#!/usr/bin/env node
// Verifies KN-285: the owner's answer on whether an Input on a screen keeps its
// message line reserved is in DESIGN.md as theirs, with the date, and the
// change it chose has a card.
//
// Exit condition: the owner has answered, through the question tool, whether
// an Input on a screen keeps its message line reserved as the component does
// or drops it as the 91 screen instances draw it, and where an error on a field
// with the line off is shown; DESIGN.md records the answer as the owner's, with
// the date; and if the line can be off, a card for the change exists.
//
// Whether the owner really answered is not something a script can see; the
// card's evidence records the question. What is checked is the record, bound
// to the decision's own paragraph with the question tool named there, so the
// section's other decisions cannot satisfy it (the gap KN-277 names in
// KN-273's). Each check also runs against a copy with its subject taken out,
// in memory, so a check that cannot fail is caught. Read-only.

import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const DESIGN = readFileSync(join(ROOT, 'DESIGN.md'), 'utf8')
const BOARD = JSON.parse(readFileSync(join(ROOT, 'agent', 'board.json'), 'utf8'))
const PARAGRAPH = /\*\*A field's message line is drawn only when there is something to say\.\*\*[\s\S]*?screen reader whichever way, KN-286\.\n/

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
const decision = (design) => {
  const section = /### Settled by the owner on 2026-09-10\n([\s\S]*?)\n## /.exec(design)?.[1] ?? ''
  return prose(PARAGRAPH.exec(section)?.[0] ?? '')
}

const recordProblem = (design) => {
  const said = decision(design)
  if (!said) return 'the settled section of 2026-09-10 has no decision on the message line'
  const missing = [
    ['the owner and the card', /Owner, KN-285/],
    ['the question tool, in this paragraph', /put and answered through the question tool/],
    ['what the screens draw', /All 91 Input instances on the screens turn the Helper Text line off/],
    ['the two heights', /64 tall at rest and the 90 tall Error variant/],
    ['the chosen option', /chose \*\*to follow the screens\*\*/],
    ['where an error shows', /an error appearing adds it with its message/],
    ['the options not taken', /Not keeping the line reserved/],
    // Worded as built once KN-287 landed.
    ['the reversal and its card', /This reverses KN-011's decision(; KN-287 builds it|, and KN-287 built it)/],
    ['the announcement, either way', /KN-286/],
  ].filter(([, pattern]) => !pattern.test(said))
  return missing.length ? `the decision does not state ${missing.map(([what]) => what).join(', ')}` : null
}

const tasksOf = (board) => board.tasks ?? board
const cardProblem = (board) => {
  const card = tasksOf(board).find((task) => task.id === 'KN-287')
  if (!card) return 'there is no KN-287 on the board'
  if (card.status === 'dropped') return 'KN-287 was dropped, so the change has no card'
  const missing = [
    ['the 64 at rest', /draws no message line and is 64 tall/],
    ['the 90 with a helper or an error', /it is 90, the file's variants/],
    ['the line appearing with an error', /an error appearing on a field without a helper adds the line with its message/],
    ['the blank error', /a blank error still draws no line/],
    ['the record', /DESIGN\.md records the owner's reversal/],
  ].filter(([, pattern]) => !pattern.test(card.exit ?? ''))
  return missing.length ? `KN-287's exit condition does not name ${missing.map(([what]) => what).join(', ')}` : null
}

check("DESIGN.md records the answer as the owner's, through the question tool, with what it changes", () => recordProblem(DESIGN))

check('the record check fails when the paragraph is taken out', () => {
  const paragraph = PARAGRAPH.exec(DESIGN)?.[0]
  if (!paragraph) return 'the paragraph could not be found to take out'
  return recordProblem(DESIGN.replace(paragraph, () => '')) ? null : 'it still passes with no decision in DESIGN.md'
})

check('the record check fails when the paragraph loses the question tool, whatever the section says', () =>
  recordProblem(DESIGN.replace('Owner, KN-285, put and answered through the question tool.', () => 'Owner, KN-285.')) ? null : 'it still passes with the question tool gone from the paragraph',
)

check('the change has its card, KN-287, with both heights, the error and the blank error in its exit', () => cardProblem(BOARD))

check('the card check fails when KN-287 is missing or dropped', () => {
  const tasks = tasksOf(BOARD)
  const variant = (change) => {
    const next = change(tasks)
    return Array.isArray(BOARD) ? next : { ...BOARD, tasks: next }
  }
  if (!cardProblem(variant((all) => all.filter((task) => task.id !== 'KN-287')))) return 'it passes with no KN-287'
  return cardProblem(variant((all) => all.map((task) => (task.id === 'KN-287' ? { ...task, status: 'dropped' } : task)))) ? null : 'it passes with KN-287 dropped'
})

for (const id of ['KN-196', 'KN-273', 'KN-276']) {
  check(`${id}'s verifier, which reads the same section, still passes`, () => {
    const result = spawnSync('node', [join(ROOT, 'agent', 'scripts', 'verify', `${id}.mjs`)], { cwd: ROOT, encoding: 'utf8' })
    return result.status === 0 ? null : `it fails:\n${`${result.stdout}${result.stderr}`.slice(-600)}`
  })
}

if (failures.length) {
  process.stderr.write(`\nKN-285 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-285 verify passed.\n')
