#!/usr/bin/env node
// Verifies KN-070: where رد شده belongs on the board.
//
// Exit condition: DESIGN.md records the answer as a decision with who made it,
// section 6 no longer lists it as open, and the column order in section 3
// matches.
//
// Read-only. It checks a document, so there is nothing to plant and nothing to
// restore; what it can do is refuse the three ways this goes stale. The third
// check is the one with teeth: the owner's answer CONTRADICTS the drawn order,
// so a document that records the decision and leaves section 3 saying رد شده is
// fourth is a document that will be followed in two directions at once.

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const DESIGN = readFileSync(join(ROOT, 'DESIGN.md'), 'utf8')

const REJECTED = 'رد شده'
const OFFER = 'پیشنهاد کار'

const failures = []
const check = (label, run) => {
  const problem = run()
  if (problem) failures.push(`${label}: ${problem}`)
  else process.stdout.write(`  ok   ${label}\n`)
}

const section = (heading, next) => {
  const from = DESIGN.indexOf(heading)
  if (from === -1) return ''
  const to = DESIGN.indexOf(next, from + heading.length)
  return DESIGN.slice(from, to === -1 ? DESIGN.length : to)
}

const open = section('## 6. Open questions', '## 7.')
const board = section('## 3. Decisions the design already made', '## 4.')

check('the decision is recorded, and says who made it', () => {
  if (!/### Settled by the owner/.test(open)) return 'section 6 has no settled block'
  const settled = open.slice(open.indexOf('### Settled by the owner'))
  if (!settled.includes(REJECTED)) return `the settled block does not mention ${REJECTED}`
  // "Owner" and the card id, so the record says who decided and which question
  // it answers. A decision with no attribution is a preference someone will
  // later assume was read off the design.
  const entry = settled.slice(settled.indexOf(REJECTED))
  if (!/Owner/.test(entry.slice(0, 400))) return 'the entry does not name who decided it'
  return /KN-070/.test(entry.slice(0, 400)) ? null : 'the entry does not cite KN-070'
})

check('section 6 no longer lists it as an OPEN question', () => {
  // Only the part above the settled block is still "open".
  const stillOpen = open.split('### Settled by the owner')[0] ?? ''
  const bullets = stillOpen.split('\n').filter((line) => line.trimStart().startsWith('- '))
  const offending = bullets.filter((line) => line.includes(REJECTED))
  return offending.length ? `still listed as open: ${offending[0]?.trim().slice(0, 80)}` : null
})

check('section 3 puts رد شده AFTER پیشنهاد کار, which is what the owner chose', () => {
  if (!board) return 'section 3 was not found'
  // The drawn order has رد شده fourth, before the offer column. The owner moved
  // it last. Both facts have to be present, or the document quietly contradicts
  // either the design or the decision, and whoever builds the board follows
  // whichever half they happened to read.
  if (!/owner moved/i.test(board)) return 'section 3 does not record that the owner moved it'
  if (!board.includes(OFFER)) return `section 3 does not mention ${OFFER}`
  const moved = board.slice(board.search(/owner moved/i))
  const rejectedAt = moved.indexOf(REJECTED)
  const offerAt = moved.indexOf(OFFER)
  if (rejectedAt === -1 || offerAt === -1) return 'the sentence recording the move names only one of the two columns'
  return rejectedAt < offerAt ? null : 'the sentence reads as if the offer moved rather than the rejection'
})

check('and the DECISION ITSELF says the column collapses, not just the prose around it', () => {
  const settled = open.slice(open.indexOf('### Settled by the owner'))
  // The bolded statement, not a window of nearby text. Searching a window let
  // the answer be changed to "always open" while the paragraph explaining WHY
  // it collapses sat two sentences below and matched the grep. Every check in
  // this repository that has ever passed dishonestly did it this way.
  const line = settled.split('\n').find((row) => row.startsWith('**') && row.includes(REJECTED))
  if (!line) return 'there is no bolded decision line naming the column'
  return /collaps/i.test(line) ? null : `the decision reads "${line.trim().slice(0, 90)}", which does not say it collapses`
})

if (failures.length) {
  process.stderr.write(`\nKN-070 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-070 verify passed.\n')
