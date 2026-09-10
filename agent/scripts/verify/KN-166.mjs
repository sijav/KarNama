#!/usr/bin/env node
// Verifies KN-166: the loop rules are written correctly in the sibling project.
//
// Exit condition: SkipBureau's loop and rule files state the finish, prove,
// close, roast order, the findings-become-cards rule with its blocking
// exception, and the plan-beside-the-work rule; anything that contradicts them
// is corrected or recorded as deliberate; and the owner is told what was found.
//
// This verifier reads a path OUTSIDE this repository, which is unusual and is
// the point of the card. If the sibling project is not there it FAILS rather
// than skipping: a check that quietly passes when its subject is missing is the
// exact false pass this repository has been bitten by, and "SkipBureau moved"
// is something the next reader should be told rather than shielded from.
//
// The negative checks are deliberately narrow. `CLAUDE.md` legitimately says
// "Never re-roast" and "Re-roasting until a number improves has no end", so a
// grep for `re-roast` would flag the sentences that ENFORCE the rule. Only the
// abandoned gates that have no honest mention are searched for.
//
// Read-only: reads files, runs nothing, writes nothing.

import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const SIBLING = join(dirname(ROOT), 'SkipBureau')
const RULES = join(SIBLING, 'CLAUDE.md')

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

check('the sibling project and its rule file are where the card says', () => {
  if (!existsSync(SIBLING)) return `${SIBLING} does not exist, so nothing here was checked`
  return existsSync(RULES) ? null : `${RULES} does not exist`
})

const raw = existsSync(RULES) ? readFileSync(RULES, 'utf8') : ''
// Prose is matched against a whitespace-collapsed copy. Markdown wraps at about
// eighty columns, so a rule stated in one sentence arrives split across a
// newline and a literal phrase match silently misses it. This check reported
// "it does not forbid reopening" against a file whose next two words were
// exactly that, because the sentence broke after "not a".
const rules = raw.replace(/\s+/g, ' ')

check('it states the order: finish and prove, THEN done, THEN roast', () => {
  if (!rules) return 'no rule file to read'
  const problems = []
  if (!/THEN and only THEN you put it in done/.test(rules)) problems.push('the owner\'s wording is not quoted')
  if (!/never closed pending a roast/i.test(rules)) problems.push('it does not say a task is never closed pending a roast')
  if (!/fire the roast in the \*\*background\*\*|roast in the \*\*background\*\*/.test(rules)) {
    problems.push('it does not say the roast runs in the background')
  }
  // Order, not just presence: the close has to be described before the roast.
  const closeAt = rules.indexOf('move it to `done`')
  const roastAt = rules.indexOf('fire the roast')
  if (closeAt === -1 || roastAt === -1) problems.push('the close and roast steps cannot both be located')
  else if (closeAt > roastAt) problems.push('the roast step is described before the close step')
  return problems.length ? problems.join('; ') : null
})

check('it states that findings become tasks and never reopen the closed one', () => {
  if (!rules) return 'no rule file to read'
  const problems = []
  if (!/becomes a new task on the board/i.test(rules)) problems.push('findings are not routed to the board')
  if (!/not a reason to reopen what was just finished/i.test(rules)) problems.push('it does not forbid reopening')
  if (!/One roast per task/i.test(rules)) problems.push('it does not say one roast per task')
  return problems.length ? problems.join('; ') : null
})

check('it states the blocking exception, and forgetting otherwise', () => {
  if (!rules) return 'no rule file to read'
  const problems = []
  if (!/revert what you did/i.test(rules)) problems.push('the blocking case does not say to revert')
  if (!/todo next/i.test(rules)) problems.push('the blocking case does not hand the choice back to the board')
  if (!/\*\*forget it\.\*\*|forget it\./i.test(rules)) problems.push('the non-blocking case does not say to forget it')
  return problems.length ? problems.join('; ') : null
})

check('it states the plan-beside-the-work rule, with its name', () => {
  if (!rules) return 'no rule file to read'
  const problems = []
  if (!/#SB-0XX - <the task's title>\.md|#\[task_number\] - \[title\]\.md/.test(rules)) {
    problems.push('the plan filename shape is not given')
  }
  if (!/in the folder the task is about to build\s+in|related folder/i.test(rules)) {
    problems.push('it does not say the plan goes in the work folder')
  }
  // Two assertions, not one alternation. This was written as
  // `never a plans/ folder` OR `not a separate folder`, and the second phrase
  // sits inside the owner's quoted instruction, which is always present, so the
  // check could never fail: deleting the rule left the quote and it passed. A
  // mutation caught it. The quote is evidence of INTENT and the sentence is the
  // INSTRUCTION, and a file needs both for different reasons.
  if (!/not a separate folder/i.test(rules)) problems.push('the owner\'s instruction is not quoted')
  if (!/never a `plans\/` folder/i.test(rules)) problems.push('it does not rule out a separate folder in its own words')
  return problems.length ? problems.join('; ') : null
})

check('it carries the two clauses that cost something to learn', () => {
  if (!rules) return 'no rule file to read'
  const problems = []
  if (!/is not a filename/i.test(rules)) problems.push('nothing warns that a title is not a filename')
  if (!/plan STAYS when the task closes/i.test(rules)) problems.push('the plan lifecycle is not stated')
  if (!/check-ignore/.test(rules)) problems.push('the rule about proving a fallback exists names no command')
  return problems.length ? problems.join('; ') : null
})

check('none of the abandoned gates survive anywhere in it', () => {
  if (!rules) return 'no rule file to read'
  // Narrow on purpose. "Never re-roast" is the rule, so the word itself is not
  // evidence of anything; only a SCORE or CRITICALS gate is, and neither has an
  // honest mention in that file.
  const problems = []
  if (/9\.5/.test(rules)) problems.push('a 9.5 score threshold is still in the file')
  if (/zero criticals/i.test(rules)) problems.push('a zero-criticals gate is still in the file')
  if (/roast again/i.test(rules)) problems.push('it still instructs roasting again after a fix')
  return problems.length ? problems.join('; ') : null
})

if (failures.length) {
  process.stderr.write(`\nKN-166 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-166 verify passed.\n')
