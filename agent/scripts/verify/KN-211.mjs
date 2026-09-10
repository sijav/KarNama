#!/usr/bin/env node
// Verifies KN-211: a trigger the tooltip cannot attach to is reported, not
// silently left without a tip.
//
// Exit condition: a trigger that does not forward props is either impossible to
// pass, by typing, or produces a clear failure rather than silence. A story
// covers a WRAPPER component trigger and not only a native button, and it fails
// if the wrapper stops forwarding. The Fragment case is handled or explicitly
// documented as unsupported.
//
// Typing cannot prove a component forwards its props and ref, so this takes the
// other branch: a clear failure. MUI applies the tooltip's own ref to the child
// and is silent when it never arrives; the component checks after mount and
// reports it. A child that takes the ref but drops the other props is caught by
// MUI's own development check.
//
// NOT read-only: it edits Tooltip.tsx and Tooltip.stories.tsx and restores each.

import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const COMPONENT = join(WEB, 'src', 'shared', 'tooltip', 'Tooltip.tsx')
const STORIES = join(WEB, 'src', 'shared', 'tooltip', 'Tooltip.stories.tsx')
const DOCS = join(WEB, 'src', 'shared', 'story-docs')

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

const withEdit = (file, from, to, body) => {
  const original = readFileSync(file, 'utf8')
  if (!original.includes(from)) return `the anchor for this mutation is gone: ${from.trim()}`
  try {
    writeFileSync(file, original.replace(from, () => to))
    return body()
  } finally {
    writeFileSync(file, original)
  }
}

check('the tooltip stories pass, the cannot-attach story included', () => {
  const { code, output } = stories()
  if (code !== 0) return `they fail before anything is broken:\n${output.slice(-800)}`
  return /export const ReportsATriggerThatCannotAttach/.test(readFileSync(STORIES, 'utf8')) ? null : 'there is no story for a trigger that cannot attach'
})

check('THE CASE: without the component\'s check the cannot-attach story fails, because MUI alone is silent', () =>
  // The missing-node report sits inside the grace timer since KN-233; turning
  // its guard into an unconditional return silences exactly that report.
  withEdit(COMPONENT, '      if (node.current) return\n', '      return\n', () => {
    const { code, output } = stories()
    if (code === 0) return 'the story passed with no check, so something else reports it and this check proves nothing'
    return /Reports A Trigger That Cannot Attach/.test(output) ? null : `it failed, but not in the cannot-attach story:\n${output.slice(-600)}`
  }),
)

check('the trigger in that story really drops what it is handed', () => {
  const source = readFileSync(STORIES, 'utf8')
  const trigger = /const SwallowingButton = [\s\S]*?\n}\n/.exec(source)?.[0] ?? ''
  if (!trigger) return 'the swallowing trigger is gone'
  return /\{\.\.\.props\}|props\b/.test(trigger) ? 'the swallowing trigger forwards props after all, so it tests nothing' : null
})

check('a WRAPPER trigger story fails if the wrapper stops forwarding', () =>
  withEdit(STORIES, '<button type="button" {...props} aria-label', '<button type="button" aria-label', () => {
    const { code, output } = stories()
    if (code === 0) return 'the stories passed with the wrapper forwarding nothing, so no story depends on it'
    return /Keeps The Triggers Name/.test(output) ? null : `it failed, but not in the wrapper story:\n${output.slice(-600)}`
  }),
)

check('the Fragment case is documented as unsupported, in both languages', () => {
  const en = readFileSync(join(DOCS, 'en', 'Shared-Tooltip.md'), 'utf8')
  const fa = readFileSync(join(DOCS, 'fa', 'Shared-Tooltip.md'), 'utf8')
  if (!/A Fragment is not supported/.test(en)) return 'the English docs do not say a Fragment is unsupported'
  return /Fragment پشتیبانی نمی‌شود/.test(fa) ? null : 'the Persian docs do not say a Fragment is unsupported'
})

if (failures.length) {
  process.stderr.write(`\nKN-211 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-211 verify passed.\n')
