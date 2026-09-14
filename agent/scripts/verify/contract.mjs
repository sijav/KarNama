#!/usr/bin/env node
// A thin CLI over agent/scripts/lib/contract.mjs: does any card instruct what
// DESIGN.md forbids? `npm run contract`.
//
// The board is the todo skill's database since KN-482, 2026-09-14, so the
// cards are read from .claude/todo.db, read-only, under the names the rules
// read them by. It used to read agent/board.json, which is now the archive of
// the JSON board and is no longer written, so a check of it would pass forever.

import { dirname, join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'

import { contractProblems, loadContractInputs, RULES } from '../lib/contract.mjs'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const db = new DatabaseSync(join(ROOT, '.claude', 'todo.db'), { readOnly: true })
const board = {
  tasks: db
    .prepare('SELECT id, title, descr, why, exit_cond FROM task ORDER BY id')
    .all()
    .map((task) => ({ id: task.id, title: task.title, desc: task.descr, why: task.why, exit: task.exit_cond })),
}
db.close()
const { design } = loadContractInputs(ROOT)

const problems = contractProblems(board, design)

if (problems.length) {
  process.stderr.write(`The board contradicts the design contract in ${problems.length} place(s):\n`)
  for (const problem of problems) process.stderr.write(`  - ${problem}\n`)
  process.exit(1)
}
process.stdout.write(
  `No card trips any contract rule. ${board.tasks.length} tasks, ${RULES.length} rules.\n` +
    'This is a regression checker, not a proof: it stops the board drifting back to decisions\n' +
    'that have already been got wrong. Read DESIGN.md for what the design actually says.\n',
)
