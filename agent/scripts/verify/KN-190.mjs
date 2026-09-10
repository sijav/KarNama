#!/usr/bin/env node
// Verifies KN-190: a mention of a command is not the command.
//
// Exit condition: the recognisers match a command in command POSITION and not
// text embedded in a string or an argument; the reviewer's `echo` fixture fails
// before the fix and passes after; and a line that genuinely runs the command in
// a pipeline or after a semicolon is decided deliberately rather than by
// accident.
//
// The obvious fix was wrong and that is worth stating, because it is what
// anyone would reach for first. "Anchor the match to the start of the line"
// breaks the file this is written for: the roast line is
// `python ~/.claude/skills/roast/roast.py task ... &`, so the command in command
// position is `python` and the roast is an ARGUMENT. Only the close really does
// start its line. One anchor cannot serve both shapes.
//
// The second wrong answer was mine: strip the quotes and search what is left.
// The plan check killed it in one sentence, that it "keeps rediscovering shell
// syntax one exception at a time", which is exactly what a blacklist of `echo`
// growing to `printf` and `cat` already looked like.
//
// So the line is tokenised, printers are named, and the shapes this cannot
// order, a pipeline, a `&&`, a semicolon, a continuation, are REPORTED rather
// than guessed at. A single trailing `&` is not one of them, because
// backgrounding the roast is what the real prompt does.
//
// What is PROVED here, by mutation, is the printer list and the unsupported
// list. The tokeniser's quote handling is not: breaking it makes the quoted
// fixture fail for a different reason instead of passing, so no test can tell
// a working quote rule from a dead one. Said plainly in `prompt-order.mjs`
// rather than left as a check that looks like coverage it does not have.
//
// Read-only.

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { MARKER, closesBeforeRoasting, readCommand } from './lib/prompt-order.mjs'

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

/** A marked block containing exactly the lines given. */
const block = (...lines) =>
  ['## Step', '', '5. **Close, then roast.**', '', `   ${MARKER}`, '   ```bash', ...lines.map((line) => `   ${line}`), '   ```', ''].join('\n')

const CLOSE = 'todo move <id> done'
const ROAST = 'python ~/.claude/skills/roast/roast.py task --title ... &'

check('the real shapes are both recognised', () => {
  // The floor. If these stop being read the checks below pass by finding
  // nothing, which is the vacuous result every negative case shares.
  const close = readCommand(CLOSE)
  const roast = readCommand(ROAST)
  if (!close.closes) return `the real close line was not read as a close: ${JSON.stringify(close)}`
  if (!roast.roasts) return `the real roast line was not read as a roast: ${JSON.stringify(roast)}`
  return roast.command === 'python' ? null : `the roast line's command was read as ${roast.command}`
})

check("THE CASE: echo of a close command is not a close", () => {
  // The reviewer's fixture. `echo "todo move <id> done"` was read as the close,
  // so a block could roast first and still report the right order.
  const echoed = readCommand('echo "todo move <id> done"')
  return echoed.closes ? 'an echoed close still counts as closing' : null
})

check("THE CASE, end to end: an echoed close above a real roast-then-close is caught", () => {
  const verdict = closesBeforeRoasting(block('echo "todo move <id> done"', ROAST, CLOSE))
  if (verdict.ok) return 'the echoed close masked the real order, which is the reported bug'
  return /BEFORE the close/.test(verdict.why) ? null : `caught, but said: ${verdict.why}`
})

check('an UNQUOTED echo of a close is not a close either', () => {
  // Quoting alone does not cover this one, which is why printers are named.
  return readCommand('echo todo move <id> done').closes ? 'an unquoted echo counts as closing' : null
})

check('a close mentioned inside an argument to something else is not a close', () => {
  // Real behaviour, pinned. Note it is the only claim here with no mutation
  // behind it: see the header, and the gap written out in `prompt-order.mjs`.
  const mentioned = readCommand('grep --after 2 "todo move <id> done" notes.md')
  return mentioned.closes ? 'a search for the text counts as running it' : null
})

for (const [name, line] of [
  ['a && chain', `${CLOSE} && ${ROAST}`],
  ['a semicolon', `${CLOSE}; ${ROAST}`],
  ['a pipeline', `${CLOSE} | tee log.txt`],
  ['a line continuation', `${CLOSE} \\`],
]) {
  check(`${name} is REPORTED as unorderable, not guessed at`, () => {
    const verdict = closesBeforeRoasting(block(line, ROAST))
    if (verdict.ok) return `${name} was silently accepted`
    return /cannot order/.test(verdict.why) ? null : `it was rejected, but for another reason: ${verdict.why}`
  })
}

check('a trailing & is NOT unsupported, because the real prompt backgrounds its roast', () => {
  // The one that must stay allowed. A rule that rejected `&` would reject the
  // file it is written for, which is how a check ends up being disabled.
  const verdict = closesBeforeRoasting(block(CLOSE, ROAST))
  return verdict.ok ? null : `the real shape was rejected: ${verdict.why}`
})

check('a semicolon INSIDE a quoted argument is not a command separator', () => {
  const verdict = closesBeforeRoasting(block(`${CLOSE} --evidence "ran a; b; c"`, ROAST))
  return verdict.ok ? null : `a quoted semicolon was read as shell syntax: ${verdict.why}`
})

check('the OLD matcher would have passed the echo decoy, so this fix is load-bearing', () => {
  // The mutation that must SURVIVE. Reproduce the unanchored regexes and watch
  // them wave the reviewer's fixture through.
  const lines = ['echo "todo move <id> done"', ROAST, CLOSE]
  const executable = lines.filter((line) => line.trim() && !line.trimStart().startsWith('#'))
  const closeAt = executable.findIndex((line) => /todo\s+move\s+\S+\s+done/.test(line))
  const roastAt = executable.findIndex((line) => /roast(\.py|\.mjs)?\s+task|npm run roast/.test(line))
  return closeAt !== -1 && closeAt < roastAt
    ? null
    : 'the old matcher caught the echo too, so this card was fixing something that was not broken'
})

check('the shared module is the only place this logic lives', () => {
  const source = readFileSync(join(ROOT, 'agent', 'scripts', 'verify', 'lib', 'prompt-order.mjs'), 'utf8')
  if (!/export const readCommand/.test(source)) return 'readCommand is not exported, so nothing else can use it'
  return /PRINTERS/.test(source) ? null : 'the printer list is gone, so an unquoted echo would count again'
})

if (failures.length) {
  process.stderr.write(`\nKN-190 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-190 verify passed.\n')
