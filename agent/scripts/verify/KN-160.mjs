#!/usr/bin/env node
// Verifies KN-160: plan files live beside the work, named `#<id> - <title>.md`.
//
// Exit condition: agent/RALPH.md and the loop skill both instruct that name and
// location, no instruction anywhere still names `.claude/plan-<id>.md`, the
// existing plan for KN-112 has been moved to its work folder under the new
// name, and a check proves the loop files agree.
//
// The deliberate narrowness of the old-path search is the interesting part.
// Scanning the whole repository for `.claude/plan-` is WRONG here and would
// report a defect that does not exist: this card's own board entry describes
// the old path, so does its plan file, and so does every roast archive that
// discussed it. Naming a thing in order to abolish it is how you write about
// abolishing it. This repository has shipped that bug twice, KN-128 and
// KN-072, so the search is confined to the files that INSTRUCT, and the list
// of them is written out here where it can be argued with.
//
// Read-only.

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir } from 'node:os'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const LOOP_SKILL = join(homedir(), '.claude', 'skills', 'loop', 'SKILL.md')

// Every file that tells somebody where to put a plan. A file that merely
// mentions the old path is not one of these, and adding one here is how a new
// instruction file gets covered.
const INSTRUCTION_FILES = [join(ROOT, 'agent', 'RALPH.md'), join(ROOT, 'agent', 'STATE.md'), LOOP_SKILL]

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

check('every instruction file exists, including the one outside the repository', () => {
  // Failing loudly rather than skipping. A verifier that quietly drops an
  // assertion when a file is absent reports success for a check it never ran,
  // which is exactly what KN-065's roast caught a version of this repository
  // doing. The loop skill lives in the operator's home directory by design, so
  // this verifier genuinely depends on it being installed, and says so.
  const missing = INSTRUCTION_FILES.filter((path) => !existsSync(path))
  return missing.length ? `not found: ${missing.join(', ')}` : null
})

check('no instruction file still sends a plan to the old directory', () => {
  const offenders = INSTRUCTION_FILES.filter((path) => existsSync(path) && readFileSync(path, 'utf8').includes('.claude/plan-'))
  return offenders.length ? `still names .claude/plan-: ${offenders.join(', ')}` : null
})

check('RALPH.md and the loop skill both give the name AND the location', () => {
  const problems = []
  for (const path of INSTRUCTION_FILES.slice(0, 1).concat(LOOP_SKILL)) {
    if (!existsSync(path)) continue
    const text = readFileSync(path, 'utf8')
    // The name, allowing either `<task id>` or `<task-id>` since the two files
    // word it differently and the shape is what matters.
    if (!/#<task[ -]id> - <title>\.md/.test(text)) problems.push(`${path} does not give the "#<id> - <title>.md" name`)
    // And the location, which is the half that makes the name worth anything.
    if (!/beside|folder the (work|change) is about to/i.test(text)) problems.push(`${path} does not say WHERE it goes`)
  }
  return problems.length ? problems.join('; ') : null
})

check('the plan directory this card abolishes holds no plans', () => {
  const dir = join(ROOT, '.claude')
  if (!existsSync(dir)) return null
  const strays = readdirSync(dir).filter((name) => /^plan-.*\.md$/.test(name))
  return strays.length ? `.claude still holds ${strays.join(', ')}` : null
})

check("KN-112's plan sits beside the code it describes, under the new name", () => {
  // The one open plan, checked by finding it rather than by trusting a path,
  // so a rename of the folder does not silently pass.
  const dir = join(ROOT, 'apps', 'web', 'src', 'core', 'preferences')
  if (!existsSync(dir)) return 'apps/web/src/core/preferences does not exist'
  const plans = readdirSync(dir).filter((name) => name.startsWith('#KN-112 -') && name.endsWith('.md'))
  if (!plans.length) return 'no #KN-112 plan beside the preferences code'
  const body = readFileSync(join(dir, plans[0]), 'utf8')
  return /KN-112/.test(body) ? null : `${plans[0]} does not mention the task it is named for`
})

check('every plan file in the tree follows the naming rule', () => {
  // Catches the next one, not just the two that exist today. A plan named any
  // other way is invisible to the rule and to whoever comes looking.
  const found = []
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'agent') continue
      const path = join(dir, entry.name)
      if (entry.isDirectory()) walk(path)
      else if (/^plan-KN-\d+\.md$/i.test(entry.name)) found.push(path)
    }
  }
  walk(ROOT)
  return found.length ? `these use the abolished name: ${found.join(', ')}` : null
})

check('the naming rule warns that a title is not a filename', () => {
  // Not decoration. The first plan written under this rule had a title
  // containing four characters Windows refuses outright, so a rule that does
  // not mention sanitisation fails on its own first use.
  const problems = []
  for (const path of [join(ROOT, 'agent', 'RALPH.md'), LOOP_SKILL]) {
    if (!existsSync(path)) continue
    const text = readFileSync(path, 'utf8')
    if (!/is not a filename/i.test(text)) problems.push(`${path} does not warn about illegal characters in a title`)
    // The plan STAYS. An earlier version of this check required the opposite,
    // and required it because the rule said so on the strength of "git holds
    // every version", which was false: `.gitignore` carried `.claude/plan-*.md`
    // and those files had never been committed. Two plans were deleted before
    // the contradiction was caught. The check now asserts the surviving rule and
    // refuses the deleted one by name, so it cannot come back quietly.
    if (!/plan STAYS when the task closes/i.test(text)) problems.push(`${path} does not say the plan stays when the task closes`)
    if (/[Dd]elete the plan when the task closes/.test(text)) {
      problems.push(`${path} tells the reader to delete a plan on close, which destroyed KN-071's`)
    }
  }
  return problems.length ? problems.join('; ') : null
})

if (failures.length) {
  process.stderr.write(`\nKN-160 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-160 verify passed.\n')
