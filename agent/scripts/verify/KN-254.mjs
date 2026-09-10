#!/usr/bin/env node
// Verifies KN-254: an empty or blank error is no error.
//
// Exit condition: an error that is empty or only whitespace is no error: the
// field keeps its default border, is not aria-invalid, and shows its helper
// text; a story renders such an error and asserts all three; DESIGN.md or the
// component's story docs say the error state needs a message; and a mutation
// back to testing error against undefined fails that story by name.
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
const NORMALISED = '  const error = given === undefined || isBlank(given) ? undefined : given\n'

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

check('the Input stories pass, BlankErrorIsNoError included', () => {
  const { code, output } = stories()
  if (code !== 0) return `they fail before anything is broken:\n${output.slice(-800)}`
  // At least the fourteen there are now; later cards add more.
  const passed = Number(/Tests {2}(\d+) passed \(\1\)/.exec(output)?.[1] ?? 0)
  return passed >= 14 ? null : `expected at least fourteen stories to pass, read ${passed}:\n${output.slice(-300)}`
})

check('BlankErrorIsNoError renders an empty error and a whitespace-only one, and asserts all three', () => {
  const source = readFileSync(STORIES, 'utf8')
  const story = /export const BlankErrorIsNoError: Story = \{\n([\s\S]*?)\n\}\n/.exec(source)?.[1] ?? ''
  if (!story) return 'there is no BlankErrorIsNoError story'
  const missing = [
    ['an empty error', '<JobTitle error="" />'],
    ['a whitespace-only error', '<JobTitle error="   " />'],
    ['the default border', "semantic['border/default']"],
    ['no aria-invalid', "not.toHaveAttribute('aria-invalid')"],
    ['the helper in its own colour', "semantic['text/secondary']"],
  ].filter(([, text]) => !story.includes(text))
  return missing.length ? `it does not show ${missing.map(([what]) => what).join(', ')}` : null
})

check('THE CASE: the error tested against undefined again fails BlankErrorIsNoError', () => {
  const original = readFileSync(COMPONENT, 'utf8')
  if (!original.includes(NORMALISED)) return `the normalisation is not where this mutation expects it:\n${NORMALISED}`
  try {
    writeFileSync(COMPONENT, original.replace(NORMALISED, () => '  const error = given\n'))
    const { code, output } = stories()
    if (code === 0) return 'the stories passed with a blank error treated as an error, so nothing asserts it'
    return output.includes('× Blank Error Is No Error ') ? null : `it failed, but not in BlankErrorIsNoError:\n${output.slice(-500)}`
  } finally {
    writeFileSync(COMPONENT, original)
  }
})

check('DESIGN.md and both story docs say the error state needs a message', () => {
  const design = readFileSync(join(ROOT, 'DESIGN.md'), 'utf8')
  const section = /### An Input's error needs a message\n([\s\S]*?)\n### /.exec(design)?.[1] ?? ''
  if (!/\*\*A blank error is no error\*\*/.test(section)) return 'DESIGN.md has no section saying a blank error is no error'
  const docs = ['en', 'fa'].map((lang) => [lang, readFileSync(join(WEB, 'src', 'shared', 'story-docs', lang, 'Shared-Input.md'), 'utf8')])
  const silent = docs.filter(([, text]) => !/### BlankErrorIsNoError\n/.test(text)).map(([lang]) => lang)
  if (silent.length) return `the story is not documented in: ${silent.join(', ')}`
  const en = /### error\n\n([\s\S]*?)\n### /.exec(docs[0][1])?.[1] ?? ''
  return /blank/.test(en) ? null : 'the English docs for the error prop do not say a blank one is no error'
})

if (failures.length) {
  process.stderr.write(`\nKN-254 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-254 verify passed.\n')
