#!/usr/bin/env node
// Verifies KN-227: the token-file guard has no way round it, and the lint
// exemptions it stands in for have a retirement a command can test.
//
// Exit condition: the guard reads every string literal in the SOURCE of
// src/theme/tokens.ts, not the runtime values, so a literal inside a function,
// a Map or any other construct is checked; the font stack is checked by value;
// mutations adding copy as a function return, as a Map entry and as the
// fontFamily value each fail it; and TECH-DEBT.md 13's retiring check is a
// condition a command can test.
//
// NOT read-only: it edits tokens.ts and eslint.config.js and restores each.

import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const TOKENS = join(WEB, 'src', 'theme', 'tokens.ts')
const CONFIG = join(WEB, 'eslint.config.js')

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

/** Applies `edit` to `file`, runs `body`, and restores the file whatever happens. */
const withEdit = (file, edit, body) => {
  const original = readFileSync(file, 'utf8')
  const edited = edit(original)
  if (edited === original) return 'the mutation found nothing to change, so the file changed shape'
  try {
    writeFileSync(file, edited)
    return body()
  } finally {
    writeFileSync(file, original)
  }
}

const appended = (line) => (source) => `${source}\n${line}\n`

check('the source-level guard passes as the file stands', () => {
  const { code, output } = guard()
  if (code !== 0) return `it fails before anything is planted:\n${output.slice(-800)}`
  return /ts\.createSourceFile/.test(readFileSync(join(WEB, 'src', 'theme', 'tokens.test.ts'), 'utf8'))
    ? null
    : 'the guard does not parse the source'
})

for (const [name, edit, expected] of [
  ['copy returned from a function', appended("export const deleteLabel = () => 'Delete this application'"), 'Delete this application'],
  ['copy inside a Map', appended("export const labels = new Map([['delete', 'Delete this application']])"), 'Delete this application'],
  [
    'copy as the fontFamily value',
    (source) => source.replace(/export const fontFamily = .*\n/, () => "export const fontFamily = 'Delete this application'\n"),
    'Delete this application',
  ],
]) {
  check(`THE CASE: ${name} in tokens.ts fails the guard, naming it`, () =>
    withEdit(TOKENS, edit, () => {
      const { code, output } = guard()
      if (code === 0) return `the guard passed with ${name}`
      return output.includes(expected) ? null : `it failed, but without naming the literal:\n${output.slice(-500)}`
    }),
  )
}

check('TECH-DEBT 13 still stands: without its three exemptions the lint fails', () => {
  // The retirement condition, run. If the lint ever passes with all three
  // exemptions gone, the rule has learned to tell these strings from copy and
  // the exemptions and the entry are to be deleted, so this fails and says so.
  const unexempted = (source) =>
    source
      .replace("'src/**/*.test.{ts,tsx}', 'src/theme/tokens.ts']", () => "'src/**/*.test.{ts,tsx}']")
      .replace(" +\n  // The class the Tooltip puts on its drawn surface so a test can find it,\n  // KN-222. An identifier, named for the same reason as the storage key.\n  '|TOOLTIP_SURFACE'", () => '')
      .replace("  '|STORAGE_KEY'", () => "  ''")
  const original = readFileSync(CONFIG, 'utf8')
  const edited = unexempted(original)
  const removed = ['tokens.ts', 'TOOLTIP_SURFACE', 'STORAGE_KEY'].filter((name) => original.includes(name) && !edited.replace(/\/\/.*$/gm, '').includes(name))
  if (removed.length !== 3) return `could not remove all three exemptions, only ${removed.join(', ') || 'none'}, so the config changed shape`
  return withEdit(CONFIG, () => edited, () => {
    const { code } = run('npm run lint')
    return code === 0 ? 'the lint passes without the three exemptions: retire TECH-DEBT 13 and delete them' : null
  })
})

check('TECH-DEBT 13 names that command as its retiring check', () => {
  const debt = readFileSync(join(ROOT, 'TECH-DEBT.md'), 'utf8')
  const entry = /\n## 13\.[^\n]*\n([\s\S]*?)(\n---\n|$)/.exec(debt)?.[1] ?? ''
  return /\*\*The check that retires this\.\*\*[\s\S]*node agent\/scripts\/verify\/KN-227\.mjs/.test(entry) ? null : 'the retiring check does not name the command'
})

if (failures.length) {
  process.stderr.write(`\nKN-227 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-227 verify passed.\n')
