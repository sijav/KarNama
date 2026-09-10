#!/usr/bin/env node
// Verifies KN-210: the tooltip's width is the frame's, and a test pins it.
//
// Exit condition: either the component sets the width the frame actually
// specifies, from the frame rather than from the screenshot, or DESIGN.md
// records that the frame has no fixed width and wrapping is content driven. A
// test pins whichever answer is true, so a MUI default change is caught rather
// than absorbed.
//
// The answer, from get_design_context on node 410:469: the frame is FIXED at
// 260 (`w-[260px]`) with the text set to fill, and no variable is bound to the
// width. The card said 292. That number was wrong, and it is exactly the kind of
// number a screenshot produces.
//
// NOT read-only: it edits Tooltip.tsx and restores it in a finally.

import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const COMPONENT = join(WEB, 'src', 'shared', 'tooltip', 'Tooltip.tsx')
const STORIES = join(WEB, 'src', 'shared', 'tooltip', 'Tooltip.stories.tsx')

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
  const result = spawnSync('npx vitest run --project storybook src/shared/tooltip', { cwd: WEB, encoding: 'utf8', shell: true })
  return { code: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}

const withBreak = (from, to) => {
  const original = readFileSync(COMPONENT, 'utf8')
  if (!original.includes(from)) return { stale: true, code: null, output: '' }
  try {
    writeFileSync(COMPONENT, original.replace(from, () => to))
    return stories()
  } finally {
    writeFileSync(COMPONENT, original)
  }
}

const APPLIED = '          width: TIP_WIDTH,\n          maxWidth: TIP_WIDTH,\n'

check('the tooltip stories pass as they stand', () => {
  // The positive control: both breaks below require a FAILURE.
  const { code, output } = stories()
  return code === 0 ? null : `the stories fail before anything is broken:\n${output.slice(-1000)}`
})

check("THE CASE: the component sets the frame's fixed width, 260, as width AND cap", () => {
  const source = readFileSync(COMPONENT, 'utf8')
  if (!/const TIP_WIDTH = 260\b/.test(source)) return 'the width constant is not 260, the fixed width of node 410:469'
  // Both, or MUI's default cap can still narrow it: a width alone is absorbed
  // by any max-width below it.
  return source.includes(APPLIED) ? null : 'the width is not applied as both width and maxWidth'
})

check("MUTATION: falling back to MUI's default width fails the story", () => {
  const { stale, code, output } = withBreak(APPLIED, '')
  if (stale) return 'the width lines changed shape, so this break no longer applies'
  if (code === 0) return 'the stories passed with no width set, so nothing pins it'
  return /offsetWidth|to be 260|260/.test(output) ? null : `it failed, but not on the width:\n${output.slice(-700)}`
})

check('MUTATION: a narrower library cap is caught rather than absorbed', () => {
  // The clause the card names: if MUI's default ever dropped below 260, a tip
  // that relied on it would quietly narrow. Simulated by the cap itself falling
  // to 240, which is what such a default change would do to a component that
  // did not set its own.
  const { stale, code, output } = withBreak(APPLIED, '          width: TIP_WIDTH,\n          maxWidth: 240,\n')
  if (stale) return 'the width lines changed shape, so this break no longer applies'
  if (code === 0) return 'the stories passed with the tip capped at 240, so a narrower default would be absorbed'
  return /240/.test(output) ? null : `it failed, but not on the width:\n${output.slice(-700)}`
})

check("the story pins the DESIGN's number, not the component's constant", () => {
  // Importing TIP_WIDTH into the story would let the component move the number
  // and take the test with it.
  const source = readFileSync(STORIES, 'utf8')
  if (/TIP_WIDTH/.test(source.replace(/^\s*\/\/.*$/gm, ''))) return 'the story reads the width from the component'
  return /offsetWidth\)\.toBe\(260\)/.test(source) ? null : 'no story asserts the tip is 260 wide'
})

check('DESIGN.md records the answer where a reader will find it', () => {
  const design = readFileSync(join(ROOT, 'DESIGN.md'), 'utf8')
  const row = design.split('\n').find((line) => line.includes('`410:469`'))
  if (!row) return 'the Tooltip row is gone from the component table'
  return /FIXED 260/.test(row) ? null : `the Tooltip row does not say the frame is a fixed 260: ${row}`
})

if (failures.length) {
  process.stderr.write(`\nKN-210 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-210 verify passed.\n')
