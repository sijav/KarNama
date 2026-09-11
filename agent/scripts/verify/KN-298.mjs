#!/usr/bin/env node
// Verifies KN-298: an Input's error replaced by another while the field has
// focus lands in the same live region, the one that was there before.
//
// Exit condition: a story replaces one error with another on a focused Input,
// focus kept, and asserts the same alert holds the second error and the field
// is described by it; KN-286's verifier reads Chromium's accessibility tree
// after the replacement, the alert holding the second error, in both
// languages; and KN-286's plan says what is tested and that no check here hears
// a screen reader.
//
// NOT read-only: it edits Input.tsx for its mutation and restores it in a
// finally, and it runs KN-286's verifier, which does the same.

import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const COMPONENT = join(WEB, 'src', 'shared', 'input', 'Input.tsx')
const STORIES = join(WEB, 'src', 'shared', 'input', 'Input.stories.tsx')
const STORY = 'Error Announced While Typing'

// The region, and the region keyed on its error, so React mounts a new node
// whenever the error changes instead of changing the one that was there.
const REGION = '        <span role="alert">{error}</span>\n'
const KEYED = '        <span role="alert" key={error}>{error}</span>\n'

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
const ran = (output, mark) => output.split('\n').some((line) => mark.test(line) && line.includes(`> ${STORY}`))

check('the Input stories pass, and ErrorAnnouncedWhileTyping replaces one error with another on the alert it found empty', () => {
  const source = readFileSync(STORIES, 'utf8')
  const story = /export const ErrorAnnouncedWhileTyping: Story = \{\n([\s\S]*?)\n\}\n/.exec(source)?.[1] ?? ''
  const missing = [
    ['the second rule', "value.length < 2 ? { error: i18n._('Enter at least two characters') }"],
    ['focus kept through the replacement', "await userEvent.type(box, 'x')\n      await expect(box).toHaveFocus()"],
    ['the same node', "await expect(within(field).getByRole('alert')).toBe(region)"],
    ['the second error in it', 'await expect(region).toHaveTextContent(short)'],
    ['the field described by it', 'await expect(box).toHaveAccessibleDescription(short)'],
  ].filter(([, text]) => !(text.startsWith('value.length') ? source : story).includes(text))
  if (missing.length) return `the story does not have ${missing.map(([what]) => what).join(', ')}`
  const { code, output } = stories()
  if (code !== 0) return `they fail:\n${output.slice(-800)}`
  return ran(output, /✓/) ? null : 'ErrorAnnouncedWhileTyping did not run and pass'
})

check('THE CASE: the alert keyed on its error, a new node for each, fails ErrorAnnouncedWhileTyping by name', () => {
  const original = readFileSync(COMPONENT, 'utf8')
  if (!original.includes(REGION)) return `the region is not where the mutation expects it:\n${REGION}`
  try {
    writeFileSync(COMPONENT, original.replace(REGION, () => KEYED))
    const { code, output } = stories()
    if (code === 0) return 'the stories passed with a new alert node for each error'
    return ran(output, /[×✗]/) ? null : `it failed, but not in ErrorAnnouncedWhileTyping:\n${output.slice(-500)}`
  } finally {
    writeFileSync(COMPONENT, original)
  }
})

check("KN-286's verifier passes, its accessibility tree reading the second error in the same node in both languages", () => {
  const result = spawnSync('node', [join(ROOT, 'agent', 'scripts', 'verify', 'KN-286.mjs')], { cwd: ROOT, encoding: 'utf8' })
  const output = `${result.stdout}${result.stderr}`
  process.stdout.write(output.split('\n').filter((line) => /^\s+(fa-IR|en-US):/.test(line)).map((line) => `${line}\n`).join(''))
  if (result.status !== 0) return `it fails:\n${output.slice(-800)}`
  return output.includes('then a second error replacing it in the same node') ? null : "KN-286's tree check does not read the replacement"
})

check("KN-286's plan says what is tested, and that no check here hears a screen reader", () => {
  const plan = readFileSync(join(WEB, 'src', 'shared', 'input', "#KN-286 - An Input's error is not announced when it appears while the field has focus.md"), 'utf8').replace(/\s+/g, ' ')
  if (/and again if it changes to another error/.test(plan)) return 'the plan still claims the second error is read'
  return /carrying a second error in the same node when it replaces the first, KN-298; whether a screen reader speaks each is for a person listening, since no check here hears one/.test(plan) ? null : 'the plan does not say what is tested'
})

if (failures.length) {
  process.stderr.write(`\nKN-298 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-298 verify passed.\n')
