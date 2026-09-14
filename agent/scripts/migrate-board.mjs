#!/usr/bin/env node
// KN-482: moves agent/board.json into the todo skill's database, .claude/todo.db.
//
// One-off, and kept as the record of how the move was made. The owner chose the
// database on 2026-09-14: the loop had run on board.json since 2026-09-07 while
// the database held a copy of the first 145 cards, imported by 2026-09-08 and
// never updated.
//
// Without --apply it changes nothing and says what it would do. With --apply it
// writes everything in one transaction, then compares every card it wrote with
// the JSON and exits 1 on any difference. A second --apply changes nothing,
// which is how it is shown to be idempotent.
//
// The JSON is newer than the database for every card both hold, so a card the
// database already has is updated to the JSON's values, and nothing is deleted.
// Once the board has moved on in the database, running this again would put the
// archive's blocks, notes and roast rounds back over the database's, which is
// why it writes only when told to.

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(fileURLToPath(import.meta.url))))
const JSON_BOARD = join(ROOT, 'agent', 'board.json')
const DATABASE = join(ROOT, '.claude', 'todo.db')
const SKILL = join(homedir(), '.claude', 'skills', 'todo', 'todo.mjs')
const apply = process.argv.includes('--apply')

const fail = (message) => {
  console.error(message)
  process.exit(1)
}

if (!existsSync(JSON_BOARD)) fail(`No ${JSON_BOARD}.`)
if (!existsSync(DATABASE)) fail(`No ${DATABASE}: the todo skill's board has to exist first.`)
if (!existsSync(SKILL)) fail(`No ${SKILL}: this moves the board into that skill's database, so the skill has to be installed.`)

// The skill creates its tables and columns the first time it opens a board.
// Letting it open the board, with a command that only reads, is what makes the
// database the shape this script writes, rather than a copy of that DDL here
// drifting from the skill's.
const opened = spawnSync(process.execPath, [SKILL, 'phase'], { cwd: ROOT, encoding: 'utf8' })
if (opened.status !== 0) fail(`The todo skill could not open the board:\n${opened.stderr}`)

const board = JSON.parse(readFileSync(JSON_BOARD, 'utf8'))
const db = new DatabaseSync(DATABASE, { timeout: 5000 })

const NEEDED = {
  task: ['id', 'title', 'descr', 'why', 'severity', 'points', 'status', 'exit_cond', 'area', 'created', 'parent_task', 'phase', 'evidence', 'closed', 'reason', 'updated'],
  phase: ['name', 'goal', 'position', 'status', 'label'],
  blocked_by: ['task', 'parent'],
  blocked: ['task', 'reason', 'since'],
  note: ['task', 'at', 'text'],
  roast: ['task', 'round', 'at', 'file', 'score', 'criticals', 'filed', 'dismissed', 'reviewer_score', 'reviewer_criticals', 'head', 'card_digest', 'legacy'],
}
for (const [table, needed] of Object.entries(NEEDED)) {
  const have = db.prepare(`PRAGMA table_info(${table})`).all().map((row) => row.name)
  const missing = needed.filter((column) => !have.includes(column))
  if (missing.length) fail(`${table} lacks ${missing.join(', ')}: the installed todo skill is older than this move needs.`)
}

// The eight cards blocked on board.json, each read and classified by hand
// rather than inferred from its prose, as the plan review asked. Five wait on
// the owner; three wait on a task, which also becomes their blocker. KN-196 is
// done and still carries an old blockedReason, and is not blocked.
const BLOCKS = {
  'KN-073': null,
  'KN-077': null,
  'KN-269': null,
  'KN-270': null,
  'KN-396': null,
  'KN-356': 'KN-428',
  'KN-401': 'KN-477',
  'KN-477': 'KN-482',
}
const blockedOnBoard = board.tasks
  .filter((task) => task.status === 'blocked')
  .map((task) => task.id)
  .sort()
const expected = Object.keys(BLOCKS).sort()
if (JSON.stringify(blockedOnBoard) !== JSON.stringify(expected)) {
  fail(`board.json's blocked cards are ${blockedOnBoard.join(', ')}, and this move was written for ${expected.join(', ')}. Classify the difference before moving.`)
}

const byId = new Map(board.tasks.map((task) => [task.id, task]))
const childOf = (task) => /^CHILD OF (KN-\d+)/.exec(task.desc)?.[1] ?? null

// One level: a finding naming another finding hangs off the top parent, the
// way the skill's own add flattens it. Its prose keeps saying what it said.
const parentTaskOf = (task) => {
  let parent = childOf(task)
  const seen = new Set()
  while (parent && byId.has(parent) && childOf(byId.get(parent)) && !seen.has(parent)) {
    seen.add(parent)
    parent = childOf(byId.get(parent))
  }
  return parent
}

