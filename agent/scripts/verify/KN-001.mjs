#!/usr/bin/env node
// Verifies KN-001's exit condition:
//
//   "npm run todo -- validate" exits 0, "npm run todo -- next" names a task,
//   agent/TODO_BOARD.md renders, "npm run roast" reaches Codex and archives a
//   reply, and AGENTS.md plus DESIGN.md both exist with the Figma tokens
//   transcribed.
//
// The previous version of this check was a shell one-liner using `test -f` and
// `/dev/null`, which cannot run on Windows at all, and where it did run it only
// grepped the harness's static usage text, so it passed whether or not a roast
// could reach anything. Node, so it runs the same on both platforms, and it
// asserts the things the condition actually names.

import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const isWindows = process.platform === 'win32'

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

const node = (args, options = {}) =>
  spawnSync(process.execPath, args, { cwd: ROOT, encoding: 'utf8', ...options })

const todo = join(ROOT, 'agent', 'scripts', 'todo.mjs')

check('the board validates', () => {
  const result = node([todo, 'validate'])
  return result.status === 0 ? null : `exited ${result.status}: ${(result.stderr || '').trim()}`
})

check('next names a task', () => {
  const result = node([todo, 'next'])
  if (result.status !== 0) return `exited ${result.status}: ${(result.stderr || '').trim()}`
  return /^KN-\d{3}\s+\S/.test(result.stdout.trim()) ? null : `did not print a task card:\n${result.stdout.slice(0, 200)}`
})

check('the rendered board is in sync with board.json', () => {
  const path = join(ROOT, 'agent', 'TODO_BOARD.md')
  if (!existsSync(path)) return 'agent/TODO_BOARD.md does not exist'
  // `render --check` rather than `render`. The writing version made this whole
  // script unrunnable in a read-only sandbox, which is exactly where a reviewer
  // runs it, and it reported the failure as a stale board rather than as its
  // own side effect.
  const result = node([todo, 'render', '--check'])
  return result.status === 0 ? null : (result.stderr || '').trim() || `render --check exited ${result.status}`
})

check('AGENTS.md carries the working agreement', () => {
  const path = join(ROOT, 'AGENTS.md')
  if (!existsSync(path)) return 'missing'
  const text = readFileSync(path, 'utf8')
  const required = ['lingui', 'Components before screens', 'Match the design exactly', 'TECH-DEBT.md']
  const missing = required.filter((needle) => !text.includes(needle))
  return missing.length ? `does not mention ${missing.join(', ')}` : null
})

check('DESIGN.md carries the Figma tokens', () => {
  const path = join(ROOT, 'DESIGN.md')
  if (!existsSync(path)) return 'missing'
  const text = readFileSync(path, 'utf8')
  // The file key, one colour from each token family, and the status set. If the
  // tokens were never transcribed these are all absent.
  const required = ['EITM6CbJY33dMY8IsMFR4R', '#2563eb', '#4b5563', '#f6f7f9', 'Vazirmatn', 'spacing', 'radius']
  const missing = required.filter((needle) => !text.includes(needle))
  if (missing.length) return `does not mention ${missing.join(', ')}`
  const statuses = ['new', 'applied', 'interview', 'rejected', 'offer']
  const absent = statuses.filter((status) => !text.includes(`\`${status}\``))
  return absent.length ? `does not document the ${absent.join(', ')} status token(s)` : null
})

check('the roast harness is wired and reaches Codex', () => {
  // The harness refuses without a task id, which proves it loads and validates
  // rather than that it can reach anything.
  const usage = node([join(ROOT, 'agent', 'scripts', 'roast.mjs')])
  if (usage.status === 0) return 'the harness accepted no arguments, so its guards are not running'
  if (!/npm run roast/.test(usage.stderr || '')) return 'the harness did not print its usage'

  // What the exit condition actually claims is that a roast REACHES Codex, so
  // check the binary the harness shells out to, the same way the harness does.
  const version = isWindows
    ? spawnSync('codex --version', { cwd: ROOT, shell: true, encoding: 'utf8' })
    : spawnSync('codex', ['--version'], { cwd: ROOT, encoding: 'utf8' })
  if (version.error || version.status !== 0) {
    return `codex is not runnable: ${version.error?.message ?? `exit ${version.status}`}`
  }
  return null
})

