#!/usr/bin/env node
// Verifies KN-166, after the owner's correction of 2026-09-10.
//
// The card was: go and CHECK that a sibling project's loop rules are written
// correctly. That was a one-off reading task and it is recorded in the card's
// evidence: the rules there were already right, and what was actually broken
// was that its loop prompt contradicted itself, which became KN-181.
//
// What this file used to be was a standing check that READ that project on
// every run and failed when it was absent or merely reworded. The owner's
// words: its rules needed to be checked, not run. It made this repository's
// verification depend on a project outside it, and it went red for a sibling
// wording change within an hour of a reviewer predicting exactly that.
//
// So what is left to verify HERE is the correction itself: that KarNama's
// verifiers reach nothing outside KarNama. That is a fact about this repository
// and it is the only part of this card that belongs in this repository.
//
// Read-only.

import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const VERIFY = join(ROOT, 'agent', 'scripts', 'verify')

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

// Assembled at runtime so the literal never appears in this file. A check that
// searches for a string and contains that string flags ITSELF, which is what
// happened on the first run here and is the same shape as a grep matching the
// prose that explains the ban. Stripping comments is not enough when the needle
// lives in a regex literal, which is code.
const SIBLING = new RegExp(['Skip', 'Bureau'].join(''))

const withoutComments = (text) => text.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1')

const sources = () =>
  readdirSync(VERIFY, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.mjs'))
    .map((entry) => ({ name: entry.name, text: readFileSync(join(VERIFY, entry.name), 'utf8') }))

check('this file no longer reads the sibling project', () => {
  // Comments are stripped first: this file necessarily NAMES the project in
  // order to explain why it stopped reading it, and a check that flagged its
  // own explanation would be the mistake this repository keeps shipping.
  const code = withoutComments(readFileSync(join(VERIFY, 'KN-166.mjs'), 'utf8'))
  return SIBLING.test(code) ? 'it still names the sibling project in code' : null
})

check('no verifier in this repository reaches outside it', () => {
  // The correction, stated as a property rather than as a promise. `..` in a
  // path join is how a check escapes its own repository, and a sibling named in
  // code is the other way.
  const offenders = []
  for (const { name, text } of sources()) {
    const code = withoutComments(text)
    if (SIBLING.test(code)) offenders.push(`${name} names the sibling project`)
    if (/dirname\(ROOT\)/.test(code)) offenders.push(`${name} resolves a path above the repository root`)
  }
  return offenders.length ? offenders.join('; ') : null
})

check('the card still records what it found, since that is where the work lives', () => {
  const board = JSON.parse(readFileSync(join(ROOT, 'agent', 'board.json'), 'utf8'))
  const tasks = Array.isArray(board.tasks) ? board.tasks : Object.values(board.tasks)
  const card = tasks.find((task) => task.id === 'KN-166')
  if (!card) return 'KN-166 is not on the board'
  const evidence = String(card.evidence ?? '')
  if (!/rules there are already correct|premise was wrong/i.test(evidence)) {
    return 'the evidence no longer says what the reading actually found'
  }
  return /KN-177/.test(evidence) ? null : 'the evidence does not name what it filed'
})

if (failures.length) {
  process.stderr.write(`\nKN-166 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-166 verify passed.\n')
