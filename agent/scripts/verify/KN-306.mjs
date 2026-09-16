#!/usr/bin/env node
// Verifies KN-306: the fixtures never reach the production bundle, checked against the BUNDLE.
//
// Exit condition: a check builds the web app for production and asserts that no fixture value, a
// sentinel only the fixtures hold, appears in the emitted files; a planted import of the fixtures
// from app code makes it fail.
//
// The test this replaces as the bundle check, `story-fixtures.test.ts`, scans shipped SOURCE for an
// import specifier and its can-fail case tests that regex against a literal string. That is the
// mistake `lib/verify.mjs` records KN-058 making: asserting "by slicing source between two string
// markers, which tests text rather than behaviour". A convention about source is not the artifact.
// That test stays — it catches the ordinary mistake in a second — but it is the cheap early check,
// not this one.
//
// **This verifier WRITES and it BUILDS, three times.** It cannot run in a read-only checkout and it
// takes minutes. Both are deliberate: the exit asks that a planted import make the check fail, and
// only a real build through the real Vite graph can establish that. An earlier draft proved the
// scanner against a committed directory instead, so that it could run read-only — but that proves
// only that the scanner finds bytes in a directory, and the read-only "rule" was one I had
// generalised out of the rationale on `fixtures/always-fails.mjs`, which explains why THAT fixture
// is committed rather than constraining every verifier.
//
// What it proves: these sentinels are absent from the artifact this build emitted. What it does not
// prove: that every possible fixture value is absent. That limit is printed rather than hedged past.

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { filesUnder, scanBundle } from '../lib/bundle-scan.mjs'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const DIST = join(WEB, 'dist')
const ENTRY = join(WEB, 'src', 'main.tsx')
const FIXTURES = join(WEB, 'src', 'shared', 'story-fixtures')

// The Pages workflow's own inputs, so the artifact scanned is the shape that ships. VITE_API_URL is
// a repository variable there and Pages refuses an empty one, KN-489, because deploys went out
// reporting success while rejecting every call. Requiring it here would make this unrunnable
// locally, and a fixture leak is a question about the module graph, which that address cannot
// change — so it is defaulted, and the run prints what it used.
const PLACEHOLDER_API = 'https://example.invalid/graphql'
const BUILD_ENV = {
  KARNAMA_BASE: '/KarNama/',
  VITE_AUTH_MODE: 'demo',
  VITE_API_URL: process.env.VITE_API_URL ?? PLACEHOLDER_API,
}

// What the planted import carries, so a leftover one can be told from a real defect. A `finally`
// covers an ordinary failure but not a killed process, so this is looked for at startup too.
const MARKER = 'Planted by agent/scripts/verify/KN-306.mjs'

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

/**
 * A sentinel per language, read from the fixtures' own JSON as TEXT.
 *
 * Read rather than imported, because a check that pulls the fixtures into its own module graph to
 * find out whether they reach a bundle is its own joke. Taken from the data rather than hardcoded,
 * so renaming a fixture cannot silently empty the list and leave a check that scans for nothing.
 *
 * Per language because the two files hold different values: en-US has "Pars New Technologies" where
 * fa-IR has «فناوران نوین پارس», not a transliteration. Today both travel together, since the
 * fixtures' index imports both JSON files, so one would catch the other's leak — but an arrangement
 * importing one language would not, and the check should not depend on that staying true.
 */
const sentinels = () => {
  const taken = ['en-US', 'fa-IR'].map((locale) => {
    const held = JSON.parse(readFileSync(join(FIXTURES, `${locale}.json`), 'utf8'))
    const value = held.jobs?.[0]?.company
    if (typeof value !== 'string' || value.trim() === '')
      throw new Error(`${locale}.json has no company on its first job to use as a sentinel`)
    return value
  })
  if (new Set(taken).size !== taken.length)
    throw new Error(`the two locales gave the same sentinel, ${taken[0]}, so one language is unchecked`)
  return taken
}

// NO SHELL, and no npm either.
//
// The first version passed `shell: true` so `npm` would resolve on Windows; Node warns that with a
// shell the arguments are concatenated rather than escaped, and this repository had already removed
// that hazard once — `lib/verify.mjs` spawns argv with no shell so "the written command and the
// executed command" stay the same thing. The second version dropped the shell and named `npm.cmd`,
// which Node refuses to spawn without one: every check threw EINVAL.
//
// So the two commands `npm run build` actually runs are spawned directly, through this process's
// own node. Both entry points are hoisted to the root `node_modules`, so the paths are the
// repository's rather than the machine's, which an npm beside the node install would not be.
const TSC = join(ROOT, 'node_modules', 'typescript', 'bin', 'tsc')
const VITE = join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js')

// What apps/web's build script says, checked against what is run below. Spawning the two commands
// directly is faster and shell-free, but it means this verifier could go on checking an old
// definition of "the production build" after someone changed that script. Asserting they agree is
// the same rule `lib/verify.mjs` states: keep the written command and the executed command one
// thing.
const BUILD_SCRIPT = 'tsc --noEmit && vite build'

