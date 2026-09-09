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

/**
 * A committed capture, checked byte for byte against its recorded digest.
 *
 * Throws rather than returning a problem, because every caller treats a
 * tampered or missing capture as fatal and a check that swallows it would be
 * the same false pass it exists to prevent.
 */
const capture = (key) => {
  const record = manifest.source?.captures?.[key]
  if (!record?.file) throw new Error(`the manifest records no ${key} capture`)
  const body = readFileSync(join(ROOT, record.file))
  const digest = createHash('sha256').update(body).digest('hex')
  if (digest !== record.sha256) throw new Error(`${record.file} has changed since it was captured`)
  if (body.length !== record.bytes) {
    throw new Error(`${record.file} is ${body.length} bytes, the manifest says ${record.bytes}`)
  }
  return { record, text: body.toString('utf8') }
}

/** The top-level frame ids in a committed capture, derived not listed. */
const captureNodes = (key) =>
  capture(key)
    .text.split(/\r?\n/)
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
  const nodes = captureNodes('screens')
  if (nodes.length < 40) return `only ${nodes.length} frames derivable from the capture, which looks truncated`
  const missing = nodes.filter((node) => !design.includes(node))
  return missing.length
    ? `${missing.length} of ${nodes.length} captured frames are not in the document: ${missing.slice(0, 8).join(', ')}`
    : null
})

check('the documentation frame list is DERIVED from a committed capture too', () => {
  // The same argument, applied to the canvas this task is actually about. The
  // screens half was captured and the documentation half was not, so a frame
  // could be dropped from `documentationFrames` AND from DESIGN.md and the
  // whole thing stayed green: the verifier was looping the author's own list.
  // Canvas 5:8 is now committed, the 14 frames are derived from it, and the
  // manifest must match that set exactly in BOTH directions.
  const captured = captureNodes('documentation')
  if (captured.length < 10) return `only ${captured.length} frames derivable from 5:8, which looks truncated`

  const claimed = new Set(manifest.documentationFrames.map((frame) => frame.node))
  const unclaimed = captured.filter((node) => !claimed.has(node))
  if (unclaimed.length) {
    return `${unclaimed.length} captured frame(s) missing from the manifest: ${unclaimed.join(', ')}`
  }
  const invented = [...claimed].filter((node) => !captured.includes(node))
  if (invented.length) return `manifest claims frame(s) the capture does not contain: ${invented.join(', ')}`

  const absent = captured.filter((node) => !design.includes(node))
  return absent.length ? `captured frame(s) not in DESIGN.md: ${absent.join(', ')}` : null
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

  // And every item the manifest knows about must appear SOMEWHERE, so removing
  // a bullet is not a way to make this pass.
  //
  // An answered question is not a removed one. When the owner settles an item
  // the bullet leaves the open list on purpose, and this check used to read
  // that as the question being dropped: recording four decisions turned KN-002
  // red, which punished the correct action and invited someone to weaken the
  // check rather than record the answer. So the manifest carries the
  // DISPOSITION, and each disposition is looked for where it belongs.
  const settledBody = sectionBody('Open questions the design has not settled')?.split('### Settled by the owner')[1] ?? ''

  for (const item of manifest.openItems) {
    if (item.settledBy) {
      // Settled: it must be in the settled block, naming the card that settled
      // it, and it must NOT still be asked as an open question.
      // Either the marker phrase or the frame it came from. An ANSWER is
      // allowed to be worded differently from the question that prompted it:
      // "should a contact require email or phone" is settled by "a contact
      // needs only a full name", which shares no phrase with it. The frame id
      // is what both cite, so it identifies the item across the rewording, and
      // demanding the question's words appear in the answer would mean
      // contorting the prose to satisfy a grep.
      const identified = settledBody.includes(item.marker) || (item.from && settledBody.includes(item.from))
      if (!identified) {
        problems.push(`${item.id} is recorded as settled by ${item.settledBy} but neither "${item.marker}" nor frame ${item.from} appears in the settled block`)
      } else if (!settledBody.includes(item.settledBy)) {
        problems.push(`${item.id} is in the settled block but does not name ${item.settledBy}, so nothing ties the answer to the card that got it`)
      }
      if (items.some((line) => line.includes(item.marker))) {
        problems.push(`${item.id} is settled in the manifest and still listed as an open question`)
      }
      continue
    }
    if (!items.some((line) => line.includes(item.marker))) {
      problems.push(`${item.id} is in the manifest but no longer listed in the document`)
    }
  }
  return problems.length ? problems.join(' | ') : null
})

