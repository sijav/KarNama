#!/usr/bin/env node
// Verifies KN-283: the Input's stories and KN-266's production check measure
// where the text starts, not the input's box.
//
// Exit condition: the Input's stories and KN-266's production check measure
// where the text starts, the input's box edge plus its own padding, border and
// text-indent on the side the text starts from, given its direction and
// alignment, and read 16 as 95:5 draws it; a static text-indent, a padding on
// the input and a changed alignment, each present in every state, fail Default
// and the production check by name.
//
// The production check is KN-266's own, run as KN-266's verifier against the
// component with each mutation in place, and its failure is read by the
// check's name and reason.
//
// NOT read-only: it edits Input.tsx for its mutations and restores it in a
// finally, and it runs KN-266's verifier, which does the same.

import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const COMPONENT = join(WEB, 'src', 'shared', 'input', 'Input.tsx')
const STORIES = join(WEB, 'src', 'shared', 'input', 'Input.stories.tsx')

const INPUT = "            '& input': { padding: 0, height: 'auto' },\n"
const PRODUCTION = 'in every state and both directions the text sits 16 from the edge'
// Each mutation of the input's own style, present in every state, and what
// KN-266's production check must say about it.
const MUTATIONS = [
  ['a text-indent of one pixel', "            '& input': { padding: 0, height: 'auto', textIndent: '1px' },\n", /text at 17 and 16/],
  ['a padding at the inline start of one pixel', "            '& input': { padding: 0, paddingInlineStart: '1px', height: 'auto' },\n", /text at 17 and 16/],
  ['the text centred', "            '& input': { padding: 0, height: 'auto', textAlign: 'center' },\n", /aligned center/],
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
const kn266 = () => {
  const result = spawnSync('node', [join(ROOT, 'agent', 'scripts', 'verify', 'KN-266.mjs')], { cwd: ROOT, encoding: 'utf8' })
  return { code: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}

const withEdit = (from, to, run) => {
  const original = readFileSync(COMPONENT, 'utf8')
  if (!original.includes(from)) throw new Error(`the anchor for this mutation is gone:\n${from}`)
  try {
    writeFileSync(COMPONENT, original.replace(from, () => to))
    return run()
  } finally {
    writeFileSync(COMPONENT, original)
  }
}

check('the Input stories measure where the text starts: its box, its own border and padding, and its text-indent, by direction and alignment', () => {
  const source = readFileSync(STORIES, 'utf8')
  const helper = /const textInsets = [\s\S]*?\n\}\n/.exec(source)?.[0] ?? ''
  const missing = [
    ['the input own style read', 'const style = getComputedStyle(box)'],
    ["the placeholder's when empty", "getComputedStyle(box, '::placeholder')"],
    ['the alignment', 'shown.textAlign'],
    ['the scroll', 'box.scrollLeft !== 0'],
    ['the padding', 'px(style.paddingLeft)'],
    ['the border', 'px(style.borderLeftWidth)'],
    ['the text-indent', 'px(shown.textIndent)'],
  ].filter(([, text]) => !helper.includes(text))
  if (missing.length) return `textInsets does not read ${missing.map(([what]) => what).join(', ')}`
  const { code, output } = stories()
  if (code !== 0) return `the stories fail:\n${output.slice(-800)}`
  return /✓.*> Default\b/.test(output) ? null : 'Default did not run and pass'
})

check("KN-266's verifier passes, its production check measuring where the text starts", () => {
  const { code, output } = kn266()
  if (code !== 0) return `it fails:\n${output.slice(-800)}`
  return output.includes(`ok   ${PRODUCTION}`) ? null : 'its production check did not run and pass'
})

for (const [what, to, reason] of MUTATIONS) {
  check(`THE CASE, ${what}: Default fails by name, and so does KN-266's production check`, () =>
    withEdit(INPUT, to, () => {
      const { code, output } = stories()
      if (code === 0) return `the stories passed with ${what}`
      if (!/[×✗].*> Default\b/.test(output)) return `the stories failed, but not in Default:\n${output.slice(-500)}`
      const production = kn266()
      const line = production.output.split('\n').find((text) => text.includes(PRODUCTION) && !text.includes('ok   ')) ?? ''
      if (production.code === 0 || !line) return `KN-266's production check did not fail with ${what}:\n${production.output.slice(-600)}`
      return reason.test(production.output) ? null : `KN-266's production check failed, but not saying ${reason}:\n${line.slice(0, 400)}`
    }),
  )
}

if (failures.length) {
  process.stderr.write(`\nKN-283 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-283 verify passed.\n')