const build = () => {
  const declared = JSON.parse(readFileSync(join(WEB, 'package.json'), 'utf8')).scripts?.build
  if (declared !== BUILD_SCRIPT) {
    throw new Error(
      `apps/web's build script is now ${JSON.stringify(declared)}; this verifier runs ${JSON.stringify(BUILD_SCRIPT)} and must be updated to match`,
    )
  }
  for (const [label, entry, args] of [
    ['tsc', TSC, ['--noEmit']],
    ['vite', VITE, ['build']],
  ]) {
    if (!existsSync(entry)) throw new Error(`no ${label} at ${entry}, so the production build cannot be run`)
    execFileSync(process.execPath, [entry, ...args], {
      cwd: WEB,
      encoding: 'utf8',
      env: { ...process.env, ...BUILD_ENV },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
  }
}

/**
 * A scan that read nothing is not a clean scan, and a build that emitted no script is not a build.
 *
 * The script check is a SANITY check that a build happened, and is not a claim about what is
 * covered: every regular file is scanned, HTML, CSS and assets included, and requiring a `.js`
 * only catches the case where the build produced nothing runnable and absence would mean nothing.
 */
const scanned = (marks) => {
  const emitted = filesUnder(DIST)
  if (emitted.length === 0) throw new Error('dist held no files, so nothing was scanned and nothing is established')
  if (!emitted.some((path) => path.endsWith('.js'))) {
    throw new Error(`dist held no JavaScript among its ${emitted.length} file(s), so the build emitted nothing runnable`)
  }
  return scanBundle(DIST, marks)
}

const marks = sentinels()
process.stdout.write(`KN-306: sentinels ${marks.map((mark) => JSON.stringify(mark)).join(' and ')}\n`)
process.stdout.write(
  `KN-306: building with KARNAMA_BASE=${BUILD_ENV.KARNAMA_BASE} VITE_AUTH_MODE=${BUILD_ENV.VITE_AUTH_MODE} VITE_API_URL=${BUILD_ENV.VITE_API_URL}\n`,
)

if (!existsSync(ENTRY)) {
  process.stderr.write(`KN-306 verify FAILED: no entry module at ${ENTRY}\n`)
  process.exit(1)
}
const original = readFileSync(ENTRY, 'utf8')
if (original.includes(MARKER)) {
  // A previous run of THIS script was killed between planting and restoring. Saying "the defect
  // itself" here would blame the product for the tooling's mess, so it says what happened and how
  // to undo it rather than building a planted tree and reporting whatever that produced.
  // Says what to DELETE rather than offering a command that overwrites the file. An earlier version
  // of this message told the reader to run `git checkout --` on the entry, which would throw away
  // any legitimate edits made to it since the interrupted run — destructive advice, printed at the
  // moment someone is most likely to paste it without reading.
  process.stderr.write(
    `KN-306 verify REFUSED: ${ENTRY} still carries this verifier's own planted import.\n` +
      'A previous run was killed between planting and restoring. Remove ONLY the planted block\n' +
      `before running again: in the diff for that file, delete the line marked "${MARKER}"\n` +
      'together with the import and the condition beneath it, and leave everything else alone.\n' +
      'Restoring the whole file would discard any unrelated edits made to it since.\n' +
      'Then rebuild, because dist was left holding the planted tree.\n',
  )
  process.exit(1)
}
if (original.includes('story-fixtures')) {
  process.stderr.write(`KN-306 verify FAILED: ${ENTRY} imports the fixtures, which is the defect this card exists for\n`)
  process.exit(1)
}

check('the production build emits a bundle holding no fixture sentinel', () => {
  build()
  const result = scanned(marks)
  return result.findings.length === 0
    ? null
    : `the bundle holds ${result.findings.map(({ sentinel, files }) => `${JSON.stringify(sentinel)} in ${files.join(', ')}`).join('; ')}`
})

check('a planted import of the fixtures from app code makes that check fail', () => {
  const planted = `${original}
// ${MARKER} and removed by it. A runtime condition rather than a bare import, because a bundler may
// drop an import whose module has no side effects.
import { fixtures as plantedFixtures } from './shared/story-fixtures'
if (plantedFixtures('en-US').jobs.length < 0) console.log('unreachable, and so not droppable')
`
  try {
    writeFileSync(ENTRY, planted)
    build()
    const result = scanned(marks)
    return result.findings.length > 0
      ? null
      : 'a planted import did not put any sentinel in the bundle, so this check cannot fail and proves nothing'
  } finally {
    writeFileSync(ENTRY, original)
  }
})

// Left representing the restored tree rather than the planted one, so nobody reads the next scan of
// dist as the truth about what ships.
check('the entry is restored byte for byte, and dist is rebuilt from it', () => {
  // A rebuild alone cannot prove the restore: the planted import is valid TypeScript, so a failed
  // restore still builds successfully and would leave dist holding fixture data while this check
  // reported a clean bundle. So the bytes are compared before anything is built.
  const now = readFileSync(ENTRY, 'utf8')
  if (now.includes(MARKER)) return 'the planted marker is still in the entry, so the restore did not take'
  if (now !== original) return 'the entry does not match the bytes it started with, so the restore did not take'
  build()
  const result = scanned(marks)
  return result.findings.length === 0 ? null : 'the rebuild from the restored tree still holds a sentinel'
})

if (failures.length) {
  process.stderr.write(`\nKN-306 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}

process.stdout.write(
  '\nKN-306 verify passed.\n' +
    'It proves those sentinels are absent from the artifact this build emitted, and that a real\n' +
    'import from app code would have put them there. It does NOT prove that every possible fixture\n' +
    'value is absent: it carries one value per language, read from the fixtures themselves.\n',
)
