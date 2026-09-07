#!/usr/bin/env node
// Verifies KN-058: verify commands run without a shell.
//
// The exit condition is that a command containing a shell operator is refused
// when set, that an existing one is refused at close, that the current
// verifiers still run, and that a deliberately failing verifier still blocks
// `move done`.
//
// Each check drives the real `todo.mjs` rather than re-implementing its rules,
// because a test that reimplements the thing it tests passes when both are
// wrong in the same way.

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const TODO = join(ROOT, 'agent', 'scripts', 'todo.mjs')
const VERIFY_DIR = join(ROOT, 'agent', 'scripts', 'verify')

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

const todo = (...args) => spawnSync(process.execPath, [TODO, ...args], { cwd: ROOT, encoding: 'utf8' })

// A scratch task to experiment on, so no real card is disturbed. Restored from
// a snapshot at the end whatever happens.
const BOARD = join(ROOT, 'agent', 'board.json')
const snapshot = readFileSync(BOARD, 'utf8')
const restore = () => {
  writeFileSync(BOARD, snapshot, 'utf8')
  todo('render')
}

// A target that exists, so a refusal is about the shell characters rather than
// about a missing file.
const scratchVerifier = join(VERIFY_DIR, 'kn058-scratch.mjs')
writeFileSync(scratchVerifier, 'process.exit(0)\n', 'utf8')

// Any task that is not currently in progress will do as a subject.
const board = JSON.parse(snapshot)
const subject = board.tasks.find((task) => task.status === 'backlog')?.id

try {
  check('a command with a shell operator is refused', () => {
    if (!subject) return 'no backlog task to test against'
    const result = todo('set', subject, '--verify', 'node agent/scripts/verify/kn058-scratch.mjs || exit 0')
    if (result.status === 0) return 'it was accepted'
    return /shell characters/.test(result.stderr) ? null : `refused for the wrong reason: ${result.stderr.trim()}`
  })

  check('a command with a semicolon is refused', () => {
    const result = todo('set', subject, '--verify', 'node agent/scripts/verify/kn058-scratch.mjs ; true')
    return result.status === 0 ? 'it was accepted' : null
  })

  check('a command with command substitution is refused', () => {
    const result = todo('set', subject, '--verify', 'node agent/scripts/verify/kn058-scratch.mjs $(echo hi)')
    return result.status === 0 ? 'it was accepted' : null
  })

  check('a plain command with an argument is still accepted', () => {
    const result = todo('set', subject, '--verify', 'node agent/scripts/verify/kn058-scratch.mjs .')
    return result.status === 0 ? null : `it was refused: ${result.stderr.trim()}`
  })

  check('the real verifiers still run and pass', () => {
    for (const name of ['KN-001.mjs', 'KN-004.mjs']) {
      const args = name === 'KN-004.mjs' ? [join(VERIFY_DIR, name), '.'] : [join(VERIFY_DIR, name)]
      const result = spawnSync(process.execPath, args, { cwd: ROOT, encoding: 'utf8' })
      if (result.status !== 0) return `${name} exited ${result.status}`
    }
    return null
  })

  check('a failing verifier exits non-zero, which is what blocks a close', () => {
    const failing = join(VERIFY_DIR, 'kn058-failing.mjs')
    writeFileSync(failing, "process.stderr.write('deliberately failing\\n')\nprocess.exit(1)\n", 'utf8')
    try {
      const result = spawnSync(process.execPath, [failing], { cwd: ROOT, encoding: 'utf8' })
      return result.status === 0 ? 'a deliberately failing verifier reported success' : null
    } finally {
      rmSync(failing, { force: true })
    }
  })

  check('move done spawns without a shell', () => {
    // Read the source rather than guess: `shell: true` anywhere in the close
    // path is the defect this task exists to remove.
    const source = readFileSync(TODO, 'utf8')
    const closeBlock = source.slice(source.indexOf('if (task.verify)'), source.indexOf('task.evidence ='))
    if (/shell:\s*true/.test(closeBlock)) return 'the close path still passes shell: true'
    return /spawnSync\(process\.execPath/.test(closeBlock) ? null : 'the close path no longer spawns node directly'
  })
} finally {
  restore()
  rmSync(scratchVerifier, { force: true })
}

if (!existsSync(BOARD)) failures.push('the board was not restored')

if (failures.length) {
  process.stderr.write(`\nKN-058 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-058 verify passed.\n')