// A block is a row beside the status in the skill, so a blocked card keeps a
// status the task table allows. board.json never recorded what a card was
// before it was blocked, so it is backlog, and the block keeps it out of next.
const statusOf = (task) => (task.status === 'blocked' ? 'backlog' : task.status)
const blockersOf = (task) => [...new Set([...(task.parent ?? []), ...(BLOCKS[task.id] ? [BLOCKS[task.id]] : [])])].sort()
const notesFor = (task) => [
  ...(task.notes ?? []).map(String),
  ...(task.verify ? [`verify command, from the JSON board: ${task.verify}`] : []),
  ...(task.fixedSince
    ? [
        `fixed since round ${task.fixedSince.round} at ${task.fixedSince.head}, in ${(task.fixedSince.changed ?? []).join(', ')}: ${task.fixedSince.why}`,
      ]
    : []),
]
const filedOf = (round) => (round.filed === undefined ? null : round.filed.join(', '))

const okrIds = new Set((board.okrs ?? []).map((okr) => okr.id))
for (const task of board.tasks) {
  if (task.okr && !okrIds.has(task.okr)) fail(`${task.id} serves ${task.okr}, which board.json does not hold.`)
  for (const blocker of blockersOf(task)) if (!byId.has(blocker)) fail(`${task.id} waits on ${blocker}, which board.json does not hold.`)
  const rounds = (task.roasts ?? []).map((round) => round.round)
  if (new Set(rounds).size !== rounds.length) fail(`${task.id} has two roast rounds with one number: ${rounds.join(', ')}.`)
}

const existing = new Set(db.prepare('SELECT id FROM task').all().map((row) => row.id))
const updating = board.tasks.filter((task) => existing.has(task.id)).length
const unknownToJson = [...existing].filter((id) => !byId.has(id))
console.log(`board.json: ${board.tasks.length} cards, ${(board.okrs ?? []).length} objectives.`)
console.log(`The database holds ${existing.size}: ${updating} updated to the JSON's values, ${board.tasks.length - updating} inserted.`)
if (unknownToJson.length) console.log(`The database also holds ${unknownToJson.length} card(s) the JSON does not, left as they are: ${unknownToJson.join(', ')}`)
if (!apply) {
  console.log('Nothing written. Run with --apply to move the board.')
  process.exit(0)
}

