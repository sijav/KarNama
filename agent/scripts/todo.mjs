#!/usr/bin/env node
// The board tool.
//
// Zero dependencies on purpose. The loop's first iteration has to be able to
// pick a task on a fresh clone, before `npm install` has ever run, so this file
// may only import from `node:`.
//
// `agent/board.json` is the source of truth and is written only by this script.
// `agent/TODO_BOARD.md` is the rendered kanban a human reads, regenerated after
// every mutation so the two can never drift.

import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const AGENT_DIR = dirname(dirname(fileURLToPath(import.meta.url)))
const ROOT = dirname(AGENT_DIR)
const BOARD_PATH = join(AGENT_DIR, 'board.json')
const RENDER_PATH = join(AGENT_DIR, 'TODO_BOARD.md')

/** Highest first. `next` walks this order, so index is the rank. */
const SEVERITIES = ['critical', 'high', 'medium', 'low']
const STATUSES = ['backlog', 'in_progress', 'review', 'blocked', 'done', 'dropped']
const AREAS = ['agent', 'infra', 'design', 'web', 'api', 'graphql', 'docs', 'deploy']
/** Fibonacci only. A task that wants 4 is really a 3 or a 5, and saying which is the useful act. */
const POINTS = [1, 2, 3, 5, 8, 13]

const REQUIRED = ['id', 'title', 'desc', 'why', 'severity', 'points', 'area', 'parent', 'status', 'exit']

/** A task is pickable in these states. `blocked` is excluded: it names a reason outside the board. */
const OPEN_STATUSES = ['in_progress', 'review', 'backlog']
/** A parent in one of these no longer blocks its children. */
const SETTLED_STATUSES = ['done', 'dropped']

// ---------------------------------------------------------------- board io

const loadBoard = () => {
  if (!existsSync(BOARD_PATH)) return { version: 1, project: 'KarNama', nextId: 1, tasks: [] }
  return JSON.parse(readFileSync(BOARD_PATH, 'utf8'))
}

const saveBoard = (board) => {
  mkdirSync(AGENT_DIR, { recursive: true })
  writeFileSync(BOARD_PATH, `${JSON.stringify(board, null, 2)}\n`, 'utf8')
  writeFileSync(RENDER_PATH, renderBoard(board), 'utf8')
}

const byId = (board, id) => board.tasks.find((task) => task.id === id)

const git = (args) => spawnSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })

// ---------------------------------------------------------------- arguments

/**
 * Flags as `--key value` or `--key=value`. A flag repeated collects into an
 * array, which is what `--parent` and `--ask` need. Bare words are positional.
 */
const parseArgs = (argv) => {
  const flags = {}
  const positional = []
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    if (!token.startsWith('--')) {
      positional.push(token)
      continue
    }
    const equals = token.indexOf('=')
    const key = equals === -1 ? token.slice(2) : token.slice(2, equals)
    let value
    if (equals !== -1) {
      value = token.slice(equals + 1)
    } else if (argv[index + 1] !== undefined && !argv[index + 1].startsWith('--')) {
      value = argv[index + 1]
      index += 1
    } else {
      value = true
    }
    if (key in flags) {
      flags[key] = Array.isArray(flags[key]) ? [...flags[key], value] : [flags[key], value]
    } else {
      flags[key] = value
    }
  }
  return { flags, positional }
}

const asList = (value) => {
  if (value === undefined || value === true) return []
  const raw = Array.isArray(value) ? value : [value]
  return raw
    .flatMap((entry) => String(entry).split(','))
    .map((entry) => entry.trim())
    .filter(Boolean)
}

const fail = (message) => {
  process.stderr.write(`${message}\n`)
  process.exit(1)
}

/**
 * A flag written with no value parses as `true`. Coercing that silently is how a
 * field gets a wrong value instead of an error: `--points --area docs` made
 * `Number(true)`, which is 1, a perfectly valid story point, and quietly moved
 * the task to the front of the queue.
 */
