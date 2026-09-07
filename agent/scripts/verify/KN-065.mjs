#!/usr/bin/env node
// Verifies KN-065: move done requires a verify command.
//
// Exit condition: move done refuses a task with no verify command, the message
// names KN-054 as where the backfill happens, a task with a deliberately
// failing verify still cannot close, and validate reports the count of tasks
// lacking one.
//
// **Genuinely read-only with respect to the repository.** The first version
// snapshotted board.json, let the CLI rewrite it, and restored it in a finally,
// which is not read-only however carefully it is written: in the read-only tree
// a reviewer works in, the first write failed with EPERM, the restore failed
// with it, and every accumulated result was lost. It could not run in the one
// environment where an outsider could check it.
//
// So it copies the board into the system temp directory and points the CLI at
// the copy with KARNAMA_BOARD. Nothing under the repository is written.

import { spawnSync } from 'node:child_process'
import { chmodSync, copyFileSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { verifyGate } from '../lib/verify.mjs'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const TODO = join(ROOT, 'agent', 'scripts', 'todo.mjs')
const REAL_BOARD = join(ROOT, 'agent', 'board.json')

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

const scratchDir = mkdtempSync(join(tmpdir(), 'karnama-kn065-'))
const scratchBoard = join(scratchDir, 'board.json')
copyFileSync(REAL_BOARD, scratchBoard)
// The copy inherits the source's mode, so in the read-only tree this verifier
// exists to work in, the scratch board arrived read-only too and the CLI could
// not write it either. The copy is ours; make it writable.
chmodSync(scratchBoard, 0o600)

/** The real CLI, pointed at the throwaway copy. */
const todo = (...args) =>
  spawnSync(process.execPath, [TODO, ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    env: { ...process.env, KARNAMA_BOARD: scratchBoard },
  })

const board = JSON.parse(readFileSync(REAL_BOARD, 'utf8'))
const isOpen = (task) => task.status !== 'done' && task.status !== 'dropped'

try {
  check('move done refuses a task with no verify command, before the roast gate', () => {
    const subject = board.tasks.find((task) => !task.verify && task.status === 'backlog')
    if (!subject) return 'no task without a verify command to test against'

    // Park whatever is running, then walk the subject to review. Each move is
    // asserted, because a setup step that silently failed would make the real
    // assertion below pass or fail for a reason that has nothing to do with it.
    const running = board.tasks.find((task) => task.status === 'in_progress')
    if (running) {
      const parked = todo('move', running.id, 'review')
      if (parked.status !== 0) return `could not park ${running.id}: ${parked.stderr.trim()}`
    }
    for (const to of ['in_progress', 'review']) {
      const moved = todo('move', subject.id, to)
      if (moved.status !== 0) return `could not move ${subject.id} to ${to}: ${moved.stderr.trim()}`
    }

    const result = todo('move', subject.id, 'done', '--evidence', 'testing the verify requirement')
    if (result.status === 0) return `${subject.id} closed with no verify command`

    // This is also the ORDERING assertion, behaviourally: the subject has no
    // roast round either, so if the roast gate fired first this would name the
    // roast instead. An earlier version asserted ordering by reading source
    // positions, which a comment could satisfy and a refactor could break.
    if (!/has no verify command/.test(result.stderr)) {
      return `the roast gate fired first, or another guard did: ${result.stderr.trim().split('\n')[0]}`
    }
    if (!/KN-054/.test(result.stderr)) return 'the message does not name KN-054 as where the backfill happens'
    if (!new RegExp(`agent/scripts/verify/${subject.id}\\.mjs`).test(result.stderr)) {
      return 'the message does not name the file to write'
    }
    return null
  })

  check('a task whose verify FAILS still cannot close', () => {
    const problem = verifyGate(ROOT, { id: 'SCRATCH', verify: 'node agent/scripts/verify/fixtures/always-fails.mjs' })
    return problem ? null : 'the close gate accepted a task whose verifier exited non-zero'
  })

  check('validate reports the count, including when it is zero', () => {
    const result = todo('validate')
    if (result.status !== 0) return `validate exited ${result.status}: ${result.stderr.trim()}`
    const match = /(\d+) of (\d+) open task\(s\) have no verify command/.exec(result.stdout)
    // Asserted unconditionally: a report that disappears at zero is one nothing
    // can assert against, and it would make this check fail the moment the
    // backfill succeeded.
    if (!match) return `validate did not report the count: ${result.stdout.trim()}`

    const open = board.tasks.filter(isOpen)
    const missing = open.filter((task) => !task.verify)
    if (Number(match[2]) !== open.length) return `reported ${match[2]} open tasks, the board has ${open.length}`
    return Number(match[1]) === missing.length ? null : `reported ${match[1]} missing, the board has ${missing.length}`
  })

  check('the count excludes dropped tasks, which are finished rather than unclosable', () => {
    const result = todo('validate')
    const match = /(\d+) of (\d+) open task\(s\)/.exec(result.stdout)
    if (!match) return 'no count to check'
    const dropped = board.tasks.filter((task) => task.status === 'dropped')
    const openCount = board.tasks.filter(isOpen).length
    if (dropped.length === 0 && Number(match[2]) === openCount) return null
    return Number(match[2]) === openCount ? null : `dropped tasks are being counted as open`
  })

  check('nothing under the repository was written', () => {
    // The point of the whole scratch-board arrangement. If the CLI wrote to the
    // real board, this file would differ from the copy taken before any of it.
    return readFileSync(REAL_BOARD, 'utf8') === JSON.stringify(board, null, 2) + '\n'
      ? null
      : 'agent/board.json changed while this verifier ran'
  })
} finally {
  rmSync(scratchDir, { recursive: true, force: true })
}

if (failures.length) {
  process.stderr.write(`\nKN-065 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-065 verify passed.\n')
