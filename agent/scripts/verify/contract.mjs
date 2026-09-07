#!/usr/bin/env node
// A thin CLI over agent/scripts/lib/contract.mjs, so the same rules run from the
// command line and from every board mutation. They were briefly only here,
// which made the check optional: `add` and `set` ran the structural validator
// and nothing else, so a careless author could write a green card instructing
// the wrong product and only find out if somebody remembered to run this.

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { contractProblems, loadContractInputs, RULES } from '../lib/contract.mjs'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const board = JSON.parse(readFileSync(join(ROOT, 'agent', 'board.json'), 'utf8'))
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
