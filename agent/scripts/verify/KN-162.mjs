#!/usr/bin/env node
// Verifies KN-162: `done` is terminal, so a finding cannot reopen a closed task.
//
// Exit condition: move <id> in_progress, backlog, review or blocked all REFUSE
// when the task is done, naming the new-card route; the refusal is proved by
// driving the real CLI in an isolated repository; and a mutation removing the
// guard fails the check with its own message.
//
// The trap this file is shaped around, named by the plan check before it was
// written: a verifier that proves a refusal FOR THE WRONG REASON. `move X
// blocked` without `--reason` is refused for the missing reason, and `move X
// in_progress` while another task is active is refused for the other task.
// Either would make this file green with the guard deleted. So every attempt
// below carries VALID flags and a clear board, the refusal has to name the
// terminal rule specifically, and the card has to still be `done` afterwards.
//
// Read-only with respect to the repository: everything it writes is under the
// system temp directory and is removed at the end.

import { spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))

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

// A copy of KN-159's sandbox. Duplicated deliberately and once: the plan check
// agreed that extracting a shared helper for two callers is premature, and that
// the third one is when it should move to lib/. Filed there rather than guessed
// at here.
const buildSandbox = () => {
  const dir = mkdtempSync(join(tmpdir(), 'kn162-'))
  const git = (args) => spawnSync('git', args, { cwd: dir, encoding: 'utf8' })
  git(['init', '-q'])
  git(['config', 'user.email', 'verify@karnama.test'])
  git(['config', 'user.name', 'KN-162'])
  git(['config', 'commit.gpgsign', 'false'])
  mkdirSync(join(dir, 'agent'), { recursive: true })
  cpSync(join(ROOT, 'agent', 'scripts'), join(dir, 'agent', 'scripts'), { recursive: true })
  cpSync(join(ROOT, 'DESIGN.md'), join(dir, 'DESIGN.md'))
  writeFileSync(join(dir, 'agent', 'scripts', 'verify', 'sandbox-passes.mjs'), 'process.exit(0)\n')
  writeFileSync(
    join(dir, 'agent', 'board.json'),
    `${JSON.stringify({ version: 1, project: 'KN-162 sandbox', nextId: 1, tasks: [] }, null, 2)}\n`,
  )
  git(['add', '-A'])
  git(['commit', '-q', '-m', 'sandbox'])
  return dir
}

