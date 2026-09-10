#!/usr/bin/env node
// Verifies KN-241: the Input's focused-while-invalid state is a recorded
// decision with a story, and its focus test checks both axes.
//
// Exit condition: DESIGN.md records what a focused invalid field looks like and
// why; a story focuses an invalid field and asserts exactly that; the Focus
// story asserts the text keeps both its horizontal and vertical position when
// the border widens; and a mutation changing the focused-error border fails
// the new story.
//
// NOT read-only: it edits Input.tsx and restores it in a finally.

import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const COMPONENT = join(WEB, 'src', 'shared', 'input', 'Input.tsx')

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

const mutation = (from, to, story) => {
  const original = readFileSync(COMPONENT, 'utf8')
  if (!original.includes(from)) return `the anchor for this mutation is gone:\n${from}`
  try {
    writeFileSync(COMPONENT, original.replace(from, () => to))
    const { code, output } = stories()
    if (code === 0) return 'the stories passed with the break, so nothing measures it'
    return output.includes(`× ${story} `) ? null : `it failed, but not in ${story}:\n${output.slice(-500)}`
  } finally {
    writeFileSync(COMPONENT, original)
  }
}

check('the Input stories pass, FocusedWhileInvalid included', () => {
  const { code, output } = stories()
  return code === 0 ? null : `they fail before anything is broken:\n${output.slice(-800)}`
})

check('THE CASE: turning the focused invalid border blue fails FocusedWhileInvalid', () =>
  mutation(
    "              borderColor: error === undefined ? colour['border/focus'] : colour['border/error'],\n",
    "              borderColor: colour['border/focus'],\n",
    'Focused While Invalid',
  ),
)

check('the Focus story catches the text moving vertically', () =>
  // A pixel of extra top padding on focus: the field stays 44 tall, and the text
  // drops by it. The first version of the story compared only `left`.
  mutation("            '&.Mui-focused': {\n", "            '&.Mui-focused': {\n              paddingTop: 2,\n", 'Focus'),
)

check('DESIGN.md records the focused-while-invalid decision and its reason', () => {
  const design = readFileSync(join(ROOT, 'DESIGN.md'), 'utf8')
  const section = /### The Input focused while invalid\n([\s\S]*?)\n### /.exec(design)?.[1] ?? ''
  if (!section) return 'there is no DESIGN.md section for the state'
  if (!/two\s+pixels of `border\/error`/.test(section)) return 'the section does not say what the state looks like'
  return /fixing it/.test(section) ? null : 'the section does not say why'
})

if (failures.length) {
  process.stderr.write(`\nKN-241 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-241 verify passed.\n')
