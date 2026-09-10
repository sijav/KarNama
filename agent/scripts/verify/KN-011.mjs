#!/usr/bin/env node
// Verifies KN-011: the Input, six states, from node 95:38.
//
// Exit condition: all six states match Figma, the error state shows
// border/error with text/error helper copy, the helper line reserves its space
// so the field does not jump when an error appears, and the label is bound to
// the input for screen readers.
//
// Each guarantee has a story that measures it and a mutation here that breaks
// exactly that and requires exactly that story to fail.
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

const failedStories = (output) => [...output.matchAll(/× (.+?) \d+ms/g)].map((match) => match[1])

check('the six state stories and the two behaviour stories pass', () => {
  const { code, output } = stories()
  if (code !== 0) return `they fail before anything is broken:\n${output.slice(-800)}`
  const source = readFileSync(STORIES, 'utf8')
  const missing = ['Default', 'Filled', 'Focus', 'WithError', 'Disabled', 'Hover', 'LabelIsBound', 'ErrorDoesNotMoveTheField'].filter(
    (name) => !new RegExp(`export const ${name}: Story`).test(source),
  )
  return missing.length ? `there is no ${missing.join(', ')} story` : null
})

for (const [label, from, to, story] of [
  ['THE CASE: the error state is measured, border/error on the field', "const edge = error === undefined ? colour['border/default'] : colour['border/error']", "const edge = colour['border/default']", 'With Error'],
  ['the helper line reserves its space, so an error does not move the form', '          minHeight: `${body.lineHeight}px`,\n', '', 'Error Does Not Move The Field'],
  ['the label is bound to the input', '        htmlFor={id}\n', '', 'Label Is Bound'],
  ['focus is two pixels wide and does not move the text', '              paddingInline: `${spacing.md - 1}px`,\n', '', 'Focus'],
  ['hover takes the text/secondary border', "            ...(error === undefined ? { '&:hover:not(.Mui-focused):not(.Mui-disabled)': { borderColor: colour['text/secondary'] } } : {}),\n", '', 'Hover'],
]) {
  check(`${label}: breaking it fails exactly that story`, () => {
    const original = readFileSync(COMPONENT, 'utf8')
    if (!original.includes(from)) return `the anchor for this mutation is gone:\n${from}`
    try {
      writeFileSync(COMPONENT, original.replace(from, () => to))
      const { code, output } = stories()
      if (code === 0) return 'the stories passed with it broken, so nothing measures it'
      const failed = failedStories(output)
      return failed.includes(story) ? null : `${story} did not fail; failed instead: ${failed.join(', ') || 'nothing named'}`
    } finally {
      writeFileSync(COMPONENT, original)
    }
  })
}

check('the error copy is the field\'s description, and it comes from the catalog', () => {
  const source = readFileSync(STORIES, 'utf8')
  if (!/toHaveAccessibleDescription\(line\.textContent\)/.test(source)) return 'no story asserts the error is what the field announces'
  const fa = readFileSync(join(WEB, 'src', 'i18n', 'locales', 'fa-IR.ts'), 'utf8')
  return fa.includes("'This field cannot be empty': 'این فیلد نمی‌تواند خالی باشد'") ? null : 'the error copy is not in the catalog as the design writes it'
})

if (failures.length) {
  process.stderr.write(`\nKN-011 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-011 verify passed.\n')