check('everywhere the CAPTURES say something is unsettled is accounted for', () => {
  // The strongest check here, and the one that would have caught what a roast
  // caught by hand: the source says which of its own items are unfinished, in
  // its own words, and that is evidence rather than assertion.
  //
  // DESIGN.md claimed all sixteen copy changes in 505:3 "were applied" and that
  // nothing was left in the Figma file alone. Two of the sixteen say inside the
  // frame that they were NOT applied: one records that the node does not exist
  // after searching every Add and Edit state, the other that the text was not
  // found and needs manual review. Every check passed, because every check was
  // reading what the author wrote about the source instead of the source.
  //
  // Scanning DESIGN.md for English open-item vocabulary cannot do this: a
  // document can only be checked for what it says. A capture can be checked for
  // what it says is missing.
  const PENDING = [
    /نیاز به بررسی/, // needs review
    /نیاز به تأیید|نیاز به تایید/, // needs confirmation
    /پیدا نشد/, // was not found
    /وجود ندار(?:ه|د)/, // does not exist
    /تأییدنشده|تاییدنشده|تأیید نشده/, // unconfirmed
    /⚠/, // the designer's own warning marker
  ]

  const found = []
  for (const key of Object.keys(manifest.source?.captures ?? {})) {
    for (const line of capture(key).text.split(/\r?\n/)) {
      if (!PENDING.some((pattern) => pattern.test(line))) continue
      const node = (/id="([^"]+)"/.exec(line) || [])[1]
      if (node) found.push({ node, capture: key })
    }
  }
  if (!found.length) return 'no pending marker found in any capture, which means the scan is broken, not that the design is clean'

  const recorded = new Map((manifest.capturePending ?? []).map((item) => [`${item.capture}/${item.node}`, item]))
  const byId = new Map(board.tasks.map((task) => [task.id, task]))
  const problems = []

  for (const { node, capture: key } of found) {
    const item = recorded.get(`${key}/${node}`)
    if (!item) {
      problems.push(`${key} ${node} is marked pending in the capture and recorded nowhere`)
      continue
    }
    // A capture is a historical artefact: the marker in it never goes away, so
    // "the owning task must still be open" was a trap. Completing KN-077 would
    // fail this check, and deleting its record would fail the other direction,
    // leaving no way to ever finish. A disposition is therefore permanent: a
    // task while it is open, or a written decision and the heading it landed
    // under once it is closed.
    const hasTask = typeof item.decidedBy === 'string'
    const hasDecision = typeof item.decided === 'string' && typeof item.landedIn === 'string'
    if (hasTask === hasDecision) {
      problems.push(`${key} ${node} needs exactly one of decidedBy, or decided plus landedIn`)
      continue
    }
    if (hasTask) {
      const owner = byId.get(item.decidedBy)
      if (!owner) problems.push(`${key} ${node} is assigned to ${item.decidedBy}, which is not on the board`)
      else if (['done', 'dropped'].includes(owner.status)) {
        problems.push(
          `${key} ${node} is assigned to ${item.decidedBy}, which is ${owner.status}: record what was decided and where it landed instead`,
        )
      }
    } else if (sectionBody(item.landedIn) === null) {
      problems.push(`${key} ${node} says it landed under "${item.landedIn}", which is not a heading in DESIGN.md`)
    }
  }
  // Both directions: a recorded item whose marker has gone from the capture is a
  // stale entry, and leaving those in is how the inventory stops meaning
  // anything.
  const live = new Set(found.map(({ node, capture: key }) => `${key}/${node}`))
  for (const key of recorded.keys()) {
    if (!live.has(key)) problems.push(`${key} is recorded as pending but the capture no longer says so`)
  }
  return problems.length ? problems.join(' | ') : null
})

