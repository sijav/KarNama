#!/usr/bin/env node
// Verifies KN-273: the owner's answer on the resting edge of a control is in
// DESIGN.md as theirs, with the date, and the raise it chose has a card.
//
// Exit condition: the owner has answered, through the question tool, whether
// the resting edge of an enabled Input and an unchecked Checkbox stays
// border/default as the file draws it or is raised to at least 3:1 against the
// surfaces it sits on; DESIGN.md records the answer as the owner's, with the
// date; and if it is raised, a card for the change exists.
//
// Whether the owner really answered is not something a script can see; the
// answer is recorded in the card's evidence and in the section's own words.
// Each check below also runs against a copy with the thing it looks for taken
// out, in memory, so a check that cannot fail is caught. Read-only.

import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const DESIGN = readFileSync(join(ROOT, 'DESIGN.md'), 'utf8')
const BOARD = JSON.parse(readFileSync(join(ROOT, 'agent', 'board.json'), 'utf8'))
const HEAD = "**A control's resting edge clears 3 to one.**"

const failures = []
const check = (label, run) => {
  try {
    const problem = run()
    if (problem) failures.push(`${label}: ${problem}`)
    else process.stdout.write(`  ok   ${label}\n`)
  } catch (error) {
    failures.push(`${label}: threw ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Prose with its line breaks folded, so a phrase that wraps still reads.
const prose = (text) => text.replace(/\s+/g, ' ')
const settled = (design) => prose(/### Settled by the owner on 2026-09-10\n([\s\S]*?)\n## /.exec(design)?.[1] ?? '')
const decision = (design) => {
  const section = settled(design)
  const at = section.indexOf(prose(HEAD))
  return at === -1 ? '' : section.slice(at)
}

// What the record must say, as a function of the text, so it can be run on a
// copy with a piece removed.
const recordProblem = (design) => {
  const said = decision(design)
  if (!said) return 'the settled section of 2026-09-10 has no decision on a control\'s resting edge'
  if (!/Owner, KN-273\./.test(said)) return 'the decision does not name the owner and KN-273'
  if (!/question tool/.test(settled(design))) return 'the section does not say the answer came through the question tool'
  const missing = [
    ['the chosen option, a new named role', /a new named role for a control's resting edge/],
    ['the ratio', /3 to one or more on every surface a control sits on/],
    ['what uses it', /The Input, the Checkbox and the Select/],
    ['what keeps the file\'s colours', /Hover edge keeps its drawn colour/],
    ['the card that builds it', /KN-275 builds it/],
  ].filter(([, pattern]) => !pattern.test(said))
  return missing.length ? `the decision does not state ${missing.map(([what]) => what).join(', ')}` : null
}

const cardProblem = (board) => {
  const card = (board.tasks ?? board).find((task) => task.id === 'KN-275')
  if (!card) return 'there is no KN-275 on the board'
  if (card.status === 'dropped') return 'KN-275 was dropped, so the raise has no card'
  const exit = card.exit ?? ''
  const missing = [
    ['a named role', /named role for a control's resting edge/],
    ['the light ratio with margin', /3\.3:1 or more on bg\/surface, bg\/page and bg\/surface-secondary/],
    ['the dark row and its check', /darkMode\.ts derives it and checks it at 3:1/],
    ['the Input and the Checkbox', /Input's resting border and the Checkbox's unchecked frame use it/],
  ].filter(([, pattern]) => !pattern.test(exit))
  return missing.length ? `KN-275's exit condition does not name ${missing.map(([what]) => what).join(', ')}` : null
}

check('DESIGN.md records the answer as the owner\'s, with the date, and what it applies to', () => recordProblem(DESIGN))

check('the record check fails when the decision is taken out of DESIGN.md', () => {
  const paragraph = /\*\*A control's resting edge clears 3 to one\.\*\*[\s\S]*?KN-275 builds it\.\n/.exec(DESIGN)?.[0]
  if (!paragraph) return 'the paragraph could not be found to take out'
  return recordProblem(DESIGN.replace(paragraph, () => '')) ? null : 'it still passes with no decision in DESIGN.md'
})

check('the record check fails when the decision is no longer the owner\'s', () =>
  recordProblem(DESIGN.replace('Owner, KN-273.', () => 'Author proposal, KN-273.')) ? null : 'it still passes with the owner taken off the decision',
)

check('the raise has its card, KN-275, with the ratios and both themes in its exit condition', () => cardProblem(BOARD))

check('the card check fails when KN-275 is missing or dropped', () => {
  const tasks = BOARD.tasks ?? BOARD
  const without = tasks.filter((task) => task.id !== 'KN-275')
  const dropped = tasks.map((task) => (task.id === 'KN-275' ? { ...task, status: 'dropped' } : task))
  if (!cardProblem(Array.isArray(BOARD) ? without : { ...BOARD, tasks: without })) return 'it passes with no KN-275'
  return cardProblem(Array.isArray(BOARD) ? dropped : { ...BOARD, tasks: dropped }) ? null : 'it passes with KN-275 dropped'
})

check("KN-196's verifier, which reads the same section, still passes", () => {
  const result = spawnSync('node', [join(ROOT, 'agent', 'scripts', 'verify', 'KN-196.mjs')], { cwd: ROOT, encoding: 'utf8' })
  return result.status === 0 ? null : `it fails:\n${`${result.stdout}${result.stderr}`.slice(-600)}`
})

if (failures.length) {
  process.stderr.write(`\nKN-273 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-273 verify passed.\n')
