#!/usr/bin/env node
// Verifies KN-196: the owner's answer on dropping a card onto a column that is
// collapsed to a count is recorded as a decision, and KN-061 builds against it.
//
// Exit condition: DESIGN.md records the answer as a decision with who made it
// and when, covering hover-expand and its delay, whether a collapsed column
// accepts a drop, what the user sees after the drop lands, and what the
// keyboard path targets. Section 6 no longer lists it as open. KN-061's exit
// condition names the decided behaviour, and this card is removed as its
// blocker.
//
// Read-only: it reads DESIGN.md and the board and runs the contract check.

import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
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
    failures.push(`${label}: threw ${error instanceof Error ? error.message : String(error)}`)
  }
}

const design = readFileSync(join(ROOT, 'DESIGN.md'), 'utf8')
// Prose with its line breaks folded, so a phrase that wraps still reads.
const prose = (text) => text.replace(/\s+/g, ' ')
const settled = prose(/### Settled by the owner on 2026-09-10\n([\s\S]*?)\n## /.exec(design)?.[1] ?? '')
const drop = /\*\*Dropping a card onto the rejected column while it is collapsed to a count\.\*\*([\s\S]*?)(\*\*Employment type|$)/.exec(settled)?.[1] ?? ''

check('DESIGN.md has a section of the owner decisions of 2026-09-10, with the drop decision in it', () =>
  settled && drop ? null : 'there is no "Settled by the owner on 2026-09-10" section with the drop decision',
)

check('it says who decided, on which card, and that the details are the owner\'s too', () => {
  if (!/Owner, KN-196/.test(drop)) return 'the decision does not name the owner and KN-196'
  if (!/confirmed the details through the question tool/.test(settled)) return 'it does not say the owner confirmed the details'
  return /Author (proposal|reading)/.test(drop) ? 'a detail is still marked as the author\'s, though the owner confirmed them all' : null
})

check('hover-expand, with its delay', () =>
  /expands after a short hover: \d+ ?ms/.test(drop) ? null : 'the hover-expand and its delay in milliseconds are not there',
)

check('whether the collapsed column accepts a drop', () =>
  /accepts a drop while still collapsed/.test(drop) ? null : 'it does not say a drop onto the collapsed column lands',
)

check('what the user sees after the drop lands, and when it does not happen', () => {
  const missing = [
    ['the recollapse with a highlight, only when the drag opened it', /recollapses with a brief highlight, and only if the drag opened it/],
    ['the flash in the rejected status colour', /flashes the rejected status colour/],
    ['the announcement', /screen reader hears the move/],
    ['a column the user opened staying open', /opened themselves stays open/],
    ['no highlight when the save fails', /save fails[^.]*no highlight/],
  ].filter(([, pattern]) => !pattern.test(drop))
  return missing.length ? `it does not say: ${missing.map(([what]) => what).join(', ')}` : null
})

check('the keyboard target, announced with its count', () =>
  /one target, announced with its count/.test(drop) ? null : 'the keyboard answer, one target announced with its count, is not there',
)

check('section 6 does not list the drop as an open question', () => {
  const open = prose(/## 6\. Open questions the design has not settled\n([\s\S]*?)\n---\n/.exec(design)?.[1] ?? '')
  if (!open) return 'section 6 could not be read'
  return /collapsed|dropped onto|KN-196/.test(open) ? 'section 6 still lists it' : null
})

check("KN-061's exit condition names the decided behaviour, and KN-196 no longer blocks it", () => {
  const board = JSON.parse(readFileSync(join(ROOT, 'agent', 'board.json'), 'utf8'))
  const card = board.tasks.find((task) => task.id === 'KN-061')
  if (!card) return 'KN-061 is not on the board'
  if (card.parent.includes('KN-196')) return 'KN-196 still blocks KN-061'
  const missing = [
    ['expands after a short hover of 500 ms', /expands after a short hover of 500 ms/],
    ['accepts a drop while collapsed', /accepts? a drop while (still )?collapsed/],
    ['recollapses with a brief highlight, only if the drag opened it', /recollapses with a brief highlight, and only if the drag opened it/],
    ['a column the user opened stays open', /column the user opened stays open/],
    ['a failed save returns the card with no highlight', /failed save returns the card with no highlight/],
    ['one keyboard target announced with its count', /one target,? announced with its count/],
  ].filter(([, pattern]) => !pattern.test(card.exit))
  return missing.length ? `its exit condition does not name: ${missing.map(([what]) => what).join(', ')}` : null
})

check('the contract check passes', () => {
  const result = spawnSync('npm run -s contract', { cwd: ROOT, encoding: 'utf8', shell: true })
  return result.status === 0 ? null : `it fails:\n${`${result.stdout}${result.stderr}`.slice(-600)}`
})

if (failures.length) {
  process.stderr.write(`\nKN-196 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-196 verify passed.\n')
