#!/usr/bin/env node
// Verifies KN-244: a focused invalid Input shows focus by a ring that changes
// at least a two pixel perimeter at 3:1, not by one pixel of the same red.
//
// Exit condition: a focused invalid field differs from the same field
// unfocused by at least a two-pixel perimeter changed at 3:1 contrast or more,
// the WCAG 2.4.13 measure the ordinary Focus state already meets; the field's
// border stays border/error so the error is still visible; the text does not
// move; DESIGN.md's section records the treatment, the measure and the reason;
// and FocusedWhileInvalid asserts it, with a mutation back to the one-pixel
// treatment failing that story by name.
//
// Each clause gets a mutation that breaks it and must fail FocusedWhileInvalid.
//
// KN-274 moved the ring inside the field, so a host that clips at the field's
// edge cannot take it: the clauses measure that ring, an ::after four in from
// the edge, against the field's own surface, where they measured an outline
// against three backdrops.
//
// NOT read-only: it edits Input.tsx and Input.stories.tsx and restores each in
// a finally, and it runs KN-241's verifier, which does the same.

import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const DIR = join(WEB, 'src', 'shared', 'input')
const COMPONENT = join(DIR, 'Input.tsx')
const STORIES = join(DIR, 'Input.stories.tsx')
const STORY = 'Focused While Invalid'

const RING = "                    '&::after': {\n"
const RING_WIDTH = 'const RING_WIDTH = 2\n'
const RING_COLOUR = "                      borderColor: colour['border/focus'],\n"
const EDGE_WIDTH = '              borderWidth: 2,\n'
const BORDER = "              borderColor: error === undefined ? colour['border/focus'] : colour['border/error'],\n"

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

// Break one thing, expect FocusedWhileInvalid to fail, and, where given, fail
// on the assertion that clause is about rather than on some other one.
const mutation = (file, from, to, what, because) => {
  const original = readFileSync(file, 'utf8')
  if (!original.includes(from)) return `the anchor for this mutation is gone:\n${from}`
  try {
    writeFileSync(file, original.replace(from, () => to))
    const { code, output } = stories()
    if (code === 0) return `the stories passed with ${what}, so nothing measures it`
    if (!output.includes(`× ${STORY} `)) return `it failed, but not in FocusedWhileInvalid:\n${output.slice(-500)}`
    return because === undefined || output.includes(because) ? null : `FocusedWhileInvalid failed, but not on "${because}":\n${output.slice(-700)}`
  } finally {
    writeFileSync(file, original)
  }
}

check('the Input stories pass, FocusedWhileInvalid included', () => {
  const { code, output } = stories()
  return code === 0 ? null : `they fail before anything is broken:\n${output.slice(-800)}`
})

check("FocusedWhileInvalid measures the ring against the field's own surface, and the area of the change", () => {
  const source = readFileSync(STORIES, 'utf8')
  const story = /export const FocusedWhileInvalid: Story = \{\n([\s\S]*?)\n\}\n/.exec(source)?.[1] ?? ''
  const missing = [
    ["the surface the field's own", 'const surface = hexOf(getComputedStyle(field).backgroundColor)'],
    ['the ring measured against it', 'contrast(hexOf(ring.borderTopColor), surface)).toBeGreaterThanOrEqual(3)'],
    ['the area against the two-pixel perimeter', 'changed - 4 * (width + height)).toBeGreaterThanOrEqual(0)'],
    ['the text measured before and after', 'changes(before, textLayout(box))).toEqual([])'],
  ].filter(([, text]) => !story.includes(text))
  return missing.length ? `the story does not assert ${missing.map(([what]) => what).join(', ')}` : null
})

check('THE CASE: the one-pixel treatment back, the ring removed, fails FocusedWhileInvalid', () =>
  // A pseudo-element no browser knows: the rule is dropped, and no ring drawn.
  mutation(COMPONENT, RING, "                    '&::kn244-removed': {\n", 'no focus ring'),
)

check("the contrast clause measures: a ring in the field's own surface colour fails on the contrast assertion", () =>
  mutation(COMPONENT, RING_COLOUR, "                      borderColor: colour['bg/surface'],\n", 'a ring the field cannot show', 'to be greater than or equal to 3'),
)

check('the two pixel clause: a one pixel ring fails it', () =>
  mutation(COMPONENT, RING_WIDTH, 'const RING_WIDTH = 1\n', 'a one pixel ring', 'to be greater than or equal to 2'),
)

check('the area clause: the ring alone, the edge not widening on focus, fails it', () =>
  mutation(COMPONENT, EDGE_WIDTH, '              borderWidth: error === undefined ? 2 : 1,\n', 'only the ring changing', 'to be greater than or equal to 0'),
)

check('the border stays border/error: a blue focused invalid border fails it', () =>
  mutation(COMPONENT, BORDER, "              borderColor: colour['border/focus'],\n", 'a blue border on an invalid field'),
)

check('the text does not move: a padding change on an invalid field\'s focus fails it', () =>
  mutation(COMPONENT, RING, "                    paddingInline: `${spacing.sm}px`,\n                    '&::after': {\n", 'the text moving on focus', 'box '),
)

check('DESIGN.md records the treatment, the measure and the reason', () => {
  const design = readFileSync(join(ROOT, 'DESIGN.md'), 'utf8')
  const section = /### The Input focused while invalid\n([\s\S]*?)\n### /.exec(design)?.[1] ?? ''
  if (!section) return 'there is no DESIGN.md section for the state'
  const missing = [
    ['the error border kept', /two\s+pixels of `border\/error`/],
    ['the ring', /two\s+pixels\s+of\s+`border\/focus`,\s+four\s+pixels\s+in/],
    ['the measure', /2\.4\.13/],
    ['the ratio', /3\s+to\s+one/],
    ['the reason', /cannot\s+resolve/],
    ['the ring inside the field', /inside\s+the\s+field's\s+own\s+box/],
  ].filter(([, pattern]) => !pattern.test(section))
  return missing.length ? `the section does not state ${missing.map(([what]) => what).join(', ')}` : null
})

check("KN-241's verifier still passes, mutations and all", () => {
  const result = spawnSync('node', [join(ROOT, 'agent', 'scripts', 'verify', 'KN-241.mjs')], { cwd: ROOT, encoding: 'utf8' })
  return result.status === 0 ? null : `it fails:\n${`${result.stdout}${result.stderr}`.slice(-600)}`
})

if (failures.length) {
  process.stderr.write(`\nKN-244 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-244 verify passed.\n')
