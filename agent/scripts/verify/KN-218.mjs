#!/usr/bin/env node
// Verifies KN-218: the tooltip's padding and shadow are the frame's.
//
// Exit condition: a story measures the open tip's computed padding as 8 top and
// bottom and 12 at each side, and its computed box-shadow as the value read
// from node 410:469; that value lives in the token set beside Card and Modal and
// is recorded in DESIGN.md's elevation table with the node it was read from; and
// a mutation restoring padding 12 on all sides fails the story.
//
// NOT read-only: it edits Tooltip.tsx and restores it in a finally.

import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const COMPONENT = join(WEB, 'src', 'shared', 'tooltip', 'Tooltip.tsx')

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

const vitest = (project, path) => {
  const result = spawnSync(`npx vitest run --project ${project} ${path}`, { cwd: WEB, encoding: 'utf8', shell: true })
  return { code: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}

const withBreak = (from, to) => {
  const original = readFileSync(COMPONENT, 'utf8')
  if (!original.includes(from)) return { stale: true, code: null, output: '' }
  try {
    writeFileSync(COMPONENT, original.replace(from, () => to))
    return vitest('storybook', 'src/shared/tooltip')
  } finally {
    writeFileSync(COMPONENT, original)
  }
}

const PADDING = 'padding: `${spacing.xs}px ${spacing.sm}px`,'
const SHADOW = '          boxShadow: theme.karnama.elevation.tooltip,\n'

check('the tooltip stories pass as they stand', () => {
  // The positive control: both breaks below require a FAILURE.
  const { code, output } = vitest('storybook', 'src/shared/tooltip')
  return code === 0 ? null : `the stories fail before anything is broken:\n${output.slice(-1000)}`
})

check('THE CASE: padding 12 on all sides, as it was, fails the story', () => {
  const { stale, code, output } = withBreak(PADDING, 'padding: `${spacing.sm}px`,')
  if (stale) return 'the padding is no longer py spacing-xs px spacing-sm'
  if (code === 0) return 'the stories passed with 12 all round, so nothing measures the padding'
  return /On Hover/.test(output) ? null : `it failed, but not in the story that measures the tip:\n${output.slice(-600)}`
})

check('removing the shadow fails the story', () => {
  const { stale, code } = withBreak(SHADOW, '')
  if (stale) return 'the component no longer draws the shadow from the theme token'
  return code === 0 ? 'the stories passed with no shadow, so nothing measures it' : null
})

check('the shadow lives in the token set beside Card and Modal, and its test passes', () => {
  const tokens = readFileSync(join(WEB, 'src', 'theme', 'tokens.ts'), 'utf8')
  if (!tokens.includes("tooltip: '0 6px 18px -2px #0000003D'")) return 'elevation.tooltip is not the value read from 410:469'
  const { code, output } = vitest('unit', 'src/theme/tokens.test.ts')
  return code === 0 ? null : `the token test fails:\n${output.slice(-600)}`
})

check("DESIGN.md's elevation table records it with the node it was read from", () => {
  const design = readFileSync(join(ROOT, 'DESIGN.md'), 'utf8')
  const row = design.split('\n').find((line) => line.startsWith('|') && line.includes('`410:469`') && line.includes('#0000003D'))
  if (!row) return 'no elevation row names 410:469 with the shadow'
  // And it must say it is not a style, or the table contradicts "exactly two".
  return /no style/.test(row) ? null : `the row does not say the shadow is bound to no style: ${row}`
})

if (failures.length) {
  process.stderr.write(`\nKN-218 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-218 verify passed.\n')
