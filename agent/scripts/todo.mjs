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

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const AGENT_DIR = dirname(dirname(fileURLToPath(import.meta.url)))
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
      parent: asList(flags.parent),
      status: flags.status && flags.status !== true ? String(flags.status) : 'backlog',
      exit: String(flags.exit),
      roasts: [],
      notes: [],
      createdAt: new Date().toISOString(),
    })
    mutate(board)
    process.stdout.write(`added ${id}\n`)
  },

  move(board, { positional }) {
    const [id, status] = positional
    if (!id || !status) fail('move needs an id and a status, for example: move KN-003 in_progress')
    const task = byId(board, id)
    if (!task) fail(`move: ${id} does not exist`)
    if (!STATUSES.includes(status)) fail(`move: status must be one of ${STATUSES.join(', ')}`)

    // A task is only done when a roast round has actually cleared it. Without
    // this the loop can mark its own homework, which is the failure the roast
    // step exists to prevent.
    if (status === 'done') {
      const last = task.roasts?.[task.roasts.length - 1]
      if (!last) fail(`move: ${id} has no roast round. Run "npm run roast -- ${id} ..." and record it before closing.`)
      if (last.criticals > 0) fail(`move: ${id}'s last roast left ${last.criticals} critical(s) open`)
      if (last.score < 9.5) fail(`move: ${id}'s last roast scored ${last.score}, below the 9.5 bar`)
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
      if (key === 'parent') task.parent = asList(value)
      else if (key === 'points') task.points = Number(value)
      else if (key === 'note') task.notes = [...(task.notes ?? []), String(value)]
      else if (REQUIRED.includes(key)) task[key] = String(value)
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
    task.roasts = [
      ...(task.roasts ?? []),
      {
        round: (task.roasts?.length ?? 0) + 1,
        score: Number(flags.score),
        criticals: Number(flags.criticals),
        file: flags.file && flags.file !== true ? String(flags.file) : '(not archived)',
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
      const open = board.tasks.filter((entry) => OPEN_STATUSES.includes(entry.status))
      if (!open.length) {
        process.stdout.write('Board is finished. Every task is done or dropped.\n')
        return
      }
      process.stdout.write('Nothing is pickable, every open task is blocked:\n')
      for (const entry of open) {
        const blockers = (entry.parent ?? [])
          .filter((parentId) => !SETTLED_STATUSES.includes(byId(board, parentId)?.status))
          .join(', ')
        process.stdout.write(`  ${entry.id} waits on ${blockers || 'an unknown blocker'}\n`)
      }
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
        '  add --title --desc --why --severity --points --area --exit [--parent id] [--status s]',
        '  move <id> <status>         backlog | in_progress | review | blocked | done | dropped',
        '  set <id> --field value     edit a field, or --note "text" to append a note',
        '  roast <id> --score N --criticals N --file path',
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