const requireValue = (value, flag) => {
  if (value === true || value === undefined) fail(`--${flag} needs a value`)
  return Array.isArray(value) ? fail(`--${flag} was given more than once`) : String(value)
}

/** The digest of what a reviewer was actually shown, so an edited card invalidates its round. */
const cardDigest = (task) =>
  createHash('sha256')
    .update(
      JSON.stringify({
        title: task.title,
        desc: task.desc,
        why: task.why,
        exit: task.exit,
        area: task.area,
        severity: task.severity,
        points: task.points,
        parent: task.parent,
      }),
    )
    .digest('hex')

/**
 * The LAST verdict block, not the first match anywhere in the file.
 *
 * Searching the whole archive let a preamble decide the verdict: a file whose
 * top said `criticals: 0` and whose real verdict said `criticals: 2` read as
 * clean, and the reverse demanded a dismissal that was not owed.
 */
const finalVerdict = (archive) => {
  const index = archive.lastIndexOf('VERDICT')
  if (index === -1) return null
  const tail = archive.slice(index)
  const score = tail.match(/^\s*score:\s*([0-9]+(?:\.[0-9]+)?)\s*$/im)
  const criticals = tail.match(/^\s*criticals:\s*([0-9]+)\s*$/im)
  if (!score || !criticals) return null
  return { score: Number(score[1]), criticals: Number(criticals[1]) }
}

/**
 * Load a roast archive and prove it came from the harness, for this task, for
 * this round.
 *
 * Substring-matching "VERDICT" was not evidence of anything: the harness writes
 * the verdict TEMPLATE into its own prompt file, so `--file <the prompt>` passed
 * the check and recorded a fabricated clear round. The sidecar the harness
 * writes is the thing that has to match.
 */
const readArchive = (file, task, expectedRound) => {
  if (/\.prompt\.md$/.test(file)) {
    fail(`roast: ${file} is the prompt the harness sent, not the reply it received`)
  }
  const path = join(ROOT, file)
  if (!existsSync(path)) fail(`roast: --file ${file} does not exist, relative to the repository root`)

  const metaPath = `${path}.meta.json`
  if (!existsSync(metaPath)) {
    fail(`roast: ${file} has no .meta.json beside it, so it was not written by "npm run roast"`)
  }
  const meta = JSON.parse(readFileSync(metaPath, 'utf8'))
  const archive = readFileSync(path, 'utf8')

  if (meta.replyDigest !== createHash('sha256').update(archive).digest('hex')) {
    fail(`roast: ${file} has been edited since the harness wrote it, its digest no longer matches`)
  }
  if (meta.task !== task.id) fail(`roast: ${file} is a roast of ${meta.task}, not of ${task.id}`)
  if (meta.round !== expectedRound + 1) {
    fail(`roast: ${file} is round ${meta.round}, and ${task.id} is recording round ${expectedRound + 1}`)
  }
  return { archive, meta }
}

/** `add` opens tasks. Closing one is `move`'s job, because that is where the gate is. */
const openingStatus = (status) => {
  if (!['backlog', 'in_progress'].includes(status)) {
    fail(`add: a task may only be created in backlog or in_progress. Use "move" to reach ${status}.`)
  }
  return status
}

// ---------------------------------------------------------------- validation

/**
 * Every integrity rule the board has. Returns a list of strings; empty means
 * clean. `validate` prints them and exits non-zero, and every mutation runs it
 * first so a broken board can never be written.
 */
