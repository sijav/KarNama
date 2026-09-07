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

import { runVerify, VerifyError, verifyArgv } from '../lib/verify.mjs'

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
    return /shell character/.test(result.stderr) ? null : `refused for the wrong reason: ${result.stderr.trim()}`
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

  // The next three exercise the SAME function the close path calls, rather than
  // reading todo.mjs source for the string `shell: true`. The source version was
  // brittle in both directions: a refactor that renamed a variable broke it
  // while the code was correct, and a stale comment containing the markers would
  // have passed it while the close path was broken. It tested wording.

  check('runVerify reports a failing verifier, which is what blocks a close', () => {
    const failing = join(VERIFY_DIR, 'kn058-failing.mjs')
    writeFileSync(failing, "process.stderr.write('deliberately failing\\n')\nprocess.exit(1)\n", 'utf8')
    try {
      const status = runVerify(ROOT, 'node agent/scripts/verify/kn058-failing.mjs')
      return status === 0 ? 'a deliberately failing verifier reported success' : null
    } finally {
      rmSync(failing, { force: true })
    }
  })

  check('runVerify reports success for a passing verifier', () => {
    const status = runVerify(ROOT, 'node agent/scripts/verify/kn058-scratch.mjs')
    return status === 0 ? null : `a passing verifier reported ${status}`
  })

  check('runVerify refuses a shell operator rather than executing it', () => {
    // The exact exploit: a valid prefix with an operator appended. Under the old
    // code this ran through a shell and reported success whatever the verifier
    // did. It must now throw instead of running anything.
    try {
      runVerify(ROOT, 'node agent/scripts/verify/kn058-failing.mjs || exit 0')
      return 'it ran a command containing a shell operator'
    } catch (error) {
      return error instanceof VerifyError ? null : `threw the wrong error: ${error.message}`
    }
  })

  check('a Windows path argument is accepted, since there is no shell to confuse', () => {
    // A backslash was previously rejected outright, which broke every Windows
    // path argument the advertised `[args]` format is meant to allow.
    const argv = verifyArgv('node agent/scripts/verify/kn058-scratch.mjs C:\\work\\tokens')
    return argv.length === 3 && argv[2] === 'C:\\work\\tokens' ? null : `parsed as ${JSON.stringify(argv)}`
  })

  check('cmd.exe expansion characters are still refused', () => {
    for (const command of [
      'node agent/scripts/verify/kn058-scratch.mjs %PATH%',
      'node agent/scripts/verify/kn058-scratch.mjs ^a',
    ]) {
      try {
        verifyArgv(command)
        return `accepted ${command}`
      } catch (error) {
        if (!(error instanceof VerifyError)) return `threw the wrong error for ${command}`
      }
    }
    return null
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
