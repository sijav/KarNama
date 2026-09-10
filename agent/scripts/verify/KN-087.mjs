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

check('the structural prop list does not name aria-* or title', () => {
  // A previous version of this check read the FIRST quoted fragment after
  // `ignoreNames:` with a regex, and the pattern was a concatenation, so
  // `'...locale' + '|aria-[a-z]+...'` slipped straight past it. Reading a
  // JavaScript expression with a regular expression is the wrong tool. The
  // exemption list is now a single named constant with no concatenation of
  // prop names, and this reads that constant, so there is one string to check
  // rather than however many the author chose to split it into.
  const declaration = /const structuralProps =\s*([\s\S]*?)\n\n/.exec(config)?.[1]
  if (!declaration) return 'the structuralProps constant is gone, so the config shape has changed and this check is stale'
  const readded = ['aria-', 'title'].filter((name) => declaration.includes(name))
  if (readded.length) return `back in the exemption list: ${readded.join(', ')}`
  // And the shape-based escape must not come back either: it matched
  // `New/Applied`, which is copy, so it exempted the very props this task is
  // about through the value instead of the name.
  //
  // Comments are stripped first. The paragraph that records why the pattern was
  // removed has to be allowed to quote it, or the config cannot warn anyone off
  // re-adding it, and the check fired on its own explanation. Same exemption
  // the Body/Small prose and the "only elevation" correction already have.
  const code = config.replace(/^\s*\/\/.*$/gm, '')
  return code.includes('[A-Z][A-Za-z]*(/[A-Z]') ? 'the story-path shape exemption is back, and it matches New/Applied' : null
})

check('the behaviour is checked, not only the config, on every known hole', () => {
  // The config check says WHY when this breaks; this one says THAT it broke. A
  // config can read correctly and be overridden by a later block, which is how
  // a scoped `src/shared/**` override would slip past a config-only check.
  const cases = [
    ['unlocalized-aria.tsx', 'a bare aria-label'],
    ['unlocalized-title.tsx', 'a bare title'],
    ['unlocalized-pathlike.tsx', 'copy shaped like a Storybook path, New/Applied'],
    ['unlocalized-setattribute.tsx', "an aria-label set through setAttribute"],
    ['unlocalized-tokenlike.tsx', 'copy shaped like a design token, delete/application'],
  ]
  const problems = []
  for (const [file, what] of cases) {
    if (!existsSync(join(WEB, 'src', 'gate-fixtures', file))) {
      problems.push(`${file} is missing, so ${what} is unchecked`)
      continue
    }
    const result = lint(`src/gate-fixtures/${file}`)
    if (result.status === 0) {
      problems.push(`${what} passed the lint`)
      continue
    }
    const output = `${result.stdout ?? ''}${result.stderr ?? ''}`
    if (!output.includes('lingui/no-unlocalized-strings')) problems.push(`${what} failed for another reason: ${output.slice(0, 200)}`)
  }
  return problems.length ? problems.join(' | ') : null
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
  // exempt by NAME, which swept the tooltip in with it, and then by SHAPE,
  // which swept in any copy shaped like a path. It is exempt by WHERE it is
  // now: `title` is added to the prop list only in the block scoped to
  // `**/*.stories.tsx`. This check is what stops someone widening it again to
  // make the stories lint.
  const result = spawnSync('npm run lint', { cwd: WEB, encoding: 'utf8', shell: true, env: { ...process.env, FORCE_COLOR: '0' } })
  return result.status === 0 ? null : (result.stdout || result.stderr || '').split('\n').slice(-20).join('\n')
})

check("KN-003's verifier requires each fixture BY NAME, and discovers the rest", () => {
  // Discovery alone let the aria fixture be deleted and replaced by any other
  // `unlocalized-*.tsx`: the count stayed up and the hole reopened. Naming them
  // makes deletion a failure; discovering on top means a new fixture is covered
  // without editing this list.
  const other = readFileSync(join(ROOT, 'agent', 'scripts', 'verify', 'KN-003.mjs'), 'utf8')
  if (!other.includes('readdirSync')) return 'it no longer discovers, so a new fixture would be added and never run'
  if (!/startsWith\('unlocalized'\)/.test(other)) return 'it discovers files but not by the unlocalized prefix'
  const named = [
    'unlocalized-aria.tsx',
    'unlocalized-title.tsx',
    'unlocalized-pathlike.tsx',
    'unlocalized-setattribute.tsx',
    'unlocalized-tokenlike.tsx',
  ]
  const missing = named.filter((name) => !other.includes(name))
  return missing.length ? `not required by name in KN-003: ${missing.join(', ')}` : null
})

if (failures.length) {
  process.stderr.write(`\nKN-087 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-087 verify passed.\n')
