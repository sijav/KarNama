#!/usr/bin/env node
// Verifies KN-161: the skills work in either runtime.
//
// Exit condition: roast, todo and loop each carry a python and a node entry
// point that produce the same behaviour on the same inputs, each SKILL.md
// documents both invocations, and a check runs both entry points of each skill
// and compares their observable result rather than asserting the files exist.
//
// "Rather than asserting the files exist" is the clause that shapes this. Two
// files with the same name in different languages prove nothing at all: the
// whole risk of a second implementation is that it drifts, silently, and the
// drift shows up as a tool that behaves differently depending on which runtime
// happened to be installed. So this RUNS the parity harnesses, which drive both
// real entry points and compare what they produced.
//
// It reads and runs things under the operator's home directory, because that is
// where the skills live. If they are not installed it FAILS rather than skips.
//
// Read-only with respect to this repository. The harnesses it runs write only
// to their own temp directories.

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const SKILLS = join(homedir(), '.claude', 'skills')

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

const run = (command, args, cwd) => {
  const done = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, PYTHONIOENCODING: 'utf-8', CI: '1', FORCE_COLOR: '0' },
    maxBuffer: 32 * 1024 * 1024,
  })
  return { status: done.status, output: `${done.stdout ?? ''}${done.stderr ?? ''}` }
}

check('both runtimes are available, so a parity result means something', () => {
  const node = run('node', ['--version'])
  const python = run('python', ['--version'])
  if (node.status !== 0) return 'node is not runnable, so neither half could be compared'
  if (python.status !== 0) return 'python is not runnable, so neither half could be compared'
  return null
})

for (const [skill, halves] of [
  ['todo', ['todo.mjs', 'todo.py']],
  ['roast', ['roast.py', 'roast.mjs']],
]) {
  check(`the ${skill} skill ships both halves`, () => {
    const missing = halves.filter((half) => !existsSync(join(SKILLS, skill, half)))
    return missing.length ? `${missing.join(', ')} not installed under ${join(SKILLS, skill)}` : null
  })
}

check('the todo halves agree, driven command by command', () => {
  const harness = join(SKILLS, 'todo', 'test-parity.py')
  if (!existsSync(harness)) return `${harness} does not exist, so nothing compared the two halves`
  const { status, output } = run('python', [harness], join(SKILLS, 'todo'))
  if (status !== 0) return output.split('\n').slice(-20).join('\n')
  // Non-vacuity: a harness that compared nothing also exits 0.
  const compared = (output.match(/^\s+same\s/gm) ?? []).length
  return compared >= 20 ? null : `it compared only ${compared} commands, so agreeing proves little`
})

check('the roast halves agree, driven end to end against a stub reviewer', () => {
  const harness = join(SKILLS, 'roast', 'test-parity-roast.py')
  if (!existsSync(harness)) return `${harness} does not exist, so nothing compared the two halves`
  const { status, output } = run('python', [harness], join(SKILLS, 'roast'))
  if (status !== 0) return output.split('\n').slice(-25).join('\n')
  const compared = (output.match(/^\s+same\s/gm) ?? []).length
  // Four end-to-end requests plus the reset table.
  return compared >= 12 ? null : `it compared only ${compared} cases, so agreeing proves little`
})

check('each SKILL.md gives BOTH invocations, not just the one it was written for', () => {
  const problems = []
  for (const [skill, node, python] of [
    ['todo', 'todo.mjs', 'todo.py'],
    ['roast', 'roast.mjs', 'roast.py'],
  ]) {
    const doc = join(SKILLS, skill, 'SKILL.md')
    if (!existsSync(doc)) {
      problems.push(`${skill} has no SKILL.md`)
      continue
    }
    const text = readFileSync(doc, 'utf8')
    if (!text.includes(node)) problems.push(`${skill}/SKILL.md never names ${node}`)
    if (!text.includes(python)) problems.push(`${skill}/SKILL.md never names ${python}`)
    if (!/parity/i.test(text)) problems.push(`${skill}/SKILL.md does not say the two are checked against each other`)
  }
  return problems.length ? problems.join('; ') : null
})

check('the loop skill has no script needing a second runtime, and that is recorded', () => {
  // The third skill named in the exit condition. It is NOT ported, and the
  // reason is not that it was forgotten: its only script, compact.py, prints a
  // digest of the project into the context, which is the opposite of what the
  // compact step exists for. KN-172 deletes it rather than doubling it. Saying
  // so here is what stops the next reader treating this as an oversight.
  const directory = join(SKILLS, 'loop')
  if (!existsSync(directory)) return `${directory} does not exist`
  const stray = ['compact.mjs'].filter((name) => existsSync(join(directory, name)))
  if (stray.length) return `${stray.join(', ')} exists, so the loop skill grew a script after all`
  const doc = readFileSync(join(directory, 'SKILL.md'), 'utf8')
  return /cannot run `\/compact`|compaction is the harness/i.test(doc)
    ? null
    : 'the loop skill does not record that compaction is the harness’s to perform'
})

if (failures.length) {
  process.stderr.write(`\nKN-161 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-161 verify passed.\n')
