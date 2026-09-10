#!/usr/bin/env node
// Verifies KN-209: the tooltip describes its trigger and never names it.
//
// Exit condition: the tooltip DESCRIBES rather than labels: a trigger with its
// own aria-label keeps that name, and the tip is reachable through
// aria-describedby. A story asserts the computed accessible name of an
// icon-only trigger while the tip is open, and a mutation removing
// describeChild makes it fail. The case where the trigger has NO name of its own
// is decided deliberately and written down, because describing something
// unnamed leaves it unnamed.
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

const vitest = (project, path) => {
  const result = spawnSync(`npx vitest run --project ${project} ${path}`, { cwd: WEB, encoding: 'utf8', shell: true })
  return { code: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}

check('the tooltip stories pass, KeepsTheTriggersName included', () => {
  const { code, output } = vitest('storybook', 'src/shared/tooltip')
  if (code !== 0) return `they fail before anything is broken:\n${output.slice(-800)}`
  return /export const KeepsTheTriggersName/.test(readFileSync(STORIES, 'utf8')) ? null : 'there is no story asserting the trigger keeps its name'
})

check('THE CASE: without describeChild the icon-only trigger loses its name, and the story fails', () => {
  const original = readFileSync(COMPONENT, 'utf8')
  if (!original.includes('    describeChild\n')) return 'the tooltip does not set describeChild'
  try {
    writeFileSync(COMPONENT, original.replace('    describeChild\n', () => ''))
    const { code, output } = vitest('storybook', 'src/shared/tooltip')
    if (code === 0) return 'the stories passed with the tip labelling its trigger, so nothing asserts the name'
    if (!/Keeps The Triggers Name/.test(output)) return `it failed, but not in the naming story:\n${output.slice(-600)}`
    return /accessible name/.test(output) ? null : `it failed, but not on the accessible name:\n${output.slice(-600)}`
  } finally {
    writeFileSync(COMPONENT, original)
  }
})

check('the trigger in that story is icon-only, named by its own label from the catalog', () => {
  const source = readFileSync(STORIES, 'utf8')
  const trigger = /const DeleteStatusButton = [\s\S]*?\n}\n/.exec(source)?.[0] ?? ''
  if (!trigger) return 'the icon-only trigger is gone'
  if (!trigger.includes("aria-label={i18n._('Delete status')}")) return 'the trigger is not named by its own aria-label through the catalog'
  // Nothing but the icon inside, so the ONLY name it can have is its label.
  if (!/>\s*\{InfoMark\}\s*<\/button>/.test(trigger)) return 'the trigger has content besides the icon, so it is not icon-only'
  return /\{\.\.\.props\}/.test(trigger) ? null : 'the trigger does not forward its props, so MUI could not attach to it'
})

check('the unnamed-trigger decision is written down, in both languages', () => {
  const en = readFileSync(join(DOCS, 'en', 'Shared-Tooltip.md'), 'utf8')
  const fa = readFileSync(join(DOCS, 'fa', 'Shared-Tooltip.md'), 'utf8')
  if (!/must have an accessible name of its own/.test(en)) return 'the English docs do not say the trigger needs its own name'
  if (!/stays unnamed/.test(en)) return 'the English docs do not say what happens to a trigger without one'
  return /نام دسترس‌پذیرِ خودش/.test(fa) ? null : 'the Persian docs do not carry the decision'
})

check('the label is a real catalog message in both languages', () => {
  const { code, output } = vitest('unit', 'src/i18n/catalog.test.ts')
  if (code !== 0) return `the catalog test fails:\n${output.slice(-600)}`
  const fa = readFileSync(join(WEB, 'src', 'i18n', 'locales', 'fa-IR.ts'), 'utf8')
  return fa.includes("'Delete status': 'حذف وضعیت'") ? null : 'the Persian catalog does not carry the label as the design writes it'
})

if (failures.length) {
  process.stderr.write(`\nKN-209 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-209 verify passed.\n')
