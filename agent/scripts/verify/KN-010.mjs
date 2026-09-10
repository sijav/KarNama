#!/usr/bin/env node
// Verifies KN-010: the Status Chip, nine statuses at two sizes, display only.
//
// Exit condition: nine statuses at both sizes match their Figma nodes, Size=M
// is used only where the design uses it, the chip has no tabindex and no click
// handler and a test asserts that, and the label is rendered from the STATUS
// RECORD rather than from the lingui catalog, so a status the user has renamed
// shows its new name. Only the five default names ship as catalog messages, as
// the seed values for a fresh account.
//
// NOT read-only: it edits StatusChip.tsx and restores it in a finally.

import { spawnSync } from 'node:child_process'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const DIR = join(WEB, 'src', 'shared', 'status-chip')
const COMPONENT = join(DIR, 'StatusChip.tsx')

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

check('the Status Chip stories pass', () => {
  const { code, output } = stories()
  return code === 0 ? null : `they fail before anything is broken:\n${output.slice(-800)}`
})

check('THE CASE: the matrix of 18 variants catches a wrong colour pairing', () =>
  // Fill and text swapped: every chip still renders, and every one is wrong.
  mutation(
    'backgroundColor: theme.karnama.status[status].container,\n        color: theme.karnama.status[status].base,',
    'backgroundColor: theme.karnama.status[status].base,\n        color: theme.karnama.status[status].container,',
    'All Statuses',
  ),
)

check('the matrix catches a wrong size too', () => mutation('const HEIGHT = { S: 24, M: 28 } as const', 'const HEIGHT = { S: 24, M: 24 } as const', 'All Statuses'))

check('Size M is used only where the design uses it: nowhere yet outside the chip itself', () => {
  // The design allows M only in the kanban column header, which does not exist
  // yet. Any StatusChip given size M elsewhere is a departure.
  const offenders = []
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name)
      if (statSync(full).isDirectory()) {
        if (!['gate-fixtures', 'status-chip'].includes(name)) walk(full)
      } else if (/\.tsx$/.test(name) && /<StatusChip\b[^>]*\bsize="M"/.test(readFileSync(full, 'utf8'))) {
        offenders.push(relative(WEB, full))
      }
    }
  }
  walk(join(WEB, 'src'))
  return offenders.length ? `StatusChip size M outside the column header: ${offenders.join(', ')}` : null
})

check('display only: no handler or tabindex in its props, and a story asserts none is rendered', () => {
  const { withDefaultConfig } = createRequire(join(WEB, 'package.json'))('react-docgen-typescript')
  const [chip] = withDefaultConfig({ savePropValueAsString: true, propFilter: (prop) => !prop.parent?.fileName.includes('node_modules') }).parse([COMPONENT])
  const props = Object.keys(chip?.props ?? {})
  const interactive = props.filter((name) => /^on[A-Z]/.test(name) || name === 'tabIndex')
  if (interactive.length) return `the chip accepts ${interactive.join(', ')}`
  const story = readFileSync(join(DIR, 'StatusChip.stories.tsx'), 'utf8')
  return /not\.toHaveAttribute\('tabindex'\)/.test(story) && /not\.toHaveFocus\(\)/.test(story) ? null : 'no story asserts the chip cannot be focused'
})

check('the label comes from the record, never the catalog', () => {
  const source = readFileSync(COMPONENT, 'utf8')
  if (/lingui|i18n|defaultStatusName/.test(source.replace(/^\s*\/\/.*$/gm, ''))) return 'the chip reaches for translations itself'
  const story = readFileSync(join(DIR, 'StatusChip.stories.tsx'), 'utf8')
  return /export const RenamedStatus/.test(story) ? null : 'no story shows a renamed status keeping its new name'
})

check('only the five default names ship as catalog messages', () => {
  const fa = readFileSync(join(WEB, 'src', 'i18n', 'locales', 'fa-IR.ts'), 'utf8')
  const five = [
    ['Saved', 'ذخیره‌شده'],
    ['Applied', 'درخواست‌شده'],
    ['Interview', 'مصاحبه'],
    ['Rejected', 'رد شده'],
    ['Job offer', 'پیشنهاد کار'],
  ]
  const missing = five.filter(([id, persian]) => !fa.includes(`'${id}': '${persian}'`))
  if (missing.length) return `the catalog lacks ${missing.map(([id]) => id).join(', ')} as the legend writes them`
  // The custom slots are user data and must not ship a name.
  if (/سفارشی/.test(fa)) return 'a custom slot name is in the catalog'
  const result = spawnSync('npx vitest run --project unit src/shared/status-chip src/i18n', { cwd: WEB, encoding: 'utf8', shell: true })
  return result.status === 0 ? null : `the seed-name or catalog tests fail:\n${`${result.stdout ?? ''}${result.stderr ?? ''}`.slice(-600)}`
})

if (failures.length) {
  process.stderr.write(`\nKN-010 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-010 verify passed.\n')
