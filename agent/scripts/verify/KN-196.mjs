#!/usr/bin/env node
// Verifies KN-196: how a card is dropped onto a column collapsed to a count.
//
// This is a DECISION card, so the exit condition is about the record rather
// than about code: DESIGN.md must answer all four questions, say who decided
// and when, KN-061 must name the decided behaviour, and this card must no
// longer block it.
//
// The attribution clause is the one that matters and it is KN-153's rule.
// The owner WAS asked, on 2026-09-10, and had no preference on any of the
// three questions, so the answers are the author's. Recording them inside the
// owner-settled block would launder an agent decision into an owner decision,
// and "the owner declined to choose" is not the same as "the owner chose".
//
// Read-only.

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const DESIGN = readFileSync(join(ROOT, 'DESIGN.md'), 'utf8')
const board = JSON.parse(readFileSync(join(ROOT, 'agent', 'board.json'), 'utf8'))
const byId = new Map(board.tasks.map((task) => [task.id, task]))

const flat = DESIGN.split(/\s+/).join(' ')
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

/** The paragraph that carries this decision, bounded by blank lines. */
const entry = () => {
  const paragraphs = DESIGN.split(/\n\s*\n/).map((block) => block.split(/\s+/).join(' '))
  return paragraphs.filter((block) => /KN-196/.test(block))
}

check('DESIGN.md carries the decision, in exactly one place', () => {
  const found = entry()
  if (found.length === 0) return 'DESIGN.md never mentions KN-196, so the answer was not recorded'
  return found.length === 1 ? null : `${found.length} paragraphs claim this decision, so which one is canonical is not stated`
})

check('it says WHO decided and WHEN, and does not claim the owner chose', () => {
  // KN-153. The owner was asked and delegated; that is not the owner choosing.
  const [block] = entry()
  if (!block) return 'the decision paragraph could not be located'
  if (!/2026-09-10/.test(block)) return 'the decision does not say when it was made'
  if (!/no preference|delegated/i.test(block)) return 'the decision does not record that the owner was asked and declined to choose'
  if (!/author/i.test(block)) return 'the decision does not attribute the answers to the author'
  // And it must NOT be dressed as settled by the owner.
  return /owner[- ]settled|settled by the owner/i.test(block) && !/not owner-settled/i.test(block)
    ? 'the decision claims to be owner-settled, which it is not'
    : null
})

for (const [clause, pattern] of [
  ['hover expands it, with a delay', /hover expands it[^.]*500\s?ms|500\s?ms/i],
  ['whether a collapsed column accepts a drop', /does NOT accept a drop while collapsed/i],
  ['what the user sees after the drop lands', /re-collapses[^.]*count[^.]*ticks up|count ticks up/i],
  ['what the keyboard path targets', /keyboard treats it as ONE target/i],
]) {
  check(`the decision answers: ${clause}`, () => (pattern.test(flat) ? null : `DESIGN.md does not answer "${clause}"`))
}

check('KN-061 names the decided behaviour in its exit condition', () => {
  const task = byId.get('KN-061')
  if (!task) return 'KN-061 is not on the board'
  const exit = String(task.exit ?? '').split(/\s+/).join(' ')
  if (!/KN-196/.test(exit)) return 'KN-061 does not cite the decision'
  const missing = [
    ['the hover delay', /500\s?ms/i],
    ['the refusal to accept a collapsed drop', /does NOT accept a drop while collapsed/i],
    ['the keyboard target', /ONE target/i],
  ].filter(([, pattern]) => !pattern.test(exit))
  return missing.length ? `KN-061 does not name ${missing.map(([name]) => name).join(', ')}` : null
})

check('this card no longer blocks KN-061', () => {
  const task = byId.get('KN-061')
  const blockers = Array.isArray(task?.parent) ? task.parent : []
  return blockers.includes('KN-196') ? 'KN-196 is still listed as a blocker of KN-061' : null
})

if (failures.length) {
  process.stderr.write(`\nKN-196 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-196 verify passed.\n')
