#!/usr/bin/env node
// Verifies KN-131: the build typechecks what it ships.
//
// Exit condition: removing a selected field from the health operation and
// regenerating makes `npm run build` fail, proved by planting exactly that, and
// the failure names the consumer file rather than something incidental. Every
// workspace build either typechecks its own sources or the verifier records why
// it cannot.
//
// `vite build` transpiles per file and never typechecks, so `npm run build`
// emitted a bundle whose types nothing had verified. The separate `lint:tsc`
// script covered it, but that is not the command a deploy runs, and KN-051 is
// about to point GitHub Pages at the one that is.
//
// This one WRITES: it edits the operation document and the generated types, and
// restores them from snapshots taken before any check runs.

import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const PKG = join(ROOT, 'packages', 'graphql')

const OPERATION = join(PKG, 'src', 'operations', 'health.graphql')
const GENERATED = join(PKG, 'src', 'generated.ts')

// Snapshotted before anything runs, so the restoration check below compares
// against the state this script was handed rather than against its own output.
const TOUCHED = [OPERATION, GENERATED]
const snapshots = new Map(TOUCHED.map((path) => [path, readFileSync(path, 'utf8')]))

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

// eslint-disable-next-line no-control-regex -- tsc colourises whatever FORCE_COLOR says
const plain = (text) => text.replace(/\[[0-9;]*m/g, '').replaceAll('\\', '/')

const scripts = (workspace) => JSON.parse(readFileSync(join(ROOT, workspace, 'package.json'), 'utf8')).scripts ?? {}

check('every workspace build typechecks its own sources', () => {
  // Read as a property of the command, not as a spelling. `tsc` with emit is a
  // typecheck too, which is why the API's build already qualified while the
  // other two did not.
  const typechecks = (build) => /(^|&&|\|\|)\s*(npx\s+)?tsc\b/.test(build) || /npm run lint:tsc/.test(build)
  const missing = []
  for (const workspace of ['apps/web', 'apps/api', 'packages/graphql']) {
    const build = scripts(workspace).build ?? ''
    if (!build) missing.push(`${workspace} has no build at all`)
    else if (!typechecks(build)) missing.push(`${workspace} build is "${build}", which never runs the compiler`)
  }
  return missing.length ? missing.join('; ') : null
})

check('the root build delegates to all of them', () => {
  const build = scripts('.').build ?? ''
  return /--workspaces/.test(build) ? null : `the root build is "${build}", so a workspace could be skipped`
})

check('A TYPE ERROR FAILS THE BUILD, proved by planting one in each workspace', () => {
  // The blunt case first, one workspace at a time. A build that ships a bundle
  // whose types were never checked is the whole finding, and the cheapest proof
  // that it no longer does is to break a type and watch the build refuse.
  const plants = [
    { workspace: 'apps/web', file: join(ROOT, 'apps', 'web', 'src', 'core', 'api', 'health.ts') },
    { workspace: 'packages/graphql', file: join(PKG, 'src', 'index.ts') },
    { workspace: 'apps/api', file: join(ROOT, 'apps', 'api', 'src', 'health', 'health.model.ts') },
  ]
  for (const plant of plants) {
    const original = readFileSync(plant.file, 'utf8')
    try {
      writeFileSync(plant.file, `${original}\nexport const kn131TypeError: number = 'not a number'\n`)
      const build = run('npm run build')
      if (build.status === 0) return `${plant.workspace} built with a type error in it`
      const output = plain(`${build.stdout ?? ''}${build.stderr ?? ''}`)
      if (!/kn131TypeError/.test(output)) return `${plant.workspace} failed, but never mentioned the planted error:\n${output.slice(-400)}`
    } finally {
      writeFileSync(plant.file, original)
    }
  }
  return null
})

check('REMOVING A SELECTED FIELD AND REGENERATING FAILS THE BUILD, proved by doing it', () => {
  // The exact sequence from the card, and the one a type error alone does not
  // cover: both generation checks AGREE, because both halves were regenerated.
  // Nothing is stale. The only thing wrong is that a consumer still reads a
  // field the response no longer carries, which is precisely what a build
  // without a typecheck cannot see.
  const operation = readFileSync(OPERATION, 'utf8')
  try {
    const reduced = operation.replace('    environment\n', '')
    if (reduced === operation) return 'the operation could not be edited, so this check proves nothing'
    writeFileSync(OPERATION, reduced)

    const update = run('npm run codegen:update --workspace @karnama/graphql')
    if (update.status !== 0) return `codegen:update failed, so the two halves never agreed:\n${(update.stdout ?? '').slice(-300)}`
    if (/environment/.test(/export type HealthQuery = ([^;]+);/.exec(readFileSync(GENERATED, 'utf8'))?.[1] ?? '')) {
      return 'the regenerated response type still has the field, so nothing is being checked'
    }

    const build = run('npm run build')
    if (build.status === 0) return 'the build succeeded while a consumer reads a field the response no longer carries'
    const output = plain(`${build.stdout ?? ''}${build.stderr ?? ''}`)
    // Named, or the failure could be anything. `health.ts` is the consumer that
    // reads `health.environment`; the card asks for the failure to name it.
    if (!/src\/core\/api\/health\.ts/.test(output)) {
      return `it failed, but never named the consumer:\n${output.slice(-500)}`
    }
    return /environment/.test(output) ? null : `it named the consumer, but not over the missing field:\n${output.slice(-500)}`
  } finally {
    writeFileSync(OPERATION, operation)
    run('npm run codegen:update --workspace @karnama/graphql')
  }
})

check('every file this script touched is byte-identical to how it found it', () => {
  for (const path of TOUCHED) {
    if (readFileSync(path, 'utf8') !== snapshots.get(path)) return `${path.slice(ROOT.length + 1)} was left modified`
  }
  return null
})

check('and the build still passes', () => {
  const build = run('npm run build')
  return build.status === 0 ? null : `the build no longer passes, which is a defect in this script:\n${plain(build.stdout ?? '').slice(-400)}`
})

if (failures.length) {
  process.stderr.write(`\nKN-131 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-131 verify passed.\n')
