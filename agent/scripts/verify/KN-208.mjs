#!/usr/bin/env node
// Verifies KN-208: the Checkbox's five Figma states are each a story, hover
// included and driven by a real pointer, and KN-013.mjs checks them BY NAME.
//
// Exit condition: every Figma state named on the card has a story, hover
// included, and hover is exercised with a real pointer rather than a dispatched
// event. KN-013.mjs checks the states by name against the card rather than
// counting stories, so adding a sixth story or renaming one cannot silently
// satisfy it. A mutation deleting the hover story fails it.
//
// KN-013.mjs carries the checks, including the two that make the real pointer
// provable: a dispatched hover swapped in must FAIL the Hover story, and so must
// the hover colour reverted to the default border. This file adds what KN-013
// cannot say about itself: that deleting or renaming the Hover story fails it.
//
// NOT read-only: it edits Checkbox.stories.tsx and restores it in a finally.

import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const STORIES = join(ROOT, 'apps', 'web', 'src', 'shared', 'checkbox', 'Checkbox.stories.tsx')

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

const kn013 = () => {
  const result = spawnSync('node agent/scripts/verify/KN-013.mjs', { cwd: ROOT, encoding: 'utf8', shell: true })
  return { code: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}

const withStories = (mutate, body) => {
  const original = readFileSync(STORIES, 'utf8')
  const mutated = mutate(original)
  if (mutated === original) return 'the mutation found nothing to change, so the story file changed shape'
  try {
    writeFileSync(STORIES, mutated)
    return body()
  } finally {
    writeFileSync(STORIES, original)
  }
}

check('KN-013.mjs passes as the code stands', () => {
  // The positive control: both mutations below require KN-013 to FAIL.
  const { code, output } = kn013()
  return code === 0 ? null : `KN-013 fails before anything is broken:\n${output.slice(-1500)}`
})

check('THE CASE: deleting the Hover story fails KN-013, by name', () => {
  return withStories(
    (source) => {
      const start = source.indexOf('export const Hover: Story = {')
      const end = source.indexOf('export const Disabled: Story = {')
      return start < 0 || end < start ? source : source.slice(0, start) + source.slice(end)
    },
    () => {
      const { code, output } = kn013()
      if (code === 0) return 'KN-013 passed with no Hover story, so the state is not required'
      return /no story for Hover/.test(output) ? null : `KN-013 failed, but not by naming the missing state:\n${output.slice(-600)}`
    },
  )
})

check('renaming the Hover story fails KN-013 too, so a count cannot stand in for the name', () => {
  // The old check counted five passing stories. A rename keeps the count and
  // loses the state, which is exactly what it could not see.
  return withStories(
    (source) => source.replace('export const Hover: Story = {', () => 'export const HoverState: Story = {'),
    () => {
      const { code, output } = kn013()
      if (code === 0) return 'KN-013 passed with Hover renamed, so it is still counting rather than naming'
      return /no story for Hover/.test(output) ? null : `KN-013 failed, but not by naming the state:\n${output.slice(-600)}`
    },
  )
})

if (failures.length) {
  process.stderr.write(`\nKN-208 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-208 verify passed.\n')
