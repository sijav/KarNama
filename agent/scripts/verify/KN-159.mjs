#!/usr/bin/env node
// Verifies KN-159: a task closes BEFORE its roast, and a finding never reopens it.
//
// Exit condition: move <id> done succeeds from in_progress with NO roast round
// recorded, provided the verify command passes, evidence is given and the
// worktree is clean; it still refuses from backlog; it still refuses when the
// verify command fails; roast accepts a done task; and RALPH.md documents
// finish, prove, close, roast in that order with findings always becoming cards.
//
// The gate is DRIVEN, not read. A source check here would be worthless twice
// over: the thing that changed is a control-flow path through `move`, and the
// repository has already been bitten by a verifier that grepped for a construct
// and matched the comment explaining it. So this builds a throwaway git
// repository, copies the real scripts into it, and runs the real CLI.
//
// Isolation is the point. `todo.mjs` resolves ROOT from its own location and
// checks THAT worktree for uncommitted work, so a copy inside a temp repo
// operates on the temp board and the temp worktree, and this verifier can run
// while the real tree is mid-edit.
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

/** A git repository holding a copy of the real board scripts and nothing else. */
const buildSandbox = () => {
  const dir = mkdtempSync(join(tmpdir(), 'kn159-'))
  const git = (args) => spawnSync('git', args, { cwd: dir, encoding: 'utf8' })
  git(['init', '-q'])
  git(['config', 'user.email', 'verify@karnama.test'])
  git(['config', 'user.name', 'KN-159'])
  // `commit.gpgsign=false` because a signing key configured globally would make
  // every commit here prompt or fail, and this repository is throwaway.
  git(['config', 'commit.gpgsign', 'false'])

  mkdirSync(join(dir, 'agent'), { recursive: true })
  cpSync(join(ROOT, 'agent', 'scripts'), join(dir, 'agent', 'scripts'), { recursive: true })
  // Every board mutation runs the design-contract check, which reads DESIGN.md
  // from the root it resolved. The REAL one is copied rather than a stub,
  // because the contract rules match against its text and a stub would make the
  // sandbox pass rules the repository would fail.
  cpSync(join(ROOT, 'DESIGN.md'), join(dir, 'DESIGN.md'))
  writeFileSync(join(dir, 'agent', 'scripts', 'verify', 'sandbox-passes.mjs'), 'process.exit(0)\n')
  writeFileSync(join(dir, 'agent', 'scripts', 'verify', 'sandbox-fails.mjs'), 'process.exit(1)\n')
  writeFileSync(
    join(dir, 'agent', 'board.json'),
    `${JSON.stringify({ version: 1, project: 'KN-159 sandbox', nextId: 1, tasks: [] }, null, 2)}\n`,
  )
  git(['add', '-A'])
  git(['commit', '-q', '-m', 'sandbox'])
  return dir
}

