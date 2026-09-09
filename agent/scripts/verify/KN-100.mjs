#!/usr/bin/env node
// Verifies KN-100: the gate-fixtures flag is hermetic.
//
// Exit condition: KARNAMA_GATE_FIXTURES=0 npm test passes and runs no fixture,
// the ordinary run inside agent/scripts/verify/KN-003.mjs passes with the
// variable set to any value in the parent environment, and both are proved by
// planted environments.
//
// The flag adds a test designed to FAIL to the web unit project, so it had two
// ways to fire when nobody asked. `Boolean(process.env.X)` is true for the
// string "0", and the verifier handed children a raw copy of its own
// environment. Either one turns an ordinary run red for a reason that is
// nowhere in the diff.
//
// The SHAPE of the proof matters more than the number of checks. An ABSENCE
// proves nothing on its own: a listing that fails, collects nothing, or names
// its files differently produces the same empty result as a correctly scrubbed
// run. So every absence below is paired with a positive control on the SAME
// instrument, and every listing is required to be non-empty first.
//
// The second clause is proved at the collection level rather than by nesting
// KN-003, which runs two full suites, a build and a storybook build. Listing
// the resolved unit project under a planted parent is the same composition —
// the real config, resolved by the real tool, under the exact hazard — in
// seconds instead of minutes.
//
// Read-only: runs commands, writes nothing to the repository.

import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { childEnv } from './lib/child-env.mjs'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const FIXTURE = 'failing.gate.ts'

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
 * Runs the body with the variable planted in THIS process's environment, which
 * is what a child inherits, and puts the environment back afterwards so a later
 * check cannot be reading a value an earlier one left behind.
 */
const withParentValue = (value, body) => {
  const had = Object.prototype.hasOwnProperty.call(process.env, 'KARNAMA_GATE_FIXTURES')
  const previous = process.env.KARNAMA_GATE_FIXTURES
  process.env.KARNAMA_GATE_FIXTURES = value
  try {
    return body()
  } finally {
    if (had) process.env.KARNAMA_GATE_FIXTURES = previous
    else delete process.env.KARNAMA_GATE_FIXTURES
  }
}

/**
 * The files the real unit project resolves to, without running any of them.
 * `--filesOnly` is what makes this cheap enough to run eight times.
 */
