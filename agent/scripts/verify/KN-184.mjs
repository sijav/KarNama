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

import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { closeAndRoastBlock, closesBeforeRoasting } from './lib/prompt-order.mjs'

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
const prompt = ({ decoy = false, reversed = false, fence = '```' } = {}) =>
  [
    '## Then work the loop',
    '',
    ...(decoy
      ? [
          '3. **An earlier step that happens to show both commands.**',
          '',
          `   ${fence}bash`,
          '   todo move <id> done',
          '   roast.py task --title ... &',
          `   ${fence}`,
          '',
        ]
      : []),
    '5. **THEN move it to `done`, and only then fire the roast, in the background.**',
    '',
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
  const block = closeAndRoastBlock(prompt())
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

check('a missing block is reported as missing, not as an order problem', () => {
  const verdict = closesBeforeRoasting('## Then work the loop\n\n5. **Move it to done and roast it.**\n\nNo block here.\n')
  if (verdict.ok) return 'a prompt with no command block passed'
  return /no command block/.test(verdict.why) ? null : `it said: ${verdict.why}`
})

check('the real sibling prompt still passes through the same function', () => {
  // The fixtures prove the logic; this proves it against the file it is for.
  const real = join(dirname(ROOT), 'SkipBureau', '.claude', 'ralph-loop.local.md')
  if (!existsSync(real)) return `${real} does not exist, so the real case was not checked`
  const verdict = closesBeforeRoasting(readFileSync(real, 'utf8'))
  return verdict.ok ? null : verdict.why
})

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

check('KN-166 calls this function rather than keeping its own copy', () => {
  const source = readFileSync(join(ROOT, 'agent', 'scripts', 'verify', 'KN-166.mjs'), 'utf8')
  if (!/closesBeforeRoasting/.test(source)) return 'KN-166 does not use the shared extraction'
  // The old indexOf pair must be gone, or both live side by side and the weak
  // one still decides.
  return /indexOf\('roast\.py task'\)/.test(source) ? 'KN-166 still compares positions in the whole document' : null
})

if (failures.length) {
  process.stderr.write(`\nKN-184 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-184 verify passed.\n')
