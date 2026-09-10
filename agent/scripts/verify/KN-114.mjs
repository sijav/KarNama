#!/usr/bin/env node
// Verifies KN-114: an empty string is not a translation.
//
// Exit condition: setting any Persian message to an empty or whitespace-only
// string fails npm test and the failure names the id; so does setting one to
// its English id with the punctuation or casing changed; each is proved by
// planting it and watching the suite go red rather than by reading the checks.
//
// THIS FILE WRITES TO THE REPOSITORY, and says so rather than claiming to be
// read-only, because the claim is what a reviewer trusts when deciding whether
// to run it. It edits `src/i18n/locales/fa-IR.ts`, runs the catalog test
// against each planted value, and restores the file in a `finally`, then
// re-reads it to prove the restore took. A KILLED run does not execute a
// `finally`, so an interrupted verifier can leave a mutated catalog behind;
// `git diff src/i18n/locales/fa-IR.ts` is the check, and this has bitten this
// repository twice.
//
// Planting into the REAL catalog rather than a copy is deliberate. The test
// imports `./locales/fa-IR` directly, so a copy in a temp directory is a file
// nothing reads: it would prove the plant was written, not that the suite sees
// it. The plan check named this as the step most likely to be got wrong.

import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { childEnv } from './lib/child-env.mjs'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const CATALOG = join(WEB, 'src', 'i18n', 'locales', 'fa-IR.ts')
// The id planted against. Any entry would do; this one is first in the file.
const ID = 'KarNama'

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

const runCatalog = () => {
  const result = spawnSync(
    'npx vitest run src/i18n/catalog.test.ts --project unit --coverage.enabled=false',
    { cwd: WEB, encoding: 'utf8', shell: true, env: childEnv() },
  )
  return { status: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}

const original = readFileSync(CATALOG, 'utf8')
// Matches the value of the chosen id, whatever it currently is, so the plant
// does not depend on the Persian text staying what it is today.
const entry = new RegExp(`('${ID}':\\s*)'[^']*'`)

if (!entry.test(original)) {
  process.stderr.write(`\nKN-114 verify FAILED: no '${ID}' entry to plant into, so nothing below would mean anything\n`)
  process.exit(1)
}

const plant = (value) => writeFileSync(CATALOG, original.replace(entry, `$1'${value}'`))

try {
  check('the catalog test passes on the real catalog, so a failure below is the plant', () => {
    // The positive control. Every check after this asserts a FAILURE, and a
    // suite that was red for an unrelated reason would satisfy all of them.
    const { status, output } = runCatalog()
    if (status !== 0) return `it is already failing:\n${output.split('\n').slice(-15).join('\n')}`
    const passed = Number(/Tests\s+(\d+) passed/.exec(output)?.[1] ?? 0)
    return passed >= 8 ? null : `only ${passed} tests ran, so passing proves little`
  })

  // Each evasion, with the name it should be caught under. The value is written
  // into the catalog and the suite has to go red AND name the id, because a
  // failure that does not say which message is broken sends the reader hunting.
  for (const [name, value] of [
    ['an empty string', ''],
    ['spaces only', '   '],
    ['a tab only', '\t'],
    ['a non-breaking space only', '\u00a0'],
    ['zero-width characters only', '\u200c\u200b'],
    ['the English id exactly', ID],
    ['the English id with punctuation and casing changed', `${ID.toLowerCase()}!`],
  ]) {
    check(`${name} FAILS the catalog test, and the failure names the id`, () => {
      plant(value)
      const { status, output } = runCatalog()
      if (status === 0) return 'the suite stayed green with that value in the catalog'
      return output.includes(ID) ? null : `it failed but never named ${ID}:\n${output.split('\n').slice(-12).join('\n')}`
    })
  }
} finally {
  writeFileSync(CATALOG, original)
  if (readFileSync(CATALOG, 'utf8') !== original) {
    process.stderr.write(`\nKN-114 verify: RESTORE FAILED for ${CATALOG}, the catalog is still planted\n`)
    process.exit(1)
  }
}

check('the restored catalog still passes, so the plants left nothing behind', () => {
  const { status, output } = runCatalog()
  return status === 0 ? null : `the catalog test fails after restore:\n${output.split('\n').slice(-15).join('\n')}`
})

check('the file carries no invisible characters of its own', () => {
  // The check about blank messages was first written with literal zero-width
  // characters in its regex, which nobody can see, review or retype. It now
  // names the Unicode FORMAT category instead. This keeps them out.
  const test = readFileSync(join(WEB, 'src', 'i18n', 'catalog.test.ts'), 'utf8')
  const invisible = [...test].filter((character) => /\p{Cf}/u.test(character))
  return invisible.length ? `${invisible.length} invisible character(s) in catalog.test.ts` : null
})

if (failures.length) {
  process.stderr.write(`\nKN-114 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-114 verify passed.\n')
