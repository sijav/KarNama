#!/usr/bin/env node
// Verifies KN-205: the Checkbox's hover and focus rules reach the frame only.
//
// The defect: the frame and the glyph inside it were both `MuiBox-root`, because
// the glyph is a Box rendered as an `svg` and MUI puts that class on every Box.
// So a descendant selector matched two elements and the white 12px tick drew its
// own blue focus outline.
//
// This does not read the selector and agree with it. It breaks the fix and
// requires the story to fail, because a story that merely renders would pass
// either way.
//
// NOT read-only: it edits Checkbox.tsx and restores it in a finally.

import { readFileSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const COMPONENT = join(WEB, 'src', 'shared', 'checkbox', 'Checkbox.tsx')

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
  const result = spawnSync('npx', ['vitest', 'run', '--project', 'storybook', 'src/shared/checkbox'], {
    cwd: WEB,
    encoding: 'utf8',
    shell: true,
  })
  return { code: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}

const withBreak = (from, to) => {
  const original = readFileSync(COMPONENT, 'utf8')
  if (!original.includes(from)) return { stale: true, code: null, output: '' }
  try {
    writeFileSync(COMPONENT, original.replace(from, to))
    return stories()
  } finally {
    writeFileSync(COMPONENT, original)
  }
}

check('the checkbox stories pass as they stand', () => {
  // The positive control. Both cases below require a FAILURE, and a component
  // that is broken outright supplies failures for free.
  const { code, output } = stories()
  return code === 0 ? null : `the stories fail before anything is broken:\n${output.slice(-1000)}`
})

check('THE CASE: restoring the MUI-class selector fails the focus assertion', () => {
  const { stale, code, output } = withBreak('[`&.Mui-focusVisible .${FRAME}`]', "['&.Mui-focusVisible .MuiBox-root']")
  if (stale) return 'the focus rule is no longer scoped to the frame marker, so this card has been undone'
  if (code === 0) return 'the stories passed with the selector matching the glyph again, so nothing tests the scope'
  return /toHaveLength|outlined|KarnamaCheckbox-frame/i.test(output)
    ? null
    : `it failed, but not on the focus scope:\n${output.slice(-800)}`
})

check('removing the frame marker fails too, so the class is load-bearing', () => {
  const { stale, code } = withBreak('    className={FRAME}\n', '')
  if (stale) return 'the frame no longer carries the marker'
  return code === 0 ? 'the stories passed with the frame unmarked' : null
})

check('the frame owns its class, and the glyph does not', () => {
  const source = readFileSync(COMPONENT, 'utf8')
  // One constant used by both the element and the rules, so they cannot drift.
  if (!/const FRAME = '/.test(source)) return 'there is no frame marker constant'
  const rules = source.match(/\[`&[^`]*`\]/g) ?? []
  const unscoped = rules.filter((rule) => !rule.includes('${FRAME}'))
  if (unscoped.length) return `a style rule is not scoped to the frame: ${unscoped[0]}`
  // Hover must stay on the ROOT. MUI lays an invisible input over the control as
  // a SIBLING of the frame, so it is topmost at the frame's centre and a
  // `.frame:hover` rule never matches. I moved it into the frame first and
  // hovering with a real pointer showed the border never changing.
  return /&:hover[^`]*\$\{FRAME\}/.test(source)
    ? null
    : 'the hover rule is not on the root, where the element that actually receives the pointer lives'
})

if (failures.length) {
  process.stderr.write(`\nKN-205 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-205 verify passed.\n')
