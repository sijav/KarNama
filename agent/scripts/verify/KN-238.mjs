#!/usr/bin/env node
// Verifies KN-238: a long renamed status name is cut with an ellipsis inside
// the Status Chip, which never grows past where it sits.
//
// Exit condition: a status name longer than its container is truncated with an
// ellipsis inside the chip, which never grows past its container; the full name
// stays readable by a screen reader; a story renders a long name inside a 276px
// container and asserts nothing overflows; and DESIGN.md records the decision.
//
// NOT read-only: it edits StatusChip.tsx and restores it in a finally.

import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const DIR = join(WEB, 'src', 'shared', 'status-chip')
const COMPONENT = join(DIR, 'StatusChip.tsx')
const STORIES = join(DIR, 'StatusChip.stories.tsx')

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

const mutation = (from, to, what, story = 'Long Name') => {
  const original = readFileSync(COMPONENT, 'utf8')
  if (!original.includes(from)) return `the anchor for this mutation is gone:\n${from}`
  try {
    writeFileSync(COMPONENT, original.replace(from, () => to))
    const { code, output } = stories()
    if (code === 0) return `the stories passed with ${what}, so nothing measures it`
    return output.includes(`× ${story} `) ? null : `it failed, but not in ${story}:\n${output.slice(-500)}`
  } finally {
    writeFileSync(COMPONENT, original)
  }
}

check('the Status Chip stories pass, LongName included', () => {
  const { code, output } = stories()
  return code === 0 ? null : `they fail before anything is broken:\n${output.slice(-800)}`
})

check('LongName puts a long name in a 276 column and asserts no overflow, a cut with an ellipsis, and the whole name', () => {
  const source = readFileSync(STORIES, 'utf8')
  const story = /export const LongName: Story = \{\n([\s\S]*?)\n\}\n/.exec(source)?.[1] ?? ''
  if (!story) return 'there is no LongName story'
  const column = /const InAColumn = \(\) => \(\n([\s\S]*?)\n\)\n/.exec(source)?.[1] ?? ''
  if (!column.includes('sx={{ width: 276 }}') || !story.includes('<InAColumn />')) return 'LongName does not render the chip in the 276 column'
  const missing = [
    ['nothing spilling out of the column', 'await expect(column.scrollWidth).toBe(column.clientWidth)'],
    ['the chip no wider than the column', 'await expect(chip.offsetWidth).toBe(column.clientWidth)'],
    ['the name actually cut', 'await expect(chip.scrollWidth).toBeGreaterThan(chip.clientWidth)'],
    ['the ellipsis', "toHaveProperty('textOverflow', 'ellipsis')"],
    ['the whole name as the chip text', 'await expect(chip).toHaveTextContent(LONG)'],
  ].filter(([, text]) => !story.includes(text))
  return missing.length ? `it does not assert ${missing.map(([what]) => what).join(', ')}` : null
})

check('THE CASE: a chip allowed to grow past its container fails LongName', () =>
  mutation("        maxWidth: '100%',\n", '', 'the chip growing past its column'),
)

check('a chip that cuts the name without an ellipsis fails LongName', () =>
  mutation("        textOverflow: 'ellipsis',\n", '', 'no ellipsis'),
)

check('a chip that takes the page direction instead of the name fails LongNameInEnglish', () =>
  mutation('      dir="auto"\n', '', 'the page direction imposed on the name', 'Long Name In English'),
)

check('DESIGN.md records the decision', () => {
  const design = readFileSync(join(ROOT, 'DESIGN.md'), 'utf8')
  const section = /### A long status name is cut, not wrapped\n([\s\S]*?)\n### /.exec(design)?.[1] ?? ''
  if (!section) return 'DESIGN.md has no section for a long status name'
  if (!/ellipsis/.test(section) || !/screen reader/.test(section)) return 'the section does not say how the name is cut and that a screen reader still gets all of it'
  return /direction from the name/.test(section) ? null : 'the section does not say the chip takes its direction from the name'
})

if (failures.length) {
  process.stderr.write(`\nKN-238 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-238 verify passed.\n')
