#!/usr/bin/env node
// Verifies KN-132: the byte-compared files survive a CRLF checkout.
//
// Exit condition: packages/graphql/src/generated.ts and
// packages/graphql/src/operations/*.graphql are pinned in .gitattributes with
// the reason written beside them, and a simulated core.autocrlf=true checkout
// shows them arriving with LF while an unpinned markdown file in the same
// checkout arrives with CRLF. Removing a pin makes that file arrive with CRLF.
//
// The unpinned control is the load-bearing part. "No CR found" is equally
// consistent with a checkout that converted NOTHING, and a simulation that
// silently failed to simulate would report exactly the result a correct one
// does. So the same checkout has to be shown converting something.
//
// It clones into a temp directory and does all of its mutating there. The real
// worktree is never written to, which is the difference between this and
// KN-114's harness, whose habit of restoring a stale snapshot over whatever it
// found is filed as KN-183.
//
// Read-only with respect to this repository. It clones from HEAD, so a pin that
// is edited but not committed is not what it checks.

import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))

// Every file something compares byte for byte, with what does the comparing.
// A list, and honestly a list: an earlier version of this card wanted it
// DERIVED from the scripts, which meant building a mechanism that refuses
// future unpinned files. That is a gate nobody asked for. The names are here
// where a reader can see them and add to them.
const PINNED = [
  ['apps/api/schema.gql', 'the build compares it against a fresh generation'],
  ['packages/graphql/src/generated.ts', 'packages/graphql/scripts/check-generated.mjs compares it literally'],
  ['packages/graphql/src/operations/health.graphql', 'agent/scripts/verify/KN-128.mjs matches a literal newline in it'],
]
// An ordinary text file, pinned by nothing, which MUST come out converted.
const CONTROL = 'AGENTS.md'

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

const git = (cwd, args) => spawnSync('git', args, { cwd, encoding: 'utf8' })
const hasCR = (path) => readFileSync(path).includes(0x0d)

/** A fresh clone of HEAD checked out as a Windows default machine would. */
const clone = () => {
  const dir = mkdtempSync(join(tmpdir(), 'kn132-'))
  const target = join(dir, 'checkout')
  const result = spawnSync(
    'git',
    ['clone', '--quiet', '--config', 'core.autocrlf=true', '--config', 'core.eol=crlf', ROOT, target],
    { encoding: 'utf8' },
  )
  if (result.status !== 0) throw new Error(`clone failed: ${result.stderr ?? ''}`)
  return { dir, target }
}

const { dir, target } = clone()
try {
  check('the simulated checkout really did convert something', () => {
    // The positive control, first, because every check below reads an ABSENCE
    // of CR and an absence proves nothing if the checkout converted nothing.
    const control = join(target, CONTROL)
    if (!existsSync(control)) return `${CONTROL} is not in the checkout, so the control could not run`
    return hasCR(control) ? null : `${CONTROL} came out with LF, so core.autocrlf=true converted nothing here`
  })

  for (const [path, why] of PINNED) {
    check(`${path} survives the checkout with LF`, () => {
      const full = join(target, path)
      if (!existsSync(full)) return `it is not in the checkout at all`
      return hasCR(full) ? `it came out with CRLF, and ${why}` : null
    })
  }

  check('removing a pin makes that file come out with CRLF, so the pin is what protects it', () => {
    // The mutation, done INSIDE the clone. Drop the generated.ts rule from the
    // clone's .gitattributes, force a re-checkout of just that file, and it
    // must convert. Without this the checks above are consistent with a
    // repository where nothing is pinned and nothing would convert anyway.
    const attributes = join(target, '.gitattributes')
    const before = readFileSync(attributes, 'utf8')
    const without = before.replace(/^packages\/graphql\/src\/generated\.ts text eol=lf$/m, '')
    if (without === before) return 'the generated.ts pin was not found in the clone, so nothing was removed'
    writeFileSync(attributes, without)
    const file = join(target, 'packages/graphql/src/generated.ts')
    rmSync(file)
    const restored = git(target, ['-c', 'core.autocrlf=true', 'checkout', '--', 'packages/graphql/src/generated.ts'])
    if (restored.status !== 0) return `could not re-check-out the file: ${restored.stderr ?? ''}`
    return hasCR(file) ? null : 'it still came out with LF without its pin, so the pin is not what was protecting it'
  })

  check('.gitattributes says WHY each pin is there', () => {
    // The existing entries each carry their reason, and the reason is the part
    // that stops the next person deleting a line they cannot explain.
    // The comment IMMEDIATELY above the rule, not a comment somewhere nearby.
    // Searching a window of characters above the line passed when the comment
    // for this pin was deleted, because the comment belonging to the PREVIOUS
    // pin was still inside the window. A mutation caught that. Coincidental
    // proximity is not authorship, and this file is a stack of rules each of
    // which has a paragraph, so "there is a # near here" is always true.
    const lines = readFileSync(join(ROOT, '.gitattributes'), 'utf8').split('\n')
    const missing = PINNED.filter(([path]) => {
      const pattern = path.replace('health.graphql', '*.graphql')
      const index = lines.findIndex((line) => line.startsWith(pattern) && !line.trimStart().startsWith('#'))
      if (index === -1) return true
      // Walk up past nothing at all: the line directly above must be a comment.
      const above = lines[index - 1] ?? ''
      return !above.trimStart().startsWith('#')
    })
    return missing.length ? `no reason recorded directly above ${missing.map(([path]) => path).join(', ')}` : null
  })
} finally {
  rmSync(dir, { recursive: true, force: true })
}

if (failures.length) {
  process.stderr.write(`\nKN-132 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-132 verify passed.\n')
