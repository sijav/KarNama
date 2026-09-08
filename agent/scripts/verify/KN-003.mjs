#!/usr/bin/env node
// Verifies KN-003: the web scaffold and its quality gate.
//
// Exit condition: on a clean checkout, lint, lint:tsc, test, build and
// build-storybook all pass in apps/web, and both a deliberately broken test and
// a deliberately unlocalized string fail the run when planted by hand.
//
// The second half is the half that matters, and it is why this is slow. Five
// green commands prove that five commands ran; they do not prove any of them
// can go red. `src/gate-fixtures/` holds a component with a bare English
// sentence and a test that asserts 1 + 1 is 3, both committed, both excluded
// from the ordinary run, and both driven here through the real tools. If either
// stops failing, every green run since then meant nothing.
//
// Read-only: runs commands, writes nothing to the repository. Everything the
// commands emit goes to dist/, storybook-static/ and coverage/, which are
// gitignored build output rather than tracked files, and `move done` checks the
// worktree separately.

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')

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

/**
 * Runs a command in apps/web and returns its result.
 *
 * `shell: true` because npm and npx are .cmd shims on Windows and node cannot
 * exec them directly. The arguments are literals in this file, never anything
 * read from the board or the environment, so there is nothing here for a shell
 * to interpolate.
 */
const run = (command, extraEnv = {}) =>
  spawnSync(command, { cwd: WEB, encoding: 'utf8', shell: true, env: { ...process.env, CI: '1', FORCE_COLOR: '0', ...extraEnv } })

if (!existsSync(WEB)) {
  process.stderr.write('KN-003 verify FAILED: apps/web does not exist\n')
  process.exit(1)
}

const pkg = JSON.parse(readFileSync(join(WEB, 'package.json'), 'utf8'))
const vitestConfig = readFileSync(join(WEB, 'vitest.config.ts'), 'utf8')

check('the lint script treats a warning as a failure', () => {
  // Without --max-warnings 0 a rule set to warn is a rule that does nothing, and
  // "we lint" stays true while the lint stops meaning anything.
  const script = pkg.scripts?.lint ?? ''
  return script.includes('--max-warnings 0') ? null : `lint is "${script}", which lets warnings through`
})

check('coverage is required to be total, on all four metrics', () => {
  const thresholds = /thresholds:\s*\{([^}]*)\}/.exec(vitestConfig)?.[1] ?? ''
  const missing = ['statements', 'branches', 'functions', 'lines'].filter(
    (metric) => !new RegExp(`${metric}:\\s*100\\b`).test(thresholds),
  )
  return missing.length ? `not held at 100: ${missing.join(', ')}` : null
})

