#!/usr/bin/env node
// Verifies KN-243: the Input's Focus story measures the text, not the box.
//
// Exit condition: the Focus story fails whenever focus changes anything that
// lays out the text inside the field: it asserts the input element's box and
// every computed property of the input are unchanged by focus, naming any
// property it exempts and why, and a mutation adding a focused-only
// text-indent to the input fails Focus by name.
//
// NOT read-only: it edits Input.tsx and restores it in a finally.

import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const COMPONENT = join(WEB, 'src', 'shared', 'input', 'Input.tsx')
const STORIES = join(WEB, 'src', 'shared', 'input', 'Input.stories.tsx')

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

// Adds a rule to the focused field's input, which moves the text inside a box
// that stays where it was. The Focus story must fail, and fail for that.
const FOCUSED = "              paddingInline: `${spacing.md - 1}px`,\n"
const focusedInput = (rule, changed) => {
  const original = readFileSync(COMPONENT, 'utf8')
  if (!original.includes(FOCUSED)) return `the anchor for this mutation is gone:\n${FOCUSED}`
  try {
    writeFileSync(COMPONENT, original.replace(FOCUSED, () => `${FOCUSED}              '& input': ${rule},\n`))
    const { code, output } = stories()
    if (code === 0) return 'the stories passed with the text moved, so nothing measures it'
    if (!output.includes('× Focus ')) return `it failed, but not in Focus:\n${output.slice(-500)}`
    return output.includes(changed) ? null : `Focus failed without naming ${changed}:\n${output.slice(-500)}`
  } finally {
    writeFileSync(COMPONENT, original)
  }
}

check('the Input stories pass', () => {
  const { code, output } = stories()
  return code === 0 ? null : `they fail before anything is broken:\n${output.slice(-800)}`
})

check('THE CASE: a focused-only text-indent on the input fails Focus, naming text-indent', () =>
  focusedInput("{ textIndent: '3px' }", 'text-indent: 0px → 3px'),
)

check("a focused-only change of the input's font family fails Focus, naming font-family", () =>
  focusedInput("{ fontFamily: 'monospace' }", 'font-family:'),
)

check('the only exemption is the outline, and the story says why', () => {
  const source = readFileSync(STORIES, 'utf8')
  const exempt = [...source.matchAll(/^const NOT_LAYOUT = (.+)$/gm)].map((match) => match[1])
  if (exempt.length !== 1) return `expected one NOT_LAYOUT, found ${exempt.length}`
  if (exempt[0] !== '/^outline(-|$)/') return `the exemption is ${exempt[0]}, not the outline family alone`
  return /it takes no space, so it cannot move the text/.test(source) ? null : 'the reason for the exemption is not written down'
})

if (failures.length) {
  process.stderr.write(`\nKN-243 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-243 verify passed.\n')
