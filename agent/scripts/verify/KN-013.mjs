#!/usr/bin/env node
// Verifies KN-013: the checkbox, five states, from Figma node 204:11.
//
// Exit condition: all five states match Figma, indeterminate is set through the
// DOM PROPERTY rather than an attribute so it survives a re-render, and the
// control is reachable and toggleable by keyboard.
//
// The middle clause is the one that needs proving rather than asserting, and it
// is the one that was actually broken twice while building this. MUI does not
// set the property at all — it picks an icon and writes `data-indeterminate` —
// so a checkbox can draw a dash while telling assistive technology it is simply
// unchecked. And MUI 9 removed `inputRef` from SwitchBase, so the first attempt
// to set the property silently did nothing: an unknown prop is ignored and
// nothing about the rendered output looked wrong.
//
// So this does not read the source and agree with it. It BREAKS the assignment
// and requires the story to fail, which is the only way to show the story is
// testing the property rather than the attribute beside it.
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

/** The Checkbox stories, in a real browser, through the storybook project. */
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

check('the five stories pass in a real browser', () => {
  // The positive control, and it is not decoration: every case below requires a
  // FAILURE, and a component that is broken outright supplies failures free.
  const { code, output } = stories()
  if (code !== 0) return `the Checkbox stories fail before anything is broken:\n${output.slice(-1200)}`
  return /5 passed|Tests {2}5 passed/.test(output) ? null : `expected five stories to run, got:\n${output.slice(-400)}`
})

check('THE CASE: breaking the DOM-property assignment fails the Indeterminate story', () => {
  // If the story asserted `data-indeterminate` instead, this break would leave
  // it green: MUI writes that attribute whether or not the property is set.
  const { stale, code, output } = withBreak(
    '    applyIndeterminate(input, indeterminate)',
    '    applyIndeterminate(input, false)',
  )
  if (stale) return 'the assignment this card is about is no longer in Checkbox.tsx'
  if (code === 0) return 'the stories passed with the indeterminate property never set, so nothing tests it'
  return /indeterminate/i.test(output) ? null : `it failed, but not about indeterminate:\n${output.slice(-800)}`
})

check('the property is set on the ELEMENT, not rendered into the markup', () => {
  // There is no `indeterminate` content attribute in HTML. Spreading it onto an
  // input would be dropped by React, so the mechanism has to be an assignment.
  const source = readFileSync(COMPONENT, 'utf8')
  if (!/\.indeterminate = /.test(source)) return 'nothing assigns the indeterminate property'
  return /slotProps=\{\{ input: \{ ref:/.test(source)
    ? null
    : 'the input node is not reached through slotProps.input.ref, which is the only way in MUI 9'
})

check('every colour and radius comes from the Figma variables, by token name', () => {
  // Figma node 204:11 resolves to seven variables. Each maps onto a token key,
  // and naming them here means swapping one for a near-enough neighbour fails
  // rather than merely looking slightly wrong.
  const source = readFileSync(COMPONENT, 'utf8')
  const required = [
    "'bg/surface'",
    "'bg/surface-secondary'",
    "'bg/brand/default'",
    "'border/default'",
    "'border/focus'",
    "'text/on-accent'",
    'radius.sm',
    'iconSize.md',
  ]
  const missing = required.filter((token) => !source.includes(token))
  return missing.length ? `the component no longer uses ${missing.join(', ')}` : null
})

check('no design value is written as a literal', () => {
  // Delegated to the repository's own rule rather than restated here, so the two
  // cannot disagree. It reads comments as well as code, which is worth knowing.
  const result = spawnSync('npx', ['vitest', 'run', '--project', 'unit', 'src/theme/noLiterals.test.ts'], {
    cwd: WEB,
    encoding: 'utf8',
    shell: true,
  })
  return result.status === 0 ? null : `noLiterals rejects the component:\n${`${result.stdout ?? ''}`.slice(-800)}`
})

check('the keyboard path is a story, not a claim', () => {
  const source = readFileSync(join(WEB, 'src', 'shared', 'checkbox', 'Checkbox.stories.tsx'), 'utf8')
  if (!/export const KeyboardOnly/.test(source)) return 'there is no keyboard-only story'
  // Tab to reach it and Space to toggle it, with no pointer in the story at all.
  if (!/userEvent\.tab\(\)/.test(source)) return 'the keyboard story never tabs to the control'
  return /userEvent\.keyboard\(' '\)/.test(source) ? null : 'the keyboard story never presses Space'
})

if (failures.length) {
  process.stderr.write(`\nKN-013 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-013 verify passed.\n')