check('the copy-change counts in DESIGN.md are DERIVED from the capture', () => {
  // "Fourteen of the sixteen were applied" was written to correct a roast
  // finding, and was itself an unverified number: the same defect one level up.
  // Frame 505:3 enumerates its changes with Persian ordinals, so both numbers
  // come out of the capture. Change the source and the document has to follow,
  // or this fails.
  const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty']
  const PENDING = /نیاز به بررسی|نیاز به تأیید|نیاز به تایید|پیدا نشد|وجود ندار(?:ه|د)/

  const lines = capture('documentation').text.split(/\r?\n/)
  const start = lines.findIndex((line) => /^  <frame id="505:3"/.test(line))
  if (start === -1) return 'frame 505:3 is not in the capture'
  const end = lines.findIndex((line, index) => index > start && /^  <\/frame>/.test(line))
  const block = lines.slice(start, end === -1 ? undefined : end)

  const items = block.filter((line) => /<text id="[^"]+" name="[۰-۹]+\.\s/.test(line))
  const pending = items.filter((line) => PENDING.test(line))
  const total = WORDS[items.length]
  const applied = WORDS[items.length - pending.length]
  const outstanding = WORDS[pending.length]
  if (!total || !applied) return `derived ${items.length} items and ${pending.length} pending, which is outside the word table`

  const problems = []
  if (!design.includes(`${total} copy changes`)) problems.push(`the document does not say "${total} copy changes"`)
  if (!design.includes(`${outstanding} were not`)) problems.push(`the document does not say "${outstanding} were not"`)

  // Every "N of the sixteen" in the document has to be the derived number, so a
  // second sentence cannot drift away from the first.
  const claims = [...design.matchAll(new RegExp(`\\b(\\w+) of (?:the |its )?${total}\\b`, 'gi'))]
  if (!claims.length) problems.push(`the document never says how many of the ${total} were applied`)
  for (const claim of claims) {
    if (claim[1].toLowerCase() !== applied) {
      problems.push(`the document claims "${claim[0]}" where the capture gives ${applied}`)
    }
  }
  return problems.length ? problems.join(' | ') : null
})

check('the truncation the document admits to is MEASURED, not estimated', () => {
  // DESIGN.md tells the reader how much of the capture is cut off, which is the
  // one thing standing between "derived from source" and overclaiming. A number
  // written by hand there would rot the moment the capture is replaced, and
  // rotting downwards -- claiming less truncation than there is -- is exactly
  // the direction that misleads. So it is measured here.
  const names = [...capture('documentation').text.matchAll(/name="([^"]*)"/g)].map((match) => [...match[1]].length)
  const cap = Math.max(...names.filter((length) => names.filter((other) => other === length).length > 10))
  const atCap = names.filter((length) => length >= cap - 2 && length <= cap).length

  const problems = []
  if (!design.includes(`${atCap} of the ${names.length} names`)) {
    problems.push(`the capture has ${atCap} of ${names.length} names at or just under the cap of ${cap}, and DESIGN.md does not say so`)
  }
  if (atCap / names.length > 0.6) problems.push(`${atCap} of ${names.length} names are truncated, which is too much to derive anything from`)
  return problems.length ? problems.join(' | ') : null
})

check('nothing is left open ANYWHERE in the document, not just in section 6', () => {
  // The previous version parsed only the open-questions section, so an item
  // written as ordinary prose elsewhere was invisible. It missed a real one:
  // "The Review fields are provisional until the Job Record shape is finalised"
  // sat in section 3 for four rounds, citing nothing, while the exit condition
  // claimed every open item in the FILE was disposed of. Found by a roast.
  //
  // Section 6 is excluded here only because the check above parses it far more
  // strictly; everything outside it is scanned for the vocabulary of an
  // undecided thing, and each hit must carry its own disposition.
  const OPEN = /\b(provisional|unconfirmed|undecided|unresolved|open question|open item|to be decided|not (?:yet )?(?:settled|decided)|TBD)\b/i
  const DISPOSED = /\b(section 6|open questions)\b/i

  const heading = /^(#{2,4}) .*Open questions the design has not settled.*$/m.exec(design)
  if (!heading) return 'there is no open-questions section to exclude'
  const from = heading.index
  const rest = design.slice(from + heading[0].length)
  const next = rest.search(new RegExp(`^#{2,${heading[1].length}} `, 'm'))
  const outside = design.slice(0, from) + (next === -1 ? '' : rest.slice(next))

  const byId = new Map(board.tasks.map((task) => [task.id, task]))
  const tracked = (text) =>
    [...text.matchAll(/KN-\d{3}/g)].some((match) => {
      const task = byId.get(match[0])
      return task && !['done', 'dropped'].includes(task.status)
    })

  // Blank-line separated blocks, with table rows and list items judged one by
  // one so a disposition on a neighbouring bullet cannot cover a bare one.
  const candidates = []
  for (const block of outside.split(/\r?\n\s*\r?\n/)) {
    if (!block.trim()) continue
    const rows = block.split(/\r?\n/).filter((line) => line.trim().startsWith('|'))
    const items = listItems(block)
    if (rows.length) candidates.push(...rows)
    else if (items.length) candidates.push(...items)
    else candidates.push(block.replace(/\s+/g, ' '))
  }

  const undisposed = candidates.filter((text) => OPEN.test(text) && !DISPOSED.test(text) && !tracked(text))
  return undisposed.length
    ? `${undisposed.length} open item(s) outside section 6 with no task and no cross-reference: ${undisposed
        .map((text) => `"${text.slice(0, 70).trim()}…"`)
        .join(' | ')}`
    : null
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
