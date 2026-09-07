// Does the board instruct anything the design contract forbids?
//
// This exists because the same defect was found twice by an outside reviewer and
// missed twice by me. Both times I "reconciled" the board by editing the cards I
// remembered, which is not checking. A card that passes its own exit condition
// while building the wrong product is the most expensive kind of wrong, because
// nothing downstream signals it.
//
// **What this is NOT.** It is not a proof that the board agrees with DESIGN.md.
// It is a regression checker: a rule per decision that has actually been got
// wrong, or that is easy to get wrong. Regexes over prose cannot express "the
// sidebar is on the right", only "nobody wrote the words that mean it is on the
// left". Read DESIGN.md; this only stops the board drifting back.
//
// Every rule names its anchor in DESIGN.md, so a reader can check the rule
// against the decision rather than taking the rule's word for it.

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const FIELDS = ['title', 'desc', 'why', 'exit']

export const RULES = [
  {
    forbidden: /\breorder\b/i,
    allowed: [/reorder was removed/i, /cannot be edited or reordered/i, /reorder is not/i],
    why: 'the column menu has three options, reorder was removed from the design',
    anchor: 'custom statuses are managed inline',
  },
  {
    forbidden: /\b(?:two|2) (?:nav |navigation )?destinations\b|\bexactly two routes\b/i,
    allowed: [/two destinations.{0,40}superseded/i],
    why: 'navigation has three destinations',
    anchor: 'section 3, navigation',
  },
  {
    // The gap a reviewer found: forbidding "two destinations" said nothing about
    // adding a FOURTH, which is the mistake the language switch invites.
    forbidden: /\b(?:fourth|4th|another|extra|additional)\s+(?:item|entry|tab|destination)[^.]{0,40}tab bar|tab bar[^.]{0,40}\b(?:fourth|4th|another|extra|additional)\b/i,
    allowed: [/a fourth (?:entry|tab|item) would change the design/i, /no fourth/i],
    why: 'the tab bar carries exactly the three drawn destinations, the language switch goes in the page header',
    anchor: 'section 4, where the language switch goes',
  },
  {
    forbidden: /sidebar[^.]{0,30}\bon the left\b|\bleft\b[^.]{0,20}sidebar/i,
    allowed: [/mirrors|in English|LTR/i],
    why: 'the desktop sidebar is on the right, the layout is RTL',
    anchor: 'section 3, navigation',
  },
  {
    forbidden: /\b(?:dropdown|drop-down|select)\b[^.]{0,40}\bstatus\b|\bstatus\b[^.]{0,30}\b(?:dropdown|drop-down)\b/i,
    allowed: [/dropdown was removed/i, /never a dropdown/i, /not a dropdown/i],
    why: 'status is chosen with chips through the Status Picker, the dropdown was removed',
    anchor: 'section 3, status is chosen with chips',
  },
  {
    forbidden: /\b(?:an?|the|separate)\s+edit button\b/i,
    allowed: [/no separate edit button/i, /there is no edit button/i, /edit button.{0,30}removed/i],
    why: 'there is no Edit button anywhere, clicking a card opens its modal already editable',
    anchor: 'section 3, there is no separate Edit button',
  },
  {
    forbidden: /sort(?:ing)?[^.]{0,40}\bby status\b/i,
    allowed: [/by status is NOT/i],
    why: 'the four permitted sort options are newest, oldest, nearest deadline, company name',
    anchor: 'section 3, sorting',
  },
  {
    forbidden: /label comes from the catalog|from the (?:lingui )?catalog rather than/i,
    // A status label is data BECAUSE the user can rename it. The five defaults
    // still ship as catalog messages, as the seed values for a new account, and
    // a card saying so is correct rather than a violation.
    allowed: [/seed/i, /default status (?:names|labels)/i, /fresh account/i],
    why: 'a status label is record data, because the user can rename it',
    anchor: 'section 3, enumerated field values',
  },
  {
    forbidden: /\bcard list\b|\bplain list\b(?! screen)/i,
    allowed: [/described a plain list, which/i],
    why: 'the main screen is a kanban board, not a list',
    anchor: 'section 3, the main screen is a kanban board',
  },
  {
    forbidden: /reverse (?:the )?array|\.reverse\(\)/i,
    allowed: [/must not reverse/i, /no array reversal/i, /rather than by reversing/i],
    why: 'RTL is direction rtl with the natural array order, reversing an array is a defect',
    anchor: 'section 3, RTL is direction rtl',
  },
]

/**
 * The anchors a rule depends on. Checked for presence AND for negation in the
 * same sentence, because a reviewer pointed out that "navigation no longer has
 * three destinations" still contains "has three destinations", so a presence
 * test alone would keep enforcing a decision that had been reversed.
 */
const ANCHORS = [
  ['three destinations', /has three destinations/i],
  ['kanban not a list', /is a kanban board, not a list/i],
  ['phone OTP', /Auth is phone OTP/i],
  ['three column menu options', /exactly \*\*three\*\* options/i],
  ['four sort options', /exactly four options/i],
  ['no Edit button', /no separate Edit button anywhere/i],
  ['chips not a dropdown', /chips, never a dropdown/i],
]

const NEGATORS = /\b(no longer|not|never|superseded|reversed|instead of)\b/i

/**
 * The sentence holding a match, with the matched phrase itself cut out.
 *
 * Cutting it out is the whole trick. Several anchors ARE negations, "is a
 * kanban board, not a list" and "chips, never a dropdown", so testing the raw
 * sentence for a negator reported every one of them as a reversed decision.
 */
const sentenceAround = (text, index, length) => {
  const start = text.lastIndexOf('.', index) + 1
  const end = text.indexOf('.', index + length)
  const sentence = text.slice(start, end === -1 ? text.length : end)
  const offset = index - start
  return sentence.slice(0, offset) + sentence.slice(offset + length)
}

/** Returns a list of problem strings. Empty means no known contradiction. */
export const contractProblems = (board, design) => {
  const problems = []

  for (const task of board.tasks) {
    for (const field of FIELDS) {
      const value = task[field] ?? ''
      for (const rule of RULES) {
        if (!rule.forbidden.test(value)) continue
        if (rule.allowed.some((pattern) => pattern.test(value))) continue
        problems.push(`${task.id}.${field}: ${rule.why} (DESIGN.md ${rule.anchor})`)
      }
    }
  }

  for (const [label, pattern] of ANCHORS) {
    const match = pattern.exec(design)
    if (!match) {
      problems.push(`CHECKER IS STALE: DESIGN.md no longer states "${label}", so the rule enforcing it may be wrong`)
      continue
    }
    if (NEGATORS.test(sentenceAround(design, match.index, match[0].length))) {
      problems.push(
        `CHECKER IS STALE: DESIGN.md appears to have REVERSED "${label}", so its rule would enforce the old answer`,
      )
    }
  }

  // A canary, so a clean result means the rules can still fire.
  const planted = 'the column menu should let the user reorder statuses'
  const fires = RULES.some((rule) => rule.forbidden.test(planted) && !rule.allowed.some((p) => p.test(planted)))
  if (!fires) problems.push('CHECKER IS BROKEN: a planted violation was not detected')

  return problems
}

export const loadContractInputs = (root) => ({
  design: readFileSync(join(root, 'DESIGN.md'), 'utf8'),
})
