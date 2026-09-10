#!/usr/bin/env node
// Verifies KN-248: the Input's placeholder stays put when an empty field takes
// focus, and a story measures it.
//
// Exit condition: a story focuses an empty Input and asserts that neither the
// input's layout nor its placeholder's computed style changes with focus,
// reading the placeholder through getComputedStyle(input, '::placeholder'), and
// a mutation adding a focused-only placeholder text-indent fails that story by
// name.
//
// NOT read-only: it edits Input.tsx and restores it in a finally.

import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const COMPONENT = join(WEB, 'src', 'shared', 'input', 'Input.tsx')
const STORIES = join(WEB, 'src', 'shared', 'input', 'Input.stories.tsx')

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
  const result = spawnSync('npx vitest run --project storybook src/shared/input', { cwd: WEB, encoding: 'utf8', shell: true })
  return { code: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}

check('the Input stories pass, FocusWhileEmpty included', () => {
  const { code, output } = stories()
  if (code !== 0) return `they fail before anything is broken:\n${output.slice(-800)}`
  // At least the thirteen there were when this closed; later cards add more.
  const passed = Number(/Tests {2}(\d+) passed \(\1\)/.exec(output)?.[1] ?? 0)
  return passed >= 13 ? null : `expected at least thirteen stories to pass, read ${passed}:\n${output.slice(-300)}`
})

check('FocusWhileEmpty focuses an empty field and compares the placeholder through getComputedStyle', () => {
  const source = readFileSync(STORIES, 'utf8')
  const story = /export const FocusWhileEmpty: Story = \{\n([\s\S]*?)\n\}\n/.exec(source)?.[1] ?? ''
  if (!story) return 'there is no FocusWhileEmpty story'
  if (/(^|\n) {2}args: \{[^}]*\b(value|defaultValue):/.test(story)) return 'the story fills the field, so no placeholder shows'
  if (!story.includes("await expect(box).toHaveValue('')")) return 'the story does not establish that the field is empty'
  if (!story.includes('await expect(changes(before, textLayout(box))).toEqual([])')) return 'the story does not compare the layout before and after focus'
  return source.includes("...propertiesOf(getComputedStyle(box, '::placeholder'), '::'),") ? null : 'textLayout does not read the placeholder'
})

check('THE CASE: a focused-only placeholder text-indent fails FocusWhileEmpty, naming it', () => {
  const original = readFileSync(COMPONENT, 'utf8')
  const anchor = "            '&.Mui-focused': {\n"
  if (!original.includes(anchor)) return `the anchor for this mutation is gone:\n${anchor}`
  try {
    writeFileSync(COMPONENT, original.replace(anchor, () => `${anchor}              '& input::placeholder': { textIndent: '3px' },\n`))
    const { code, output } = stories()
    if (code === 0) return 'the stories passed with the placeholder moved, so nothing measures it'
    if (!output.includes('× Focus While Empty ')) return `it failed, but not in FocusWhileEmpty:\n${output.slice(-500)}`
    return output.includes('::text-indent: 0px → 3px') ? null : `FocusWhileEmpty failed without naming the placeholder's text-indent:\n${output.slice(-500)}`
  } finally {
    writeFileSync(COMPONENT, original)
  }
})

check('the lingui exemption for getComputedStyle is named and says why', () => {
  const config = readFileSync(join(WEB, 'eslint.config.js'), 'utf8')
  const block = /ignoreFunctions: \[([\s\S]*?)\n {2}\],/.exec(config)?.[1] ?? ''
  if (!block.includes("'getComputedStyle',")) return 'getComputedStyle is not in ignoreFunctions'
  return /pseudo-element[\s\S]*?never renders anything[\s\S]*?KN-248\.\n {4}'getComputedStyle',/.test(block) ? null : 'the exemption has no reason written beside it'
})

if (failures.length) {
  process.stderr.write(`\nKN-248 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-248 verify passed.\n')
