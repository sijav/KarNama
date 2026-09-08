#!/usr/bin/env node
// Verifies KN-120: schema.gql is a checked build artefact, not a side effect of
// starting the server.
//
// Exit condition: npm run build produces schema.gql without starting a server,
// the file is committed, and a check fails when the resolvers and the committed
// schema disagree.
//
// The third clause is the one with teeth, and it is proved by DOING it: the
// committed schema is temporarily replaced with something else, the check is
// run, and it has to fail and say so. Asserting that a comparison exists would
// establish nothing, since a comparison that always returns equal also exists.
//
// This one WRITES: it replaces schema.gql and restores it. The header says so,
// the restore is in a finally block, and the file is re-read at the end to prove
// it came back.

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const API = join(ROOT, 'apps', 'api')
const SCHEMA = join(API, 'schema.gql')

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

const run = (command, options = {}) =>
  spawnSync(command, {
    cwd: API,
    encoding: 'utf8',
    shell: true,
    env: { ...process.env, CI: '1', FORCE_COLOR: '0' },
    ...options,
  })

check('the schema is committed, not ignored', () => {
  const ignore = readFileSync(join(ROOT, '.gitignore'), 'utf8')
  if (/^apps\/api\/schema\.gql$/m.test(ignore)) return '.gitignore still ignores the schema'
  const tracked = spawnSync('git ls-files --error-unmatch apps/api/schema.gql', { cwd: ROOT, encoding: 'utf8', shell: true })
  return tracked.status === 0 ? null : 'schema.gql is not tracked by git, so a fresh clone has no contract'
})

check('the server no longer writes it on boot', () => {
  // It used to, and that is what made the contract a side effect: a server
  // started in the wrong directory rewrote the file in a different format and
  // broke the check.
  const module = readFileSync(join(API, 'src', 'app.module.ts'), 'utf8')
  if (/autoSchemaFile:\s*join\(/.test(module)) return 'autoSchemaFile still writes to a path, so booting the server rewrites the schema'
  return /autoSchemaFile:\s*true/.test(module) ? null : 'autoSchemaFile is neither true nor a path, so the shape has changed'
})

check('the build CHECKS the schema and does not regenerate it', () => {
  // It used to regenerate. That is worse than not checking: a developer could
  // change a resolver, leave the committed schema stale, run the ordinary build
  // and get a success, because the build repaired the evidence it should have
  // rejected. A roast rated that critical. Generation is now its own command.
  const scripts = JSON.parse(readFileSync(join(API, 'package.json'), 'utf8')).scripts ?? {}
  const build = scripts.build ?? ''
  if (build.includes('schema:generate') || build.includes('schema:update')) {
    return `build is "${build}", which regenerates the schema instead of checking it`
  }
  if (!build.includes('schema:check')) return `build is "${build}", which never checks the schema`
  return typeof scripts['schema:update'] === 'string' ? null : 'there is no schema:update command to regenerate with'
})

check('generation needs no server, no environment and no database', () => {
  // With NOTHING set. The generator must not need WEB_ORIGIN, DATABASE_URL or a
  // port, because a fresh clone has none of them.
  const bare = { CI: '1', FORCE_COLOR: '0', PATH: process.env.PATH, SystemRoot: process.env.SystemRoot }
  const compile = run('npx tsc -p tsconfig.build.json', { env: bare })
  if (compile.status !== 0) return (compile.stdout || compile.stderr || '').split('\n').slice(-15).join('\n')
  const result = run('npm run schema:update', { env: bare })
  if (result.status !== 0) return (result.stdout || result.stderr || '').split('\n').slice(-20).join('\n')
  return existsSync(SCHEMA) ? null : 'schema:update did not produce schema.gql'
})

check('a stale schema fails the ORDINARY build, not just the explicit check', () => {
  // The clause the roast found false. What matters is not that a check exists
  // somewhere, it is that the command people actually run refuses.
  const original = readFileSync(SCHEMA, 'utf8')
  try {
    writeFileSync(SCHEMA, `${original}\ntype NobodyWroteThis {\n  field: String!\n}\n`)
    const result = run('npm run build')
    if (result.status === 0) return 'npm run build succeeded against a stale schema'
    return /stale/.test(`${result.stdout ?? ''}${result.stderr ?? ''}`) ? null : 'the build failed, but not because the schema is stale'
  } finally {
    writeFileSync(SCHEMA, original)
  }
})

check('the committed schema matches the resolvers right now', () => {
  const result = run('npm run schema:check')
  return result.status === 0 ? null : (result.stdout || result.stderr || '').split('\n').slice(-10).join('\n')
})

// What the schema looked like before this script touched anything. Compared
// against at the end, rather than against git: comparing to git conflated "this
// script left the file modified" with "the file has an uncommitted change for
// any reason at all", and reported a failure the first time the schema
// legitimately gained a header.
const schemaBefore = readFileSync(SCHEMA, 'utf8')

check('a STALE schema fails the check, proved by making one', () => {
  const original = readFileSync(SCHEMA, 'utf8')
  try {
    writeFileSync(SCHEMA, `${original}\ntype SomethingNobodyWrote {\n  field: String!\n}\n`)
    const result = run('npm run schema:check')
    if (result.status === 0) return 'the check passed against a schema that does not match the resolvers'
    const output = `${result.stdout ?? ''}${result.stderr ?? ''}`
    if (!/stale/.test(output)) return `it failed, but not because the schema is stale:\n${output.slice(-300)}`
    // The message has to say what to run. Whoever sees it is mid-review.
    return /schema:generate/.test(output) ? null : 'the failure does not say how to fix it'
  } finally {
    writeFileSync(SCHEMA, original)
  }
})

check('the schema was put back exactly as this script found it', () =>
  readFileSync(SCHEMA, 'utf8') === schemaBefore ? null : 'schema.gql differs from what this script found, which is a defect in this script',
)

check('every resolver is in the list the generator builds from', () => {
  // The drift the single list closes: a resolver registered in a Nest module
  // and absent from `src/graphql/resolvers.ts` is in the running server and
  // missing from the generated schema, so the client has no type for a field
  // that exists. The test that checks this is run here rather than trusted.
  const result = run('npx vitest run src/graphql --project schema --coverage.enabled=false')
  if (result.status !== 0) return (result.stdout || result.stderr || '').split('\n').slice(-20).join('\n')
  const count = /Tests\s+(\d+)\s+passed/.exec(`${result.stdout ?? ''}${result.stderr ?? ''}`)
  if (!count) return 'the schema test run reported no count'
  return Number(count[1]) >= 8 ? null : `only ${count[1]} schema tests ran`
})

if (failures.length) {
  process.stderr.write(`\nKN-120 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-120 verify passed.\n')
