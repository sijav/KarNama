#!/usr/bin/env node
// Verifies KN-032: the tooltip, from Figma node 410:469.
//
// Exit condition: it matches Figma, appears on hover AND on keyboard focus
// rather than hover alone, and does not trap the pointer.
//
// The last two are the ones worth breaking rather than reading. A hover-only
// tooltip is invisible to anyone using a keyboard, and a tooltip that accepts
// the pointer swallows the click meant for the control underneath — and that
// one was actually wrong at first, because MUI's tooltip is INTERACTIVE by
// default and sets `pointer-events: auto` itself. Styling alone did not fix it.
//
// NOT read-only: it edits Tooltip.tsx and restores it in a finally.

import { readFileSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
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
  const result = spawnSync('npx', ['vitest', 'run', '--project', 'storybook', 'src/shared/tooltip'], {
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

check('the stories pass as they stand', () => {
  // The positive control. Both breaks below require a FAILURE, and a component
  // that is broken outright supplies failures for free.
  const { code, output } = stories()
  return code === 0 ? null : `the stories fail before anything is broken:\n${output.slice(-1000)}`
})

check('THE CASE: allowing the tooltip to take the pointer fails', () => {
  // Removing `disableInteractive` restores MUI's default, which sets
  // `pointer-events: auto`. If nothing fails, nothing is testing the clause and
  // the tip can swallow a click.
  const { stale, code, output } = withBreak('    disableInteractive\n', '')
  if (stale) return 'the tooltip no longer disables MUI interactivity, so it can take the pointer'
  if (code === 0) return 'the stories passed with the tooltip interactive again, so nothing tests the pointer'
  return /pointerEvents|pointer-events|auto/i.test(output) ? null : `it failed, but not on the pointer:\n${output.slice(-700)}`
})

check('keyboard focus opens it, not hover alone', () => {
  // MUI shows on focus unless told not to. Turning that off must fail, or the
  // focus story is not actually proving anything.
  const { stale, code } = withBreak('    disableInteractive\n', '    disableInteractive\n    disableFocusListener\n')
  if (stale) return 'the component changed shape and this break no longer applies'
  return code === 0 ? 'the stories passed with the focus listener disabled, so nothing proves focus opens it' : null
})

check('every colour, radius and spacing comes from the Figma variables', () => {
  // Node 410:469 resolves to these. The fill is `text/primary`, which is a
  // deliberate reuse rather than a missing token: Figma points this surface at
  // the same variable as the darkest text colour.
  const source = readFileSync(COMPONENT, 'utf8')
  const required = ["'text/primary'", "'text/on-accent'", 'radius.md', 'spacing.sm', 'spacing.xs', 'iconSize.sm']
  const missing = required.filter((token) => !source.includes(token))
  return missing.length ? `the tooltip no longer uses ${missing.join(', ')}` : null
})

check('the icon is decorative, so a screen reader is not told it twice', () => {
  const source = readFileSync(COMPONENT, 'utf8')
  // The text already says everything the mark does.
  return /aria-hidden/.test(source) ? null : 'the icon is not marked decorative'
})

check('hover, focus and dismissal are all stories, not claims', () => {
  const source = readFileSync(STORIES, 'utf8')
  const missing = [
    ['a hover story', /export const OnHover/],
    ['a keyboard-focus story', /export const OnKeyboardFocus/],
    ['a pointer-trap story', /export const DoesNotTrapThePointer/],
    ['a dismissal story', /export const Dismissed/],
  ].filter(([, pattern]) => !pattern.test(source))
  if (missing.length) return `there is no ${missing.map(([name]) => name).join(', no ')}`
  // The focus story must not reach for a pointer, or it proves the wrong thing.
  const focus = /export const OnKeyboardFocus[\s\S]*?\n}/.exec(source)?.[0] ?? ''
  return /userEvent\.hover|userEvent\.click/.test(focus)
    ? 'the keyboard story uses a pointer, so it does not show focus alone opens the tip'
    : null
})

if (failures.length) {
  process.stderr.write(`\nKN-032 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-032 verify passed.\n')
