#!/usr/bin/env node
// Verifies KN-235: a trigger's own aria-describedby is joined by the tooltip's,
// not replaced by it.
//
// Exit condition: a trigger with its own aria-describedby keeps it AND gains the
// tooltip's, in that order, before and after focus, asserted by a story that
// checks the computed description contains both texts; no report is logged for
// it; the ref-only and cannot-attach reports still fire; and a mutation dropping
// the merge fails the story.
//
// NOT read-only: it edits Tooltip.tsx and restores it in a finally.

import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const COMPONENT = join(WEB, 'src', 'shared', 'tooltip', 'Tooltip.tsx')
const STORIES = join(WEB, 'src', 'shared', 'tooltip', 'Tooltip.stories.tsx')
const MERGE = "{ 'aria-describedby': own ? `${own} ${descriptionId}` : descriptionId }"

const failures = []
const check = (label, run) => {
  try {
    const problem = run()
    if (problem) failures.push(`${label}: ${problem}`)
    else process.stdout.write(`  ok   ${label}\n`)
  } catch (error) {
    failures.push(`${label}: threw ${error instanceof Error ? error.message : String(error)}`)
  }
}

const stories = () => {
  const result = spawnSync('npx vitest run --project storybook src/shared/tooltip', { cwd: WEB, encoding: 'utf8', shell: true })
  return { code: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}

check('the tooltip stories pass, the own-description story and both reports included', () => {
  const { code, output } = stories()
  if (code !== 0) return `they fail before anything is broken:\n${output.slice(-800)}`
  const source = readFileSync(STORIES, 'utf8')
  const missing = ['KeepsTheTriggersOwnDescription', 'ReportsATriggerThatDropsItsProps', 'ReportsATriggerThatCannotAttach'].filter(
    (name) => !new RegExp(`export const ${name}: Story`).test(source),
  )
  return missing.length ? `there is no ${missing.join(', ')} story` : null
})

check('THE CASE: without the merge, the trigger loses its own description and the story fails', () => {
  const original = readFileSync(COMPONENT, 'utf8')
  if (!original.includes(MERGE)) return 'the component no longer merges the two descriptions'
  try {
    writeFileSync(COMPONENT, original.replace(MERGE, () => "{ 'aria-describedby': descriptionId }"))
    const { code, output } = stories()
    if (code === 0) return 'the stories passed with the trigger\'s own description replaced, so nothing tests the merge'
    if (!output.includes('× Keeps The Triggers Own Description ')) return `it failed, but not in the own-description story:\n${output.slice(-600)}`
    return /accessible description/.test(output) ? null : `it failed, but not on the description:\n${output.slice(-600)}`
  } finally {
    writeFileSync(COMPONENT, original)
  }
})

check('the story checks both texts in order, before and at focus, and that nothing is reported', () => {
  const source = readFileSync(STORIES, 'utf8')
  const story = /export const KeepsTheTriggersOwnDescription[\s\S]*?\n}\n/.exec(source)?.[0] ?? ''
  if (!story.includes("`${i18n._('My job opportunities')} ${args.title}`")) return 'the story does not expect the own description first and the tooltip text after it'
  const described = story.split('toHaveAccessibleDescription(both)').length - 1
  if (described < 2 || story.indexOf('userEvent.tab()') < story.indexOf('toHaveAccessibleDescription(both)')) return 'the story does not check the description both before and after focus'
  return /expect\(console\.error\)\.not\.toHaveBeenCalled\(\)/.test(story) ? null : 'the story does not check that nothing is reported'
})

if (failures.length) {
  process.stderr.write(`\nKN-235 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-235 verify passed.\n')
