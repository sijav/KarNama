#!/usr/bin/env node
// Verifies KN-034: the Prisma schema, the migrations and the seed.
//
// Exit condition: migrations apply to an empty database and to an existing one,
// the schema covers every field the Figma job record names, status history
// records every transition with its timestamp, and a seed script produces a
// realistic archive to develop against.
//
// The field list is checked against DESIGN.md rather than against a list in
// this file. That distinction has been the difference between a real check and
// a self-satisfied one three times in this repository: a verifier carrying its
// own copy of the answer only ever proves that two things the same author wrote
// agree. DESIGN.md is itself held to Figma by KN-002 and KN-004, so the chain
// runs schema -> DESIGN.md -> capture.
//
// Read-only: reads files and runs the test suite, writes nothing but build
// output.

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const API = join(ROOT, 'apps', 'api')

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

const design = readFileSync(join(ROOT, 'DESIGN.md'), 'utf8')
const schema = readFileSync(join(API, 'prisma', 'schema.prisma'), 'utf8')

/** The section of DESIGN.md that lists the record's fields. */
const jobRecordSection = () => {
  const start = design.indexOf('## 4. The Job Record')
  const end = design.indexOf('## 5.', start)
  if (start === -1 || end === -1) return null
  return design.slice(start, end)
}

check('every field DESIGN.md names on the job record is in the schema', () => {
  const section = jobRecordSection()
  if (!section) return 'DESIGN.md has no Job Record section, so this check is stale'

  // Pulled OUT of the document rather than listed here. The required three come
  // from the table, the optional ones from the paragraph that names them in
  // backticks, and both are the document's own words.
  const required = [...section.matchAll(/^\| `(\w+)`\s+\|/gm)].map((match) => match[1])
  const optional = [...section.matchAll(/`(\w+)`\s+[؀-ۿ]/g)].map((match) => match[1])
  const named = [...new Set([...required, ...optional])].filter((field) => field !== 'statusHistory')

  if (required.length !== 3) return `expected three required fields in the table, found ${required.length}: ${required.join(', ')}`
  if (named.length < 12) return `only ${named.length} fields parsed out of DESIGN.md, so the parse is wrong rather than the schema`

  // `status` is a relation in the schema and a field in the document, so it is
  // satisfied by `statusId`; `note`, `contacts` and `files` are relations the
  // document says so about.
  const relations = { status: 'statusId', note: 'notes', contacts: 'contacts', files: 'files' }
  const missing = named.filter((field) => {
    const wanted = relations[field] ?? field
    return !new RegExp(`^\\s+${wanted}\\b`, 'm').test(schema)
  })
  return missing.length ? `named by DESIGN.md and absent from the schema: ${missing.join(', ')}` : null
})

check('status is never nullable, because the design says it always has a value', () => {
  const record = /model JobRecord \{([\s\S]*?)\n\}/.exec(schema)?.[1] ?? ''
  if (!record) return 'there is no JobRecord model'
  if (/statusId\s+String\?/.test(record)) return 'statusId is nullable, and DESIGN.md says a status is never absent'
  return /statusId\s+String\b/.test(record) ? null : 'JobRecord has no statusId'
})

check('status history is a TABLE, appended and never rewritten', () => {
  const history = /model StatusHistory \{([\s\S]*?)\n\}/.exec(schema)?.[1] ?? ''
  if (!history) return 'there is no StatusHistory model, so the trail is a column somewhere'
  if (!/changedAt\s+DateTime/.test(history)) return 'entries carry no timestamp, so the trail has no order'
  if (!/fromStatusId\s+String\?/.test(history)) return 'fromStatusId is not nullable, so the first entry cannot be a creation'
  // An `updatedAt` here would mean history is editable, which is the one thing
  // it must not be.
  return /updatedAt/.test(history) ? 'StatusHistory has an updatedAt, so history can be rewritten' : null
})

check('the models the card names all exist', () => {
  const wanted = ['User', 'JobRecord', 'Status', 'StatusHistory', 'Contact', 'Note', 'FileReference', 'FeedbackSubmission']
  const missing = wanted.filter((model) => !new RegExp(`model ${model} \\{`).test(schema))
  if (missing.length) return `missing models: ${missing.join(', ')}`
  return /enum ModerationState/.test(schema) ? null : 'there is no moderation state for the admin panel to move'
})

check('there are at least two migrations, so the existing-database case is real', () => {
  // One migration can only ever be applied to an empty database. The second
  // case in the exit condition needs something to apply forward.
  const dir = join(API, 'prisma', 'migrations')
  if (!existsSync(dir)) return 'there are no migrations'
  const names = readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
  if (names.length < 2) return `only ${names.length} migration(s), so nothing can be applied to an existing database`
  const misnamed = names.filter((name) => !/^\d{14}_[a-z0-9_]+$/.test(name))
  return misnamed.length ? `migrations must sort by timestamp, these do not: ${misnamed.join(', ')}` : null
})

check('the suite runs the migrations against a real Postgres and passes', () => {
  // PGlite, in process. The point is that it is POSTGRES: a SQLite would accept
  // SQL that Supabase rejects, and the failure would arrive on the first deploy.
  const result = spawnSync('npm test', {
    cwd: API,
    encoding: 'utf8',
    shell: true,
    env: { ...process.env, CI: '1', FORCE_COLOR: '0' },
  })
  if (result.status !== 0) return (result.stdout || result.stderr || '').split('\n').slice(-25).join('\n')
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`
  const count = /Tests\s+(\d+)\s+passed/.exec(output)
  if (!count) return 'the run reported no test count'
  return Number(count[1]) >= 40 ? null : `only ${count[1]} tests ran, which is fewer than this workspace has`
})

check('the migration tests actually cover both cases and the seed', () => {
  const test = readFileSync(join(API, 'src', 'database', 'migrations.test.ts'), 'utf8')
  const wanted = [
    ['apply to an EMPTY database', 'the empty-database case'],
    ['apply to an EXISTING database', 'the existing-database case'],
    ['PGlite', 'a real Postgres'],
  ]
  const missing = wanted.filter(([needle]) => !test.includes(needle))
  if (missing.length) return `the tests do not cover ${missing.map(([, what]) => what).join(', ')}`
  const seed = readFileSync(join(API, 'src', 'database', 'seed.ts'), 'utf8')
  // Realistic means more than one row. A seed with a single job opportunity
  // cannot show a board, a trail, or an empty column.
  const records = [...seed.matchAll(/id: 'job-\d+'/g)].length
  return records >= 5 ? null : `the seed writes only ${records} job opportunities, which is not an archive`
})

check('the seed spreads across the board and carries a trail', () => {
  const seed = readFileSync(join(API, 'src', 'database', 'seed.ts'), 'utf8')
  for (const key of ['new', 'applied', 'interview', 'rejected', 'offer']) {
    if (!new RegExp(`statusKey: '${key}'`).test(seed)) return `nothing is seeded in the ${key} column`
  }
  const longest = [...seed.matchAll(/trail: \[([^\]]*)\]/g)].map((match) => match[1].split(',').length)
  return Math.max(...longest, 0) >= 4 ? null : 'no seeded record has moved more than twice, so the trail is not worth rendering'
})

if (failures.length) {
  process.stderr.write(`\nKN-034 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-034 verify passed.\n')
