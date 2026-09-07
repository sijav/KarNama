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
import { createHash } from 'node:crypto'
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

/** The top-level frame ids in the committed Screens capture, derived not listed. */
const captureNodes = () =>
  readFileSync(join(ROOT, manifest.source.capture.file), 'utf8')
    .split(/\r?\n/)
    .filter((line) => /^  <(frame|section) /.test(line))
    .map((line) => (/id="([^"]+)"/.exec(line) || [])[1])
    .filter(Boolean)

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, (match) => `\\${match}`)

/**
 * The body of a section, by its heading text, INCLUDING its subsections.
 *
 * Ending at the next heading of any level was wrong: a `##` with `###`
 * subsections returned only its preamble, so every fact that lived in a
 * subsection read as missing. A section ends at the next heading of the same
 * level or higher.
 */
const sectionBody = (heading) => {
  const pattern = new RegExp(`^(#{2,4}) .*${escapeRegExp(heading)}.*$`, 'm')
  const match = pattern.exec(design)
  if (!match) return null
  const level = match[1].length
  const from = match.index + match[0].length
  const next = design.slice(from).search(new RegExp(`^#{2,${level}} `, 'm'))
  return next === -1 ? design.slice(from) : design.slice(from, from + next)
}

/**
 * List items in a block, with wrapped continuation lines joined.
 *
 * Line-by-line was wrong twice over: a bullet's own text was truncated at the
 * first newline, so a marker further along was invisible, and a wrapped line
 * that happened to begin "18." was read as a numbered list item of its own.
 */
const listItems = (body) => {
  const items = []
  let inItem = false
  let previousBlank = true

  for (const line of body.split(/\r?\n/)) {
    const blank = !line.trim()
    // A bullet always starts an item. A NUMBERED item only starts one after a
    // blank line, because a wrapped sentence ending "... flags it as open item"
    // continues onto a line beginning "18." and that is prose, not a list.
    const startsItem = /^\s*[-*+]\s/.test(line) || (previousBlank && /^\s*\d+\.\s/.test(line))

    if (startsItem) {
      items.push(line.trim())
      inItem = true
    } else if (inItem && !blank) {
      items[items.length - 1] += ` ${line.trim()}`
    } else if (blank) {
      // A blank line ends the item. A paragraph after it is prose, not a
      // continuation, and treating it as one invented list items that did not
      // exist.
      inItem = false
    }
    previousBlank = blank
  }
  return items
}

check('the screen list is DERIVED from a committed capture, not asserted', () => {
  // The manifest used to carry a hand-written list of 53 node ids, which is a
  // claim. The raw get_metadata response for canvas 5:7 is committed instead,
  // its digest recorded, and the list re-derived here. That does not prove the
  // canvas was read in full, but it does mean the list and the document are
  // both checked against the same captured artefact rather than against me.
  const capture = manifest.source?.capture
  if (!capture?.file) return 'the manifest records no capture'
  const body = readFileSync(join(ROOT, capture.file))
  const digest = createHash('sha256').update(body).digest('hex')
  if (digest !== capture.sha256) return `${capture.file} has changed since it was captured`
  if (body.length !== capture.bytes) return `${capture.file} is ${body.length} bytes, the manifest says ${capture.bytes}`

  const nodes = captureNodes()
  if (nodes.length < 40) return `only ${nodes.length} frames derivable from the capture, which looks truncated`
  const missing = nodes.filter((node) => !design.includes(node))
  return missing.length
    ? `${missing.length} of ${nodes.length} captured frames are not in the document: ${missing.slice(0, 8).join(', ')}`
    : null
})

check("every documentation frame's facts are IN the section it claims", () => {
  // Searched within the claimed section, not across the whole document. Global
  // search meant a heading could be emptied and its facts moved into an
  // unrelated paragraph while the index row survived, which is the same
  // false-pass class as before with a slightly harder mutation.
  const problems = []
  for (const frame of manifest.documentationFrames) {
    if (!design.includes(frame.node)) {
      problems.push(`${frame.node} is not mentioned at all`)
      continue
    }
    const body = sectionBody(frame.landsUnder)
    if (body === null) {
      problems.push(`${frame.node} claims to land under "${frame.landsUnder}", which is not a heading`)
      continue
    }
    const missing = frame.facts.filter((fact) => !body.includes(fact))
    if (missing.length) {
      problems.push(`${frame.node} (${frame.title}) is missing from "${frame.landsUnder}": ${missing.join(', ')}`)
    }
  }
  return problems.length ? problems.join(' | ') : null
})

check('EVERY open item is disposed of, and by the task that actually owns it', () => {
  // Three earlier weaknesses, all real. It only saw lines starting `- `, so a
  // `*` bullet or a paragraph was invisible. Any existing KN id satisfied any
  // bullet, so a retention question citing KN-070 passed even though KN-070 is
  // about where rejected belongs. And "Decided by" was accepted as a
  // disposition when the four items still said "Undecided", which is an open
  // item tracked by a task, not a decision.
  const body = sectionBody('Open questions the design has not settled')
  if (!body) return 'there is no open-questions section'

  const items = listItems(body)
  if (!items.length) return 'the open-questions section has no items, which is suspicious rather than clean'

  const byId = new Map(board.tasks.map((task) => [task.id, task]))
  const owners = new Map(manifest.openItems.map((item) => [item.decidedBy, item]))
  const problems = []

  for (const item of items) {
    const named = [...item.matchAll(/KN-\d{3}/g)].map((match) => match[0]).filter((id) => byId.has(id))
    const decided = /\*\*Decided(?: by)?[^*]*\*\*.*\b(on|:)\b/i.test(item)
    if (!named.length && !decided) {
      problems.push(`no task and no decision: ${item.slice(0, 60)}`)
      continue
    }
    // Subject linkage: the named task must be the one the manifest says owns
    // this item, matched by the marker that identifies it.
    const matched = named.some((id) => {
      const owner = owners.get(id)
      return owner && item.includes(owner.marker)
    })
    if (!matched) {
      problems.push(`${named.join(', ') || 'a decision'} does not own this item: ${item.slice(0, 60)}`)
      continue
    }
    // An item is only tracked while its task is still open.
    const stillOpen = named.some((id) => !['done', 'dropped'].includes(byId.get(id).status))
    if (!stillOpen) problems.push(`tracked by a closed task while still open in the document: ${item.slice(0, 60)}`)
  }

  // And every item the manifest knows about must appear, so removing a bullet
  // is not a way to make this pass.
  for (const item of manifest.openItems) {
    if (!items.some((line) => line.includes(item.marker))) {
      problems.push(`${item.id} is in the manifest but no longer listed in the document`)
    }
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
