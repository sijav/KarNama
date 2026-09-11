#!/usr/bin/env node
// Verifies KN-065: move done requires a verify command.
//
// Exit condition: move done refuses a task with no verify command, the message
// names KN-054 as where the backfill happens, a task with a deliberately
// failing verify still cannot close, and validate reports the count of tasks
// lacking one.
//
// **Reversed by the owner on 2026-09-11**: "there's no proof, just put the task
// on done, since if there are bugs you will do them later". So the first check
// now asserts the new rule, that move done closes a taken task with no verify
// command and runs none; the shared gate still reports a failing verifier for
// anyone running a card's command by hand; and validate still reports the
// count, as information.
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
const skipped = []
/** Returned by a check that cannot run here, as opposed to one that failed. */
const SKIP = Symbol('skip')

const check = (label, run) => {
  try {
    const problem = run()
    if (problem === SKIP) skipped.push(label)
    else if (problem) failures.push(`${label}: ${problem}`)
    else process.stdout.write(`  ok   ${label}\n`)
  } catch (error) {
    failures.push(`${label}: threw ${error.message}`)
  }
}

// Some review sandboxes forbid writes ANYWHERE, including the system temp
// directory, so even creating a scratch copy fails with EPERM before a single
// check runs. The checks that drive the CLI genuinely need a writable board,
// because the CLI writes one; the rest do not. So set up if we can, and report
// the difference honestly rather than failing the whole run or, worse, claiming
// to have checked something that never ran.
//
// This costs nothing in the environment that matters: `move done` writes the
// board itself, so a close can only ever happen somewhere writable.
let scratchBoard = null
let noWrites = null
let cleanup = null
try {
  const scratchDir = mkdtempSync(join(tmpdir(), 'karnama-kn065-'))
  scratchBoard = join(scratchDir, 'board.json')
  copyFileSync(REAL_BOARD, scratchBoard)
  // The copy inherits the source's mode, so under a read-only tree the scratch
  // board arrived read-only too and the CLI could not write it either.
  chmodSync(scratchBoard, 0o600)
  cleanup = scratchDir
} catch (error) {
  noWrites = error.code ?? error.message
}

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
  check('move done closes a taken task with no verify command, and runs none, the owner\'s rule of 2026-09-11', () => {
    if (!scratchBoard) return SKIP
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

    const result = todo('move', subject.id, 'done', '--evidence', 'testing the close without a verify command')
    // The one thing still asked of the close besides the evidence is a clean
    // worktree, which is the real repository's; on a dirty one it refuses for
    // that, and that is not the rule under test.
    if (result.status !== 0 && /unreviewed changes/.test(result.stderr)) return SKIP
    if (result.status !== 0) return `${subject.id} did not close: ${result.stderr.trim().split('\n')[0]}`
    return /has no verify command/.test(result.stderr) ? 'the close still complained about a verify command' : null
  })

  check('the shared gate still reports a failing verifier, for a card run by hand', () => {
    const problem = verifyGate(ROOT, { id: 'SCRATCH', verify: 'node agent/scripts/verify/fixtures/always-fails.mjs' })
    return problem ? null : 'the gate accepted a task whose verifier exited non-zero'
  })

  check('validate reports the count, including when it is zero', () => {
    if (!scratchBoard) return SKIP
    const result = todo('validate')
    if (result.status !== 0) return `validate exited ${result.status}: ${result.stderr.trim()}`
    const match = /(\d+) of (\d+) open task\(s\) have no verify command; none is needed to close/.exec(result.stdout)
    // Asserted unconditionally: a report that disappears at zero is one nothing
    // can assert against, and it would make this check fail the moment the
    // backfill succeeded.
    if (!match) return `validate did not report the count: ${result.stdout.trim()}`

    // Counted on the scratch board the CLI validated, which the first check
    // changed by closing a task on it.
    const open = JSON.parse(readFileSync(scratchBoard, 'utf8')).tasks.filter(isOpen)
    const missing = open.filter((task) => !task.verify)
    if (Number(match[2]) !== open.length) return `reported ${match[2]} open tasks, the board has ${open.length}`
    return Number(match[1]) === missing.length ? null : `reported ${match[1]} missing, the board has ${missing.length}`
  })

  check('the count excludes dropped tasks, which are finished rather than unclosable', () => {
    if (!scratchBoard) return SKIP
    const result = todo('validate')
    const match = /(\d+) of (\d+) open task\(s\)/.exec(result.stdout)
    if (!match) return 'no count to check'
    const scratch = JSON.parse(readFileSync(scratchBoard, 'utf8'))
    const dropped = scratch.tasks.filter((task) => task.status === 'dropped')
    const openCount = scratch.tasks.filter(isOpen).length
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
  if (cleanup) rmSync(cleanup, { recursive: true, force: true })
}

if (failures.length) {
  process.stderr.write(`\nKN-065 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}

// A skipped check is not a passed check, and saying "passed" when three of the
// four substantive assertions did not run would be the worst version of this
// script: it would turn a visible crash into an invisible false pass, in
// exactly the environment where a reviewer is meant to check the work.
//
// So it exits non-zero and calls itself INCOMPLETE. That is not the crash it
// replaced: the reason is stated, the checks that did run are reported, and
// nothing is claimed that was not established. It also does not affect a close,
// because `move done` writes the board itself, so a close only ever happens
// somewhere writable, where nothing skips.
if (skipped.length) {
  process.stderr.write(
    `\nKN-065 verify INCOMPLETE. ${skipped.length} of ${skipped.length + 2} checks could not run:\n`,
  )
  for (const label of skipped) process.stderr.write(`  skip ${label}\n`)
  process.stderr.write(
    `\nThis environment forbids writes (${noWrites}), and driving the CLI needs a writable board.\n` +
      'The two checks that do not need one passed. Run this where writes are allowed to establish the rest;\n' +
      'a close happens there by definition, since move done writes the board itself.\n',
  )
  process.exit(1)
}

process.stdout.write('\nKN-065 verify passed.\n')
