#!/usr/bin/env node
// Verifies KN-033: the API scaffold and its quality gate.
//
// Exit condition: lint, typecheck, test and build all pass in apps/api, the
// server starts, the GraphQL playground serves the schema, the health endpoint
// answers, and a missing required environment variable fails at startup with a
// clear message rather than at first request.
//
// The last clause is the one with teeth and the only one that needs a real
// process. The others are commands; this one is a behaviour, and it is
// behaviour that only exists at the boundary: the failure has to happen before
// the server listens, it has to name the variable, and it has to exit non-zero
// so a deploy notices. Nothing short of starting the thing establishes that.
//
// Read-only with respect to the repository. It runs the build, which writes
// dist/ and schema.gql, and both are gitignored build output.

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
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

const COMPLETE_ENV = {
  WEB_ORIGIN: 'http://localhost:5173',
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/karnama-verify',
  PORT: '4199',
}

const run = (command, extraEnv = {}) =>
  spawnSync(command, { cwd: API, encoding: 'utf8', shell: true, env: { ...process.env, CI: '1', FORCE_COLOR: '0', ...extraEnv } })

if (!existsSync(API)) {
  process.stderr.write('KN-033 verify FAILED: apps/api does not exist\n')
  process.exit(1)
}

const pkg = JSON.parse(readFileSync(join(API, 'package.json'), 'utf8'))
const vitestConfig = readFileSync(join(API, 'vitest.config.ts'), 'utf8')

check('the lint script treats a warning as a failure', () =>
  (pkg.scripts?.lint ?? '').includes('--max-warnings 0') ? null : `lint is "${pkg.scripts?.lint}", which lets warnings through`,
)

check('coverage is required to be total, on all four metrics', () => {
  const thresholds = /thresholds:\s*\{([^}]*)\}/.exec(vitestConfig)?.[1] ?? ''
  const missing = ['statements', 'branches', 'functions', 'lines'].filter((m) => !new RegExp(`${m}:\\s*100\\b`).test(thresholds))
  return missing.length ? `not held at 100: ${missing.join(', ')}` : null
})

check('decorator metadata survives the test build', () => {
  // Without this plugin esbuild strips decorators and emits no metadata, so
  // every injected dependency arrives undefined and the schema comes out with
  // the wrong types. It is not a type error, it is a resolver returning null,
  // which is why the config is checked as well as the tests being run.
  if (!/unplugin-swc/.test(vitestConfig)) return 'vitest does not use the swc plugin, so decorator metadata will be dropped'
  const swcrc = JSON.parse(readFileSync(join(API, '.swcrc'), 'utf8'))
  return swcrc.jsc?.transform?.decoratorMetadata === true ? null : '.swcrc does not enable decoratorMetadata'
})

for (const [label, script] of [
  ['lint passes', 'npm run lint'],
  ['the type checker passes', 'npm run lint:tsc'],
  ['the build succeeds', 'npm run build'],
]) {
  check(label, () => {
    const result = run(script)
    return result.status === 0 ? null : (result.stdout || result.stderr || '').split('\n').slice(-20).join('\n')
  })
}

check('the suite passes and actually ran', () => {
  const result = run('npm test')
  if (result.status !== 0) return (result.stdout || result.stderr || '').split('\n').slice(-25).join('\n')
  const count = /Tests\s+(\d+)\s+passed/.exec(`${result.stdout ?? ''}${result.stderr ?? ''}`)
  if (!count) return 'the run reported no test count, so it may have run nothing'
  return Number(count[1]) >= 10 ? null : `only ${count[1]} tests ran, which is too few to be the suite`
})

check('the built server starts, serves GraphiQL and answers the health query', () => {
  // Against the BUILD, from a cold process, the way Render will run it. The
  // in-process test proves the module graph; this proves the artefact.
  // A committed script rather than an inline `node -e`. The escaped version
  // crashed libuv on the way out on Windows and reported it as a server
  // failure, which is a quoting failure wearing a product failure's clothes.
  const probe = join(ROOT, 'agent', 'scripts', 'verify', 'lib', 'probe-api.mjs')
  const result = spawnSync(process.execPath, [probe, API, COMPLETE_ENV.PORT], {
    cwd: API,
    encoding: 'utf8',
    env: { ...process.env, ...COMPLETE_ENV },
  })
  return result.status === 0 ? null : (result.stderr || result.stdout || '').trim().slice(-600)
})

check('a missing required variable fails at STARTUP, names it, and exits non-zero', () => {
  const { WEB_ORIGIN: _omitted, ...incomplete } = COMPLETE_ENV
  const result = run('node dist/main.js', { ...incomplete, WEB_ORIGIN: '' })
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`

  if (result.status === 0) return 'it started anyway, so the failure would arrive at the first request instead'
  if (!/WEB_ORIGIN/.test(output)) return `it failed without naming the variable:\n${output.slice(0, 400)}`
  if (!/cannot start/.test(output)) return 'the message does not say the API cannot start'
  // The message has to be readable in a deploy log. A Nest exception handler
  // wrapping it in five frames of stack was the first version, and it is the
  // difference between one sentence and a hunt.
  if (/ModuleJob|at async|ExceptionHandler/.test(output)) return `the failure is buried in a stack trace:\n${output.slice(0, 400)}`
  return output.split('\n').filter(Boolean).length <= 4 ? null : `the message is ${output.split('\n').length} lines, which is not one sentence`
})

check('the generated schema is code-first and on disk', () => {
  // Code first means the schema is produced FROM the resolvers, so
  // packages/graphql can generate client types from a file that cannot disagree
  // with the server. A schema-first setup would put a second copy of the
  // contract in the repository for someone to forget to update.
  const schema = join(API, 'schema.gql')
  if (!existsSync(schema)) return 'schema.gql was not generated'
  const text = readFileSync(schema, 'utf8')
  if (!/AUTOMATICALLY GENERATED/.test(text)) return 'schema.gql is not the generated file'
  for (const fragment of ['type Health {', 'status: String!', 'uptimeSeconds: Float!', 'health: Health!']) {
    if (!text.includes(fragment)) return `the schema is missing ${fragment}, so decorator metadata was probably dropped`
  }
  return null
})

if (failures.length) {
  process.stderr.write(`\nKN-033 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-033 verify passed.\n')