/** Runs the copied CLI inside the sandbox and returns status plus merged output. */
const todo = (dir, args) => {
  const result = spawnSync(process.execPath, [join(dir, 'agent', 'scripts', 'todo.mjs'), ...args], {
    cwd: dir,
    encoding: 'utf8',
    env: { ...process.env, CI: '1', FORCE_COLOR: '0' },
  })
  return { status: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}

/**
 * Runs a setup command and refuses to continue if it failed.
 *
 * The first version of this file ignored the status of its setup calls, so a
 * `set --verify` that never applied surfaced three checks later as "closing
 * refused", which reads exactly like the gate working. Setup that fails
 * silently makes a verifier report the wrong thing with total confidence.
 */
const must = (dir, args) => {
  const result = todo(dir, args)
  if (result.status !== 0) throw new Error(`setup "${args.join(' ')}" failed:\n${result.output.trim()}`)
  return result
}

/**
 * Opens one task and returns its id, so each check starts from a known state.
 *
 * "Known state" includes parking whatever the previous check left in progress.
 * Only one task may be in progress at a time, so a check that deliberately
 * fails to close its task poisoned every check after it, and the reported
 * reason was the board's own "already in progress", which looks like a finding
 * rather than like the mess it was.
 */
const openTask = (dir, { verify } = {}) => {
  const board = JSON.parse(readFileSync(join(dir, 'agent', 'board.json'), 'utf8'))
  for (const task of board.tasks) {
    if (task.status === 'in_progress') must(dir, ['move', task.id, 'backlog', '--note', 'parked by the sandbox'])
  }
  const added = todo(dir, [
    'add',
    '--title', 'sandbox task',
    '--desc', 'a task that exists only to drive the gate',
    '--why', 'the gate cannot be checked without something to close',
    '--severity', 'low',
    '--points', '1',
    '--area', 'agent',
    '--exit', 'it closes, or it does not',
  ])
  const id = /added (\S+)/.exec(added.output)?.[1]
  if (!id) throw new Error(`could not open a sandbox task: ${added.output}`)
  if (verify) must(dir, ['set', id, '--verify', verify])
  return id
}

// A verify command has to be `node agent/scripts/verify/<name>.mjs`, and that
// is not incidental: an arbitrary command could be pointed, directly or through
// a link, at a path the work-change gate treats as bookkeeping. So the sandbox
// gets two real verifier scripts rather than an inline `node -e`, which is also
// closer to what a task actually carries.
const PASSES = 'node agent/scripts/verify/sandbox-passes.mjs'
const FAILS = 'node agent/scripts/verify/sandbox-fails.mjs'

const sandbox = buildSandbox()
try {
  check('a task closes from in_progress with NO roast round at all', () => {
    // The whole point of the change. Under the old gate this failed twice, once
    // for not being in `review` and once for having no roast.
    const id = openTask(sandbox, { verify: PASSES })
    must(sandbox, ['move', id, 'in_progress'])
    const closed = todo(sandbox, ['move', id, 'done', '--evidence', 'the sandbox verify command exited 0'])
    if (closed.status !== 0) return `it refused:\n${closed.output.trim()}`
    const shown = todo(sandbox, ['show', id]).output
    return /status\s+done/.test(shown) ? null : `it reported success but the card is not done:\n${shown}`
  })

  check('closing still refuses a task nobody took', () => {
    // Not a leftover of the old flow. Closing a `backlog` card means the work
    // happened off the board, which is the one ordering case worth stopping.
    const id = openTask(sandbox, { verify: PASSES })
    const closed = todo(sandbox, ['move', id, 'done', '--evidence', 'never taken'])
    if (closed.status === 0) return 'a backlog task closed without ever being taken'
    return /is backlog/.test(closed.output) ? null : `it refused for the wrong reason:\n${closed.output.trim()}`
  })

  check('closing still refuses when the verify command FAILS', () => {
    // The check that replaced the roast gate. If this does not hold, the change
    // removed a gate and put nothing in its place.
    const id = openTask(sandbox, { verify: FAILS })
    must(sandbox, ['move', id, 'in_progress'])
    const closed = todo(sandbox, ['move', id, 'done', '--evidence', 'claiming it works'])
    if (closed.status === 0) return 'a task closed while its own verify command was failing'
    const shown = todo(sandbox, ['show', id]).output
    return /status\s+in_progress/.test(shown) ? null : 'it refused but moved the card anyway'
  })

  check('closing still refuses without evidence', () => {
    const id = openTask(sandbox, { verify: PASSES })
    must(sandbox, ['move', id, 'in_progress'])
    const closed = todo(sandbox, ['move', id, 'done'])
    return closed.status === 0 ? 'a task closed with no evidence recorded' : null
  })

  check('closing still refuses over uncommitted work', () => {
    // Bookkeeping is exempt, real work is not, so this plants a work file.
    const id = openTask(sandbox, { verify: PASSES })
    must(sandbox, ['move', id, 'in_progress'])
    const planted = join(sandbox, 'src-file.txt')
    writeFileSync(planted, 'uncommitted work\n')
    try {
      const closed = todo(sandbox, ['move', id, 'done', '--evidence', 'closing over a dirty tree'])
      if (closed.status === 0) return 'a task closed over uncommitted work'
      return /unreviewed changes/.test(closed.output) ? null : `refused for the wrong reason:\n${closed.output.trim()}`
    } finally {
      rmSync(planted, { force: true })
    }
  })

  check('a DONE task is an acceptable thing to roast', () => {
    // The roast now runs against closed work, so `done` has to pass the status
    // guard. It cannot be driven all the way through here, because recording a
    // round needs a harness-written archive and manifest that cannot be forged,
    // which is a property worth keeping. So this asserts the status guard is not
    // what stops it: the failure must be about the archive, never about `done`.
    const id = openTask(sandbox, { verify: PASSES })
    must(sandbox, ['move', id, 'in_progress'])
    must(sandbox, ['move', id, 'done', '--evidence', 'closed before its roast, as the loop now says'])
    const roasted = todo(sandbox, ['roast', id, '--score', '7', '--criticals', '0', '--file', 'agent/roasts/nope.md'])
    if (roasted.status === 0) return 'it accepted a round pointing at an archive that does not exist'
    if (/is done\./.test(roasted.output)) return `the status guard still rejects a done task:\n${roasted.output.trim()}`
    return /does not exist/.test(roasted.output) ? null : `refused for an unexpected reason:\n${roasted.output.trim()}`
  })
} finally {
  rmSync(sandbox, { recursive: true, force: true })
}

check('RALPH.md documents close-then-roast, and no fix-in-task rule survives', () => {
  const ralph = readFileSync(join(ROOT, 'agent', 'RALPH.md'), 'utf8')
  const closeAt = ralph.indexOf('## Step 4 · Close it')
  const roastAt = ralph.indexOf('## Step 5 · Hand it to Codex')
  if (closeAt === -1) return 'there is no step that closes the task'
  if (roastAt === -1) return 'there is no step that hands the work to a reviewer'
  if (closeAt > roastAt) return 'the roast step comes before the close step, which is the old order'
  // The rule that was deleted, checked by its effect rather than its wording:
  // no step may tell the reader to fix a finding inside the roasted task.
  if (/Fix in-task ONLY when/.test(ralph)) return 'the fix-in-task rule is still in the file'
  return /STAYS done|stays done/.test(ralph) ? null : 'the file never says a roasted task stays closed'
})

if (failures.length) {
  process.stderr.write(`\nKN-159 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-159 verify passed.\n')
