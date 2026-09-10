#!/usr/bin/env node
// Verifies KN-224: the tokens.ts lingui exemption is recorded, and guarded.
//
// Exit condition: TECH-DEBT.md has an entry for the tokens.ts exemption in the
// file's what, why, fix and retiring-check format, and a unit test fails if any
// string exported from src/theme/tokens.ts is not a design value, a colour, a
// length, a shadow or the font stack, proved by a mutation adding a copy string
// to the file.
//
// The mutation is run twice and against TWO instruments. The unit test must go
// red; the lint must stay green. The second half is the reason the test exists:
// the file is exempt from lingui, so without the test nothing would notice.
//
// NOT read-only: it edits tokens.ts and restores it in a finally.

import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const TOKENS = join(WEB, 'src', 'theme', 'tokens.ts')

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

const run = (command) => {
  const result = spawnSync(command, { cwd: WEB, encoding: 'utf8', shell: true, env: { ...process.env, FORCE_COLOR: '0' } })
  return { code: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}
const guard = () => run('npx vitest run --project unit src/theme/tokens.test.ts')
const lint = () => run('npx eslint src/theme/tokens.ts')

const withTokens = (from, to, body) => {
  const original = readFileSync(TOKENS, 'utf8')
  if (!original.includes(from)) return `the anchor for this mutation is gone: ${from}`
  try {
    writeFileSync(TOKENS, original.replace(from, () => to))
    return body()
  } finally {
    writeFileSync(TOKENS, original)
  }
}

check('the guard test passes as the file stands', () => {
  const { code, output } = guard()
  if (code !== 0) return `it fails before anything is added:\n${output.slice(-800)}`
  return /holds design values and nothing a person reads/.test(readFileSync(join(WEB, 'src', 'theme', 'tokens.test.ts'), 'utf8'))
    ? null
    : 'the guard describe block is gone'
})

check('THE CASE: a copy string exported from tokens.ts fails the unit suite, and the lint does not see it', () => {
  const anchor = 'export type SemanticToken'
  return withTokens(anchor, `export const helperText = 'Delete this application'\n\n${anchor}`, () => {
    const test = guard()
    if (test.code === 0) return 'the guard passed with a sentence exported from the token file'
    // Since KN-227 the guard reports the literal it refuses, not the export it
    // sits in, because it reads the source rather than walking exports.
    if (!/Delete this application/.test(test.output)) return `it failed, but without naming the string:\n${test.output.slice(-600)}`
    const linted = lint()
    // The gap, shown rather than assumed: the file is exempt from lingui.
    return linted.code === 0 ? null : `the lint caught it too, so the exemption is not what this test covers:\n${linted.output.slice(-400)}`
  })
})

check('a copy string nested inside an existing export fails it too', () => {
  // Not only new exports: a label tucked into an object the walk has to descend.
  const anchor = "  tooltip: '0 6px 18px -2px #0000003D',"
  return withTokens(anchor, `${anchor}\n  label: 'Raised surface',`, () => {
    const test = guard()
    if (test.code === 0) return 'the guard passed with a label inside the elevation set'
    return /Raised surface/.test(test.output) ? null : `it failed, but not on the nested string:\n${test.output.slice(-600)}`
  })
})

check('TECH-DEBT.md records the exemption, what, why, cost and the check that retires it', () => {
  const debt = readFileSync(join(ROOT, 'TECH-DEBT.md'), 'utf8')
  const entry = /\n## \d+\. The lingui rule skips one whole file and two named constants\n([\s\S]*?)(\n---\n|$)/.exec(debt)?.[1]
  if (!entry) return 'there is no TECH-DEBT entry for the lingui exemptions'
  const missing = ['**What.**', '**Why it is like that.**', '**What it costs.**', '**The check that retires this.**'].filter((part) => !entry.includes(part))
  if (missing.length) return `the entry has no ${missing.join(', ')}`
  const names = ['src/theme/tokens.ts', 'STORAGE_KEY', 'TOOLTIP_SURFACE'].filter((name) => !entry.includes(name))
  return names.length ? `the entry does not name ${names.join(', ')}` : null
})

if (failures.length) {
  process.stderr.write(`\nKN-224 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-224 verify passed.\n')