const listUnit = (extraEnv = {}) => {
  const result = spawnSync('npx vitest list --project unit --filesOnly', {
    cwd: WEB,
    encoding: 'utf8',
    shell: true,
    env: childEnv(extraEnv),
  })
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`
  return { output, files: output.split('\n').filter((line) => line.startsWith('[unit] ')) }
}

check('the config opts in on the exact string rather than on truthiness', () => {
  const config = readFileSync(join(WEB, 'vitest.config.ts'), 'utf8')
  if (/Boolean\(\s*process\.env\.KARNAMA_GATE_FIXTURES/.test(config)) {
    return 'gate mode is Boolean(env), so the string "0" turns it on'
  }
  return /process\.env\.KARNAMA_GATE_FIXTURES\s*===\s*'1'/.test(config)
    ? null
    : 'gate mode is not an exact comparison against "1"'
})

check('a value in the parent environment is scrubbed out of a child environment', () => {
  const env = childEnv({}, { KARNAMA_GATE_FIXTURES: '1', PATH: 'x' })
  return 'KARNAMA_GATE_FIXTURES' in env ? `the child would still see ${env.KARNAMA_GATE_FIXTURES}` : null
})

check('the scrub is case-insensitive, because Windows environment variables are', () => {
  // `{ ...process.env }` is a plain object and case-SENSITIVE, so a parent
  // holding Karnama_Gate_Fixtures survives a delete of the uppercase name and
  // reaches the child, where Windows resolves it case-insensitively again.
  const env = childEnv({}, { Karnama_Gate_Fixtures: '1', PATH: 'x' })
  const survivor = Object.keys(env).find((key) => key.toUpperCase() === 'KARNAMA_GATE_FIXTURES')
  return survivor ? `${survivor} survived the scrub, and Windows would honour it` : null
})

check('gate mode can still be asked for by name', () => {
  // The check that keeps the scrub honest. A scrub that also swallowed the
  // deliberate opt-in would leave KN-003 running its broken-test proof against
  // a suite that no longer holds the broken test, and it would go green.
  const env = childEnv({ KARNAMA_GATE_FIXTURES: '1' }, { PATH: 'x' })
  return env.KARNAMA_GATE_FIXTURES === '1' ? null : `asking for gate mode produced ${env.KARNAMA_GATE_FIXTURES}`
})

check('KN-003 hands its children that environment, with no way around it', () => {
  // Checking the helper alone would prove a function nobody calls. The second
  // half is what closes it: not one raw spread of the parent environment is
  // left in the file, so there is no other path a child can arrive through.
  const source = readFileSync(join(ROOT, 'agent', 'scripts', 'verify', 'KN-003.mjs'), 'utf8')
  if (!/import\s*\{\s*childEnv\s*\}\s*from\s*'\.\/lib\/child-env\.mjs'/.test(source)) {
    return 'it does not import the scrub'
  }
  if (!/env:\s*childEnv\(/.test(source)) return 'it imports the scrub but does not spawn with it'
  return /\.\.\.process\.env/.test(source) ? 'it still spreads the parent environment somewhere' : null
})

check('the instrument can see the fixture when gate mode is asked for', () => {
  // The positive control. Every absence below is only evidence because this
  // passes: it proves the listing resolves the real unit project and names the
  // fixture the way the other checks look for it.
  const { files, output } = listUnit({ KARNAMA_GATE_FIXTURES: '1' })
  if (!files.length) return `the listing collected no unit files at all:\n${output.split('\n').slice(-12).join('\n')}`
  return files.some((line) => line.includes(FIXTURE))
    ? null
    : `gate mode did not collect ${FIXTURE}, so an absence proves nothing`
})

check("a parent holding '1' does not reach the real unit project", () => {
  // The clause the card is about, under the ONLY value that can prove it. A
  // parent holding "yes" or "0" is already neutralised by the exact comparison,
  // so the scrub could be missing entirely and those would still pass. "1" is
  // the one value where the scrub is the only thing standing in the way.
  return withParentValue('1', () => {
    const { files, output } = listUnit()
    if (!files.length) return `the listing collected no unit files at all:\n${output.split('\n').slice(-12).join('\n')}`
    return files.some((line) => line.includes(FIXTURE)) ? `an inherited "1" still collected ${FIXTURE}` : null
  })
})

check('no falsy-looking value turns gate mode on', () => {
  // The other half, and the one the card names by example. These are passed
  // straight through, so they test the comparison rather than the scrub.
  const bad = []
  for (const value of ['0', 'true', 'yes', '', 'false', 'no']) {
    const { files } = listUnit({ KARNAMA_GATE_FIXTURES: value })
    if (!files.length) return `the listing collected nothing for "${value}", so the result means nothing`
    if (files.some((line) => line.includes(FIXTURE))) bad.push(value === '' ? '(empty)' : value)
  }
  return bad.length ? `these values still collected ${FIXTURE}: ${bad.join(', ')}` : null
})

check('KARNAMA_GATE_FIXTURES=0 npm test passes and runs no fixture', () => {
  // The exit condition in the card's own words, run rather than inferred.
  const result = spawnSync('npm test', {
    cwd: WEB,
    encoding: 'utf8',
    shell: true,
    env: childEnv({ KARNAMA_GATE_FIXTURES: '0' }),
  })
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`
  if (output.includes(FIXTURE)) return `the run touched ${FIXTURE}`
  if (result.status !== 0) return output.split('\n').slice(-25).join('\n')
  // A suite that collected nothing also exits 0 and also never touches the
  // fixture, which is the same vacuous pass the listings above are guarded
  // against. So the count has to be read, not assumed from the exit code.
  const passed = Number(/Tests\s+(\d+) passed/.exec(output)?.[1] ?? 0)
  return passed >= 20 ? null : `the run reported ${passed} passing tests, so passing proves nothing`
})

if (failures.length) {
  process.stderr.write(`\nKN-100 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-100 verify passed.\n')
