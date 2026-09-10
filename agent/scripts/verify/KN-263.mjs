#!/usr/bin/env node
// Verifies KN-263: the Status Chip is the designed flex box again, and no
// spacing in it is off the scale.
//
// Exit condition: the chip is the designed flex box again, centred by
// alignment with no vertical padding, and the name truncates with an ellipsis
// in an inner element; every story that measures the chip measures the chip,
// not the name; KN-238's verifier still passes with its mutations; and no
// padding or spacing in StatusChip.tsx resolves to anything but a spacing
// token or zero.
//
// NOT read-only: it edits StatusChip.tsx and restores it in a finally, and it
// runs KN-238's and KN-010's verifiers, which do the same.

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

check('the Status Chip stories pass', () => {
  const { code, output } = stories()
  return code === 0 ? null : `they fail before anything is broken:\n${output.slice(-800)}`
})

check('the chip is a flex box centred by alignment, as 84:4 and 398:6185 draw it', () => {
  const source = readFileSync(COMPONENT, 'utf8')
  const missing = ["display: 'inline-flex'", "alignItems: 'center'", "justifyContent: 'center'"].filter((line) => !source.includes(line))
  if (missing.length) return `it is missing: ${missing.join(', ')}`
  return /verticalAlign|inline-block/.test(source) ? 'KN-238\'s inline block is still there' : null
})

check('every padding in StatusChip.tsx is the spacing token or zero, with no vertical padding', () => {
  const source = readFileSync(COMPONENT, 'utf8')
  const paddings = [...source.matchAll(/(padding\w*): ([^,\n]+),/g)].map(([, key, value]) => [key, value.trim()])
  if (!paddings.length) return 'no padding was found, so this read nothing'
  const vertical = paddings.filter(([key]) => /padding(Block|Top|Bottom)$/.test(key))
  if (vertical.length) return `a vertical padding is back: ${vertical.map(([key, value]) => `${key}: ${value}`).join(', ')}`
  const off = paddings.filter(([, value]) => !/^`\$\{spacing\.\w+\}px`$/.test(value) && value !== '0')
  return off.length ? `a padding that is not a token: ${off.map(([key, value]) => `${key}: ${value}`).join(', ')}` : null
})

check('the name truncates in an inner element', () => {
  const source = readFileSync(COMPONENT, 'utf8')
  const inner = /<Box component="span" sx=\{\{([^}]*)\}\}>\s*\{label\}/.exec(source)?.[1] ?? ''
  if (!inner) return 'the label is not in an inner span of its own'
  const missing = ['minWidth: 0', "overflow: 'hidden'", "textOverflow: 'ellipsis'"].filter((rule) => !inner.includes(rule))
  return missing.length ? `the inner span is missing: ${missing.join(', ')}` : null
})

check('every story that measures the chip measures the chip, not the name', () => {
  const source = readFileSync(STORIES, 'utf8')
  const body = (name) => new RegExp(`export const ${name}: Story = \\{\\n([\\s\\S]*?)\\n\\}\\n`).exec(source)?.[1] ?? ''
  const measuring = ['FromArgs', 'ColumnHeaderSize', 'DisplayOnly', 'LongName', 'LongNameInEnglish']
  const wrong = measuring.filter((name) => !body(name).includes('chipOf('))
  return wrong.length ? `these still take the name for the chip: ${wrong.join(', ')}` : null
})

check('THE CASE: a vertical padding back on the chip fails AllStatuses', () => {
  const original = readFileSync(COMPONENT, 'utf8')
  const anchor = '        paddingInline: `${spacing.xs}px`,\n'
  if (!original.includes(anchor)) return `the anchor for this mutation is gone:\n${anchor}`
  try {
    writeFileSync(COMPONENT, original.replace(anchor, () => `${anchor}        paddingBlock: 3,\n`))
    const { code, output } = stories()
    if (code === 0) return 'the stories passed with a vertical padding, so nothing measures it'
    return output.includes('× All Statuses ') ? null : `it failed, but not in AllStatuses:\n${output.slice(-500)}`
  } finally {
    writeFileSync(COMPONENT, original)
  }
})

for (const id of ['KN-238', 'KN-010']) {
  check(`${id}'s verifier still passes, mutations and all`, () => {
    const result = spawnSync('node', [join(ROOT, 'agent', 'scripts', 'verify', `${id}.mjs`)], { cwd: ROOT, encoding: 'utf8' })
    return result.status === 0 ? null : `it fails:\n${`${result.stdout}${result.stderr}`.slice(-600)}`
  })
}

if (failures.length) {
  process.stderr.write(`\nKN-263 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-263 verify passed.\n')
