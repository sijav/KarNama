#!/usr/bin/env node
// Verifies KN-231: the tooltip's trigger is described before the tip opens.
//
// Exit condition: at the moment of keyboard focus, before the tip opens, the
// trigger already has an accessible description equal to the tip's text,
// asserted by a story that does not wait for the tip; the name is still the
// trigger's own; the same assertions run in fa-IR with the Persian name; and a
// mutation removing the always-present description fails the focus-time story.
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
// The always-present link, carried on the cloned child since KN-235 merged it
// with the trigger's own. Replaced by an empty clone, the trigger is linked to
// nothing until MUI's open-only link arrives.
const LINK = "{ 'aria-describedby': own ? `${own} ${descriptionId}` : descriptionId }"

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

check('the tooltip stories pass, both focus-time stories included', () => {
  const { code, output } = stories()
  if (code !== 0) return `they fail before anything is broken:\n${output.slice(-800)}`
  const source = readFileSync(STORIES, 'utf8')
  const missing = ['DescribedAtFocus', 'DescribedAtFocusInPersian'].filter((name) => !new RegExp(`export const ${name}: Story`).test(source))
  return missing.length ? `there is no ${missing.join(' or ')} story` : null
})

check('THE CASE: without the always-present link both focus-time stories fail on the description', () => {
  const original = readFileSync(COMPONENT, 'utf8')
  if (!original.includes(LINK)) return 'the component no longer links the trigger to an always-present description'
  try {
    writeFileSync(COMPONENT, original.replace(LINK, () => '{}'))
    const { code, output } = stories()
    if (code === 0) return 'the stories passed with the description only present while open, so nothing tests focus time'
    const failed = ['Described At Focus', 'Described At Focus In Persian'].filter((name) => output.includes(`× ${name} `))
    if (failed.length !== 2) return `expected both focus-time stories to fail, got: ${failed.join(', ') || 'neither'}`
    return /accessible description/.test(output) ? null : `they failed, but not on the description:\n${output.slice(-600)}`
  } finally {
    writeFileSync(COMPONENT, original)
  }
})

check('the description exists from the first render, hidden, and the stories check it before any interaction', () => {
  const component = readFileSync(COMPONENT, 'utf8')
  if (!/<Box component="span" id=\{descriptionId\} hidden>\s*\{title\}\s*<\/Box>/.test(component)) return 'there is no hidden copy of the text carrying the description id'
  const source = readFileSync(STORIES, 'utf8')
  const helper = /const describedBeforeTheTip = [\s\S]*?\n}\n/.exec(source)?.[0] ?? ''
  const before = helper.indexOf('toHaveAccessibleDescription')
  const tab = helper.indexOf('userEvent.tab()')
  // The deterministic half: before the tab, the tip cannot be open, so MUI's
  // own open-only link cannot be what is being measured.
  return before > -1 && tab > -1 && before < tab ? null : 'the stories do not check the description before any interaction'
})

check('the Persian story asserts the Persian name, written out', () => {
  const source = readFileSync(STORIES, 'utf8')
  const story = /export const DescribedAtFocusInPersian[\s\S]*?\n}\n/.exec(source)?.[0] ?? ''
  if (!story.includes("globals: { locale: 'fa-IR' }")) return 'the Persian story is not pinned to fa-IR'
  return story.includes("toHaveAccessibleName('حذف وضعیت')") ? null : 'the Persian story does not assert the Persian name literally'
})

if (failures.length) {
  process.stderr.write(`\nKN-231 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-231 verify passed.\n')
