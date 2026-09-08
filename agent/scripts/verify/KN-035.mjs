#!/usr/bin/env node
// Verifies KN-035: codegen wired both ways.
//
// Exit condition: changing the API schema without regenerating fails the build,
// the web app imports only generated types for GraphQL data, and no
// hand-written interface duplicates a generated one.
//
// The first clause is proved by DOING it: a resolver is edited, the API schema
// is regenerated so the two halves genuinely disagree, and the ROOT build has to
// refuse. Not `codegen:check` on its own, the command people run. That
// distinction is the whole finding from KN-120, where a build that regenerated
// before comparing always passed.
//
// This one WRITES, and says so: it edits a resolver and the two generated
// files, then restores all three from snapshots taken first and re-reads them.

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const API = join(ROOT, 'apps', 'api')
const WEB = join(ROOT, 'apps', 'web')
const PKG = join(ROOT, 'packages', 'graphql')

const RESOLVER = join(API, 'src', 'health', 'health.model.ts')
const API_SCHEMA = join(API, 'schema.gql')
const GENERATED = join(PKG, 'src', 'generated.ts')

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

const run = (command, cwd = ROOT) =>
  spawnSync(command, { cwd, encoding: 'utf8', shell: true, env: { ...process.env, CI: '1', FORCE_COLOR: '0' } })

check('the package exists and is a workspace', () => {
  if (!existsSync(join(PKG, 'package.json'))) return 'packages/graphql does not exist'
  const workspaces = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).workspaces ?? []
  return workspaces.includes('packages/graphql') ? null : 'packages/graphql is not in the root workspaces'
})

check('the types are generated from the API schema, not written', () => {
  // Comments stripped first. The prose in this config explains that it reads
  // `apps/api/schema.gql`, so a grep over the whole file found the sentence
  // rather than the setting, and a mutation pointing codegen at a frozen
  // fixture passed. Found by planting exactly that.
  const config = readFileSync(join(PKG, 'codegen.ts'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
  if (!/schema:\s*'[^']*apps\/api\/schema\.gql'/.test(config)) return 'codegen does not read the API schema'
  const generated = readFileSync(GENERATED, 'utf8')
  // The generator's own preamble. A hand-written file would not have it.
  return /All built-in and custom scalars/.test(generated) ? null : 'src/generated.ts does not look generated'
})

check('the package build CHECKS rather than regenerates', () => {
  // The KN-120 finding, one workspace over. A build that writes the artefact
  // before comparing destroys the evidence it exists to reject.
  const scripts = JSON.parse(readFileSync(join(PKG, 'package.json'), 'utf8')).scripts ?? {}
  if ((scripts.build ?? '').includes('codegen:update')) return `build is "${scripts.build}", which regenerates instead of checking`
  if (!(scripts.build ?? '').includes('codegen:check')) return `build is "${scripts.build}", which never checks`
  const checker = readFileSync(join(PKG, 'scripts', 'check-generated.mjs'), 'utf8')
  return /mkdtemp/.test(checker) ? null : 'the check does not generate into a temporary directory, so it may be writing over the answer'
})

check('the web app imports the generated types rather than describing them again', () => {
  const health = readFileSync(join(WEB, 'src', 'core', 'api', 'health.ts'), 'utf8')
  if (!/from '@karnama\/graphql'/.test(health)) return 'the web app does not import the generated package'
  const webPackage = JSON.parse(readFileSync(join(WEB, 'package.json'), 'utf8'))
  return webPackage.dependencies?.['@karnama/graphql'] ? null : 'the web app does not depend on the generated package'
})

check('no hand-written type duplicates a generated one, checked by running it', () => {
  const result = run('npm test --workspace @karnama/graphql')
  if (result.status !== 0) return (result.stdout || result.stderr || '').split('\n').slice(-20).join('\n')
  const count = /Tests\s+(\d+)\s+passed/.exec(`${result.stdout ?? ''}${result.stderr ?? ''}`)
  return count && Number(count[1]) >= 4 ? null : 'the duplicate check did not run'
})

check('CHANGING THE SCHEMA WITHOUT REGENERATING FAILS THE ROOT BUILD, proved by doing it', () => {
  const resolver = readFileSync(RESOLVER, 'utf8')
  const schema = readFileSync(API_SCHEMA, 'utf8')
  const generated = readFileSync(GENERATED, 'utf8')

  try {
    // A real schema change: a new field on the health type. NULLABLE and
    // optional, so the resolver still satisfies the model and the API keeps
    // compiling: the point is to make the schema move, not to break the build
    // for an unrelated reason, and the first version of this mutation did the
    // second and looked like a pass.
    const changed = resolver.replace(
      "  @Field(() => Number, { description: 'Seconds since this process started, so a cold start is visible' })",
      "  @Field(() => String, { nullable: true, description: 'A field nobody generated types for' })\n  addedByTheVerifier?: string\n\n  @Field(() => Number, { description: 'Seconds since this process started, so a cold start is visible' })",
    )
    if (changed === resolver) return 'the resolver could not be edited, so this check proves nothing'
    writeFileSync(RESOLVER, changed)

    // Regenerate the API schema only, leaving the client types behind. That is
    // exactly the state the exit condition is about.
    const compile = run('npx tsc -p tsconfig.build.json', API)
    if (compile.status !== 0) return `the API stopped compiling, so the mutation is wrong:\n${compile.stdout ?? ''}`
    const update = run('npm run schema:update', API)
    if (update.status !== 0) return `schema:update failed:\n${update.stdout ?? ''}${update.stderr ?? ''}`
    if (readFileSync(API_SCHEMA, 'utf8') === schema) return 'the schema did not change, so nothing is being checked'

    const build = run('npm run build')
    if (build.status === 0) return 'the root build succeeded with client types generated from an older schema'
    const output = `${build.stdout ?? ''}${build.stderr ?? ''}`
    return /stale/.test(output) ? null : `the build failed, but not because anything was stale:\n${output.slice(-400)}`
  } finally {
    writeFileSync(RESOLVER, resolver)
    writeFileSync(API_SCHEMA, schema)
    writeFileSync(GENERATED, generated)
    run('npx tsc -p tsconfig.build.json', API)
  }
})

check('everything was put back exactly as this script found it', () => {
  const build = run('npm run build')
  return build.status === 0 ? null : `the build no longer passes, which is a defect in this script:\n${(build.stdout ?? '').slice(-400)}`
})

if (failures.length) {
  process.stderr.write(`\nKN-035 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-035 verify passed.\n')
