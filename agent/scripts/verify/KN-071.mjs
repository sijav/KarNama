#!/usr/bin/env node
// Verifies KN-071: whether a contact needs an email or a phone.
//
// Exit condition: DESIGN.md records the answer as a decision, section 6 no
// longer lists it as open, and KN-031 and KN-039 state the resulting rule.
//
// The answer is that a contact needs ONLY a full name. That makes this awkward
// to check, because the rule is that something is NOT required, and a check for
// an absence passes trivially against a card that says nothing at all. So the
// cards are required to state it POSITIVELY — "a contact saves with a full name
// and nothing else" — and this looks for that sentence rather than for the
// absence of another. An absent requirement is invisible to whoever builds the
// form, which is exactly how KN-149 came to be filed against KN-070.
//
// Read-only.

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const DESIGN = readFileSync(join(ROOT, 'DESIGN.md'), 'utf8')
const board = JSON.parse(readFileSync(join(ROOT, 'agent', 'board.json'), 'utf8'))
const byId = new Map((Array.isArray(board.tasks) ? board.tasks : Object.values(board.tasks ?? board)).map((t) => [t.id, t]))

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
const settled = open.includes('### Settled by the owner') ? open.slice(open.indexOf('### Settled by the owner')) : ''
const stillOpen = open.split('### Settled by the owner')[0] ?? ''

check('the decision is recorded, and says who made it and which card', () => {
  if (!settled) return 'section 6 has no settled block'
  // The bolded decision line, not a window of nearby prose. KN-070's verifier
  // passed while its answer read the opposite, because a later explanatory
  // sentence matched the grep, and this is the same shape of check.
  const line = settled.split('\n').find((row) => row.startsWith('**') && /contact/i.test(row))
  if (!line) return 'there is no bolded decision line about the contact'
  if (!/only a full name/i.test(line)) return `the decision line does not say a full name is all that is required: "${line.trim().slice(0, 90)}"`
  const entry = settled.slice(settled.indexOf(line), settled.indexOf(line) + 500)
  if (!/Owner/.test(entry)) return 'the entry does not name who decided it'
  return /KN-071/.test(entry) ? null : 'the entry does not cite KN-071'
})

check('section 6 no longer asks it as an open question', () => {
  const bullets = stillOpen.split('\n').filter((line) => line.trimStart().startsWith('- '))
  const offending = bullets.filter((line) => /contact route|email or phone/i.test(line))
  return offending.length ? `still listed as open: ${offending[0]?.trim().slice(0, 80)}` : null
})

check('the decision records that the PERMISSIVE rule was chosen deliberately', () => {
  // The file's own note argues the other way, so a reader who finds only the
  // rule and not the argument may "correct" it back. The record has to carry
  // the fact that the note was seen and overruled.
  const entry = settled.slice(settled.search(/\*\*A contact/i))
  if (!entry) return 'the contact decision could not be located'
  const first = entry.slice(0, 700)
  return /useless|note/i.test(first)
    ? null
    : 'the entry does not record that the design own note arguing the other way was put to the owner'
})

for (const id of ['KN-031', 'KN-039']) {
  check(`${id} states the rule, as something that must SUCCEED`, () => {
    const task = byId.get(id)
    if (!task) return `${id} is not on the board`
    const exit = String(task.exit ?? '')
    // Positive, not an absence. "does not require email" is satisfied by a card
    // that never mentions contacts at all; "saves with a full name and nothing
    // else" is a thing a builder can be held to.
    if (!/full name/i.test(exit)) return `${id}'s exit condition does not mention the full name rule`
    if (!/KN-071/.test(exit)) return `${id}'s exit condition states a rule without citing the decision it comes from`
    const positive = /saves? with|accepted|read back/i.test(exit)
    return positive ? null : `${id} states the rule only as an absence, which a card that says nothing also satisfies`
  })
}

if (failures.length) {
  process.stderr.write(`\nKN-071 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-071 verify passed.\n')