const todo = (dir, args) => {
  const result = spawnSync(process.execPath, [join(dir, 'agent', 'scripts', 'todo.mjs'), ...args], {
    cwd: dir,
    encoding: 'utf8',
    env: { ...process.env, CI: '1', FORCE_COLOR: '0' },
  })
  return { status: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}

const must = (dir, args) => {
  const result = todo(dir, args)
  if (result.status !== 0) throw new Error(`setup "${args.join(' ')}" failed:\n${result.output.trim()}`)
  return result
}

/** Opens a task, takes it, and closes it, leaving nothing else in progress. */
const closedTask = (dir) => {
  const added = must(dir, [
    'add',
    '--title', 'a closed task',
    '--desc', 'exists to be closed and then poked at',
    '--why', 'the terminal rule cannot be checked without something closed',
    '--severity', 'low',
    '--points', '1',
    '--area', 'agent',
    '--exit', 'node agent/scripts/verify/sandbox-passes.mjs exits zero, which is all this sandbox task has to prove',
  ])
  const id = /added (\S+)/.exec(added.output)?.[1]
  if (!id) throw new Error(`could not open a sandbox task: ${added.output}`)
  must(dir, ['set', id, '--verify', 'node agent/scripts/verify/sandbox-passes.mjs'])
  must(dir, ['move', id, 'in_progress'])
  must(dir, ['move', id, 'done', '--evidence', 'closed so the terminal rule has something to refuse'])
  return id
}

const statusOf = (dir, id) => /status\s+(\S+)/.exec(todo(dir, ['show', id]).output)?.[1]

const sandbox = buildSandbox()
try {
  check('the sandbox can close a task at all, so a refusal below means something', () => {
    // The positive control. Every check after this asserts something was
    // REFUSED, and a CLI that refused everything would satisfy all of them.
    const id = closedTask(sandbox)
    return statusOf(sandbox, id) === 'done' ? null : `the task did not reach done, it is ${statusOf(sandbox, id)}`
  })

  // Each destination, with the flags that destination legitimately needs, so a
  // refusal cannot be blamed on a missing argument.
  for (const [status, extra] of [
    ['in_progress', []],
    ['backlog', []],
    ['review', []],
    ['blocked', ['--reason', 'a perfectly valid reason']],
    ['dropped', ['--reason', 'a perfectly valid reason']],
  ]) {
    check(`a done task REFUSES to move to ${status}, for the terminal reason`, () => {
      const id = closedTask(sandbox)
      const moved = todo(sandbox, ['move', id, status, ...extra])
      if (moved.status === 0) return `it moved to ${status}, so done is not terminal`
      if (!/done is terminal/.test(moved.output)) {
        return `refused, but not for the terminal rule:\n${moved.output.trim()}`
      }
      if (!/add --title/.test(moved.output)) return 'the refusal does not name the new-card route'
      const after = statusOf(sandbox, id)
      return after === 'done' ? null : `it refused but left the card as ${after}`
    })
  }

  check('nothing else was in progress, so no refusal came from that guard', () => {
    // The other wrong reason. If a sandbox task had been left in progress, the
    // in_progress attempt above would be refused by the one-at-a-time rule and
    // would look identical from the outside.
    const board = JSON.parse(readFileSync(join(sandbox, 'agent', 'board.json'), 'utf8'))
    const running = board.tasks.filter((task) => task.status === 'in_progress')
    return running.length ? `${running.map((task) => task.id).join(', ')} was in progress` : null
  })

  check('re-closing an already closed task is a no-op, not an error', () => {
    // A retry should not be punished, and this is also what proves the guard is
    // a transition rule rather than a blanket refusal of any move.
    const id = closedTask(sandbox)
    const again = todo(sandbox, ['move', id, 'done', '--evidence', 'saying it again'])
    if (again.status !== 0) return `re-closing was refused:\n${again.output.trim()}`
    return statusOf(sandbox, id) === 'done' ? null : 'the card left done on a repeat close'
  })

  check('an OPEN task still moves freely, so the guard is not catching everything', () => {
    const added = must(sandbox, [
      'add',
      '--title', 'an open task',
      '--desc', 'stays open',
      '--why', 'to prove ordinary transitions still work',
      '--severity', 'low',
      '--points', '1',
      '--area', 'agent',
      '--exit', 'node agent/scripts/verify/sandbox-passes.mjs exits zero, and the card moves between open states',
    ])
    const id = /added (\S+)/.exec(added.output)?.[1]
    const toProgress = todo(sandbox, ['move', id, 'in_progress'])
    if (toProgress.status !== 0) return `an open task could not be taken:\n${toProgress.output.trim()}`
    const toBacklog = todo(sandbox, ['move', id, 'backlog'])
    if (toBacklog.status !== 0) return `an open task could not be parked:\n${toBacklog.output.trim()}`
    return statusOf(sandbox, id) === 'backlog' ? null : 'the park did not take effect'
  })
} finally {
  rmSync(sandbox, { recursive: true, force: true })
}

check('RALPH.md and the CLI agree that a finding never reopens a closed task', () => {
  const ralph = readFileSync(join(ROOT, 'agent', 'RALPH.md'), 'utf8')
  if (!/STAYS done|stays done/.test(ralph)) return 'RALPH.md does not say a roasted task stays closed'
  const source = readFileSync(join(ROOT, 'agent', 'scripts', 'todo.mjs'), 'utf8')
  return /done is terminal/.test(source) ? null : 'todo.mjs does not carry the terminal refusal'
})

if (failures.length) {
  process.stderr.write(`\nKN-162 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-162 verify passed.\n')