const checkBoard = (board) => {
  const problems = []
  const seen = new Set()

  for (const task of board.tasks) {
    const label = task.id ?? '(no id)'

    for (const field of REQUIRED) {
      const value = task[field]
      const empty = value === undefined || value === null || (typeof value === 'string' && value.trim() === '')
      if (empty) problems.push(`${label}: missing required field "${field}"`)
    }

    if (seen.has(task.id)) problems.push(`${label}: duplicate id`)
    seen.add(task.id)

    if (task.severity && !SEVERITIES.includes(task.severity)) {
      problems.push(`${label}: severity "${task.severity}" is not one of ${SEVERITIES.join(', ')}`)
    }
    if (task.status && !STATUSES.includes(task.status)) {
      problems.push(`${label}: status "${task.status}" is not one of ${STATUSES.join(', ')}`)
    }
    if (task.area && !AREAS.includes(task.area)) {
      problems.push(`${label}: area "${task.area}" is not one of ${AREAS.join(', ')}`)
    }
    if (task.points !== undefined && !POINTS.includes(task.points)) {
      problems.push(`${label}: points ${task.points} is not one of ${POINTS.join(', ')}`)
    }
    if (!Array.isArray(task.parent)) {
      problems.push(`${label}: parent must be an array, use [] when nothing blocks it`)
    }

    // An exit condition that cannot be checked is a wish. This does not prove
    // checkability, it only catches the one-word placeholder.
    if (typeof task.exit === 'string' && task.exit.trim().length < 25) {
      problems.push(`${label}: exit condition is too short to be checkable, say which test or command proves it`)
    }
  }

  for (const task of board.tasks) {
    for (const parentId of task.parent ?? []) {
      const parent = byId(board, parentId)
      if (!parent) {
        problems.push(`${task.id}: parent "${parentId}" does not exist`)
        continue
      }
      // A blocker that is less severe than what it blocks never gets picked
      // ahead of it, so the severe child starves behind a task nobody selects.
      // The fix is to raise the blocker, which is why this is an error.
      if (SEVERITIES.indexOf(parent.severity) > SEVERITIES.indexOf(task.severity)) {
        problems.push(
          `${task.id} (${task.severity}) is blocked by ${parent.id} (${parent.severity}), which is less severe, so the blocker would never be picked first. Raise ${parent.id} to at least ${task.severity}.`,
        )
      }
      if (task.status === 'done' && !SETTLED_STATUSES.includes(parent.status)) {
        problems.push(`${task.id} is done but its parent ${parent.id} is ${parent.status}`)
      }
    }
  }

  // The single-work-in-progress rule lived only in `move`, so `add --status
  // in_progress` created a second running task and the board still validated.
  // An invariant enforced at one call site is a convention, not an invariant.
  const running = board.tasks.filter((task) => task.status === 'in_progress')
  if (running.length > 1) {
    problems.push(
      `${running.map((task) => task.id).join(' and ')} are all in_progress. Exactly one task may be, because the selection law ranks in_progress ahead of severity.`,
    )
  }

  for (const task of board.tasks) {
    if (task.status === 'blocked' && !task.blockedReason) {
      problems.push(`${task.id} is blocked with no reason recorded, so it has silently left the board`)
    }
    if (task.status === 'dropped' && !task.droppedReason) {
      problems.push(`${task.id} is dropped with no reason recorded`)
    }
    if (task.status === 'done' && !task.evidence) {
      problems.push(`${task.id} is done with no evidence recorded of how its exit condition was checked`)
    }
  }

  // Depth-first cycle detection over the parent edges.
  const state = new Map()
  const walk = (id, trail) => {
    if (state.get(id) === 'done') return
    if (state.get(id) === 'open') {
      problems.push(`dependency cycle: ${[...trail, id].join(' -> ')}`)
      return
    }
    state.set(id, 'open')
    const task = byId(board, id)
    for (const parentId of task?.parent ?? []) {
      if (byId(board, parentId)) walk(parentId, [...trail, id])
    }
    state.set(id, 'done')
  }
  for (const task of board.tasks) walk(task.id, [])

  return problems
}

// ---------------------------------------------------------------- selection

const isUnblocked = (board, task) =>
  (task.parent ?? []).every((parentId) => {
    const parent = byId(board, parentId)
    return parent && SETTLED_STATUSES.includes(parent.status)
  })

/**
 * The selection law, in one place so it is auditable.
 *
 * Finish before starting: work already in progress outranks work awaiting its
 * roast, which outranks anything new. Only then does severity decide, then the
 * smaller story point, then the older id. A task whose parents are unsettled is
 * not a candidate at all.
 */
const rank = (task) => [
  OPEN_STATUSES.indexOf(task.status),
  SEVERITIES.indexOf(task.severity),
  task.points,
  task.id,
]

