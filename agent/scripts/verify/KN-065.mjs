#!/usr/bin/env node
// Verifies KN-065: move done requires a verify command.
//
// Exit condition: move done refuses a task with no verify command, the message
// names KN-054 as where the backfill happens, a task with a deliberately
// failing verify still cannot close, and validate reports the count of tasks
// lacking one.
//
// Drives the real todo.mjs for everything reachable, and calls the shared
// verifyGate for the close-time behaviour that a whole close cannot reach,
// because closing needs a manifest-bound roast round and one of those cannot be
// fabricated without forging, by design.
//
// Read-only with respect to the repository: it snapshots board.json, restores
// it in a finally, and writes no scratch files. A verifier that cannot run in a
// read-only tree cannot be run by the reviewer who most needs to.

import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { verifyGate } from '../lib/verify.mjs'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const TODO = join(ROOT, 'agent', 'scripts', 'todo.mjs')
const BOARD = join(ROOT, 'agent', 'board.json')

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

const snapshot = readFileSync(BOARD, 'utf8')
const board = JSON.parse(snapshot)

try {
  check('some open task still lacks a verify command, so the checks below mean something', () => {
    const open = board.tasks.filter((task) => task.status !== 'done' && task.status !== 'dropped')
    return open.some((task) => !task.verify) ? null : 'every open task already has one, so nothing is being tested'
  })

  check('move done refuses a task with no verify command', () => {
    const subject = board.tasks.find((task) => !task.verify && task.status === 'backlog')
    if (!subject) return 'no task without a verify command to test against'

    // Park whatever is running, walk the subject to review, and try to close it.
    const running = board.tasks.find((task) => task.status === 'in_progress')
    if (running) todo('move', running.id, 'review')
    todo('move', subject.id, 'in_progress')
    todo('move', subject.id, 'review')
    const result = todo('move', subject.id, 'done', '--evidence', 'testing the verify requirement')

    if (result.status === 0) return `${subject.id} closed with no verify command`
    if (!/has no verify command/.test(result.stderr)) {
      return `refused for another reason first: ${result.stderr.trim().split('\n')[0]}`
    }
    if (!/KN-054/.test(result.stderr)) return 'the message does not name KN-054 as where the backfill happens'
    if (!new RegExp(`agent/scripts/verify/${subject.id}\\.mjs`).test(result.stderr)) {
      return 'the message does not name the file to write'
    }
    return null
  })

  check('the refusal comes BEFORE the roast gate, so the advice is the useful one', () => {
    // Ordering is part of the behaviour: telling someone to write a check is
    // more actionable than telling them to get a review of an unchecked thing.
    const source = readFileSync(TODO, 'utf8')
    const doneBlock = source.slice(source.indexOf("if (status === 'done')"))
    const verifyAt = doneBlock.indexOf('has no verify command')
    const roastAt = doneBlock.indexOf('has no roast round')
    if (verifyAt === -1 || roastAt === -1) return 'one of the two guards is missing'
    return verifyAt < roastAt ? null : 'the roast gate fires before the verify requirement'
  })

  check('a task whose verify FAILS still cannot close', () => {
    // Through the same gate move done calls. A whole close cannot be driven
    // here, so this exercises the function rather than a copy of its logic.
    const problem = verifyGate(ROOT, { id: 'SCRATCH', verify: 'node agent/scripts/verify/fixtures/always-fails.mjs' })
    return problem ? null : 'the close gate accepted a task whose verifier exited non-zero'
  })

  check('validate reports how many open tasks lack a verify command', () => {
    const result = todo('validate')
    if (result.status !== 0) return `validate exited ${result.status}`
    const match = /(\d+) of (\d+) open task\(s\) have no verify command/.exec(result.stdout)
    if (!match) return `validate did not report the count: ${result.stdout.trim()}`
    const expected = board.tasks.filter((task) => task.status !== 'done' && task.status !== 'dropped' && !task.verify)
    return Number(match[1]) === expected.length
      ? null
      : `reported ${match[1]} but ${expected.length} open tasks lack one`
  })
} finally {
  writeFileSync(BOARD, snapshot, 'utf8')
  todo('render')
}

if (failures.length) {
  process.stderr.write(`\nKN-065 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-065 verify passed.\n')
