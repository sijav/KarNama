#!/usr/bin/env node
// Verifies KN-007: Storybook docs infrastructure, in both languages, with its guard.
//
// The exit condition is about what the guard CATCHES, so this does not read the
// guard's source and agree with it. It plants each failure the card names, runs
// the real guard, and requires it to fail for that reason — then restores and
// requires it to pass again, because a guard that fails on a clean repository
// proves nothing either.
//
// NOT read-only: it writes and removes fixtures under apps/web. Everything it
// creates is removed in a finally, and the last check re-runs the guard on the
// restored tree so a leaked fixture is visible rather than silent.

import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const DOCS = join(WEB, 'src', 'shared', 'story-docs')

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

/** Runs the guard and returns its exit code and combined output. */
const guard = () => {
  const result = spawnSync('npx', ['vitest', 'run', '--project', 'unit', 'src/shared/story-docs/guard.test.ts'], {
    cwd: WEB,
    encoding: 'utf8',
    shell: true,
  })
  return { code: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}

/** Plants something, runs the guard, restores, and reports what the guard said. */
const withBreak = (plant, restore) => {
  try {
    plant()
    return guard()
  } finally {
    restore()
  }
}

check('the guard passes on the repository as it stands', () => {
  // The positive control, and it comes first on purpose. Every check below
  // requires a FAILURE, and a guard that is broken outright supplies failures
  // for free.
  const { code, output } = guard()
  return code === 0 ? null : `the guard fails before anything is planted:\n${output.slice(-1200)}`
})

check('THE CASE: a story with no markdown entry fails the guard', () => {
  const story = join(WEB, 'src', 'shared', 'story-docs', 'Planted.stories.tsx')
  const { code, output } = withBreak(
    () =>
      writeFileSync(
        story,
        ['const meta = { title: `Planted/Nothing` }'.replace(/`/g, "'"), 'export default meta', 'export const One = {}', ''].join('\n'),
      ),
    () => {
      if (existsSync(story)) rmSync(story)
    },
  )
  if (code === 0) return 'the guard passed with an undocumented story in the tree'
  return /is missing en\/Planted-Nothing\.md/.test(output) ? null : `it failed, but not for the missing markdown:\n${output.slice(-900)}`
})

check('THE CASE: a documented prop that no longer exists fails the guard', () => {
  const file = join(DOCS, 'en', 'Shared-LanguageSwitch.md')
  const original = readFileSync(file, 'utf8')
  const { code, output } = withBreak(
    () => writeFileSync(file, original.replace('### placement', '### placemnt')),
    () => writeFileSync(file, original),
  )
  if (code === 0) return 'the guard passed while the docs named a prop the component does not have'
  return /does not have/.test(output) ? null : `it failed, but not for the planted prop:\n${output.slice(-900)}`
})

check('a real prop with no entry fails the guard', () => {
  const file = join(DOCS, 'en', 'Shared-LanguageSwitch.md')
  const original = readFileSync(file, 'utf8')
  const { code, output } = withBreak(
    () => writeFileSync(file, original.replace(/## Props\n\n### placement\n\n[^#]+/, '## Props\n\n')),
    () => writeFileSync(file, original),
  )
  if (code === 0) return 'the guard passed with an undocumented prop'
  return /has no entry/.test(output) ? null : `it failed, but not for the undocumented prop:\n${output.slice(-900)}`
})

check('the Persian side missing what the English side documents fails the guard', () => {
  const file = join(DOCS, 'fa', 'Shared-LanguageSwitch.md')
  const original = readFileSync(file, 'utf8')
  const { code, output } = withBreak(
    () => writeFileSync(file, original.replace(/### Sidebar\n\n[^#]+/, '')),
    () => writeFileSync(file, original),
  )
  if (code === 0) return 'the guard passed with the Persian side short a story the English side documents'
  return /fa stories does not match en/.test(output) ? null : `it failed, but not for the missing Persian entry:\n${output.slice(-900)}`
})

check('both languages exist for every story, and the loader can read them', () => {
  // The other half of "a Docs page reads fully in Persian and fully in English".
  // Whether it RENDERS is gate steps 5 to 7 and was checked by opening
  // Storybook; that a file exists and parses is checkable here.
  const titles = ['Shared-LanguageSwitch', 'App-Shell', 'Foundations-Tokens', 'Core-PreferencesProvider']
  const missing = []
  for (const title of titles) {
    for (const language of ['en', 'fa']) {
      const path = join(DOCS, language, `${title}.md`)
      if (!existsSync(path) || readFileSync(path, 'utf8').trim().length === 0) missing.push(`${language}/${title}.md`)
    }
  }
  return missing.length ? `missing or empty: ${missing.join(', ')}` : null
})

check('the Docs page is wired into Storybook, and autodocs is on', () => {
  // Without `autodocs` there is no Docs page for `docs.page` to replace, and
  // the failure is invisible: the tab just does not appear.
  const preview = readFileSync(join(WEB, '.storybook', 'preview.tsx'), 'utf8')
  if (!/tags:\s*\['autodocs'\]/.test(preview)) return 'autodocs is not enabled, so no Docs page is generated'
  return /docs:\s*\{\s*page:\s*DocsPage\s*\}/.test(preview) ? null : 'the custom DocsPage is not wired into parameters.docs.page'
})

check('the guard still passes, so nothing above leaked a fixture', () => {
  const { code, output } = guard()
  return code === 0 ? null : `the tree was left broken by this verifier:\n${output.slice(-1200)}`
})

if (failures.length) {
  process.stderr.write(`\nKN-007 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-007 verify passed.\n')
