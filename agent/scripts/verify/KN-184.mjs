#!/usr/bin/env node
// Verifies KN-184: the order check reads the fenced block, not the document.
//
// Exit condition: the check extracts the fenced code block belonging to the
// close-and-roast step and compares the order of the commands WITHIN it, so a
// document carrying an earlier correctly-ordered example and a reversed real
// block is reported rather than passed.
//
// The decisive case is that decoy document, and it runs against IN-MEMORY
// fixtures through the same `closesBeforeRoasting` the real check calls. That
// matters twice over: testing a copy of the logic would prove the copy works,
// and planting a decoy into the sibling project's tracked prompt would mean
// editing another session's file to run a test.
//
// Read-only: reads two files, runs nothing, writes nothing.

import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { MARKER, closesBeforeRoasting, markedBlocks } from './lib/prompt-order.mjs'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))

const failures = []
const check = (label, run) => {
  try {
    const problem = run()
    if (problem) failures.push(`${label}: ${problem}`)
    else process.stdout.write(`  ok   ${label}\n`)
  } catch (error) {
    failures.push(`${label}: threw ${error.message}`)
  }
}

/** A prompt shaped like the real one: a numbered step with an indented block. */
const prompt = ({ decoy = false, reversed = false, fence = '```', marked = true, renamedHeading = false } = {}) =>
  [
    '## Then work the loop',
    '',
    ...(decoy
      ? [
          '3. **An earlier step that happens to show both commands: done, roast.**',
          '',
          `   ${fence}bash`,
          '   todo move <id> done',
          '   roast.py task --title ... &',
          `   ${fence}`,
          '',
        ]
      : []),
    renamedHeading
      ? '5. **Close the task, then request review.**'
      : '5. **THEN move it to `done`, and only then fire the roast, in the background.**',
    '',
    ...(marked ? [`   ${MARKER}`] : []),
    `   ${fence}bash`,
    ...(reversed
      ? ['   python ~/.claude/skills/roast/roast.py task --title ... &', '   todo move <id> done']
      : ['   todo move <id> done', '   python ~/.claude/skills/roast/roast.py task --title ... &']),
    `   ${fence}`,
    '',
    '   Do not wait for it.',
  ].join('\n')

check('a correct prompt passes', () => {
  const verdict = closesBeforeRoasting(prompt())
  return verdict.ok ? null : `it rejected a correct prompt: ${verdict.why}`
})

check('a reversed block is caught', () => {
  const verdict = closesBeforeRoasting(prompt({ reversed: true }))
  if (verdict.ok) return 'it passed a block that roasts before it closes'
  return /BEFORE the close/.test(verdict.why) ? null : `caught, but said: ${verdict.why}`
})

check('THE CASE: a correct decoy above a reversed real block is still caught', () => {
  // The defect this card exists for. The previous check compared the first
  // close command and the first roast command anywhere in the document, so the
  // decoy's correct pair satisfied it while the real block was backwards.
  const verdict = closesBeforeRoasting(prompt({ decoy: true, reversed: true }))
  if (verdict.ok) return 'the decoy masked the reversed block, which is exactly the bug'
  return /BEFORE the close/.test(verdict.why) ? null : `caught, but said: ${verdict.why}`
})

check('a decoy above a CORRECT block does not cause a false alarm', () => {
  // The other direction. A check that fixed the bug by rejecting any document
  // with two blocks would pass the test above for the wrong reason.
  const verdict = closesBeforeRoasting(prompt({ decoy: true }))
  return verdict.ok ? null : `it rejected a correct prompt with an example above it: ${verdict.why}`
})

check('the block is found even though it is indented inside a list item', () => {
  // In the real file the fence sits under a numbered step and is indented by
  // three spaces. Matching a fence only at the start of a line finds nothing
  // and reports the block as missing, which reads like a prompt with no block.
  const { blocks } = markedBlocks(prompt())
  const block = blocks[0] ? { found: true, ...blocks[0] } : { found: false, why: 'no marked block' }
  if (!block.found) return `the indented fence was not found: ${block.why}`
  return block.body.some((line) => /todo move/.test(line)) ? null : 'the block was found but is empty'
})

check('a tilde fence works too', () => {
  const verdict = closesBeforeRoasting(prompt({ fence: '~~~' }))
  return verdict.ok ? null : `a tilde-fenced block was not read: ${verdict.why}`
})

check('a commented-out command does not count as the command', () => {
  const commented = prompt().replace('   todo move <id> done', '   # todo move <id> done')
  const verdict = closesBeforeRoasting(commented)
  if (verdict.ok) return 'a commented close counted as closing'
  return /never closes the task/.test(verdict.why) ? null : `caught, but said: ${verdict.why}`
})

check('an UNMARKED prompt is reported as unmarked, never guessed at', () => {
  // The refusal that replaces the guess. Falling back to a heuristic when no
  // marker is present would restore the exact inference this change removes,
  // and would do it silently, which is worse than saying so.
  const verdict = closesBeforeRoasting(prompt({ marked: false, reversed: true }))
  if (verdict.ok) return 'an unmarked prompt passed, so something guessed'
  return /no block is marked/.test(verdict.why) ? null : `it said: ${verdict.why}`
})

