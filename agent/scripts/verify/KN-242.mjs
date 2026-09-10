#!/usr/bin/env node
// Verifies KN-242: the Input stories render from their args, and the fixed
// renders say so by disabling their controls.
//
// Exit condition: Default renders the Input from its args with the specimen
// copy as its defaults, a story with non-default args asserts the field follows
// them, and any story that is a fixed render by design disables the controls it
// cannot honour.
//
// NOT read-only: it edits Input.stories.tsx and restores it in a finally.

import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
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

const storyBody = (source, name) => new RegExp(`export const ${name}: Story = \\{[\\s\\S]*?\\n\\}\\n`).exec(source)?.[0] ?? ''

check('the Input stories pass', () => {
  const { code, output } = stories()
  return code === 0 ? null : `they fail before anything is broken:\n${output.slice(-800)}`
})

check('the meta renders every arg through the specimen, and Default adds no render of its own', () => {
  const source = readFileSync(STORIES, 'utf8')
  if (!/ {2}render: \(args\) => <JobTitle key=\{args\.defaultValue\} \{\.\.\.args\} \/>,/.test(source)) return 'the meta does not pass its args to the specimen'
  return /render:/.test(storyBody(source, 'Default')) ? 'Default overrides the args-driven render' : null
})

check('THE CASE: a render that ignores its args fails FromArgs', () => {
  const original = readFileSync(STORIES, 'utf8')
  const anchor = '  render: (args) => <JobTitle key={args.defaultValue} {...args} />,\n'
  if (!original.includes(anchor)) return 'the meta render changed shape, so this mutation no longer applies'
  try {
    writeFileSync(STORIES, original.replace(anchor, () => '  render: () => <JobTitle />,\n'))
    const { code, output } = stories()
    if (code === 0) return 'the stories passed with the args ignored, so nothing asserts the field follows them'
    return output.includes('× From Args ') ? null : `it failed, but not in FromArgs:\n${output.slice(-500)}`
  } finally {
    writeFileSync(STORIES, original)
  }
})

check('every fixed render disables its controls', () => {
  const source = readFileSync(STORIES, 'utf8')
  const fixed = [...source.matchAll(/export const (\w+): Story = \{/g)].map((match) => match[1]).filter((name) => /\n {2}render:/.test(storyBody(source, name)))
  const offering = fixed.filter((name) => !storyBody(source, name).includes('parameters: { controls: { disable: true } }'))
  if (!fixed.length) return 'no fixed render found, so this check read nothing'
  return offering.length ? `fixed renders still showing controls: ${offering.join(', ')}` : null
})

if (failures.length) {
  process.stderr.write(`\nKN-242 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-242 verify passed.\n')
