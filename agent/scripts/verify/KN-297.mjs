#!/usr/bin/env node
// Verifies KN-297: the Input's text measurement refuses what would let the
// text run from the other side without its box moving.
//
// Exit condition, as narrowed on the card on 2026-09-11 after measuring that
// Chromium ignores direction and writing-mode on ::placeholder: textInsets and
// KN-266's production check refuse by name unicode-bidi plaintext on the input,
// which lets the content set the direction, a writing mode other than
// horizontal-tb on the input, and an input whose direction is not the
// field's; unicode-bidi plaintext on the input, a vertical writing mode on it,
// and the input set to the other direction, each present in every state, fail
// Default and the production check by name; and KN-283's verifier still
// passes.
//
// The production check is KN-266's own, run as KN-266's verifier against the
// component with each mutation in place, its failure read for the reason.
//
// NOT read-only: it edits Input.tsx for its mutations and restores it in a
// finally, and it runs KN-266's and KN-283's verifiers, which do the same.

import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const COMPONENT = join(WEB, 'src', 'shared', 'input', 'Input.tsx')
const STORIES = join(WEB, 'src', 'shared', 'input', 'Input.stories.tsx')

const INPUT = "            '& input': { padding: 0, height: 'auto' },\n"
const PROPS = "        inputProps={{ 'aria-describedby': message === undefined ? undefined : messageId, 'aria-invalid': error === undefined ? undefined : true }}\n"
const PRODUCTION = 'in every state and both directions the text sits 16 from the edge'
const MUI = "import { Box, InputBase } from '@mui/material'\n"
// Each mutation, its edits, and what the story and KN-266's production check
// must say. The last is a dir attribute the other way from the theme's, which
// follows the language: a direction in the styles would be flipped back by the
// Emotion cache's RTL plugin in Persian and match the field in English, and
// the page's body does not carry the story's direction under the test runner.
const MUTATIONS = [
  ['unicode-bidi plaintext on the input', [[INPUT, "            '& input': { padding: 0, height: 'auto', unicodeBidi: 'plaintext' },\n"]], /unicode-bidi plaintext/, /content sets the direction/],
  ['a vertical writing mode on the input', [[INPUT, "            '& input': { padding: 0, height: 'auto', writingMode: 'vertical-rl' },\n"]], /writing vertical-rl/, /runs vertical-rl, not across/],
  [
    'the input given the other direction',
    [
      [MUI, "import { Box, InputBase, useTheme } from '@mui/material'\n"],
      [PROPS, "        inputProps={{ dir: useTheme().direction === 'rtl' ? 'ltr' : 'rtl', 'aria-describedby': message === undefined ? undefined : messageId, 'aria-invalid': error === undefined ? undefined : true }}\n"],
    ],
    /running (ltr|rtl) in a field running (rtl|ltr)/,
    /runs (ltr|rtl) in a field that runs (rtl|ltr)/,
  ],
]

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
  const result = spawnSync('npx vitest run --project storybook src/shared/input --reporter=verbose', { cwd: WEB, encoding: 'utf8', shell: true })
  return { code: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}
const verifier = (id) => {
  const result = spawnSync('node', [join(ROOT, 'agent', 'scripts', 'verify', `${id}.mjs`)], { cwd: ROOT, encoding: 'utf8' })
  return { code: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}

const withEdits = (edits, run) => {
  const original = readFileSync(COMPONENT, 'utf8')
  let changed = original
  for (const [from, to] of edits) {
    if (!changed.includes(from)) throw new Error(`the anchor for this mutation is gone:\n${from}`)
    changed = changed.replace(from, () => to)
  }
  try {
    writeFileSync(COMPONENT, changed)
    return run()
  } finally {
    writeFileSync(COMPONENT, original)
  }
}

check('textInsets refuses content-set direction, a writing mode across nothing, and an input running against its field, and the stories pass', () => {
  const source = readFileSync(STORIES, 'utf8')
  const helper = /const textInsets = [\s\S]*?\n\}\n/.exec(source)?.[0] ?? ''
  const missing = [
    ['unicode-bidi', 'style.unicodeBidi'],
    ['the writing mode', "style.writingMode !== 'horizontal-tb'"],
    ["the field's direction", 'getComputedStyle(field).direction'],
  ].filter(([, text]) => !helper.includes(text))
  if (missing.length) return `textInsets does not read ${missing.map(([what]) => what).join(', ')}`
  const { code, output } = stories()
  if (code !== 0) return `the stories fail:\n${output.slice(-800)}`
  return /✓.*> Default\b/.test(output) ? null : 'Default did not run and pass'
})

for (const [what, edits, production, story] of MUTATIONS) {
  check(`THE CASE, ${what}: Default fails by name, and so does KN-266's production check`, () =>
    withEdits(edits, () => {
      const { code, output } = stories()
      if (code === 0) return `the stories passed with ${what}`
      if (!/[×✗].*> Default\b/.test(output)) return `the stories failed, but not in Default:\n${output.slice(-500)}`
      if (!story.test(output)) return `Default failed, but not saying ${story}:\n${output.slice(-600)}`
      const run = verifier('KN-266')
      const line = run.output.split('\n').find((text) => text.includes(PRODUCTION) && !text.includes('ok   ')) ?? ''
      if (run.code === 0 || !line) return `KN-266's production check did not fail with ${what}:\n${run.output.slice(-600)}`
      return production.test(run.output) ? null : `KN-266's production check failed, but not saying ${production}:\n${line.slice(0, 400)}`
    }),
  )
}

check("KN-283's verifier still passes", () => {
  const { code, output } = verifier('KN-283')
  return code === 0 ? null : `it fails:\n${output.slice(-800)}`
})

if (failures.length) {
  process.stderr.write(`\nKN-297 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-297 verify passed.\n')