check("REVIEWER'S CASE: a decoy whose heading carries both words, real block reversed", () => {
  // The fixture the KN-184 reviewer ran. Step 3's heading contains "done" and
  // "roast", so the heading-keyword selector picked THAT block and passed while
  // step 5 was backwards.
  const verdict = closesBeforeRoasting(prompt({ decoy: true, reversed: true, renamedHeading: true }))
  if (verdict.ok) return 'the decoy heading masked the reversed block, which is the reported bug'
  return /BEFORE the close/.test(verdict.why) ? null : `caught, but said: ${verdict.why}`
})

check("REVIEWER'S CASE: the real step's heading uses different words entirely", () => {
  // "Close the task, then request review" contains neither "done" nor "roast",
  // so the previous selector could never have found it at all.
  const verdict = closesBeforeRoasting(prompt({ renamedHeading: true }))
  return verdict.ok ? null : `a correct block with a reworded heading was rejected: ${verdict.why}`
})

check('a marker floating above prose rather than a fence is reported', () => {
  // The plan check's warning: letting the marker find "the next fence" through
  // arbitrary text is the same inference problem wearing a marker.
  const floating = prompt().replace(`   ${MARKER}`, `   ${MARKER}\n\n   Some prose in between.`)
  const verdict = closesBeforeRoasting(floating)
  if (verdict.ok) return 'a marker detached from its block was accepted'
  return /not directly above/.test(verdict.why) ? null : `it said: ${verdict.why}`
})

// A check here used to read a SIBLING project's prompt and require it to pass.
// It is gone, on the owner's instruction of 2026-09-10: he asked me to CHECK
// that another project's rules were written correctly, once, and that is not a
// standing licence for this repository's verifiers to execute against it. It
// also made KarNama go red for a reason that was not a KarNama defect, which
// happened within the hour of the reviewer predicting it. KN-182.
//
// Nothing is lost from this file. The fixtures prove the logic, and they prove
// it on cases a real file does not contain: a decoy, a renamed heading, a
// detached marker.

check('the OLD logic would have passed the decoy, so this fix is load-bearing', () => {
  // The mutation that must SURVIVE, which is stronger evidence than any passing
  // check: reproduce the previous implementation and watch it wave the defect
  // through. Without this, every check above is consistent with a change that
  // fixed nothing because there was nothing to fix.
  const document = prompt({ decoy: true, reversed: true }).replace(/\s+/g, ' ')
  const closeAt = document.indexOf('todo move <id> done')
  const roastAt = document.indexOf('roast.py task')
  if (closeAt === -1 || roastAt === -1) return 'the fixture does not exercise the old logic at all'
  return closeAt < roastAt
    ? null
    : 'the old logic caught the decoy too, so this card was fixing something that was not broken'
})

check('the HEADING selector would have passed the reviewer case, so KN-189 was real', () => {
  // The second mutation that must SURVIVE. The first reproduces version one,
  // the whole-document comparison; this reproduces version two, the heading
  // keywords, against the fixture that defeated it. Without it, the marker
  // change is equally consistent with having fixed nothing.
  const lines = prompt({ decoy: true, reversed: true, renamedHeading: true }).split('\n')
  const heading = lines.findIndex(
    (line) => /^\s*\d+\.\s/.test(line) && /\bdone\b/i.test(line) && /\broast\b/i.test(line),
  )
  if (heading === -1) return 'the fixture has no step the old selector would have matched at all'
  // It selects step 3, the decoy, whose block is correctly ordered.
  const body = lines.slice(heading).join('\n')
  const closeAt = body.indexOf('todo move <id> done')
  const roastAt = body.indexOf('roast.py task')
  return closeAt !== -1 && closeAt < roastAt
    ? null
    : 'the old heading selector would have caught this too, so KN-189 was not a real defect'
})

check('nobody keeps a private copy of this logic', () => {
  // This check used to require KN-166 to call the shared extraction. KN-166 no
  // longer reads any prompt at all: it read a sibling project's files, and the
  // owner's instruction was that those rules be CHECKED once, not run from
  // here. So the assertion that remains is the one that still means something:
  // no verifier has its own hand-rolled version of this, which is how two
  // copies come to disagree while both report success.
  const directory = join(ROOT, 'agent', 'scripts', 'verify')
  const offenders = readdirSync(directory)
    .filter((name) => name.endsWith('.mjs') && name !== 'KN-184.mjs')
    .filter((name) => {
      const text = readFileSync(join(directory, name), 'utf8')
      const code = text.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1')
      return /indexOf\('roast\.py task'\)|roast-order/.test(code) && !/prompt-order\.mjs/.test(code)
    })
  return offenders.length ? `${offenders.join(', ')} reimplements the block reading` : null
})

if (failures.length) {
  process.stderr.write(`\nKN-184 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-184 verify passed.\n')
