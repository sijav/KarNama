#!/usr/bin/env node
// Verifies KN-239: the Status Chip stories render from their args, and the ones
// that cannot say so by disabling their controls.
//
// Exit condition: Default renders from its args, so changing status, label or
// size in Controls changes the chip, asserted by a story that renders with
// non-default args; AllStatuses, a fixed matrix by design, disables the
// controls it cannot honour rather than showing them.
//
// NOT read-only: it edits StatusChip.stories.tsx and restores it in a finally.

import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const STORIES = join(WEB, 'src', 'shared', 'status-chip', 'StatusChip.stories.tsx')

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
  const result = spawnSync('npx vitest run --project storybook src/shared/status-chip', { cwd: WEB, encoding: 'utf8', shell: true })
  return { code: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}

check('the Status Chip stories pass', () => {
  const { code, output } = stories()
  return code === 0 ? null : `they fail before anything is broken:\n${output.slice(-800)}`
})

check('Default has no render of its own, so it renders the component from its args', () => {
  const source = readFileSync(STORIES, 'utf8')
  return /export const Default: Story = \{\}/.test(source) ? null : 'Default is not the plain args-driven story'
})

check('THE CASE: a render that ignores its args fails the non-default-args story', () => {
  const original = readFileSync(STORIES, 'utf8')
  const anchor = "  args: { status: 'applied', label: 'درخواست‌شده', size: 'S' },\n"
  if (!original.includes(anchor)) return 'the meta args changed shape, so this mutation no longer applies'
  try {
    // A meta-level render that draws the same chip whatever the args say.
    writeFileSync(STORIES, original.replace(anchor, () => `${anchor}  render: () => <StatusChip status="applied" label="درخواست‌شده" size="S" />,\n`))
    const { code, output } = stories()
    if (code === 0) return 'the stories passed with the args ignored, so nothing asserts the chip follows them'
    return output.includes('× From Args ') ? null : `it failed, but not in FromArgs:\n${output.slice(-500)}`
  } finally {
    writeFileSync(STORIES, original)
  }
})

check('the fixed renders disable the controls they cannot honour', () => {
  const source = readFileSync(STORIES, 'utf8')
  const missing = ['AllStatuses', 'SeededName'].filter((name) => {
    const story = new RegExp(`export const ${name}: Story = \\{[\\s\\S]*?\\n\\}\\n`).exec(source)?.[0] ?? ''
    return !story.includes('parameters: { controls: { disable: true } }')
  })
  return missing.length ? `still showing controls it ignores: ${missing.join(', ')}` : null
})

if (failures.length) {
  process.stderr.write(`\nKN-239 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-239 verify passed.\n')
