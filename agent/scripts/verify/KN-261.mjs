#!/usr/bin/env node
// Verifies KN-261: an Input error of only combining marks, variation selectors,
// default-ignorables or blank symbols is no error, and the rule lives once.
//
// Exit condition: an error made only of whitespace, format characters,
// combining marks, variation selectors and the blank symbols named here is no
// error, while a real message containing any of them is still shown; the blank
// rule is defined once and tested at its boundaries, including each of those
// characters alone and each inside a real Persian message; and the comment
// says exactly what the rule covers.
//
// Backslashes are built from their char code here, so no escape in this file
// is ever rewritten on its way to disk.
//
// NOT read-only: it edits blank.ts and restores it in a finally.

import { spawnSync } from 'node:child_process'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const DIR = join(WEB, 'src', 'shared', 'input')
const RULE = join(DIR, 'blank.ts')
const BS = String.fromCharCode(92)
const NARROW = `const BLANK = /^[${BS}s${BS}p{Cf}]*$/u`

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

const run = (project, path) => {
  const result = spawnSync(`npx vitest run --project ${project} ${path}`, { cwd: WEB, encoding: 'utf8', shell: true })
  return { code: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })

check('the blank rule passes its boundary tests', () => {
  const { code, output } = run('unit', 'src/shared/input/blank.test.ts')
  if (code !== 0) return `they fail:\n${output.slice(-800)}`
  const passed = Number(/Tests {2}(\d+) passed \(\1\)/.exec(output)?.[1] ?? 0)
  return passed >= 40 ? null : `expected at least forty boundary cases, read ${passed}`
})

check('the test covers each named character alone and inside a real Persian message', () => {
  const test = readFileSync(join(DIR, 'blank.test.ts'), 'utf8')
  const named = ['200c', '200f', '00ad', '0301', '034f', 'fe0f', '{e0100}', '3164', '115f', '2800', '0600']
  const missing = named.filter((code) => !test.includes(`'${BS}u${code}'`))
  if (missing.length) return `no case for ${missing.map((code) => `U+${code.replace(/[{}]/g, '').toUpperCase()}`).join(', ')}`
  if (!/it\.each\(NOTHING\)\('a real message with %s inside it is not blank'/.test(test)) return 'the characters are not tested inside a real message'
  return test.includes("const MESSAGE = 'این فیلد نمی") ? null : 'the real message is not the Input\'s Persian error'
})

check('THE CASE: the rule narrowed back to KN-259\'s pattern fails the tests for what it missed', () => {
  const original = readFileSync(RULE, 'utf8')
  const line = original.split('\n').find((entry) => entry.startsWith('const BLANK = '))
  if (!line) return 'blank.ts has no BLANK line to narrow'
  try {
    writeFileSync(RULE, original.replace(line, () => NARROW))
    const { code, output } = run('unit', 'src/shared/input/blank.test.ts')
    if (code === 0) return 'the tests passed with the narrow rule, so they do not reach what KN-261 added'
    const caught = ['the combining grapheme joiner alone', 'variation selector 16 alone', 'the Hangul filler alone', 'the braille blank alone'].filter((name) => output.includes(name))
    if (caught.length !== 4) return `the narrow rule failed, but not on all four characters KN-259 missed: ${caught.join(', ')}`
    // And the Input itself, not only the rule: the braille blank field turns red.
    const story = run('storybook', 'src/shared/input')
    if (story.code === 0) return 'the Input stories passed with the narrow rule, so no story shows the Input uses the new one'
    return story.output.includes('× Blank Error Is No Error ') ? null : `the stories failed, but not BlankErrorIsNoError:\n${story.output.slice(-500)}`
  } finally {
    writeFileSync(RULE, original)
  }
})

check('BlankErrorIsNoError renders an error of only the braille blank, which only the new rule calls blank', () => {
  const source = readFileSync(join(DIR, 'Input.stories.tsx'), 'utf8')
  const story = /export const BlankErrorIsNoError: Story = \{\n([\s\S]*?)\n\}\n/.exec(source)?.[1] ?? ''
  if (!story.includes(`<JobTitle error={'${BS}u2800'} />`)) return 'it has no field whose error is only the braille blank'
  return story.includes('await expect(pair).toHaveLength(5)') ? null : 'it does not check all five fields'
})

check('the rule is defined once under src, and the Input and its stories both import it', () => {
  // The anchored blank pattern, the shape KN-259's rule, its FromArgs copy and
  // the shared rule all have. The catalog test's /\p{Cf}/gu strips format
  // characters from a translation, a different rule, and is not this.
  const shape = `/^[${BS}s${BS}p{Cf}`
  const files = walk(join(WEB, 'src'))
    .filter((path) => /\.(ts|tsx)$/.test(path))
    .filter((path) => readFileSync(path, 'utf8').includes(shape))
    .map((path) => relative(WEB, path).split(BS).join('/'))
  if (files.length !== 1 || files[0] !== 'src/shared/input/blank.ts') return `the blank pattern lives in: ${files.join(', ') || 'nowhere'}`
  const input = readFileSync(join(DIR, 'Input.tsx'), 'utf8')
  if (/const BLANK/.test(input)) return 'Input.tsx still defines a rule of its own'
  if (!input.includes("import { isBlank } from './blank'") || !input.includes('isBlank(given)')) return 'Input.tsx does not use the shared rule'
  const stories = readFileSync(join(DIR, 'Input.stories.tsx'), 'utf8')
  return stories.includes("import { isBlank } from './blank'") && stories.includes('isBlank(args.error)') ? null : 'FromArgs does not use the shared rule'
})

check('the comment says exactly what the rule covers', () => {
  // The comment as prose, its lines joined, so a phrase that wraps still reads.
  const rule = readFileSync(RULE, 'utf8')
    .split('\n')
    .filter((line) => line.startsWith('//'))
    .map((line) => line.replace(/^\/\/ ?/, ''))
    .join(' ')
  const missing = ['whitespace', 'format character', 'mark with no letter', 'variation selectors', 'default-ignorable', 'Hangul fillers', 'braille blank'].filter(
    (term) => !rule.includes(term),
  )
  return missing.length ? `the comment does not name: ${missing.join(', ')}` : null
})

check('the Input stories pass, WithError with its zero-width non-joiner among them', () => {
  const { code, output } = run('storybook', 'src/shared/input')
  return code === 0 ? null : `they fail:\n${output.slice(-800)}`
})

check('DESIGN.md says what blank covers', () => {
  const design = readFileSync(join(ROOT, 'DESIGN.md'), 'utf8')
  const section = (/### An Input's error needs a message\n([\s\S]*?)\n### /.exec(design)?.[1] ?? '').replace(/\s+/g, ' ')
  return /nothing to read/.test(section) && /marks with no letter/.test(section) && /braille blank/.test(section) ? null : 'the section does not say what blank covers'
})

if (failures.length) {
  process.stderr.write(`\nKN-261 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-261 verify passed.\n')