const write = () => {
  const upsertPhase = db.prepare(
    `INSERT INTO phase (name, goal, position, status, label) VALUES (?,?,?,?,?)
     ON CONFLICT(name) DO UPDATE SET goal = excluded.goal, position = excluded.position, status = excluded.status, label = excluded.label`,
  )
  for (const okr of board.okrs ?? []) upsertPhase.run(okr.id, okr.description, okr.position, okr.status, okr.name)

  const upsertTask = db.prepare(
    `INSERT INTO task (id, title, descr, why, severity, points, status, exit_cond, area, created, parent_task, phase, evidence, closed, reason, updated)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET title = excluded.title, descr = excluded.descr, why = excluded.why, severity = excluded.severity,
       points = excluded.points, status = excluded.status, exit_cond = excluded.exit_cond, area = excluded.area, created = excluded.created,
       parent_task = excluded.parent_task, phase = excluded.phase, evidence = excluded.evidence, closed = excluded.closed,
       reason = excluded.reason, updated = excluded.updated`,
  )
  // Every card first, so the rows that refer to one always find it.
  for (const task of board.tasks) {
    upsertTask.run(
      task.id,
      task.title,
      task.desc,
      task.why,
      task.severity,
      task.points,
      statusOf(task),
      task.exit,
      task.area ?? null,
      task.createdAt,
      parentTaskOf(task),
      task.okr ?? null,
      task.evidence ?? null,
      task.closedAt ?? null,
      task.droppedReason ?? null,
      task.updatedAt ?? null,
    )
  }

  const clearEdges = db.prepare('DELETE FROM blocked_by WHERE task = ?')
  const addEdge = db.prepare('INSERT INTO blocked_by (task, parent) VALUES (?,?)')
  const clearBlock = db.prepare('DELETE FROM blocked WHERE task = ?')
  const addBlock = db.prepare('INSERT INTO blocked (task, reason, since) VALUES (?,?,?)')
  const clearNotes = db.prepare('DELETE FROM note WHERE task = ?')
  const addNote = db.prepare('INSERT INTO note (task, at, text) VALUES (?,?,?)')
  const clearRoasts = db.prepare('DELETE FROM roast WHERE task = ?')
  const addRoast = db.prepare(
    `INSERT INTO roast (task, round, at, file, score, criticals, filed, dismissed, reviewer_score, reviewer_criticals, head, card_digest, legacy)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  )
  for (const task of board.tasks) {
    clearEdges.run(task.id)
    for (const blocker of blockersOf(task)) addEdge.run(task.id, blocker)
    clearBlock.run(task.id)
    if (task.status === 'blocked') addBlock.run(task.id, task.blockedReason, task.updatedAt ?? task.createdAt)
    clearNotes.run(task.id)
    for (const text of notesFor(task)) addNote.run(task.id, task.updatedAt ?? task.createdAt, text)
    clearRoasts.run(task.id)
    for (const round of task.roasts ?? []) {
      addRoast.run(
        task.id,
        round.round,
        round.at ?? task.createdAt,
        round.file,
        round.score ?? null,
        round.criticals ?? null,
        filedOf(round),
        round.dismissed ?? null,
        round.reviewerScore ?? null,
        round.reviewerCriticals ?? null,
        round.head ?? null,
        round.cardDigest ?? null,
        round.legacy ?? null,
      )
    }
  }
}

db.exec('BEGIN IMMEDIATE')
try {
  write()
  db.exec('COMMIT')
} catch (error) {
  db.exec('ROLLBACK')
  fail(`Nothing written, the transaction was rolled back: ${error.message}`)
}

// Every card, compared with the JSON field by field, and the objectives.
const problems = []
const taskRow = db.prepare('SELECT * FROM task WHERE id = ?')
const edgesOf = db.prepare('SELECT parent FROM blocked_by WHERE task = ? ORDER BY parent')
const blockOf = db.prepare('SELECT reason FROM blocked WHERE task = ?')
const notesOf = db.prepare('SELECT text FROM note WHERE task = ? ORDER BY rowid')
const roastsOf = db.prepare('SELECT * FROM roast WHERE task = ? ORDER BY round')
for (const task of board.tasks) {
  const row = taskRow.get(task.id)
  if (!row) {
    problems.push(`${task.id} is missing`)
    continue
  }
  const wanted = {
    title: task.title,
    descr: task.desc,
    why: task.why,
    severity: task.severity,
    points: task.points,
    status: statusOf(task),
    exit_cond: task.exit,
    area: task.area ?? null,
    created: task.createdAt,
    parent_task: parentTaskOf(task),
    phase: task.okr ?? null,
    evidence: task.evidence ?? null,
    closed: task.closedAt ?? null,
    reason: task.droppedReason ?? null,
    updated: task.updatedAt ?? null,
  }
  for (const [column, value] of Object.entries(wanted)) {
    if (row[column] !== value) problems.push(`${task.id}.${column} is ${JSON.stringify(row[column])}, the JSON's is ${JSON.stringify(value)}`)
  }
  const edges = edgesOf.all(task.id).map((edge) => edge.parent).join(',')
  if (edges !== blockersOf(task).join(',')) problems.push(`${task.id} waits on ${edges || 'nothing'}, the JSON on ${blockersOf(task).join(',') || 'nothing'}`)
  const block = blockOf.get(task.id)?.reason ?? null
  if (block !== (task.status === 'blocked' ? task.blockedReason : null)) problems.push(`${task.id}'s block is ${JSON.stringify(block)}`)
  const notes = notesOf.all(task.id).map((note) => note.text)
  if (JSON.stringify(notes) !== JSON.stringify(notesFor(task))) problems.push(`${task.id} has ${notes.length} note(s) that differ from the JSON's ${notesFor(task).length}`)
  const rounds = roastsOf.all(task.id)
  const roundsWanted = task.roasts ?? []
  if (rounds.length !== roundsWanted.length) problems.push(`${task.id} has ${rounds.length} roast round(s), the JSON ${roundsWanted.length}`)
  for (const [index, round] of roundsWanted.entries()) {
    const stored = rounds[index]
    if (!stored || stored.round !== round.round || stored.file !== round.file || stored.filed !== filedOf(round) || stored.score !== (round.score ?? null)) {
      problems.push(`${task.id} round ${round.round} differs from the JSON's`)
    }
  }
}
for (const okr of board.okrs ?? []) {
  const row = db.prepare('SELECT * FROM phase WHERE name = ?').get(okr.id)
  if (!row || row.label !== okr.name || row.goal !== okr.description || row.position !== okr.position || row.status !== okr.status) {
    problems.push(`objective ${okr.id} differs from the JSON's`)
  }
}

const tally = (statuses) => statuses.reduce((counts, status) => ({ ...counts, [status]: (counts[status] ?? 0) + 1 }), {})
const jsonTally = tally(board.tasks.map((task) => task.status))
const dbTally = tally(board.tasks.map((task) => taskRow.get(task.id)?.status ?? 'missing'))
const blockedRows = db.prepare('SELECT COUNT(*) AS n FROM blocked').get().n
console.log(`JSON statuses:     ${JSON.stringify(jsonTally)}`)
console.log(`Database statuses: ${JSON.stringify(dbTally)}, with ${blockedRows} blocked row(s)`)
console.log(
  `Notes ${db.prepare('SELECT COUNT(*) AS n FROM note').get().n}, roast rounds ${db.prepare('SELECT COUNT(*) AS n FROM roast').get().n}, blocker edges ${db.prepare('SELECT COUNT(*) AS n FROM blocked_by').get().n}.`,
)
if (problems.length) {
  console.error(`${problems.length} difference(s) between the database and board.json:`)
  for (const problem of problems.slice(0, 50)) console.error(`  - ${problem}`)
  process.exit(1)
}
console.log(`Every card, block, note, roast round and objective matches board.json.`)
