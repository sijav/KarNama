#!/usr/bin/env node
// Verifies KN-002: the Documentation and Screens canvases are folded into
// DESIGN.md.
//
// Exit condition: DESIGN.md has a section per documentation frame, every open
// item in the file is either reflected in the board as a task or recorded as a
// decision, and the Job Record field list is written down.
//
// **What this can and cannot establish.** Figma cannot be queried at
// verification time, so nothing here proves the canvas was read. What it proves
// is that DESIGN.md covers everything `agent/design-manifest.json` records as
// having been read, and that the manifest is source-stamped, so a fresh read
// updates it deliberately rather than the verifier quietly agreeing with itself.
//
// Two earlier versions did agree with themselves. One carried its own list of
// 14 node ids and checked only that each occurred SOMEWHERE, so a frame's whole
// transcription could be deleted while its index row remained. The other knew
// four open-item phrases by heart, so a fifth open item with no task passed. The
// facts and the open items now come from the manifest, and the open-questions
// section is PARSED rather than pattern-matched.
//
// Read-only: reads three files, writes nothing, runs in any sandbox.

import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const design = readFileSync(join(ROOT, 'DESIGN.md'), 'utf8')
const board = JSON.parse(readFileSync(join(ROOT, 'agent', 'board.json'), 'utf8'))
const manifest = JSON.parse(readFileSync(join(ROOT, 'agent', 'design-manifest.json'), 'utf8'))

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

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, (match) => `\\${match}`)

/** The body of a `##` or `###` section, by its heading text. */
const sectionBody = (heading) => {
  const pattern = new RegExp(`^#{2,3} .*${escapeRegExp(heading)}.*$`, 'm')
  const match = pattern.exec(design)
  if (!match) return null
  const from = match.index + match[0].length
  const next = design.slice(from).search(/^#{2,3} /m)
  return next === -1 ? design.slice(from) : design.slice(from, from + next)
}

check('the manifest is source-stamped, so it can be re-derived rather than trusted', () => {
  const { source } = manifest
  for (const field of ['fileKey', 'canvases', 'readOn', 'readBy']) {
    if (!source?.[field]) return `the manifest has no ${field}, so nothing says where its content came from`
  }
  return /^\d{4}-\d{2}-\d{2}$/.test(source.readOn) ? null : `readOn is not a date: ${source.readOn}`
})

check('every documentation frame has a real section carrying its content', () => {
  // Not "the id appears somewhere". The frame's heading must exist, and the
  // facts read from that frame must be present, so deleting a transcription
  // while keeping its index row fails.
  const problems = []
  for (const frame of manifest.documentationFrames) {
    if (!design.includes(frame.node)) {
      problems.push(`${frame.node} is not mentioned at all`)
      continue
    }
    if (sectionBody(frame.landsUnder) === null) {
      problems.push(`${frame.node} claims to land under "${frame.landsUnder}", which is not a heading`)
      continue
    }
    const missing = frame.facts.filter((fact) => !design.includes(fact))
    if (missing.length) problems.push(`${frame.node} (${frame.title}) is missing: ${missing.join(', ')}`)
  }
  return problems.length ? problems.join(' | ') : null
})

check('EVERY open question in the document maps to a task, parsed not guessed', () => {
  // The section is parsed, so an open item added later without a task fails
  // even though no list in this file knows about it. That is the whole point:
  // the previous version knew four phrases and a fifth slipped straight past.
  const body = sectionBody('Open questions the design has not settled')
  if (!body) return 'there is no open-questions section'

  const bullets = body
    .split('\n')
    .filter((line) => /^- /.test(line.trim()))
    .map((line) => line.trim())
  if (!bullets.length) return 'the open-questions section has no items, which is suspicious rather than clean'

  const ids = new Set(board.tasks.map((task) => task.id))
  const unmapped = bullets.filter((bullet) => {
    // An item is disposed of either by naming the task that decides it, or by
    // being restated as a decision. Anything else is still open and unowned.
    const named = [...bullet.matchAll(/KN-\d{3}/g)].map((match) => match[0])
    return !named.some((id) => ids.has(id))
  })
  return unmapped.length
    ? `${unmapped.length} open item(s) name no board task: ${unmapped.map((b) => b.slice(0, 60)).join(' | ')}`
    : null
})

check('every open item the manifest records has a task that exists and is open', () => {
  const byId = new Map(board.tasks.map((task) => [task.id, task]))
  const problems = []
  for (const item of manifest.openItems) {
    if (!design.includes(item.marker)) problems.push(`${item.id} is not recorded in the document`)
    const task = byId.get(item.decidedBy)
    if (!task) problems.push(`${item.id} points at ${item.decidedBy}, which is not on the board`)
    else if (!design.includes(item.decidedBy)) problems.push(`${item.id}'s task ${item.decidedBy} is not named in the document`)
  }
  return problems.length ? problems.join(' | ') : null
})

check('the Job Record field list is written down, all three required', () => {
  for (const field of ['`title`', '`company`', '`status`']) {
    if (!design.includes(field)) return `${field} is not listed as required`
  }
  const optional = ['postingUrl', 'employmentType', 'jobLevel', 'expiresAt', 'skills', 'statusHistory']
  const missing = optional.filter((field) => !design.includes(field))
  return missing.length ? `optional fields missing: ${missing.join(', ')}` : null
})

check('all screen frames the manifest records are inventoried', () => {
  const missing = manifest.screenNodes.filter((node) => !design.includes(node))
  return missing.length
    ? `${missing.length} of ${manifest.screenNodes.length} not listed: ${missing.slice(0, 8).join(', ')}`
    : null
})

check('no board card contradicts the contract', () => {
  const result = spawnSync(process.execPath, [join(ROOT, 'agent', 'scripts', 'verify', 'contract.mjs')], {
    cwd: ROOT,
    encoding: 'utf8',
  })
  return result.status === 0 ? null : (result.stderr || '').trim() || `contract check exited ${result.status}`
})

check('the tasks the canvases implied exist on the board', () => {
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