check('a real KN-001 roast is archived, and the board records it', () => {
  // The earlier version of this check passed on ANY non-prompt markdown file in
  // agent/roasts that had a sidecar, from any task, of any age. A working codex
  // binary plus one stale file satisfied it, so it proved nothing about this
  // task ever having been reviewed. It has to name KN-001, hash to its own
  // manifest, and be the archive a recorded round on the board points at.
  const dir = join(ROOT, 'agent', 'roasts')
  if (!existsSync(dir)) return 'agent/roasts does not exist'

  const board = JSON.parse(readFileSync(join(ROOT, 'agent', 'board.json'), 'utf8'))
  const task = board.tasks.find((entry) => entry.id === 'KN-001')
  if (!task) return 'KN-001 is not on the board'
  const rounds = task.roasts ?? []
  if (!rounds.length) return 'the board records no roast round for KN-001'

  // EVERY round is bound to a harness run, not just the latest. The only
  // exception is a round explicitly marked `legacy`, which means it was recorded
  // before the manifest mechanism existed. There is exactly one, round 1, and
  // the honest alternatives were to delete the record or to forge a sidecar for
  // it. `roast` refuses to record a new round without a manifest, so the set of
  // legacy rounds cannot grow.
  for (const round of rounds) {
    const reply = join(ROOT, round.file)
    if (!existsSync(reply)) return `round ${round.round} points at ${round.file}, which does not exist`
    if (/\.prompt\.md$/.test(round.file)) return `round ${round.round} points at a prompt, not a reply`
    const body = readFileSync(reply, 'utf8')
    if (!/\bVERDICT\b/.test(body)) return `round ${round.round}'s archive carries no verdict`

    if (round.legacy) {
      if (round.round !== 1) return `round ${round.round} is marked legacy, but only round 1 predates the manifest`
      continue
    }

    const metaPath = `${reply}.meta.json`
    if (!existsSync(metaPath)) return `round ${round.round} has no manifest beside its archive`
    const meta = JSON.parse(readFileSync(metaPath, 'utf8'))
    if (meta.task !== 'KN-001') return `round ${round.round}'s manifest names ${meta.task}, not KN-001`
    if (meta.round !== round.round) return `round ${round.round}'s manifest says round ${meta.round}`
    if (meta.replyDigest !== createHash('sha256').update(body).digest('hex')) {
      return `round ${round.round}'s archive no longer matches its manifest digest`
    }
  }
  return null
})

check('DESIGN.md transcribes the full type scale', () => {
  // The exit condition says the Figma tokens are transcribed, and for four of
  // the type roles that was false while this script still passed, because it
  // only grepped for a few colours. DESIGN.md itself admitted they were unread.
  const text = readFileSync(join(ROOT, 'DESIGN.md'), 'utf8')
  const roles = [
    ['Heading/L', '24 / 32'],
    ['Heading/M', '20 / 28'],
    ['Title', '16 / 24'],
    ['Body', '14 / 22'],
    ['Label', '12 / 16'],
  ]
  const missing = roles.filter(([role, metrics]) => !text.includes(role) || !text.includes(metrics))
  if (missing.length) return `does not give metrics for ${missing.map(([role]) => role).join(', ')}`
  // The file deleted Body/Small outright, so listing it is a defect, not a gap.
  if (/`Body\/Small`\s*\|/.test(text)) return 'still lists Body/Small as a type role, which Figma deleted'
  return /still ha(?:s|ve) to be read|need(?:s)? reading|unread/i.test(text)
    ? 'still says some tokens are unread'
    : null
})

if (failures.length) {
  process.stderr.write(`\nKN-001 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-001 verify passed.\n')
