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
//
// The third one is «افراد مرتبط», NOT «مخاطبین». KN-152: DESIGN.md states a
// terminology rename without exception — the nav item became «شبکه من» and the
// tab inside the job modal became «افراد مرتبط» — and this array used to
// require the superseded word, so the verifier told a builder the wrong label
// was right.
const TABS = ['اطلاعات آگهی', 'سابقه', 'یادداشت', 'افراد مرتبط', 'فایل‌ها']

// The superseded label, and the two places it is still TRUE.
//
// It cannot simply be banned from DESIGN.md: the document has to be able to say
// what the frame draws and to record the rename itself. A check that forbids
// the word outright would flag the sentence that fixes the problem, which is
// the mistake this repository has shipped three times, so each occurrence is
// classified by the context around it instead.
//
// Matched against the document with whitespace collapsed, because both
// sanctioned sentences wrap across lines and a line-based check would see half
// of one and call it unexplained.
const SUPERSEDED = 'مخاطبین'
// Written out rather than read from TABS, so that when a mutation reverts TABS
// itself the message still names the label that is actually correct instead of
// echoing the mistake back.
const NEW_TAB = 'افراد مرتبط'
const SANCTIONED = [
  // The label Figma itself draws, marked as the frame's rather than the build's.
  'در فریم',
  'the rename below supersedes',
  // The sentence that RECORDS the rename, identified by the new nav label.
  'شبکه من',
]

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

check('the two canonical tab lists are exactly the five tabs, in order', () => {
  // KN-152, and the shape matters. My first attempt scanned DESIGN.md for the
  // old word and classified each hit by a window of surrounding text. The plan
  // check killed it: turning a list into five bullets makes such a locator miss
  // a bad entry, and a sentence naming all five and then saying "Figma calls
  // this one X" is falsely rejected. It is also the weakness KN-154 already
  // files against the 1200-character window above.
  //
  // So the two AUTHORITATIVE lists are extracted by their own boundaries and
  // required to be exactly TABS, in order. Prose elsewhere is not searched,
  // which is what lets the frame description and the rename sentence stand
  // without an exception being written for them.
  const flat = DESIGN.split(/\s+/).join(' ')

  const three = /has FIVE:\s*([^.]+)\./.exec(flat)
  if (!three) return 'section 3 no longer states the five tabs after a "has FIVE:" clause'
  const threeList = three[1].split(',').map((tab) => tab.trim())

  // The blockquote line ITSELF, found in the raw document rather than in the
  // flattened one. The first version anchored on the sentence that follows the
  // quote, and KN-153 rewrote that sentence, which broke the extraction — the
  // same mistake as depending on prose, one level down. A quoted line carrying
  // separators is a structural feature; the words around it are not.
  const quoted = DESIGN.split('\n').filter((line) => /^>\s*\S/.test(line) && line.includes('·'))
  if (quoted.length === 0) return 'section 6 no longer quotes the canonical tab list'
  if (quoted.length > 1) return `${quoted.length} quoted tab lists were found, so which one is canonical is not stated`
  const sixList = (quoted[0] ?? '').replace(/^>\s*/, '').replace(/\*\*/g, '').split('·').map((tab) => tab.trim()).filter(Boolean)

  // The label regression is looked for FIRST, and this order is load-bearing.
  // Checking the list against TABS first also catches it, but reports it as
  // "these five are not those five", which is the generic message every other
  // way of breaking the list produces. KN-152 asks for its own message, and a
  // mutation proved the generic one fired instead.
  if (TABS.includes(SUPERSEDED)) {
    return `this verifier still REQUIRES the superseded tab label «${SUPERSEDED}»; the modal tab is «${NEW_TAB}»`
  }
  for (const [where, list] of [['section 3', threeList], ['section 6', sixList]]) {
    if (list.includes(SUPERSEDED)) {
      return `${where} still uses the superseded tab label «${SUPERSEDED}»; the modal tab is «${NEW_TAB}»`
    }
  }

  for (const [where, list] of [['section 3', threeList], ['section 6', sixList]]) {
    if (list.length !== TABS.length || list.some((tab, at) => tab !== TABS[at])) {
      return `${where} lists [${list.join(' | ')}], not the five tabs in order [${TABS.join(' | ')}]`
    }
  }

  // The survivor, asserted rather than assumed. DESIGN.md must STILL contain
  // the old word, because it has to be able to say what Figma draws and to
  // record the rename. A check that drove it out of the document entirely would
  // be destroying the history it depends on.
  if (!flat.includes(SUPERSEDED)) {
    return 'the superseded label is gone from DESIGN.md entirely, so the rename is no longer recorded anywhere'
  }
  return SANCTIONED.some((marker) => flat.includes(marker)) ? null : 'nothing in DESIGN.md explains why the old label still appears'
})