check('the stories run in a real browser, not in a simulated DOM', () => {
  // A component checked in jsdom is a component whose layout, direction and
  // computed styles were never rendered. The design is the contract here, so
  // the stories run in headless Chromium.
  if (!/browser:\s*\{[\s\S]*enabled:\s*true/.test(vitestConfig)) return 'the storybook project does not enable browser mode'
  return /instances:\s*\[\{\s*browser:\s*'chromium'/.test(vitestConfig) ? null : 'no chromium instance is configured'
})

check('lint passes', () => {
  const result = run('npm run lint')
  return result.status === 0 ? null : (result.stdout || result.stderr || '').split('\n').slice(-25).join('\n')
})

check('the type checker passes', () => {
  const result = run('npm run lint:tsc')
  return result.status === 0 ? null : (result.stdout || result.stderr || '').split('\n').slice(-25).join('\n')
})

check('the suite passes and coverage clears the threshold', () => {
  const result = run('npm test')
  if (result.status !== 0) return (result.stdout || result.stderr || '').split('\n').slice(-25).join('\n')
  // A suite that ran zero tests exits zero. That has happened in this
  // repository before, so the count is read rather than the exit code.
  const summary = /Tests\s+(\d+)\s+passed/.exec(result.stdout ?? '')
  if (!summary) return 'the run reported no test count, so it may have run nothing'
  return Number(summary[1]) >= 20 ? null : `only ${summary[1]} tests ran, which is too few to be the suite`
})

check('the app builds', () => {
  const result = run('npm run build')
  return result.status === 0 ? null : (result.stdout || result.stderr || '').split('\n').slice(-20).join('\n')
})

check('Storybook builds', () => {
  const result = run('npm run build-storybook')
  return result.status === 0 ? null : (result.stdout || result.stderr || '').split('\n').slice(-20).join('\n')
})

check('EVERY planted unlocalized string FAILS the lint', () => {
  // Discovered rather than listed, so adding a fixture is enough to have it
  // checked and deleting one is noticed. A single named fixture was the earlier
  // version and it hid two holes: `aria-label`, which is the name a screen
  // reader speaks, and `title`, which is the tooltip, were both exempt and
  // neither had a fixture to say so. KN-087.
  const dir = join(WEB, 'src', 'gate-fixtures')
  const fixtures = readdirSync(dir).filter((name) => name.startsWith('unlocalized') && name.endsWith('.tsx'))

  // Discovery alone was not enough: with only a count to satisfy, deleting the
  // aria fixture and adding any unrelated `unlocalized-*.tsx` kept the number up
  // and the hole open. Each hole that has actually been found is named, and the
  // discovered set is checked on top of that so a new fixture is covered for
  // free.
  const required = ['unlocalized.tsx', 'unlocalized-aria.tsx', 'unlocalized-title.tsx', 'unlocalized-pathlike.tsx', 'unlocalized-setattribute.tsx']
  const absent = required.filter((name) => !fixtures.includes(name))
  if (absent.length) return `these fixtures are required by name and are missing: ${absent.join(', ')}`

  const problems = []
  for (const fixture of fixtures) {
    const result = run(`npx eslint src/gate-fixtures/${fixture} --no-ignore`)
    if (result.status === 0) {
      problems.push(`${fixture} passed the lint, so the rule is not enforcing anything for that case`)
      continue
    }
    const output = `${result.stdout ?? ''}${result.stderr ?? ''}`
    // Failing for the RIGHT reason. A parse error or a missing file would also
    // exit non-zero and would prove nothing about the rule.
    if (!output.includes('lingui/no-unlocalized-strings')) {
      problems.push(`${fixture} failed, but not on the lingui rule: ${output.slice(0, 300)}`)
    }
  }
  return problems.length ? problems.join(' | ') : null
})

check('a planted broken test FAILS the REAL test project', () => {
  // Through `npm test` and the real `vitest.config.ts`, not a config of its
  // own. The earlier version ran the fixture against a separate config file,
  // which established that vitest can report a failure and NOT that the gate
  // this repository runs would have caught one: the real unit project could
  // have been emptied or misconfigured and that proof stayed green. KN-088.
  if (!existsSync(join(WEB, 'src', 'gate-fixtures', 'failing.gate.ts'))) return 'the failing fixture is missing or renamed'

  const result = run('npm test', { KARNAMA_GATE_FIXTURES: '1' })
  if (result.status === 0) return 'the fixture that asserts 1 + 1 is 3 passed, so the runner is not reporting failures'
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`

  // Three things, because any one of them alone can be true while the gate is
  // broken. The fixture was reported failing; it was the `unit` PROJECT that
  // reported it, not some other runner; and the ordinary tests still ran
  // alongside it, so an empty include cannot masquerade as a working gate.
  if (!/1 failed/.test(output)) return `it exited non-zero, but no test was reported as failing:\n${output.slice(0, 500)}`
  if (!/\|unit\|.*failing\.gate\.ts/.test(output)) return 'the failure was not reported by the unit project against the fixture'
  const alsoPassed = /Tests\s+1 failed \| (\d+) passed/.exec(output)
  if (!alsoPassed) return 'the run reported a failure but no passing count, so the ordinary tests may not have run'
  return Number(alsoPassed[1]) >= 20 ? null : `only ${alsoPassed[1]} tests passed alongside it, so the include has been emptied`
})

check('the failing fixture cannot leak into an ORDINARY run', () => {
  // Named `.gate.ts` rather than `.test.ts`, so the ordinary include cannot
  // reach it and the flag is the only way in. If someone renames it back,
  // `npm test` starts failing for a reason nobody will connect to this
  // directory.
  // Matched as "the constant exists and contains the .test.ts pattern" rather
  // than as an exact line, because the list grew a `.test.tsx` entry and an
  // exact match would have to be edited every time it grows, which trains
  // people to edit the check instead of reading it.
  if (!/const unitInclude = \[[^\]]*'src\/\*\*\/\*\.test\.ts'/.test(vitestConfig)) {
    return 'the ordinary unit include is no longer a named constant carrying the .test.ts pattern'
  }
  if (/\.gate\.ts/.test(/const unitInclude = \[[^\]]*\]/.exec(vitestConfig)?.[0] ?? '')) {
    return 'the ordinary include now reaches the .gate.ts fixture, so a normal run would fail on it'
  }
  return /gateMode \? \[\.\.\.unitInclude/.test(vitestConfig)
    ? null
    : 'gate mode no longer ADDS to the ordinary include, so emptying it would go unnoticed'
})

if (failures.length) {
  process.stderr.write(`\nKN-003 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-003 verify passed.\n')
