#!/usr/bin/env node
// Verifies KN-276: the owner's answer on how a selected Filter Chip shows its
// state is in DESIGN.md as theirs, with the date, and the change has a card.
//
// Exit condition: the owner has answered, through the question tool, whether
// the selected Filter Chip keeps the file's fill as its only sign of selection
// or gains one that meets WCAG 1.4.11 and 1.4.1, with the options and their
// trade named; DESIGN.md records the answer as the owner's, with the date; and
// if it changes, a card for the change exists that also covers KN-272's dark
// fill.
//
// Whether the owner really answered is not something a script can see; the
// card's evidence records the question. What is checked is the record: bound
// to the decision's own paragraph, question tool included, so the section's
// other decisions cannot satisfy it (the gap KN-277 names in KN-273's). Each
// check also runs against a copy with its subject taken out, in memory, so a
// check that cannot fail is caught. Read-only.

import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const DESIGN = readFileSync(join(ROOT, 'DESIGN.md'), 'utf8')
const BOARD = JSON.parse(readFileSync(join(ROOT, 'agent', 'board.json'), 'utf8'))
const PARAGRAPH = /\*\*A selected Filter Chip shows a blue edge\.\*\*[\s\S]*?KN-279 builds it, after KN-272 fixes the dark fill\.\n/

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
  if (!said) return 'the settled section of 2026-09-10 has no decision on the selected Filter Chip'
  const missing = [
    ['the owner and the card', /Owner, KN-276/],
    ['the question tool, in this paragraph', /put and answered through the question tool/],
    ['the state it fixes', /1\.22 to one/],
    ['the chosen option', /a blue edge on the selected chip/],
    ['the ratio', /3 to one or more on every surface and against the fill inside it/],
    ['the options not taken', /Not a check before the label/],
    ['the pressed overlap', /already the chip's pressed edge/],
    ['the card that builds it, after the dark fill', /KN-279 builds it, after KN-272/],
  ].filter(([, pattern]) => !pattern.test(said))
  return missing.length ? `the decision does not state ${missing.map(([what]) => what).join(', ')}` : null
}

const tasksOf = (board) => board.tasks ?? board
const cardProblem = (board) => {
  const card = tasksOf(board).find((task) => task.id === 'KN-279')
  if (!card) return 'there is no KN-279 on the board'
  if (card.status === 'dropped') return 'KN-279 was dropped, so the change has no card'
  if (!(card.parent ?? []).includes('KN-272')) return 'KN-279 does not wait for KN-272, the dark fill'
  const missing = [
    ['the edge in a named role at 3:1', /edge is drawn in a named role at 3:1 or more/],
    ['the fill inside it', /its own fill/],
    ['both themes', /in light and in the derived dark/],
    ['the pressed state kept apart', /pressed unselected chip is still told apart from a selected one/],
  ].filter(([, pattern]) => !pattern.test(card.exit ?? ''))
  return missing.length ? `KN-279's exit condition does not name ${missing.map(([what]) => what).join(', ')}` : null
}

check('DESIGN.md records the answer as the owner\'s, through the question tool, with what it changes', () => recordProblem(DESIGN))

check('the record check fails when the paragraph is taken out', () => {
  const paragraph = PARAGRAPH.exec(DESIGN)?.[0]
  if (!paragraph) return 'the paragraph could not be found to take out'
  return recordProblem(DESIGN.replace(paragraph, () => '')) ? null : 'it still passes with no decision in DESIGN.md'
})

check('the record check fails when the paragraph loses the question tool, whatever the section says', () =>
  recordProblem(DESIGN.replace('put and answered\nthrough the question tool', () => 'decided')) ? null : 'it still passes with the question tool gone from the paragraph',
)

check('the change has its card, KN-279, waiting for KN-272, with both themes and the pressed state in its exit', () => cardProblem(BOARD))

check('the card check fails when KN-279 is missing, dropped, or no longer waits for KN-272', () => {
  const tasks = tasksOf(BOARD)
  const variant = (change) => {
    const next = change(tasks)
    return Array.isArray(BOARD) ? next : { ...BOARD, tasks: next }
  }
  if (!cardProblem(variant((all) => all.filter((task) => task.id !== 'KN-279')))) return 'it passes with no KN-279'
  if (!cardProblem(variant((all) => all.map((task) => (task.id === 'KN-279' ? { ...task, status: 'dropped' } : task))))) return 'it passes with KN-279 dropped'
  return cardProblem(variant((all) => all.map((task) => (task.id === 'KN-279' ? { ...task, parent: [] } : task)))) ? null : 'it passes with KN-279 not waiting for KN-272'
})

for (const id of ['KN-196', 'KN-273']) {
  check(`${id}'s verifier, which reads the same section, still passes`, () => {
    const result = spawnSync('node', [join(ROOT, 'agent', 'scripts', 'verify', `${id}.mjs`)], { cwd: ROOT, encoding: 'utf8' })
    return result.status === 0 ? null : `it fails:\n${`${result.stdout}${result.stderr}`.slice(-600)}`
  })
}

if (failures.length) {
  process.stderr.write(`\nKN-276 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-276 verify passed.\n')
