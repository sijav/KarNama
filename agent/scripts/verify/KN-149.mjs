#!/usr/bin/env node
// Verifies KN-149: the cards that build the board require رد شده to collapse.
//
// KN-070 settled that رد شده sits last, after پیشنهاد کار, and renders
// collapsed to a count by default, expanding on click. DESIGN.md records it.
// The cards that BUILD the board did not, so KN-043 and KN-060 could each be
// satisfied completely while rendering it as an ordinary always-open column.
//
// **Why this is a literal match, when three cards in a row were about literal
// matches failing.** What fails is INFERRING meaning from prose someone is free
// to reword: a pattern for words meaning "collapsed" is defeated by any rewrite,
// and `agent/scripts/lib/contract.mjs` says so in its own header, which is why
// all ten of its rules are NEGATIVE. This is not that. One canonical clause is
// agreed and required verbatim. A card either contains the contracted sentence
// or it does not, and nobody has to judge whether a rewording still means the
// same thing, because a rewording IS a change to the contract and shows up as
// one. The check is a textual contract, not a reading comprehension test.
//
// **What this does NOT do.** It does not discover which cards build the board.
// There is no structural property saying so, and KN-043's `parent` list is
// dependency data rather than a derivation of that, so `CARDS` below is a short
// human-maintained list. A card added later that should carry the clause and
// does not is NOT caught. That limit is real and stated rather than dressed up.
//
// It also does not detect that the owner REVERSED KN-070. If a canonical
// DESIGN.md sentence is gone or altered, this reports the decision as STALE and
// asks for a person, because presence-plus-negation over prose is a
// regression mechanism and a rewritten decision can walk straight past it.
//
// Read-only.

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))

/**
 * The decision, its contracted clause, and the cards required to carry it.
 *
 * `design` holds the sentences in DESIGN.md the clause is derived from. They are
 * matched with whitespace collapsed, because DESIGN.md is hard-wrapped and one
 * of these three already spans two lines: a literal match against the file
 * would break the next time somebody re-flows a paragraph, which is a change to
 * the layout and not to the decision.
 */
const DECISION = {
  id: 'rejected-column-collapsed',
  // ONE CLAUSE PER CARD, split by what the card can actually deliver. KN-199:
  // both used to carry an identical sentence naming the column's POSITION, and
  // KN-060 is a reusable column component that does not know which column it is.
  // Asking its implementer for a board-placement fact leaves them one way to
  // satisfy the words, which is to hard-code the board inside the component —
  // the very defect KN-149 exists to prevent, one card over.
  clauses: {
    // The board screen owns where a column sits.
    'KN-043': 'رد شده is the last column, after پیشنهاد کار, and the board renders it collapsed to a count by default.',
    // The column component owns how it renders when collapsed, and nothing about
    // where it is.
    'KN-060': 'A column can render COLLAPSED to a count instead of its cards, and expands on click; the board decides which column starts collapsed, this component does not know which one it is.',
  },
  design: [
    '«رد شده» stays as the last column, collapsed to a count by default.',
    'The owner moved رد شده after پیشنهاد کار, so it is last.',
    'Rejected is the last stage of the pipeline and it expands on click.',
  ],
}

const flat = (text) => (text ?? '').split(/\s+/).join(' ').trim()
const carries = (text, clause) => flat(text).includes(flat(clause))

const board = JSON.parse(readFileSync(join(ROOT, 'agent', 'board.json'), 'utf8'))
const design = readFileSync(join(ROOT, 'DESIGN.md'), 'utf8')
const byId = new Map(board.tasks.map((task) => [task.id, task]))

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

check('the clause is a real sentence, not something that matches everything', () => {
  // The trivially-true clause. An empty or one-word contract would make every
  // card below pass while contracting nothing, and it would look identical.
  const words = Object.values(DECISION.clauses).flatMap((clause) => flat(clause).split(' '))
  if (words.length < 8) return `the clause is only ${words.length} words, which contracts almost nothing`
  const cards = Object.keys(DECISION.clauses)
  if (!cards.length) return 'the registry names no cards, so the loop below checks nothing'
  // KN-199: two cards sharing one sentence is what put a board fact into a
  // component's contract, so identical clauses are refused outright.
  const distinct = new Set(Object.values(DECISION.clauses).map(flat))
  return distinct.size === cards.length ? null : 'two cards are contracted to the SAME clause, which is how a fact lands on a card that cannot deliver it'
})

check('the instrument can say NO as well as YES', () => {
  // Positive control. An absence proves nothing unless the same comparison is
  // shown producing a presence, and vice versa. Synthetic strings, so this does
  // not quietly depend on some other card's wording staying as it is.
  const without = 'An e2e test seeds an archive and drags a card between two columns.'
  const sample = DECISION.clauses['KN-043'] ?? ''
  const with_ = `Something before it. ${sample} Something after it.`
  if (carries(without, sample)) return 'text lacking the clause was reported as carrying it'
  if (!carries(with_, sample)) return 'text containing the clause was reported as lacking it'
  // Re-wrapped, because the board stores one string and renders it wrapped.
  const wrapped = sample.replace(/ /g, '\n   ')
  return carries(wrapped, sample) ? null : 'the same clause re-wrapped was not recognised'
})

check('every card the decision names is still on the board', () => {
  const missing = Object.keys(DECISION.clauses).filter((id) => !byId.has(id))
  return missing.length
    ? `${missing.join(', ')} is named by the decision but not on the board, so the registry is stale`
    : null
})

check('every named card carries the clause in its EXIT condition', () => {
  // The exit condition specifically, because that is the field somebody builds
  // from. A requirement recorded anywhere else is a requirement they can meet
  // the card without reading.
  const checked = []
  const bare = []
  const wrong = []
  for (const [id, clause] of Object.entries(DECISION.clauses)) {
    const task = byId.get(id)
    if (!task) continue
    checked.push(id)
    if (!carries(task.exit, clause)) bare.push(id)
    // Its OWN clause, not any clause. Swapping the two between the cards would
    // otherwise pass: each would still carry something from the registry.
    for (const [otherId, otherClause] of Object.entries(DECISION.clauses)) {
      if (otherId !== id && carries(task.exit, otherClause)) wrong.push(`${id} carries the clause contracted to ${otherId}`)
    }
  }
  if (wrong.length) return wrong.join('; ')
  if (checked.length !== Object.keys(DECISION.clauses).length) {
    return `only ${checked.length} of ${Object.keys(DECISION.clauses).length} cards were examined`
  }
  return bare.length ? `${bare.join(', ')} does not name the collapsed rejected column in its exit condition` : null
})

check('the DESIGN.md decision the clause comes from is still there', () => {
  const flatDesign = flat(design)
  const gone = DECISION.design.filter((sentence) => !flatDesign.includes(flat(sentence)))
  if (!gone.length) return null
  return (
    `STALE: DESIGN.md no longer contains ${gone.length} of the sentences this clause was derived from.\n` +
    gone.map((sentence) => `      missing: ${sentence}`).join('\n') +
    `\n      This does NOT mean the decision was reversed, and this check cannot tell.` +
    `\n      Read DESIGN.md, decide what ${DECISION.id} should now say, and update the registry.`
  )
})

if (failures.length) {
  process.stderr.write(`\nKN-149 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-149 verify passed.\n')
