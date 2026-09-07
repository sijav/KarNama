#!/usr/bin/env node
// Verifies KN-088: the broken-test proof runs through the configuration
// `npm test` actually uses.
//
// Exit condition: the planted broken test is detected through the configuration
// npm test uses, and a mutation that empties the real unit project include
// makes agent/scripts/verify/KN-003.mjs fail rather than pass.
//
// The second clause is why this file exists at all, and it is the awkward one:
// proving it means BREAKING the config, running the other verifier, and putting
// it back. So this one is not read-only, and it says so loudly. It writes to
// exactly one file, it restores it from a byte copy in a finally block, and it
// re-reads the file at the end to prove the restore worked. If it ever exits
// having left the config modified, that is a defect in this script, not a
// finding about the gate.
//
// A verifier that mutates the tree is a bad idea in general. It is done here
// because the alternative is asserting the mutation would be caught, and an
// asserted mutation is exactly the kind of proof this whole directory exists to
// replace.

import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const CONFIG = join(WEB, 'vitest.config.ts')

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

const original = readFileSync(CONFIG, 'utf8')

check('the proof runs through the real config, with no config of its own', () => {
  const kn003 = readFileSync(join(ROOT, 'agent', 'scripts', 'verify', 'KN-003.mjs'), 'utf8')
  if (kn003.includes('vitest.gate.config')) return 'it still runs a separate config file, which proves vitest can fail rather than that this gate would catch it'
  if (!kn003.includes('KARNAMA_GATE_FIXTURES')) return 'it does not drive the real project through the gate flag'
  return /npm test'?,\s*\{\s*KARNAMA_GATE_FIXTURES/.test(kn003) ? null : 'the gate flag is mentioned but not passed to npm test'
})

check('gate mode ADDS to the ordinary include rather than replacing it', () => {
  // Replacing would hide the mutation this card is about: with the ordinary
  // pattern swapped out, emptying it would change nothing about the gate run.
  if (!/const unitInclude = \['src\/\*\*\/\*\.test\.ts'\]/.test(original)) return 'the ordinary include is no longer a named constant'
  return /gateMode \? \[\.\.\.unitInclude, 'src\/gate-fixtures/.test(original) ? null : 'gate mode does not spread the ordinary include'
})

check('the failure is attributed to the unit project and counted against the suite', () => {
  const kn003 = readFileSync(join(ROOT, 'agent', 'scripts', 'verify', 'KN-003.mjs'), 'utf8')
  const wanted = [
    [/\\\|unit\\\|/, 'it does not require the unit project to be the one reporting'],
    [/1 failed \\\| \(\\d\+\) passed/, 'it does not require passing tests alongside the failure'],
  ]
  const missing = wanted.filter(([pattern]) => !pattern.test(kn003))
  return missing.length ? missing.map(([, why]) => why).join(' | ') : null
})

check('EMPTYING the real unit include makes KN-003 fail, proved by doing it', () => {
  const broken = original.replace("const unitInclude = ['src/**/*.test.ts']", 'const unitInclude = []')
  if (broken === original) return 'the mutation did not apply, so this check proves nothing'
  try {
    writeFileSync(CONFIG, broken)
    const result = spawnSync(process.execPath, [join(ROOT, 'agent', 'scripts', 'verify', 'KN-003.mjs')], {
      cwd: ROOT,
      encoding: 'utf8',
      env: { ...process.env, CI: '1', FORCE_COLOR: '0' },
    })
    if (result.status === 0) return 'KN-003 passed with an empty unit include, so its proof does not depend on the real project'
    const output = `${result.stdout ?? ''}${result.stderr ?? ''}`
    // Failing for the right reason. A syntax error would also fail.
    return /too few to be the suite|include has been emptied|no longer exactly the \.test\.ts pattern/.test(output)
      ? null
      : `it failed, but not because the include was emptied:\n${output.slice(-500)}`
  } finally {
    writeFileSync(CONFIG, original)
  }
})

check('the config was put back exactly as it was', () => {
  const now = readFileSync(CONFIG, 'utf8')
  return now === original ? null : 'vitest.config.ts differs from what this script found, which is a defect in this script'
})

if (failures.length) {
  process.stderr.write(`\nKN-088 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-088 verify passed.\n')
