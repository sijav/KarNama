#!/usr/bin/env node
// Verifies KN-112: two preference setters called in one batch keep both changes.
//
// Exit condition: a test calls both setters in the same batch and both changes
// survive in the state and in what was written, and it fails against the
// current closure-based implementation.
//
// The exit condition has two halves and they need two different instruments,
// which is the whole shape of this file.
//
// WHAT WAS WRITTEN is provable in the node project: `renderToString` never
// re-renders, so calling both setters after it returns exercises the same
// hazard, two calls against one snapshot, and the persisted value is
// observable through a stubbed `localStorage`.
//
// THE STATE is not provable there at all. Without a DOM there is nothing to
// re-render into, and re-reading the captured context after the calls only
// returns the first render's snapshot, which would prove nothing while looking
// like proof. So the state half runs as a STORY, in real Chromium, from a
// single click handler that calls both setters. That distinction matters more
// than it sounds: two calls made after `renderToString` returns are not a React
// batch, and proving that case while calling it the hard one is precisely the
// substitution this repository keeps having to catch.
//
// Read-only: runs commands, writes nothing to the repository.

import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { childEnv } from './lib/child-env.mjs'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const PREFS = join(WEB, 'src', 'core', 'preferences')

const failures = []
const check = (label, run) => {
  const started = Date.now()
  try {
    const problem = run()
    const seconds = ((Date.now() - started) / 1000).toFixed(1)
    if (problem) failures.push(`${label}: ${problem}`)
    else process.stdout.write(`  ok   ${label} (${seconds}s)\n`)
  } catch (error) {
    failures.push(`${label}: threw ${error.message}`)
  }
}

const run = (command) => {
  const result = spawnSync(command, { cwd: WEB, encoding: 'utf8', shell: true, env: childEnv() })
  return { status: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}

/** How many tests a vitest run reported passing, 0 when it never said. */
const passed = (output) => Number(/Tests\s+(\d+) passed/.exec(output)?.[1] ?? 0)

check('the PERSISTED value keeps both changes, in the node project', () => {
  const result = run('npx vitest run src/core/preferences/PreferencesProvider.test.tsx --project unit --coverage.enabled=false')
  if (result.status !== 0) return result.output.split('\n').slice(-20).join('\n')
  // Non-vacuity: a run that collected nothing also exits 0.
  const count = passed(result.output)
  return count >= 4 ? null : `the file reported ${count} passing tests, so passing proves nothing`
})

check('the RENDERED STATE keeps both changes, in a real browser', () => {
  // The half the node project cannot reach. A story, because the storybook
  // project is the only one with a DOM, and its play function drives a real
  // click so React batches the two updates the way a user would.
  const result = run(
    'npx vitest run --project storybook src/core/preferences/PreferencesProvider.stories.tsx --coverage.enabled=false',
  )
  if (result.status !== 0) return result.output.split('\n').slice(-20).join('\n')
  const count = passed(result.output)
  // Two, because the done gate wants every change seen in both languages and
  // the story is exported once per language.
  return count >= 2 ? null : `the stories reported ${count} passing, so both languages did not run`
})

check('the story calls both setters from ONE handler, not two separate clicks', () => {
  // The load-bearing detail. Two clicks are two renders and would pass against
  // the defect, so a story that drifted into clicking twice would keep printing
  // a pass while testing nothing. Checked structurally because the behavioural
  // difference is invisible from the outside once the bug is fixed.
  const story = readFileSync(join(PREFS, 'PreferencesProvider.stories.tsx'), 'utf8')
  const handler = /onClick=\{\(\) => \{([^}]*)\}\}/.exec(story)?.[1] ?? ''
  if (!/setLocale\(/.test(handler)) return 'the click handler does not call setLocale'
  if (!/setColorScheme\(/.test(handler)) return 'the click handler does not call setColorScheme'
  const clicks = (story.match(/userEvent\.click\(/g) ?? []).length
  return clicks === 1 ? null : `the story clicks ${clicks} times; one handler calling both setters is the case`
})

check('the suite no longer asserts the defect as the expected value', () => {
  // This test file did not merely miss the bug, it CERTIFIED it: it expected the
  // second write to carry the reverted locale. Fixing the provider without
  // rewriting that assertion is impossible, but re-introducing it later is very
  // possible, and it would turn the suite back into a guard against the fix.
  //
  // Scoped to the WRITE assertions, not the whole file. Searching the file for
  // the stale pair flagged a different test that legitimately has `getItem`
  // return `{en-US, system}` as the stored value, which is a value being read,
  // not a defect being expected. A check that cannot tell a fixture from an
  // assertion reports the wrong thing with complete confidence, and this one
  // did on its first run.
  const test = readFileSync(join(PREFS, 'PreferencesProvider.test.tsx'), 'utf8')
  const assertions = [...test.matchAll(/expect\(written(?:\.at\(-1\))?\)\.(?:toEqual|toBe)\(([\s\S]*?)\)\n/g)]
  if (!assertions.length) return 'no assertion about what was written could be found at all'
  const stale = assertions.some((match) => /locale:\s*'en-US',\s*colorScheme:\s*'system'/.test(match[1]))
  return stale ? 'a write assertion still expects the stale locale, which is the defect written down as correct' : null
})

check('neither setter passes the sibling field it does not own', () => {
  // The defect in one line: each setter forwarded the OTHER field from its own
  // render, so a second call before the next render wrote the first call's
  // change back. Comments are stripped first, because this file's own comments
  // describe the shape being banned, which is how a check comes to report the
  // defect it just fixed.
  const source = readFileSync(join(PREFS, 'PreferencesProvider.tsx'), 'utf8')
  const code = source.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1')
  if (!code.trim()) return 'stripping comments left nothing, so this check read an empty file'
  if (/update\(\{\s*locale:\s*next,\s*colorScheme\s*\}\)/.test(code)) return 'setLocale still forwards colorScheme'
  if (/update\(\{\s*locale,\s*colorScheme:\s*next\s*\}\)/.test(code)) return 'setColorScheme still forwards locale'
  return /useRef\(/.test(code) ? null : 'the provider no longer tracks the last value, so batching is unproven'
})

if (failures.length) {
  process.stderr.write(`\nKN-112 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-112 verify passed.\n')
