#!/usr/bin/env node
// Verifies KN-128: operations are generated and validated, not asserted.
//
// Exit condition: a query selecting a field that does not exist fails the
// build, the response type reflects the SELECTION rather than the whole object
// type, adding a required field to Health does not change HealthQueryData, and
// each is proved by a planted case.
//
// All three are proved by planting. The first two are the ones a reader would
// otherwise have to take on trust, and both were false one card ago: the
// document was a `gql` template with a hand-written `TypedDocumentNode`
// annotation, so a misspelled field typechecked and the server rejected it at
// runtime, and the response type claimed the whole object rather than the three
// fields selected.
//
// This one WRITES: it edits the operation document and the health model, and
// restores both from snapshots taken first, then re-runs the build to prove it.

import { spawnSync } from 'node:child_process'
import { readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const API = join(ROOT, 'apps', 'api')
const PKG = join(ROOT, 'packages', 'graphql')

const OPERATION = join(PKG, 'src', 'operations', 'health.graphql')
const GENERATED = join(PKG, 'src', 'generated.ts')
const MODEL = join(API, 'src', 'health', 'health.model.ts')
const RESOLVER = join(API, 'src', 'health', 'health.resolver.ts')
const API_SCHEMA = join(API, 'schema.gql')
// Temporary, and inside `src` because that is what `lint:tsc` typechecks. It is
// removed in a `finally`, and the last check in this file re-runs the build to
// prove nothing was left behind.
const PROBE = join(PKG, 'src', 'kn-128-probe.ts')

// Comments stripped before every grep for a banned construct. This file's own
// prose names the constructs it removed ("a `gql` template with a hand-written
// `TypedDocumentNode` annotation"), so the first version of the check below
// found its own explanation and reported the defect it had just fixed. Third
// time this exact shape has bitten, after KN-004 and KN-035.
const code = (path) =>
  readFileSync(path, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')

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

check('the operations are documents beside the schema, not templates in the app', () => {
  const config = code(join(PKG, 'codegen.ts'))
  if (!/documents:\s*'[^']*operations/.test(config)) return 'codegen reads no operation documents, so nothing validates them'
  for (const plugin of ['typescript-operations', 'typed-document-node']) {
    if (!config.includes(plugin)) return `the ${plugin} plugin is not in use, so the document and its type are not generated together`
  }

  const web = code(join(ROOT, 'apps', 'web', 'src', 'core', 'api', 'health.ts'))
  // Stripping comments must not leave an empty file, or the two greps below
  // pass by having nothing to read. This line is what makes them falsifiable.
  if (!/from '@karnama\/graphql'/.test(web)) return 'the web app does not import the generated package'
  // The two constructs this card removed.
  if (/TypedDocumentNode\s*</.test(web)) return 'the web app still annotates a document by hand'
  return /gql`/.test(web) ? 'the web app still writes a query as a template literal' : null
})

check('the response type is the SELECTION, not the whole object type', () => {
  const generated = readFileSync(GENERATED, 'utf8')
  const query = /export type HealthQuery = ([^;]+);/.exec(generated)?.[1] ?? ''
  if (!query) return 'there is no generated HealthQuery type'
  // It must be an inline shape of the three selected fields, not `Health`.
  if (/\bHealth\b/.test(query)) return `HealthQuery refers to the whole object type: ${query.trim().slice(0, 120)}`
  for (const field of ['status', 'environment', 'uptimeSeconds']) {
    if (!query.includes(field)) return `HealthQuery is missing ${field}`
  }
  return null
})

check('A MISSPELLED FIELD FAILS THE BUILD, proved by misspelling one', () => {
  const operation = readFileSync(OPERATION, 'utf8')
  try {
    const broken = operation.replace('    environment\n', '    environmentTypo\n')
    if (broken === operation) return 'the operation could not be edited, so this check proves nothing'
    writeFileSync(OPERATION, broken)

    const build = run('npm run build')
    if (build.status === 0) return 'the build succeeded with a query selecting a field the schema does not have'
    const output = `${build.stdout ?? ''}${build.stderr ?? ''}`
    // For the RIGHT reason, and the field name alone does not establish that:
    // a build could mention it while failing for some unrelated consequence.
    // The diagnostic is what proves codegen VALIDATED the document against the
    // schema, so require the diagnostic and the field together.
    if (!/Cannot query field/i.test(output)) return `it failed, but not by validating the document:\n${output.slice(-400)}`
    return /environmentTypo/.test(output) ? null : `it failed validation, but over some other field:\n${output.slice(-400)}`
  } finally {
    writeFileSync(OPERATION, operation)
  }
})

check('ADDING A REQUIRED FIELD TO Health DOES NOT CHANGE THE QUERY TYPE, proved by adding one', () => {
  const model = readFileSync(MODEL, 'utf8')
  const resolver = readFileSync(RESOLVER, 'utf8')
  const schema = readFileSync(API_SCHEMA, 'utf8')
  const generated = readFileSync(GENERATED, 'utf8')
  const before = /export type HealthQuery = ([^;]+);/.exec(generated)?.[1] ?? ''

  try {
    // REQUIRED, which is what the exit condition asks for and is the harder
    // case. A nullable field proves less: on the hand-written `{ health: Health }`
    // shape this card removed, an added nullable field reads as possibly
    // undefined anyway, so the compiler's refusal below would be ambiguous.
    // Non-null makes the claim unambiguous, and forces the resolver to supply
    // it, which is what a real schema change looks like.
    const changed = model.replace(
      "  @Field(() => Number, { description: 'Seconds since this process started, so a cold start is visible' })",
      "  @Field(() => String, { description: 'Added by the verifier' })\n  addedByTheVerifier!: string\n\n  @Field(() => Number, { description: 'Seconds since this process started, so a cold start is visible' })",
    )
    if (changed === model) return 'the model could not be edited, so this check proves nothing'
    writeFileSync(MODEL, changed)

    // The resolver returns an object literal typed `Health`, so a required
    // field that nothing supplies would fail to compile for a reason that has
    // nothing to do with this check.
    const changedResolver = resolver.replace("      status: 'ok',", "      status: 'ok',\n      addedByTheVerifier: 'planted',")
    if (changedResolver === resolver) return 'the resolver could not be edited, so this check proves nothing'
    writeFileSync(RESOLVER, changedResolver)

    const compile = run('npx tsc -p tsconfig.build.json', API)
    if (compile.status !== 0) return `the API stopped compiling, so the mutation is wrong:\n${compile.stdout ?? ''}`
    if (run('npm run schema:update', API).status !== 0) return 'schema:update failed'
    if (readFileSync(API_SCHEMA, 'utf8') === schema) return 'the schema did not change, so nothing is being checked'
    if (run('npm run codegen:update --workspace @karnama/graphql').status !== 0) return 'codegen:update failed'

    const regenerated = readFileSync(GENERATED, 'utf8')
    const after = /export type HealthQuery = ([^;]+);/.exec(regenerated)?.[1] ?? ''
    if (!/addedByTheVerifier/.test(regenerated)) {
      return 'the new field never reached the generated types, so the mutation did not land'
    }
    // The Health TYPE gained the field. The QUERY type must not, because the
    // query did not select it. The old shape said Apollo returned the whole
    // object, which was a lie the day it was written.
    if (after !== before) return `the query type changed when a field nobody selected was added:\n  before ${before}\n  after  ${after}`

    // Text equality is not enough on its own, and saying so is the point. The
    // shape this card removed was `{ health: Health }`, whose TEXT does not
    // change when Health gains a field either, while its MEANING does: reading
    // an unselected field typechecks and is undefined at runtime. So read the
    // field through the query type and require the compiler to refuse.
    try {
      writeFileSync(
        PROBE,
        [
          '// Written by agent/scripts/verify/KN-128.mjs. Must not compile.',
          "import type { HealthQuery } from './generated.js'",
          'export const reachesAnUnselectedField = (q: HealthQuery) => q.health.addedByTheVerifier',
          '',
        ].join('\n'),
      )
      const probe = run('npm run lint:tsc --workspace @karnama/graphql')
      if (probe.status === 0) return 'a field the query never selected can be read through the response type'
      const output = `${probe.stdout ?? ''}${probe.stderr ?? ''}`
      // TS2339 is "property does not exist on type". Requiring the code as well
      // as the name is what separates "the compiler refused this access" from
      // "the compiler refused something and the name appeared in the message".
      if (!/TS2339/.test(output)) return `it refused, but not by rejecting a property access:\n${output.slice(-400)}`
      if (!/kn-128-probe/.test(output)) return `something else failed to compile, not the probe:\n${output.slice(-400)}`
      return /addedByTheVerifier/.test(output) ? null : `it refused, but not over the unselected field:\n${output.slice(-400)}`
    } finally {
      rmSync(PROBE, { force: true })
    }
  } finally {
    writeFileSync(MODEL, model)
    writeFileSync(RESOLVER, resolver)
    writeFileSync(API_SCHEMA, schema)
    writeFileSync(GENERATED, generated)
    run('npx tsc -p tsconfig.build.json', API)
  }
})

check('everything was put back, and the build still passes', () => {
  const build = run('npm run build')
  return build.status === 0 ? null : `the build no longer passes, which is a defect in this script:\n${(build.stdout ?? '').slice(-400)}`
})

if (failures.length) {
  process.stderr.write(`\nKN-128 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-128 verify passed.\n')
