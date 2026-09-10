#!/usr/bin/env node
// Verifies KN-271: the derived dark border/focus and border/error clear 3:1
// against every background a control sits on.
//
// Exit condition: in the derived dark palette, border/focus and border/error
// each reach at least 3:1 against bg/page, bg/surface and bg/surface-secondary
// with their hue unchanged; darkMode.test.ts asserts all six ratios, and a
// mutation back to the unchecked derivation fails it; DESIGN.md's dark mode
// section says which borders are checked and at what ratio; and the Input's
// Focus state and the Checkbox's focus ring are seen in dark in both languages.
//
// The last clause is a look at the rendered components, recorded as evidence
// on the card; everything else is here.
//
// NOT read-only: it edits darkMode.ts and restores it in a finally.

import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const DERIVATION = join(WEB, 'src', 'theme', 'darkMode.ts')

const BORDERS = ['border/focus', 'border/error']
const BACKGROUNDS = ['bg/page', 'bg/surface', 'bg/surface-secondary']
const ratioCase = (border, background) => `${border} clears 3:1 on the dark ${background}`
const FOCUS_ROW = "  'border/focus': ensureContrast(deriveDark(semantic['border/focus']), darkSurface, NON_TEXT_CONTRAST),\n"
const ERROR_ROW = "  'border/error': ensureContrast(deriveDark(semantic['border/error']), darkSurface, NON_TEXT_CONTRAST),\n"

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

// Verbose, so every case is listed by name whether it passed or failed.
const tests = () => {
  const result = spawnSync('npx vitest run --project unit src/theme/darkMode.test.ts --reporter=verbose', { cwd: WEB, encoding: 'utf8', shell: true })
  return { code: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}

// A case failed by name: vitest's verbose reporter marks it with a cross.
const failedCase = (output, name) => output.split('\n').some((line) => /[×✗]/.test(line) && line.includes(name))

const mutation = (from, to, what, name) => {
  const original = readFileSync(DERIVATION, 'utf8')
  if (!original.includes(from)) return `the anchor for this mutation is gone:\n${from}`
  try {
    writeFileSync(DERIVATION, original.replace(from, () => to))
    const { code, output } = tests()
    if (code === 0) return `the tests passed with ${what}, so nothing measures it`
    return failedCase(output, name) ? null : `it failed, but not in "${name}":\n${output.slice(-600)}`
  } finally {
    writeFileSync(DERIVATION, original)
  }
}

check('the dark mode tests pass, with all six ratio cases and both hue cases by name', () => {
  const { code, output } = tests()
  if (code !== 0) return `they fail before anything is broken:\n${output.slice(-800)}`
  const expected = [
    ...BORDERS.flatMap((border) => BACKGROUNDS.map((background) => ratioCase(border, background))),
    ...BORDERS.map((border) => `${border} keeps the hue of its light token`),
  ]
  const passed = (name) => output.split('\n').some((line) => line.includes('✓') && line.includes(name))
  const missing = expected.filter((name) => !passed(name))
  return missing.length ? `these cases did not run and pass: ${missing.join('; ')}` : null
})

check('THE CASE: border/focus back to the unchecked derivation fails its surface case', () =>
  mutation(FOCUS_ROW, "  'border/focus': deriveDark(semantic['border/focus']),\n", 'the unchecked focus colour', ratioCase('border/focus', 'bg/surface')),
)

check('lowering the bar in the module fails it too, because the test states 3 itself', () =>
  mutation('export const NON_TEXT_CONTRAST = 3\n', 'export const NON_TEXT_CONTRAST = 2.5\n', 'the bar lowered to 2.5', ratioCase('border/focus', 'bg/surface')),
)

check('the error cases measure the error border: the surface colour in its place fails them', () =>
  // border/error clears 3:1 unchecked, 3.23 on the surface, so going back to
  // the unchecked derivation proves nothing about its cases. This does.
  mutation(ERROR_ROW, "  'border/error': darkSurface,\n", 'the error border drawn in the surface colour', ratioCase('border/error', 'bg/surface')),
)

check('a focus border in another hue fails the hue case', () =>
  mutation(
    FOCUS_ROW,
    "  'border/focus': ensureContrast(deriveDark(semantic['text/error']), darkSurface, NON_TEXT_CONTRAST),\n",
    'a red focus colour',
    'border/focus keeps the hue of its light token',
  ),
)

check('DESIGN.md says which borders are checked and at what ratio', () => {
  const design = readFileSync(join(ROOT, 'DESIGN.md'), 'utf8')
  const section = /### Dark mode\n([\s\S]*?)\n---\n/.exec(design)?.[1] ?? ''
  if (!section) return 'DESIGN.md has no dark mode section'
  const missing = [...BORDERS, ...BACKGROUNDS].filter((token) => !section.includes(`\`${token}\``))
  if (missing.length) return `the section does not name ${missing.join(', ')}`
  return /\*\*3 to one\*\*/.test(section) ? null : 'the section does not state the ratio'
})

if (failures.length) {
  process.stderr.write(`\nKN-271 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-271 verify passed.\n')
