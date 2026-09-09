#!/usr/bin/env node
// Verifies KN-072: where status history belongs.
//
// Exit condition: DESIGN.md records the answer as a decision, section 6 no
// longer lists it as open, and KN-030 states where history renders.
//
// The answer moves history OUT of the Info tab and into its own, which makes
// the modal five tabs where the frame draws four. So this checks a departure
// from the design, and the thing most likely to go wrong is not the departure
// but the silence around it: a reader who finds "history has its own tab" and
// not "there are five" builds three tabs and drops Contacts and Files. That
// happened in the first draft of this decision and is what these checks are
// shaped around.
//
// Read-only.

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const DESIGN = readFileSync(join(ROOT, 'DESIGN.md'), 'utf8')
const board = JSON.parse(readFileSync(join(ROOT, 'agent', 'board.json'), 'utf8'))
const byId = new Map((Array.isArray(board.tasks) ? board.tasks : Object.values(board.tasks ?? board)).map((t) => [t.id, t]))

// Every tab the frame draws, plus the one the owner added. Named here so a
// decision that quietly loses one is caught by name rather than by count.
const TABS = ['اطلاعات آگهی', 'سابقه', 'یادداشت', 'مخاطبین', 'فایل‌ها']

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
const decisions = section('## 3. Decisions the design already made', '## 4.')

check('the decision is recorded, affirmatively, with who made it', () => {
  if (!settled) return 'section 6 has no settled block'
  const line = settled.split('\n').find((row) => row.startsWith('**') && /history/i.test(row))
  if (!line) return 'there is no bolded decision line about status history'
  // Affirmative and un-negatable, for the reason KN-071 learned the hard way: a
  // substring survives negation, so "history does NOT get its own tab" would
  // otherwise satisfy a test for "its own tab".
  if (/\b(cannot|can not|does not|never|stays? at the bottom|remains? in the info)\b/i.test(line)) {
    return `the decision line negates the answer or leaves history in Info: "${line.trim().slice(0, 90)}"`
  }
  if (!/own tab/i.test(line)) return `the decision line does not say history gets its own tab: "${line.trim().slice(0, 90)}"`
  const entry = settled.slice(settled.indexOf(line))
  const bounded = entry.slice(0, entry.indexOf('\n**') === -1 ? entry.length : entry.indexOf('\n**'))
  if (!/Owner/.test(bounded)) return 'the entry does not name who decided it'
  return /KN-072/.test(bounded) ? null : 'the entry does not cite KN-072'
})

check('section 6 no longer asks it as an open question', () => {
  const bullets = stillOpen.split('\n').filter((line) => line.trimStart().startsWith('- '))
  const offending = bullets.filter((line) => /open item 18|status history/i.test(line))
  return offending.length ? `still listed as open: ${offending[0]?.trim().slice(0, 80)}` : null
})

check('the decision names ALL FIVE tabs, so nothing is silently dropped', () => {
  // The failure this exists for. The question was illustrated with a three-tab
  // sketch and the first draft of the decision copied it, which would have lost
  // مخاطبین and فایل‌ها — two tabs the design draws and the product needs.
  const entry = settled.slice(settled.search(/\*\*Status history/i))
  if (!entry) return 'the history decision could not be located'
  const missing = TABS.filter((tab) => !entry.slice(0, 1200).includes(tab))
  return missing.length ? `the decision does not name ${missing.join(', ')}, so a reader would build without them` : null
})

check('section 3 says five, and no longer calls it open', () => {
  if (!decisions) return 'section 3 was not found'
  if (/open item 18[^.]*\*\*open, tracked by KN-072\*\*/i.test(decisions) || /history[^.]*\*\*open, tracked by KN-072\*\*/i.test(decisions)) {
    return 'section 3 still calls the history placement open'
  }
  const missing = TABS.filter((tab) => !decisions.includes(tab))
  if (missing.length) return `section 3 does not list ${missing.join(', ')} among the modal tabs`
  return /FIVE|five/.test(decisions) ? null : 'section 3 does not say the modal has five tabs'
})

check('KN-030 builds five tabs, with history in ITS OWN, not in Info', () => {
  const task = byId.get('KN-030')
  if (!task) return 'KN-030 is not on the board'
  const exit = String(task.exit ?? '')
  // The card is what somebody builds from, so the contradiction has to be gone
  // from the card and not only from the document.
  //
  // The contrast clause is removed BEFORE looking. The card correctly reads
  // "renders in its OWN tab rather than in the Info tab", and a pattern greedy
  // enough to span that sentence flagged the very wording that fixes the
  // problem. Naming the old location in order to rule it out is the clearest
  // way to write the card, so the check has to allow it.
  const asserted = exit
    .replace(/\brather than[^.]*/gi, '')
    .replace(/\b(not|no longer)\b[^.]*/gi, '')
  if (/renders? (in|inside|at) the info tab/i.test(asserted)) {
    return 'KN-030 still says history renders in the Info tab, which is the opposite of the decision'
  }
  if (/all four tabs/i.test(exit)) return 'KN-030 still asks for four tabs'
  if (!/five/i.test(exit)) return 'KN-030 does not say how many tabs there are'
  return /own tab/i.test(exit) ? null : 'KN-030 does not say history renders in its own tab'
})

check('the manifest records it as settled by this card', () => {
  const manifest = JSON.parse(readFileSync(join(ROOT, 'agent', 'design-manifest.json'), 'utf8'))
  const item = manifest.openItems.find((entry) => entry.id === 'status-history-placement')
  if (!item) return 'status-history-placement is not in the manifest at all'
  return item.settledBy === 'KN-072'
    ? null
    : `the manifest says it was settled by ${item.settledBy ?? 'nobody'}, not KN-072`
})

if (failures.length) {
  process.stderr.write(`\nKN-072 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-072 verify passed.\n')