const pickNext = (board) => {
  const candidates = board.tasks.filter((task) => OPEN_STATUSES.includes(task.status) && isUnblocked(board, task))
  return candidates.sort((left, right) => {
    const a = rank(left)
    const b = rank(right)
    for (let index = 0; index < a.length; index += 1) {
      if (a[index] < b[index]) return -1
      if (a[index] > b[index]) return 1
    }
    return 0
  })[0]
}

// ---------------------------------------------------------------- rendering

const wrap = (text, width, indent = '') => {
  const words = String(text).split(/\s+/).filter(Boolean)
  const lines = []
  let line = ''
  for (const word of words) {
    if (line && `${line} ${word}`.length > width) {
      lines.push(line)
      line = word
    } else {
      line = line ? `${line} ${word}` : word
    }
  }
  if (line) lines.push(line)
  return lines.map((entry) => indent + entry).join('\n')
}

const formatCard = (board, task) => {
  const blockers = (task.parent ?? []).map((id) => {
    const parent = byId(board, id)
    return `${id} (${parent ? parent.status : 'MISSING'})`
  })
  const lines = [
    `${task.id}  ${task.title}`,
    `  status    ${task.status}`,
    `  severity  ${task.severity}`,
    `  points    ${task.points}`,
    `  area      ${task.area}`,
    `  parent    ${blockers.length ? blockers.join(', ') : 'none'}`,
    '',
    '  what',
    wrap(task.desc, 76, '    '),
    '',
    '  why',
    wrap(task.why, 76, '    '),
    '',
    '  exit condition',
    wrap(task.exit, 76, '    '),
  ]
  if (task.roasts?.length) {
    lines.push('', '  roasts')
    for (const roast of task.roasts) {
      lines.push(`    round ${roast.round}: score ${roast.score}, ${roast.criticals} critical(s), ${roast.file}`)
    }
  }
  if (task.notes?.length) {
    lines.push('', '  notes')
    for (const note of task.notes) lines.push(wrap(`- ${note}`, 76, '    '))
  }
  return lines.join('\n')
}

const COLUMNS = [
  ['in_progress', 'In progress'],
  ['review', 'Awaiting roast'],
  ['blocked', 'Blocked'],
  ['backlog', 'Backlog'],
  ['done', 'Done'],
  ['dropped', 'Dropped'],
]

const escapeCell = (text) => String(text).replace(/\|/g, '\\|').replace(/\n/g, ' ')

const renderBoard = (board) => {
  const total = board.tasks.length
  const done = board.tasks.filter((task) => task.status === 'done').length
  const points = board.tasks.reduce((sum, task) => sum + (task.points ?? 0), 0)
  const donePoints = board.tasks
    .filter((task) => task.status === 'done')
    .reduce((sum, task) => sum + (task.points ?? 0), 0)

  const out = [
    '# Board',
    '',
    '<!-- GENERATED FILE. Edit agent/board.json through agent/scripts/todo.mjs, never this file. -->',
    '',
    `Project **${board.project}** · ${done} of ${total} tasks done · ${donePoints} of ${points} points.`,
    '',
    'Columns are statuses. Within a column the order is the order `npm run todo -- next`',
    'would pick: severity first, then the smaller story point, then the older id. A task',
    'whose blockers are unsettled is never picked, whatever its severity.',
    '',
  ]

  const next = pickNext(board)
  if (next) {
    out.push(`**Next up: \`${next.id}\` ${next.title}** (${next.severity}, ${next.points} pt, ${next.area})`, '')
  } else {
    out.push('**Nothing is pickable.** Every open task is blocked, or the board is finished.', '')
  }

  for (const [status, heading] of COLUMNS) {
    const column = board.tasks
      .filter((task) => task.status === status)
      .sort((left, right) => {
        const severity = SEVERITIES.indexOf(left.severity) - SEVERITIES.indexOf(right.severity)
        if (severity !== 0) return severity
        if (left.points !== right.points) return left.points - right.points
        return left.id < right.id ? -1 : 1
      })
    if (!column.length) continue

    out.push(`## ${heading} (${column.length})`, '')
    out.push('| id | title | sev | pt | area | blocked by | exit condition |')
    out.push('| -- | ----- | --- | -- | ---- | ---------- | -------------- |')
    for (const task of column) {
      const blockers = (task.parent ?? []).join(', ') || 'none'
      out.push(
        `| \`${task.id}\` | ${escapeCell(task.title)} | ${task.severity} | ${task.points} | ${task.area} | ${blockers} | ${escapeCell(task.exit)} |`,
      )
    }
    out.push('')
  }

  out.push('## Cards', '')
  for (const task of board.tasks) {
    out.push(`### \`${task.id}\` ${task.title}`, '')
    out.push(
      `- **status** ${task.status} · **severity** ${task.severity} · **points** ${task.points} · **area** ${task.area}`,
    )
    out.push(`- **blocked by** ${(task.parent ?? []).join(', ') || 'none'}`)
    out.push('')
    out.push(task.desc, '')
    out.push(`**Why.** ${task.why}`, '')
    out.push(`**Exit condition.** ${task.exit}`, '')
    if (task.roasts?.length) {
      const rounds = task.roasts
        .map((roast) => `round ${roast.round} scored ${roast.score} with ${roast.criticals} critical(s)`)
        .join('; ')
      out.push(`**Roasts.** ${rounds}`, '')
    }
  }

  return `${out.join('\n')}\n`
}

