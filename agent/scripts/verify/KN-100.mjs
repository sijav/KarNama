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
// The second clause is proved by RUNNING KN-003 under a planted parent, not by
// approximating it. An earlier version stopped at the collection level, on the
// argument that listing the resolved unit project under a planted parent is the
// same composition for a fraction of the time. It is not the same: a config can
// branch on how it was invoked, and a resolved file set is not an executed one,
// so that proof sat next to the exit condition rather than on it. The cheap
// checks are still here and still earn their place by localising a failure,
// which a two and a half minute run does not. They just no longer stand in for
// the run itself.
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

check('EVERY child launch in KN-003 goes through the scrub', () => {
  // This check used to look for a raw spread of `process.env` and call that
  // "no way around it". It was not: a spawn with NO `env` option at all
  // inherits the parent environment by default, spreads nothing, and left the
  // existing childEnv call untouched, so it sailed past while doing the exact
  // thing the check exists to forbid. Claiming more than it established is the
  // worse half of that bug.
  //
  // So the launches are COUNTED instead. Every child-process call in the file
  // has to be matched by a `env: childEnv(` of its own, which catches both the
  // raw spread and the missing option, and catches a second launch added later
  // by anyone who does not read this file first.
  const source = readFileSync(join(ROOT, 'agent', 'scripts', 'verify', 'KN-003.mjs'), 'utf8')
  if (!/import\s*\{\s*childEnv\s*\}\s*from\s*'\.\/lib\/child-env\.mjs'/.test(source)) {
    return 'it does not import the scrub'
  }
  // Comments are stripped first so prose describing a spawn is not counted as
  // one, which is the mistake KN-002 and KN-072 each made in their own way.
  const code = source.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1')

  // The launcher names are read out of the import rather than guessed from a
  // list. A guessed list counted `/pattern/.exec(source)` as a child process,
  // which is a RegExp method sharing a name with a child_process one, and the
  // check failed on a file that was correct. Reading the import also means a
  // launcher this file does not use today is counted the day someone adds it.
  const importMatch = /import\s*(.+?)\s*from\s*'node:child_process'/.exec(code)
  if (!importMatch) return 'it imports nothing from node:child_process, so this check is measuring nothing'
  const named = /^\{([^}]*)\}$/.exec(importMatch[1].trim())
  if (!named) {
    return `the child_process import is "${importMatch[1].trim()}" rather than a named list, so launches cannot be enumerated`
  }
  const launchers = named[1]
    .split(',')
    .map((entry) => entry.trim().split(/\s+as\s+/).pop()?.trim())
    .filter((name) => name)

  // The lookbehind is what keeps `foo.exec(` and `myExec(` out of the count.
  let launches = 0
  for (const name of launchers) launches += (code.match(new RegExp(`(?<![.\\w$])${name}\\s*\\(`, 'g')) ?? []).length
  const scrubbed = (code.match(/env:\s*childEnv\(/g) ?? []).length
  if (!launches) return 'it launches no child processes at all, so this check is measuring nothing'
  if (launches !== scrubbed) return `${launches} child launch(es) but ${scrubbed} scrubbed environment(s)`
  return /\.\.\.process\.env/.test(code) ? 'it still spreads the parent environment somewhere' : null
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
  //
  // The empty string is in the list but does NOT prove what it looks like it
  // proves: Windows treats an environment variable set to "" as absent, so on
  // this platform that entry exercises the UNSET path. That path is worth
  // covering and the entry stays, but calling it a test of the empty value
  // would be describing a check by its input rather than by what it reaches.
  const bad = []
  for (const value of ['0', 'true', 'yes', '', 'false', 'no']) {
    const { files } = listUnit({ KARNAMA_GATE_FIXTURES: value })
    if (!files.length) return `the listing collected nothing for "${value}", so the result means nothing`
    if (files.some((line) => line.includes(FIXTURE))) bad.push(value === '' ? '(empty)' : value)
  }
  return bad.length ? `these values still collected ${FIXTURE}: ${bad.join(', ')}` : null
})

check('KARNAMA_GATE_FIXTURES=0 leaves the UNIT project itself intact', () => {
  // Scoped to the project that gate mode actually changes.
  //
  // The full `npm test` below reports one number for both projects, so its
  // count cannot say the unit project ran: a config regression that stopped
  // unit from collecting would leave storybook satisfying the threshold, and
  // the fixture would be absent for the wrong reason entirely. That is KN-099
  // in a different costume. A project-scoped run answers it directly and costs
  // seconds, so the aggregate number is never asked to carry this weight.
  const result = spawnSync('npx vitest run --project unit --coverage.enabled=false', {
    cwd: WEB,
    encoding: 'utf8',
    shell: true,
    env: childEnv({ KARNAMA_GATE_FIXTURES: '0' }),
  })
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`
  if (output.includes(FIXTURE)) return `the unit project ran ${FIXTURE} with the flag at "0"`
  if (result.status !== 0) return output.split('\n').slice(-25).join('\n')
  // The floor only has to catch a collapse. The project runs 208 tests today,
  // so 20 is far below anything a healthy suite reports and far above what a
  // broken include produces, which is zero.
  const passed = Number(/Tests\s+(\d+) passed/.exec(output)?.[1] ?? 0)
  return passed >= 20 ? null : `the unit project reported ${passed} passing tests, so passing proves nothing`
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
  return result.status === 0 ? null : output.split('\n').slice(-25).join('\n')
})

check("KN-003 ITSELF passes with '1' inherited from the parent environment", () => {
  // The clause the card names, run rather than approximated.
  //
  // Everything above proves things ABOUT that run: that the config ignores a
  // stray value, that the helper scrubs, that every launch in the file uses it.
  // None of them is the run. A config can branch on how it was invoked, and
  // `vitest list` resolving a file set is not `vitest run` executing one, so
  // the cheap proofs are adjacent to the exit condition rather than being it.
  // This one costs about two and a half minutes and settles it: the real
  // verifier, in the environment the card describes, either passes or does not.
  //
  // The environment here is deliberately NOT built by childEnv. Scrubbing the
  // variable on the way in would remove the very hazard being planted.
  const result = spawnSync('node agent/scripts/verify/KN-003.mjs', {
    cwd: ROOT,
    encoding: 'utf8',
    shell: true,
    env: { ...process.env, KARNAMA_GATE_FIXTURES: '1', CI: '1', FORCE_COLOR: '0' },
  })
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`
  if (result.status !== 0) return `KN-003 failed with an inherited "1":\n${output.split('\n').slice(-20).join('\n')}`
  // Non-vacuity again: KN-003 exiting 0 without having run its checks would
  // look identical from here.
  return /KN-003 verify passed/.test(output) ? null : 'KN-003 exited 0 without reporting a pass'
})

if (failures.length) {
  process.stderr.write(`\nKN-100 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-100 verify passed.\n')
