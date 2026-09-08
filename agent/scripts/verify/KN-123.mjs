#!/usr/bin/env node
// Verifies KN-123: the migration runner is safe to point at a real database.
//
// Exit condition: a migration that throws halfway leaves the database unchanged
// and the ledger recording a failure, a second concurrent run waits rather than
// racing, an applied migration whose SQL changed fails the next deploy by
// checksum, and each of those is proved by a planted case against PGlite.
//
// The planted cases are the tests in src/database/migrations.test.ts and
// migrations.guards.test.ts, which run against PGlite: Postgres compiled to
// wasm, in this process, so the SQL is executed by the engine Supabase runs.
//
// But a test that has never failed proves nothing, and this card is the one
// where being wrong costs a production database. So this script is the mutation
// harness itself, committed rather than thrown away: it puts each old behaviour
// BACK, one at a time, and requires the suite to reject it, naming the test that
// objected. If a guarantee is ever removed, the test that covers it must fail,
// and that is checked here rather than hoped for.
//
// This one WRITES to src/database/migrations.ts and restores it from a snapshot
// taken before any check runs.

import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const API = join(ROOT, 'apps', 'api')
const RUNNER = join(API, 'src', 'database', 'migrations.ts')

const snapshot = readFileSync(RUNNER, 'utf8')

const failures = []
const check = (label, run) => {
  const started = Date.now()
  try {
    const problem = run()
    if (problem) failures.push(`${label}: ${problem}`)
    else process.stdout.write(`  ok   ${label} (${((Date.now() - started) / 1000).toFixed(1)}s)\n`)
  } catch (error) {
    failures.push(`${label}: threw ${error.message}`)
  }
}

const suite = () =>
  spawnSync('npx vitest run src/database/migrations.test.ts src/database/migrations.guards.test.ts', {
    cwd: API,
    encoding: 'utf8',
    shell: true,
    env: { ...process.env, CI: '1', FORCE_COLOR: '0' },
  })

check('the runner has all four guarantees in its source', () => {
  const code = snapshot.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
  const wanted = [
    [/BEGIN;/, 'no transaction around the migration'],
    [/pg_try_advisory_lock/, 'no run lock'],
    [/failed_at/, 'no failure state'],
    [/checksumOf|createHash/, 'no checksum'],
    [/ROLLBACK/, 'no rollback on failure'],
    [/pg_advisory_unlock/, 'the lock is never released'],
  ]
  const missing = wanted.filter(([pattern]) => !pattern.test(code)).map(([, why]) => why)
  return missing.length ? missing.join('; ') : null
})

check('the suite passes as it stands', () => {
  const result = suite()
  if (result.status !== 0) return `${result.stdout ?? ''}${result.stderr ?? ''}`.split('\n').slice(-25).join('\n')
  return /Tests\s+\d+ passed/.test(`${result.stdout ?? ''}${result.stderr ?? ''}`) ? null : 'the suite reported no passing tests'
})

// Each entry removes ONE guarantee, the way a careless edit would, and names the
// test that has to object. The `expect` is matched against the failure output,
// so a suite that fails for some unrelated reason is not counted as a catch.
const regressions = [
  {
    // NOT removing the BEGIN. Postgres wraps a multi-statement simple query in
    // an IMPLICIT transaction, so that plant changed nothing observable and the
    // suite stayed green: this harness found that on its first run, before the
    // claim reached a commit message. The guarantee is that the DDL and its
    // ledger row reach the database TOGETHER, and what breaks it is the shape
    // the first runner actually had, two separate calls.
    name: 'the migration and its ledger row go back to separate exec calls',
    apply: (code) =>
      code.replace(
        '        await runner.exec(\n          `BEGIN;\\n${migration.sql}\\n` +',
        '        await runner.exec(migration.sql)\n        await runner.exec(\n          `BEGIN;\\n` +',
      ),
    expect: 'writes the migration and its ledger row in ONE statement batch',
  },
  {
    name: 'a failure is no longer recorded',
    apply: (code) => code.replace(/        await runner\.exec\(\n          `INSERT INTO "_karnama_migrations" \("name", "checksum", "applied_at", "failed_at", "error"\) ` \+\n            `VALUES \(\$\{quote\(migration\.name\)\}, \$\{quote\(checksum\)\}, NULL, now\(\), \$\{quote\(reason\.slice\(0, 1000\)\)\}\) ` \+\n            `ON CONFLICT \("name"\) DO UPDATE SET "checksum" = EXCLUDED\."checksum", "applied_at" = NULL, ` \+\n            `"failed_at" = now\(\), "error" = EXCLUDED\."error";`,\n        \)\n/, ''),
    expect: 'records the failure rather than nothing',
  },
  {
    name: 'the checksum is no longer compared',
    apply: (code) => code.replace('        if (row.checksum !== checksum) {', '        if (false) {'),
    expect: 'REFUSES an applied migration whose SQL has changed since',
  },
  {
    name: 'the run lock is no longer taken',
    apply: (code) =>
      code.replace(
        '  await takeLock(runner, options.lockAttempts ?? 30, options.lockRetryMs ?? 1000)',
        '  // lock removed by the verifier',
      ),
    expect: 'refuses to start when the lock is held',
  },
  {
    name: 'the lock is never released',
    apply: (code) => code.replace('    await runner.exec(`SELECT pg_advisory_unlock(${String(LOCK_KEY)});`)', '    // unlock removed'),
    expect: 'releases the lock when a migration fails',
  },
  {
    name: 'a migration may manage its own transaction again',
    apply: (code) => code.replace('  if (offender) {', '  if (false && offender) {'),
    expect: 'refuses a migration that manages its own transaction',
  },
]

check('REMOVING ANY ONE GUARANTEE MAKES THE SUITE FAIL, proved by removing each', () => {
  for (const regression of regressions) {
    try {
      const mutated = regression.apply(snapshot)
      if (mutated === snapshot) return `"${regression.name}" did not apply, so it proves nothing`
      writeFileSync(RUNNER, mutated)

      const result = suite()
      if (result.status === 0) return `"${regression.name}" did not make the suite fail`
      const output = `${result.stdout ?? ''}${result.stderr ?? ''}`
      if (!output.includes(regression.expect)) {
        return `"${regression.name}" failed the suite, but not through "${regression.expect}":\n${output.split('\n').filter((line) => line.includes('×') || line.includes('FAIL')).slice(0, 6).join('\n')}`
      }
    } finally {
      writeFileSync(RUNNER, snapshot)
    }
  }
  return null
})

check('the runner is byte-identical to how this script found it', () =>
  readFileSync(RUNNER, 'utf8') === snapshot ? null : 'src/database/migrations.ts was left modified')

if (failures.length) {
  process.stderr.write(`\nKN-123 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-123 verify passed.\n')
