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


/** Every top-level frame on the Screens canvas 5:7, read from the canvas. */
const SCREEN_NODES = ['241:2', '241:146', '243:2', '243:76', '243:224', '243:325', '243:433', '243:682', '243:726', '243:814', '243:899', '243:971', '243:1078', '243:1213', '243:1374', '243:1502', '243:1652', '252:2', '252:175', '252:411', '259:2', '259:105', '259:184', '259:295', '271:55', '271:190', '271:332', '305:2', '305:165', '305:374', '305:558', '305:705', '305:876', '305:1055', '305:1232', '305:1377', '305:1547', '305:1696', '305:1842', '305:2018', '305:2243', '376:5645', '376:5868', '376:5997', '377:6244', '407:6951', '407:6972', '407:7000', '407:7022', '407:7043', '407:7071', '492:7482', '492:7581']

/** Escapes a heading before it goes into a RegExp. */
const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, (match) => `\\${match}`)

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

check('all 53 screen frames are inventoried, not one per row', () => {
  // Every top-level frame on canvas 5:7, read from the canvas itself rather
  // than summarised. An earlier version checked ONE node per flow row, which
  // meant 47 of them could be deleted and it would still pass. That is exactly
  // the completeness failure this task exists to prevent.
  const missing = SCREEN_NODES.filter((node) => !design.includes(node))
  if (missing.length) return `${missing.length} of ${SCREEN_NODES.length} not listed: ${missing.slice(0, 8).join(', ')}`
  return null
})

check('every heading the frame index points at actually exists', () => {
  // The index names headings rather than section numbers, because it once
  // named numbers, a later edit renumbered the sections, and it then pointed
  // readers at the wrong place while looking authoritative. This proves each
  // destination is real.
  const index = design.slice(design.indexOf('| Frame'), design.indexOf('### What the product is'))
  const quoted = [...index.matchAll(/"([^"]+)"/g)].map((match) => match[1])
  if (quoted.length < 8) return `only found ${quoted.length} quoted destinations, the index looks unparsed`
  const missing = quoted.filter((heading) => !new RegExp(`^#{2,3} .*${escapeRegExp(heading)}`, 'm').test(design))
  return missing.length ? `these destinations are not headings: ${missing.join(' | ')}` : null
})

check('the prototype critical path and the motion values are recorded', () => {
  for (const needle of ['300ms', '150ms', 'Instant']) {
    if (!design.includes(needle)) return `the ${needle} motion value is missing`
  }
  return /critical path/i.test(design) ? null : 'the critical path is not recorded'
})

check('every open item is recorded AND has a task to obtain the decision', () => {
  // The exit condition says every open item is "either reflected in the board
  // as a task or recorded as a decision". Listing one as Undecided is NEITHER,
  // which an earlier version of this check missed entirely: it only asked
  // whether the question appeared in the document. Each now needs a card whose
  // job is to get the answer.
  const titles = board.tasks.map((task) => `${task.id} ${task.title}`)
  const items = [
    ['رد شده', 'where rejected belongs', /where رد شده belongs/i],
    ['email or phone', 'whether a contact needs a contact route', /contact needs an email or a phone/i],
    ['open item 18', 'where status history belongs', /where status history belongs/i],
    ['unconfirmed', 'the provisional enums', /confirm the employment type and job level/i],
  ]
  const unrecorded = items.filter(([needle]) => !design.includes(needle))
  if (unrecorded.length) return `not recorded in the document: ${unrecorded.map(([, what]) => what).join(', ')}`

  const untasked = items.filter(([, , pattern]) => !titles.some((title) => pattern.test(title)))
  return untasked.length
    ? `recorded as open but with no task to decide it: ${untasked.map(([, what]) => what).join(', ')}`
    : null
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