// ---------------------------------------------------------------- commands

const mutate = (board) => {
  const problems = checkBoard(board)
  if (problems.length) {
    process.stderr.write('Board would be invalid, refusing to write:\n')
    for (const problem of problems) process.stderr.write(`  - ${problem}\n`)
    process.exit(1)
  }
  saveBoard(board)
}

const commands = {
  add(board, { flags }) {
    for (const field of ['title', 'desc', 'why', 'severity', 'points', 'area', 'exit']) {
      if (!flags[field] || flags[field] === true) {
        fail(
          `add needs --${field}. Every task carries all nine fields at creation, which is the point: a task with no "why" is one nobody can judge, and a task with no exit condition is one nobody can close.`,
        )
      }
    }
    const id = flags.id && flags.id !== true ? String(flags.id) : `KN-${String(board.nextId).padStart(3, '0')}`
    if (byId(board, id)) fail(`add: ${id} already exists`)
    if (!flags.id || flags.id === true) board.nextId += 1

    board.tasks.push({
      id,
      title: String(flags.title),
      desc: String(flags.desc),
      why: String(flags.why),
      severity: String(flags.severity),
      points: Number(flags.points),
      area: String(flags.area),
      parent: flags.parent === undefined ? [] : asList(requireValue(flags.parent, 'parent')),
      // `add` may only open a task, never close one. Creating a task directly
      // as `done` was a second door around the roast gate, and it needed no
      // roast at all because there was no prior state to check.
      status: flags.status === undefined ? 'backlog' : openingStatus(requireValue(flags.status, 'status')),
      exit: String(flags.exit),
      roasts: [],
      notes: [],
      createdAt: new Date().toISOString(),
    })
    mutate(board)
    process.stdout.write(`added ${id}\n`)
  },

  move(board, { positional, flags }) {
    const [id, status] = positional
    if (!id || !status) fail('move needs an id and a status, for example: move KN-003 in_progress')
    const task = byId(board, id)
    if (!task) fail(`move: ${id} does not exist`)
    if (!STATUSES.includes(status)) fail(`move: status must be one of ${STATUSES.join(', ')}`)

    // Only one task may be in progress. The selection law puts in_progress
    // ahead of severity so that work gets finished before new work starts, and
    // that is only safe while there is exactly one of them. With two, a merely
    // high task left open outranks an unblocked critical one indefinitely.
    if (status === 'in_progress') {
      const running = board.tasks.find((entry) => entry.status === 'in_progress' && entry.id !== id)
      if (running) fail(`move: ${running.id} is already in progress. Finish or park it before starting ${id}.`)
    }

    // A blocked task is invisible to `next`, so a block with no stated cause is
    // a task that silently leaves the board.
    if (status === 'blocked') {
      task.blockedReason = requireValue(flags.reason, 'reason')
    }

    // `dropped` is a terminal state and it SETTLES dependencies, so dropping a
    // task silently unblocks everything waiting on it. It had no gate at all,
    // which made it the quiet way to close anything.
    if (status === 'dropped') {
      task.droppedReason = requireValue(flags.reason, 'reason')
      const dependents = board.tasks.filter(
        (entry) => !SETTLED_STATUSES.includes(entry.status) && (entry.parent ?? []).includes(id),
      )
      if (dependents.length) {
        fail(
          `move: dropping ${id} would settle it, which silently unblocks ${dependents.map((entry) => entry.id).join(', ')}.\n` +
            'Decide what happens to those first: re-parent them, or drop them too.',
        )
      }
    }

    // A task is only done when a roast round has actually cleared it, and the
    // round has to point at an archive that exists and carries a verdict.
    // Without the archive check the numbers are a claim about a run that may
    // never have happened.
    if (status === 'done') {
      const last = task.roasts?.[task.roasts.length - 1]
      if (!last) fail(`move: ${id} has no roast round. Run "npm run roast -- ${id} ..." and record it before closing.`)
      if (last.criticals > 0) fail(`move: ${id}'s last roast left ${last.criticals} critical(s) open`)
      if (last.score < 9.5) fail(`move: ${id}'s last roast scored ${last.score}, below the 9.5 bar`)

      // Re-verify the archive at close time, not only at record time, so a
      // reply cannot be deleted or rewritten between the two.
      readArchive(last.file, task, (task.roasts?.length ?? 1) - 1)

      // A clear round is a statement about a specific card at a specific
      // revision. Reopening a task, editing its description or exit condition,
      // or changing the code afterwards all make that statement stale, and the
      // old round was still closing the new work.
      if (last.cardDigest !== cardDigest(task)) {
        fail(`move: ${id} has been edited since the roast that cleared it. Roast the current card.`)
      }
      const head = (git(['rev-parse', 'HEAD']).stdout ?? '').trim()
      if (last.head && head && last.head !== head) {
        fail(
          `move: ${id} was reviewed at ${last.head.slice(0, 8)} and HEAD is now ${head.slice(0, 8)}.\n` +
            'The code changed after the round that cleared it, so run a new round against what exists now.',
        )
      }
      const dirty = (git(['status', '--porcelain']).stdout ?? '').trim()
      if (dirty) {
        fail(`move: the worktree is dirty, so ${id} would close over unreviewed changes:\n${dirty}`)
      }

      // Where a task names a command that proves its exit condition, run it. The
      // prose conditions cannot all be reduced to one, but many of them can, and
      // calling the whole problem irreducible was hiding the tractable half.
      if (task.verify) {
        const check = spawnSync(task.verify, {
          cwd: ROOT,
          shell: true,
          encoding: 'utf8',
          stdio: ['ignore', 'inherit', 'inherit'],
        })
        if (check.status !== 0) {
          fail(`move: ${id}'s verify command failed (exit ${check.status}): ${task.verify}`)
        }
      }

      // What the verify command cannot cover stays prose, so the claim about it
      // goes on the record where the next roast can dispute it.
      task.evidence = requireValue(flags.evidence, 'evidence')
    }

    task.status = status
    task.updatedAt = new Date().toISOString()
    if (status === 'done') task.closedAt = task.updatedAt
    mutate(board)
    process.stdout.write(`${id} -> ${status}\n`)
  },

  set(board, { positional, flags }) {
    const [id] = positional
    const task = byId(board, id)
    if (!task) fail(`set: ${id} does not exist`)
    for (const [key, value] of Object.entries(flags)) {
      // `--parent` with no value parsed as `true`, asList made that `[]`, and
      // the task silently lost every blocker it had, which changes what `next`
      // will pick. Clearing parents has to be said out loud, as `--parent none`.
      if (key === 'parent') task.parent = requireValue(value, 'parent') === 'none' ? [] : asList(value)
      else if (key === 'points') task.points = Number(requireValue(value, 'points'))
      // Repeated --note is the normal way to add several at once. Coercing the
      // array with String() joined them into one comma-spliced note.
      else if (key === 'note') task.notes = [...(task.notes ?? []), ...(Array.isArray(value) ? value : [value]).map(String)]
      // `move` carries the roast gate. Letting `set` write status too made that
      // gate optional: `set <id> --status done` closed a task with no roast at
      // all, and only tripped when the task happened to have unsettled parents.
      // One door, so there is one place the rule can live.
      else if (key === 'status') fail('set: status is changed with "move", which is where the roast gate lives')
      else if (key === 'id') fail('set: id is immutable, other tasks point at it')
      else if (REQUIRED.includes(key)) task[key] = requireValue(value, key)
      else fail(`set: "${key}" is not a task field`)
    }
    task.updatedAt = new Date().toISOString()
    mutate(board)
    process.stdout.write(`updated ${id}\n`)
  },

  roast(board, { positional, flags }) {
    const [id] = positional
    const task = byId(board, id)
    if (!task) fail(`roast: ${id} does not exist`)
    if (flags.score === undefined || flags.criticals === undefined) {
      fail('roast needs --score and --criticals, and --file pointing at the archived reply')
    }
    const score = Number(requireValue(flags.score, 'score'))
    const criticals = Number(requireValue(flags.criticals, 'criticals'))
    if (!Number.isFinite(score) || score < 0 || score > 10) fail('roast: --score must be a number from 0 to 10')
    if (!Number.isInteger(criticals) || criticals < 0) fail('roast: --criticals must be a non-negative whole number')

    const file = requireValue(flags.file, 'file')
    const { archive, meta } = readArchive(file, task, task.roasts?.length ?? 0)

    // The recorded numbers are the ADJUDICATED ones, and adjudication really can
    // drop a finding, because reviewers misread things. What it may not do is
    // drop one silently. Recording fewer criticals, or a better score, than the
    // reviewer's own verdict requires saying which findings were rejected.
    const verdict = finalVerdict(archive)
    if (!verdict) fail(`roast: ${file} has no parseable VERDICT block with score and criticals`)
    if (criticals < verdict.criticals || score > verdict.score) {
      if (!(flags.dismissed && flags.dismissed !== true)) {
        fail(
          `roast: the reviewer's verdict is ${verdict.criticals} critical(s) at score ${verdict.score}, and you are recording ${criticals} at ${score}.\n` +
            'That may well be right, reviewers misread things. Say which findings you rejected and why, with --dismissed "...".',
        )
      }
    }
    task.roasts = [
      ...(task.roasts ?? []),
      {
        round: (task.roasts?.length ?? 0) + 1,
        score,
        criticals,
        file,
        // Carried from the harness manifest so `move done` can prove the round
        // reviewed THIS card at THIS revision, rather than an older one.
        cardDigest: meta.cardDigest,
        head: meta.head,
        reviewerScore: verdict.score,
        reviewerCriticals: verdict.criticals,
        ...(flags.dismissed && flags.dismissed !== true ? { dismissed: String(flags.dismissed) } : {}),
        at: new Date().toISOString(),
      },
    ]
    mutate(board)
    const last = task.roasts[task.roasts.length - 1]
    process.stdout.write(`${id} roast round ${last.round}: score ${last.score}, ${last.criticals} critical(s)\n`)
    if (last.criticals > 0 || last.score < 9.5) {
      process.stdout.write('Not done. Fix the findings and run a NEW roast round, never a self-assessment.\n')
    } else {
      process.stdout.write(`Clear. "npm run todo -- move ${id} done" will now be accepted.\n`)
    }
  },

  next(board) {
    const task = pickNext(board)
    if (!task) {
      // A `blocked` task is not in OPEN_STATUSES, so listing only those would
      // report "nothing is pickable" while hiding the tasks that are the reason
      // for it. Whatever is stalling the board has to be named here.
      const open = board.tasks.filter((entry) => !SETTLED_STATUSES.includes(entry.status))
      if (!open.length) {
        process.stdout.write('Board is finished. Every task is done or dropped.\n')
        return
      }
      process.stdout.write('Nothing is pickable. What is holding the board:\n')
      for (const entry of open) {
        if (entry.status === 'blocked') {
          process.stdout.write(`  ${entry.id} is BLOCKED: ${entry.blockedReason ?? 'no reason recorded'}\n`)
          continue
        }
        const blockers = (entry.parent ?? [])
          .filter((parentId) => !SETTLED_STATUSES.includes(byId(board, parentId)?.status))
          .join(', ')
        process.stdout.write(`  ${entry.id} waits on ${blockers || 'an unknown blocker'}\n`)
      }
      process.stdout.write(
        '\nA board that cannot move is a decision for the owner. Unblock something, or ask.\n',
      )
      process.exit(1)
    }
    process.stdout.write(`${formatCard(board, task)}\n`)
  },

  show(board, { positional }) {
    const task = byId(board, positional[0])
    if (!task) fail(`show: ${positional[0]} does not exist`)
    process.stdout.write(`${formatCard(board, task)}\n`)
  },

  list(board, { flags }) {
    let tasks = board.tasks
    if (flags.status && flags.status !== true) tasks = tasks.filter((task) => task.status === flags.status)
    if (flags.area && flags.area !== true) tasks = tasks.filter((task) => task.area === flags.area)
    if (flags.severity && flags.severity !== true) tasks = tasks.filter((task) => task.severity === flags.severity)
    for (const task of tasks) {
      const blocked = isUnblocked(board, task) ? ' ' : 'B'
      process.stdout.write(
        `${blocked} ${task.id}  ${task.status.padEnd(11)} ${task.severity.padEnd(8)} ${String(task.points).padStart(2)}pt  ${task.area.padEnd(8)} ${task.title}\n`,
      )
    }
  },

  validate(board) {
    const problems = checkBoard(board)
    if (!problems.length) {
      process.stdout.write(`Board is valid. ${board.tasks.length} task(s).\n`)
      return
    }
    process.stderr.write(`${problems.length} problem(s):\n`)
    for (const problem of problems) process.stderr.write(`  - ${problem}\n`)
    process.exit(1)
  },

  render(board) {
    saveBoard(board)
    process.stdout.write(`rendered ${RENDER_PATH}\n`)
  },

  help() {
    process.stdout.write(
      [
        'npm run todo -- <command>',
        '',
        '  next                       print the task the law selects',
        '  show <id>                  print one card',
        '  list [--status s] [--area a] [--severity s]',
        '  add --title --desc --why --severity --points --area --exit [--parent ids] [--status s]',
        '                             opens a task. Only backlog or in_progress; closing is move\'s job.',
        '  move <id> <status>         backlog | in_progress | review | blocked | done | dropped',
        '                             done needs --evidence "how the exit condition was checked"',
        '                             blocked needs --reason "what is stopping it"',
        '                             only one task may be in_progress at a time',
        '  set <id> --field value     edit a field. --note "text" appends, repeatable.',
        '                             status is not settable here, use move. --parent none clears.',
        '  roast <id> --score N --criticals N --file path',
        '                             --file must exist and carry a VERDICT block.',
        '                             record YOUR adjudicated numbers, not the archive\'s.',
        '                             kinder than the archive needs --dismissed "what you rejected and why"',
        '  validate                   integrity check, exits non-zero when broken',
        '  render                     regenerate agent/TODO_BOARD.md',
        '',
        `  severities: ${SEVERITIES.join(', ')}`,
        `  areas:      ${AREAS.join(', ')}`,
        `  points:     ${POINTS.join(', ')}`,
        '',
      ].join('\n'),
    )
  },
}

const [, , command = 'help', ...rest] = process.argv
const handler = commands[command]
if (!handler) fail(`unknown command "${command}". Run with no argument for help.`)
handler(loadBoard(), parseArgs(rest))
