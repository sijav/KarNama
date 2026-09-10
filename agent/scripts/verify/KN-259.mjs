#!/usr/bin/env node
// Verifies KN-259: an Input error made only of invisible characters is no
// error, and a real message that contains them is still one.
//
// Exit condition: an error made only of whitespace and Unicode format
// characters is no error, while a message that merely contains them is still
// shown; BlankErrorIsNoError also renders an error of only a zero-width
// non-joiner and only a right-to-left mark and asserts they are no error, and a
// story with a real Persian message containing a ZWNJ still shows it; a
// mutation back to trim() fails the story by name.
//
// Since KN-261 the rule lives in blank.ts, shared by the Input and its
// stories, so the checks read it there. Backslashes are built from their char
// code, so no escape in this file is rewritten on its way to disk.
//
// NOT read-only: it edits Input.tsx and blank.ts and restores each in a
// finally.

import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const DIR = join(WEB, 'src', 'shared', 'input')
const COMPONENT = join(DIR, 'Input.tsx')
const RULE = join(DIR, 'blank.ts')
const STORIES = join(DIR, 'Input.stories.tsx')
const BS = String.fromCharCode(92)
const TEST = '  const error = given === undefined || isBlank(given) ? undefined : given\n'

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

const mutated = (file, from, to, story, what) => {
  const original = readFileSync(file, 'utf8')
  if (!original.includes(from)) return `the anchor for this mutation is gone:\n${from}`
  try {
    writeFileSync(file, original.replace(from, () => to))
    const { code, output } = stories()
    if (code === 0) return `the stories passed with ${what}, so nothing asserts it`
    return output.includes(`× ${story} `) ? null : `it failed, but not in ${story}:\n${output.slice(-500)}`
  } finally {
    writeFileSync(file, original)
  }
}

const blankLine = () => readFileSync(RULE, 'utf8').split('\n').find((line) => line.startsWith('const BLANK = ')) ?? ''

check('the Input stories pass', () => {
  const { code, output } = stories()
  return code === 0 ? null : `they fail before anything is broken:\n${output.slice(-800)}`
})

check('the Input treats whitespace and Unicode format characters as blank, through the shared rule', () => {
  const line = blankLine()
  if (!line.includes(`${BS}s`) || !line.includes(`${BS}p{Cf}`)) return `the rule in blank.ts does not take whitespace and the format characters: ${line}`
  return readFileSync(COMPONENT, 'utf8').includes(TEST) ? null : 'the Input does not test its error against the shared rule'
})

check('BlankErrorIsNoError renders an error of only a ZWNJ and of only a right-to-left mark, among at least four blanks', () => {
  const source = readFileSync(STORIES, 'utf8')
  const story = /export const BlankErrorIsNoError: Story = \{\n([\s\S]*?)\n\}\n/.exec(source)?.[1] ?? ''
  if (!story) return 'there is no BlankErrorIsNoError story'
  if (!story.includes(`<JobTitle error={'${BS}u200c'} />`)) return 'it does not render an error of only a zero-width non-joiner'
  if (!story.includes(`<JobTitle error={'${BS}u200f'} />`)) return 'it does not render an error of only a right-to-left mark'
  const fields = Number(/await expect\(pair\)\.toHaveLength\((\d+)\)/.exec(story)?.[1] ?? 0)
  return fields >= 4 ? null : `it checks ${fields} fields, fewer than four`
})

check('THE CASE: back to trim(), BlankErrorIsNoError fails', () =>
  mutated(COMPONENT, TEST, "  const error = given === undefined || given.trim() === '' ? undefined : given\n", 'Blank Error Is No Error', 'invisible errors treated as errors'),
)

check('a real Persian message containing a ZWNJ is still shown, and WithError is what says so', () => {
  const catalog = readFileSync(join(WEB, 'src', 'i18n', 'locales', 'fa-IR.ts'), 'utf8')
  const line = catalog.split('\n').find((entry) => entry.includes("'This field cannot be empty'")) ?? ''
  if (!line.includes(String.fromCharCode(0x200c))) return 'the Persian error the specimen shows no longer contains a ZWNJ, so WithError no longer covers this'
  // A rule greedy enough to swallow letters would hide that real message.
  const current = blankLine()
  if (!current) return 'blank.ts has no BLANK line'
  return mutated(RULE, current, current.replace(`${BS}s`, () => `${BS}s${BS}p{L}`), 'With Error', 'a real message treated as blank')
})

check('DESIGN.md names the invisible characters', () => {
  const design = readFileSync(join(ROOT, 'DESIGN.md'), 'utf8')
  const section = /### An Input's error needs a message\n([\s\S]*?)\n### /.exec(design)?.[1] ?? ''
  return /zero-width non-joiner/.test(section) ? null : 'the section does not say that invisible format characters are blank'
})

if (failures.length) {
  process.stderr.write(`\nKN-259 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-259 verify passed.\n')
