#!/usr/bin/env node
// Verifies KN-087: the lingui rule no longer exempts `aria-label` or `title`.
//
// Exit condition: a component with aria-label="Delete this application" and one
// with title="Delete this application" both fail `npm run lint`, both are
// committed under src/gate-fixtures, and agent/scripts/verify/KN-003.mjs
// requires each to fail on the lingui rule by name.
//
// Two things are checked and they are not the same thing. The CONFIG must not
// name those props in its exemption list, because a future edit that re-adds
// them should be caught at the source. And the BEHAVIOUR must reject them,
// because a config can look right and be overridden by a later block. The
// second is the one that matters; the first says why when it breaks.
//
// Read-only: runs eslint, writes nothing.

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')

const failures = []
const check = (label, run) => {
  try {
    const problem = run()
    if (problem) failures.push(`${label}: ${problem}`)
    else process.stdout.write(`  ok   ${label}\n`)
  } catch (error) {
    failures.push(`${label}: threw ${error.message}`)
  }
}

const lint = (file) =>
  spawnSync(`npx eslint ${file} --no-ignore`, { cwd: WEB, encoding: 'utf8', shell: true, env: { ...process.env, FORCE_COLOR: '0' } })

const config = readFileSync(join(WEB, 'eslint.config.js'), 'utf8')

check('the exemption list does not name aria-* or title', () => {
  // Only the ignoreNames pattern is examined. The word `title` appears in this
  // file's own prose and in the Storybook block, and a plain search for it
  // would have failed on the comment explaining why it is absent.
  const pattern = /ignoreNames:\s*\[[\s\S]*?pattern:\s*\n?\s*'([^']*)'/.exec(config)?.[1] ?? ''
  if (!pattern) return 'no ignoreNames pattern found, so the config shape has changed and this check is stale'
  const readded = ['aria-', 'title'].filter((name) => pattern.includes(name))
  return readded.length ? `back in the exemption list: ${readded.join(', ')}` : null
})

check('a bare aria-label is rejected', () => {
  const fixture = join(WEB, 'src', 'gate-fixtures', 'unlocalized-aria.tsx')
  if (!existsSync(fixture)) return 'src/gate-fixtures/unlocalized-aria.tsx is missing'
  const result = lint('src/gate-fixtures/unlocalized-aria.tsx')
  if (result.status === 0) return 'it passed, so the accessible name a screen reader speaks can still go untranslated'
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`
  return output.includes('lingui/no-unlocalized-strings') ? null : `it failed for another reason:\n${output.slice(0, 400)}`
})

check('a bare title is rejected', () => {
  const fixture = join(WEB, 'src', 'gate-fixtures', 'unlocalized-title.tsx')
  if (!existsSync(fixture)) return 'src/gate-fixtures/unlocalized-title.tsx is missing'
  const result = lint('src/gate-fixtures/unlocalized-title.tsx')
  if (result.status === 0) return 'it passed, so a tooltip can still go untranslated'
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`
  return output.includes('lingui/no-unlocalized-strings') ? null : `it failed for another reason:\n${output.slice(0, 400)}`
})

check('a Storybook story path still passes, so the fix did not just break the build', () => {
  // `title: 'App/Shell'` is a path in the sidebar, not copy. It used to be
  // exempt by NAME, which is what swept the tooltip in with it. It is now
  // exempt by SHAPE, capitalised segments separated by slashes, and this check
  // is what stops someone reverting to the name-based exemption to make the
  // stories lint again.
  const result = spawnSync('npm run lint', { cwd: WEB, encoding: 'utf8', shell: true, env: { ...process.env, FORCE_COLOR: '0' } })
  return result.status === 0 ? null : (result.stdout || result.stderr || '').split('\n').slice(-20).join('\n')
})

check("KN-003's verifier checks every unlocalized fixture, not one by name", () => {
  const other = readFileSync(join(ROOT, 'agent', 'scripts', 'verify', 'KN-003.mjs'), 'utf8')
  if (!other.includes('readdirSync')) return 'it still names a single fixture, so a new hole gets a fixture nobody runs'
  return /startsWith\('unlocalized'\)/.test(other) ? null : 'it discovers files but not by the unlocalized prefix'
})

if (failures.length) {
  process.stderr.write(`\nKN-087 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-087 verify passed.\n')
