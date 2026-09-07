#!/usr/bin/env node
// Asserts that the board does not instruct a builder to do something DESIGN.md
// forbids.
//
// This exists because the same defect was found twice by an outside reviewer and
// missed twice by me. Both times I "reconciled" the board by editing the cards I
// remembered, which is not the same as checking, and both times four or more
// cards still carried superseded instructions. A card that passes its own exit
// condition while building the wrong product is the most expensive kind of
// wrong, because nothing downstream signals it.
//
// Every rule below is a settled decision recorded in DESIGN.md, with the
// section it comes from. Adding a rule here is how a decision becomes
// enforceable rather than merely written down.

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const board = JSON.parse(readFileSync(join(ROOT, 'agent', 'board.json'), 'utf8'))
const design = readFileSync(join(ROOT, 'DESIGN.md'), 'utf8')

const FIELDS = ['title', 'desc', 'why', 'exit']

/**
 * Each rule is a phrase the board may not contain, an exception for legitimate
 * uses, and the reason with its DESIGN.md anchor. The exception matters: the
 * word "reorder" is forbidden as an INSTRUCTION but legitimate in "reorder was
 * removed" and in "history cannot be reordered", and a rule that cannot express
 * that gets deleted the first time it cries wolf.
 */
const RULES = [
  {
    forbidden: /\breorder\b/i,
    allowed: [/reorder was removed/i, /cannot be edited or reordered/i, /reorder is not/i],
    why: 'the column menu has three options, reorder was removed from the design',
    anchor: 'DESIGN.md, custom statuses are managed inline',
  },
  {
    forbidden: /\b(two|2) (?:nav |navigation )?destinations\b|\bexactly two routes\b/i,
    allowed: [/two destinations.{0,40}superseded/i],
    why: 'navigation has three destinations, the board, add, and the network page',
    anchor: 'DESIGN.md section 3, navigation',
  },
  {
    forbidden: /magic link/i,
    allowed: [/earlier email magic link decision/i, /magic link.{0,30}superseded/i],
    why: 'auth is phone OTP with a mocked provider',
    anchor: 'DESIGN.md section 3, auth',
  },
  {
    forbidden: /sort(?:ing)?[^.]{0,40}\bby status\b/i,
    allowed: [/by status is NOT/i],
    why: 'the four permitted sort options are newest, oldest, nearest deadline, company name',
    anchor: 'DESIGN.md, sorting',
  },
  {
    forbidden: /label comes from the catalog|from the (?:lingui )?catalog rather than/i,
    allowed: [],
    why: 'a status label is record data, because the user can rename it, so a catalog cannot represent it',
    anchor: 'DESIGN.md, enumerated field values',
  },
  {
    forbidden: /\bcard list\b|\bplain list\b(?! screen)/i,
    allowed: [/described a plain list, which/i],
    why: 'the main screen is a kanban board, not a list',
    anchor: 'DESIGN.md section 3, the main screen is a kanban board',
  },
]

const problems = []

for (const task of board.tasks) {
  for (const field of FIELDS) {
    const value = task[field] ?? ''
    for (const rule of RULES) {
      if (!rule.forbidden.test(value)) continue
      if (rule.allowed.some((pattern) => pattern.test(value))) continue
      problems.push(`${task.id}.${field}: ${rule.why} (${rule.anchor})`)
    }
  }
}

// The rules are only worth anything while DESIGN.md still says what they claim.
// A decision reversed in the contract but left encoded here would enforce the
// old answer, which is worse than not checking at all.
const anchors = [
  ['three destinations', /has three destinations/i],
  ['kanban not a list', /is a kanban board, not a list/i],
  ['phone OTP', /Auth is phone OTP/i],
  ['three column menu options', /exactly \*\*three\*\* options/i],
  ['four sort options', /exactly four options/i],
]
for (const [label, pattern] of anchors) {
  if (!pattern.test(design)) {
    problems.push(`CHECKER IS STALE: DESIGN.md no longer states "${label}", so the rule enforcing it may be wrong`)
  }
}

// Prove the checker can fire, so an empty result means something.
const canary = { id: 'CANARY', title: '', desc: 'the column menu should let the user reorder statuses', why: '', exit: '' }
const canaryHit = RULES.some(
  (rule) => rule.forbidden.test(canary.desc) && !rule.allowed.some((pattern) => pattern.test(canary.desc)),
)
if (!canaryHit) problems.push('CHECKER IS BROKEN: a planted violation was not detected')

if (problems.length) {
  process.stderr.write(`The board contradicts the design contract in ${problems.length} place(s):\n`)
  for (const problem of problems) process.stderr.write(`  - ${problem}\n`)
  process.exit(1)
}
process.stdout.write(`No card contradicts the design contract. ${board.tasks.length} tasks, ${RULES.length} rules.\n`)
