#!/usr/bin/env node
// Verifies KN-002: the Documentation and Screens canvases are folded into
// DESIGN.md.
//
// Exit condition: DESIGN.md has a section per documentation frame, every open
// item in the file is either reflected in the board as a task or recorded as a
// decision, and the Job Record field list is written down.
//
// Read-only. It reads DESIGN.md and board.json and writes nothing, so it runs
// anywhere, including the sandbox a reviewer uses.
//
// It also runs the contract checker, because a fold-in that introduced a card
// contradicting the design would be the exact failure this task exists to
// prevent.

import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const design = readFileSync(join(ROOT, 'DESIGN.md'), 'utf8')
const board = JSON.parse(readFileSync(join(ROOT, 'agent', 'board.json'), 'utf8'))

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

/** Every frame on the Documentation canvas, and the Screens canvas rows. */
const DOC_FRAMES = [
  ['376:2', 'what the product is'],
  ['376:9', 'design principles'],
  ['376:21', 'tokens'],
  ['376:31', 'key patterns'],
  ['376:43', 'Figma gotchas'],
  ['376:46', 'page map'],
  ['384:12', 'prototype map'],
  ['416:14', 'interactive components'],
  ['416:21', 'type scale'],
  ['434:2', 'required fields'],
  ['434:16', 'order and layout'],
  ['434:26', 'variable coverage'],
  ['434:33', 'field options'],
  ['505:3', 'copywriting'],
]

check('every Documentation frame is accounted for by node id', () => {
  const missing = DOC_FRAMES.filter(([node]) => !design.includes(node))
  return missing.length ? `no mention of ${missing.map(([node, what]) => `${node} (${what})`).join(', ')}` : null
})

check('the Job Record required fields are written down, all three', () => {
  for (const field of ['`title`', '`company`', '`status`']) {
    if (!design.includes(field)) return `${field} is not listed as required`
  }
  // The specific error this corrects: an earlier note said only the title.
  if (!/Three fields, not one/i.test(design)) return 'the document does not say there are three, which was got wrong once'
  return null
})

check('the optional field list is written down', () => {
  const optional = ['postingUrl', 'employmentType', 'jobLevel', 'expiresAt', 'skills', 'statusHistory']
  const missing = optional.filter((field) => !design.includes(field))
  return missing.length ? `missing ${missing.join(', ')}` : null
})

check('every screen flow row is inventoried with node ids', () => {
  // One representative node id per row, so a row that was summarised without
  // being read shows up.
  const rows = [
    ['the board', '241:2'],
    ['managing a status', '259:105'],
    ['adding one', '243:899'],
    ['the job modal', '377:6244'],
    ['the network', '271:190'],
    ['signing in', '407:6972'],
  ]
  const missing = rows.filter(([, node]) => !design.includes(node))
  return missing.length ? `rows not inventoried: ${missing.map(([name]) => name).join(', ')}` : null
})

check('the prototype critical path and the motion values are recorded', () => {
  for (const needle of ['300ms', '150ms', 'Instant']) {
    if (!design.includes(needle)) return `the ${needle} motion value is missing`
  }
  return /critical path/i.test(design) ? null : 'the critical path is not recorded'
})

check('every open question the file raises is recorded as open', () => {
  // Each is something the design deliberately has not settled. Recording them
  // is what stops one being resolved by accident while implementing.
  const questions = [['رد شده', 'where rejected belongs'], ['email or phone', 'whether a contact needs a contact route'], ['open item 18', 'where status history belongs'], ['unconfirmed', 'the provisional enums']]
  const missing = questions.filter(([needle]) => !design.includes(needle))
  return missing.length ? `not recorded: ${missing.map(([, what]) => what).join(', ')}` : null
})

check('the superseded tone rule is marked superseded, not silently dropped', () => {
  // 376:9 and 505:3 contradict each other. Recording which wins, and that the
  // other is superseded, is what stops the old one being re-applied.
  return /SUPERSEDED by `505:3`|superseded/i.test(design) && design.includes('505:3')
    ? null
    : 'the contradiction between the principles frame and the copywriting frame is not resolved in writing'
})

check('no board card contradicts the contract', () => {
  const result = spawnSync(process.execPath, [join(ROOT, 'agent', 'scripts', 'verify', 'contract.mjs')], {
    cwd: ROOT,
    encoding: 'utf8',
  })
  return result.status === 0 ? null : (result.stderr || '').trim() || `contract check exited ${result.status}`
})

check('the tasks the canvases implied exist on the board', () => {
  // The fold-in is only finished when what it discovered is schedulable. These
  // are the five gaps the audit found, plus the two the superseded decisions
  // required.
  const needed = [
    [/kanban column/i, 'the column component'],
    [/drag a card between columns/i, 'drag and drop'],
    [/standalone network screen/i, 'the network screen'],
    [/posting extraction/i, 'the extraction service'],
    [/phone OTP/i, 'auth as phone OTP'],
  ]
  const titles = board.tasks.map((task) => task.title).join('\n')
  const missing = needed.filter(([pattern]) => !pattern.test(titles))
  return missing.length ? `no task for ${missing.map(([, what]) => what).join(', ')}` : null
})

if (failures.length) {
  process.stderr.write(`\nKN-002 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-002 verify passed.\n')