check('the owner settled the OWN TAB; the second POSITION is marked as the author\'s', () => {
  // KN-153. The settled block is the one place in this repository whose
  // authority comes from the owner rather than from the agent. The owner was
  // asked whether history gets its own tab and said yes. Nobody asked where
  // that tab sits: the author chose second. Recording that inside the owner's
  // entry launders an agent decision into an owner decision, and the owner
  // loses the chance to say no to something they were never asked.
  //
  // The marker is declarative rather than inferred, for the reason this file
  // has learned four times: a check that decides which prose is an owner claim
  // by reading the words around it is defeated by rewording the words.
  const PROPOSAL = /author proposal, not yet put to the owner/i
  // A claim about WHERE the tab sits, as opposed to that it exists.
  const POSITION = /history goes second|position,? second/i
  const flat = DESIGN.split(/\s+/).join(' ')

  // Every paragraph that claims the position must carry the marker ITSELF.
  // Requiring the marker to exist somewhere in the document was not enough: a
  // mutation deleting it from section 6 still passed, because section 3 has its
  // own copy. Paragraphs are the unit because that is how the claim and its
  // attribution are actually written, and unlike a character window it does not
  // change meaning when a sentence is re-wrapped.
  const paragraphs = DESIGN.split(/\n\s*\n/).map((block) => block.split(/\s+/).join(' '))
  const claiming = paragraphs.filter((block) => POSITION.test(block))
  if (claiming.length === 0) return 'DESIGN.md no longer states where the history tab sits at all'
  const unmarked = claiming.filter((block) => !PROPOSAL.test(block))
  if (unmarked.length) {
    return `a paragraph claims the tab POSITION without marking it as an author proposal: "${unmarked[0]?.slice(0, 90)}..."`
  }

  // The owner's own entry, bounded by its heading and the next one, must not
  // claim the position.
  const from = flat.search(/\*\*Status history gets its own tab/i)
  if (from === -1) return 'the owner-settled entry for status history could not be located'
  const rest = flat.slice(from + 4)
  const to = rest.search(/\*\*[A-Z]/)
  const entry = to === -1 ? rest : rest.slice(0, to)

  if (/\bsecond\b/i.test(entry) && !PROPOSAL.test(entry)) {
    return 'the owner-settled entry claims the tab POSITION, which the owner was never asked about; mark it as an author proposal'
  }
  return null
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

check('no OPEN card still specifies the four-tab modal, or history inside Info', () => {
  // KN-155. KN-072 updated KN-030 and stopped, so the sweep for downstream
  // cards was never finished and KN-045 went on describing the arrangement the
  // owner had rejected — while verifying green, because its exit condition only
  // asked that history GROW, never where it rendered.
  //
  // Only OPEN cards. A closed card's text is a record of what was true when it
  // closed, and rewriting history to satisfy a checker is worse than the
  // contradiction. This card's own description quotes the wrong wording in
  // order to name it, and is closed by the time this runs.
  //
  // Contrast clauses are stripped BEFORE looking, the same way the KN-030 check
  // above does it: "history LEAVES the Info tab" and "its own tab RATHER THAN
  // Info" are the clearest ways to write the correct thing, and a pattern
  // greedy enough to span them flags the very wording that fixes the problem.
  const offenders = []
  for (const task of board.tasks) {
    if (task.status === 'done' || task.status === 'dropped') continue
    const text = [task.title, task.desc, task.exit].join(' ').split(/\s+/).join(' ')
    const asserted = text
      .replace(/\brather than[^.]*/gi, '')
      .replace(/\b(not|no longer|leaves|instead of|used to|superseded)\b[^.]*/gi, '')
    if (/four[- ]tab modal/i.test(asserted)) offenders.push(`${task.id} still calls it a four-tab modal`)
    else if (/history[^.]{0,40}\b(in|inside) the info tab/i.test(asserted)) {
      offenders.push(`${task.id} still places history inside the Info tab`)
    }
  }
  if (offenders.length) return offenders.join('; ')
  // Positive control: the sweep must actually be looking at cards.
  const open = board.tasks.filter((task) => task.status !== 'done' && task.status !== 'dropped')
  return open.length > 0 ? null : 'no open cards were examined, so this check proves nothing'
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
