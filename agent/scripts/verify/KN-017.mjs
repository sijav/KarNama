#!/usr/bin/env node
// Verifies KN-017: the filter chip, four states, from Figma node 159:71.
//
// Exit condition: four states match Figma, the count updates with the filtered
// data, selecting and deselecting are both reachable by keyboard, and the
// selected state is ANNOUNCED rather than only shown.
//
// The last clause is the one worth breaking rather than reading. A chip that
// only changes colour is invisible to a screen reader, and this chip IS the
// filter state, so `aria-pressed` is the feature and not a nicety.
//
// NOT read-only: it edits FilterChip.tsx and restores it in a finally.

import { readFileSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const COMPONENT = join(WEB, 'src', 'shared', 'filter-chip', 'FilterChip.tsx')
const STORIES = join(WEB, 'src', 'shared', 'filter-chip', 'FilterChip.stories.tsx')

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
  const result = spawnSync('npx', ['vitest', 'run', '--project', 'storybook', 'src/shared/filter-chip'], {
    cwd: WEB,
    encoding: 'utf8',
    shell: true,
  })
  return { code: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}

const withBreak = (file, from, to) => {
  const original = readFileSync(file, 'utf8')
  if (!original.includes(from)) return { stale: true, code: null, output: '' }
  try {
    writeFileSync(file, original.replace(from, to))
    return stories()
  } finally {
    writeFileSync(file, original)
  }
}

check('the stories pass as they stand', () => {
  // The positive control. Every case below requires a FAILURE, and a component
  // that is broken outright supplies failures for free.
  const { code, output } = stories()
  return code === 0 ? null : `the stories fail before anything is broken:\n${output.slice(-1000)}`
})

check('THE CASE: dropping aria-pressed fails, so the state is ANNOUNCED', () => {
  const { stale, code, output } = withBreak(COMPONENT, 'aria-pressed={selected}', 'data-selected={selected}')
  if (stale) return 'the chip no longer sets aria-pressed at all'
  if (code === 0) return 'the stories passed with no aria-pressed, so nothing proves the state is announced'
  return /aria-pressed|toHaveAttribute/i.test(output) ? null : `it failed, but not on the announcement:\n${output.slice(-700)}`
})

check('the count follows the READER, not the source, so digits are localised', () => {
  // Pinning the locale to English makes the Persian stories read 3 where they
  // expect ۳. If nothing fails, the count is not going through the locale at
  // all and a Persian screen would show the one untranslated thing on it.
  const { stale, code, output } = withBreak(COMPONENT, 'formatCount(locale, count)', "formatCount('en-US', count)")
  if (stale) return 'the chip no longer formats the count through the reader locale'
  if (code === 0) return 'the stories passed with the count pinned to English, so the digits are not localised'
  return /۳|toHaveTextContent/i.test(output) ? null : `it failed, but not on the digits:\n${output.slice(-700)}`
})

check('the count follows its prop, so it can track filtered data', () => {
  // "The count updates with the filtered data" means the rendered text is a
  // function of the prop. Pinning it proves the stories would notice.
  const { stale, code } = withBreak(COMPONENT, 'formatCount(locale, count)', 'formatCount(locale, 3)')
  if (stale) return 'the count is no longer rendered from the prop'
  return code === 0 ? 'the stories passed with the count pinned to 3, so nothing tracks the prop' : null
})

check('selecting AND deselecting are both reachable by keyboard', () => {
  const source = readFileSync(STORIES, 'utf8')
  if (!/export const KeyboardOnly/.test(source)) return 'there is no keyboard-only story'
  if (!/userEvent\.tab\(\)/.test(source)) return 'the keyboard story never tabs to the chip'
  // Enter and Space, because a native button answers to both and a filter you
  // can turn on but not off is a trap.
  const keys = /\{Enter\}/.test(source) && /userEvent\.keyboard\(' '\)/.test(source)
  return keys ? null : 'the keyboard story does not exercise both Enter and Space'
})

check('the four states come from the Figma variables, by token name', () => {
  // Node 159:71 resolves to these. Naming them means swapping one for a
  // near-enough neighbour fails rather than merely looking slightly wrong.
  const source = readFileSync(COMPONENT, 'utf8')
  const required = [
    "'bg/surface'",
    "'bg/surface-secondary'",
    "'bg/brand/container'",
    "'border/default'",
    "'border/focus'",
    "'text/secondary'",
    "'text/brand'",
    'radius.full',
  ]
  const missing = required.filter((token) => !source.includes(token))
  if (missing.length) return `the chip no longer uses ${missing.join(', ')}`

  // The design draws four states, so a fifth should not appear here. Checked
  // against the source with COMMENTS REMOVED, and that is not a detail: the
  // first version of this check failed on the component's own comment saying
  // there is no disabled state. A check that searches for a word, in a file
  // that has to be able to mention that word, flags itself. This repository has
  // now done that seven times.
  const code = source.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1')
  return /\bdisabled\b/i.test(code) ? 'the chip has grown a disabled state the design does not draw' : null
})

if (failures.length) {
  process.stderr.write(`\nKN-017 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-017 verify passed.\n')
