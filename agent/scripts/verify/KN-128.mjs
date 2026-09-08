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
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
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
// Temporary, and in the WEB app beside the module it imports, because that is
// the contract that matters. An earlier version put it next to `generated.ts`
// and imported from there, which proved the generated type was a selection and
// nothing about what the app receives. Changing the web re-export to
// `import { type Query as HealthQuery }` would have restored the whole-object
// defect this card removed while every check here still passed. A roast asked
// for the mutation I had not thought of and that was it.
// Removed in a `finally`, and the restoration check proves it is gone.
const PROBE = join(ROOT, 'apps', 'web', 'src', 'core', 'api', 'kn-128-probe.ts')
// How tsc names it, relative to the workspace it runs in. Attribution matched a
// bare basename before, so a file with the same name anywhere in the web app
// would have been read as the probe.
const PROBE_AS_TSC_NAMES_IT = 'src/core/api/kn-128-probe.ts'

// This script writes to these, and to nothing else. Snapshotted here rather
// than inside the checks, so the restoration check compares against the state
// the script was HANDED rather than against whatever it produced.
const TOUCHED = [OPERATION, GENERATED, MODEL, RESOLVER, API_SCHEMA]
const snapshots = new Map(TOUCHED.map((path) => [path, readFileSync(path, 'utf8')]))

// The probe path is unlikely to collide, which is not the same as safe. If
// something is already there it is someone's work, and overwriting it to prove
// a point about type safety would be a poor trade. Refuse instead: a script
// that destroys uncommitted work to run is not one anybody should run.
if (existsSync(PROBE)) {
  process.stderr.write(`${PROBE} already exists. This script needs that path and will not overwrite it. Move it and re-run.\n`)
  process.exit(1)
}

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

// tsc colourises its diagnostics whatever FORCE_COLOR says, and puts the escape
// codes BETWEEN the word and the code, so "error TS2339" is not contiguous in
// the raw bytes. A grep for it finds nothing and reports zero errors while the
// compiler is plainly printing one. Found by planting the case.
// eslint-disable-next-line no-control-regex -- matching escape codes is the point
const plain = (text) => text.replace(/\[[0-9;]*m/g, '')

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
    // ONE diagnostic, not two substrings that could come from two unrelated
    // messages. This is the sentence graphql-codegen prints when it validates
    // the document against the schema, naming the field and the type it is not
    // on, and nothing else in the build produces it.
    return /Cannot query field "environmentTypo" on type "Health"/.test(output)
      ? null
      : `it failed, but not by validating this operation against the schema:\n${output.slice(-500)}`
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
    const emitted = readFileSync(API_SCHEMA, 'utf8')
    if (emitted === schema) return 'the schema did not change, so nothing is being checked'
    // REQUIRED, asserted against the emitted SDL rather than assumed from the
    // decorator. Without this the plant could regress to nullable and every
    // check below would still pass, proving the weaker clause under the
    // stronger clause's name.
    if (!/addedByTheVerifier:\s*String!/.test(emitted)) {
      return `the planted field did not reach the schema as required:\n${/.*addedByTheVerifier.*/.exec(emitted)?.[0] ?? 'it is not in the schema at all'}`
    }
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
      // Baseline FIRST, with the plant applied and no probe present. Without it
      // "the plant broke something outside the probe" cannot tell a break this
      // script caused from one that was already there, and every conclusion
      // below rests on the difference.
      const baseline = run('npm run lint:tsc --workspace @karnama/web')
      if (baseline.status !== 0) {
        const detail = plain(`${baseline.stdout ?? ''}${baseline.stderr ?? ''}`)
        // The planted field appearing here at all is the defect itself, one
        // layer earlier than the probe would have found it: something in the
        // web app is typed as the whole Health object, so adding a field to
        // Health changed what the app believes a response contains.
        if (/addedByTheVerifier/.test(detail)) {
          return `the web app demands a field the query never selected, before any probe exists, so a consumer type is the whole object rather than the selection:\n${detail.slice(-500)}`
        }
        return `the web app does not typecheck with the planted field and no probe, so nothing below is attributable:\n${detail.slice(-500)}`
      }

      writeFileSync(
        PROBE,
        [
          '// Written by agent/scripts/verify/KN-128.mjs, and deleted by it.',
          '// Imports through the PUBLIC BARREL, which is what a screen imports.',
          '// Importing ./health directly proved the module was right and nothing',
          '// about the surface: re-exporting `type Query as HealthQuery` from',
          '// index.ts restores the whole-object type on the public API while the',
          '// module underneath stays correct. Every layer a consumer goes',
          '// through has to be on the path this probe takes.',
          "import type { HealthQuery } from './index'",
          '',
          '// The positive control. A response type of `never` would reject the',
          '// unselected field below with the same error code while proving',
          '// nothing, so the SELECTED fields have to stay readable.',
          'export const readsTheSelection = (q: HealthQuery) => `${q.health.status}${q.health.environment}${q.health.uptimeSeconds}`',
          '',
          '// And nothing beyond the selection is REQUIRED of a response. This is',
          '// the direction that catches a consumer aliasing the whole object',
          '// type: `Health` demands the planted field, the selection does not.',
          'export const acceptsExactlyTheSelection = (v: { readonly status: string; readonly environment: string; readonly uptimeSeconds: number }): HealthQuery[\'health\'] => v',
          '',
          '// The case under test. Must not compile.',
          'export const reachesAnUnselectedField = (q: HealthQuery) => q.health.addedByTheVerifier',
          '',
        ].join('\n'),
      )
      const probe = run('npm run lint:tsc --workspace @karnama/web')
      if (probe.status === 0) return 'a field the query never selected can be read through the response type'
      // Separators normalised, because tsc prints Windows paths with
      // backslashes and the comparison below is written with forward ones.
      const output = plain(`${probe.stdout ?? ''}${probe.stderr ?? ''}`).replaceAll('\\', '/')
      // Errors ON THE PROBE, separated from everything else. A run where the
      // plant broke some other file is a run this check cannot conclude from,
      // and the earlier version reported exactly that state as "it refused, but
      // not this property access", which pointed the reader at the wrong file.
      // Fail closed, and say which.
      const errors = output.split('\n').filter((line) => /error TS\d+/.test(line))
      const onProbe = errors.filter((line) => line.includes(PROBE_AS_TSC_NAMES_IT))
      const elsewhere = errors.filter((line) => !line.includes(PROBE_AS_TSC_NAMES_IT))
      if (elsewhere.length) {
        return `the plant broke ${elsewhere.length} thing(s) outside the probe, so this run proves nothing about the response type:\n${elsewhere.slice(0, 3).join('\n')}`
      }
      // EXACTLY one, or a positive control failed too and a refusal from a
      // broken type proves nothing about the selection.
      if (onProbe.length !== 1) return `expected exactly one error on the probe, got ${onProbe.length}:\n${output.slice(-600)}`
      // TS2339 is "property does not exist on type", named together with the
      // property, which separates "the compiler rejected THIS access" from
      // "the compiler rejected something and the name appeared in the message".
      const only = onProbe[0]
      // The positive control failing over the planted field is its own answer,
      // and a useful one: it means the response type DEMANDS a field the query
      // never selected, which is the whole-object type arriving through some
      // layer between the generated file and here. Say that rather than
      // reporting it as the wrong property access.
      if (/TS274\d/.test(only) && /addedByTheVerifier/.test(only)) {
        return `the response type requires a field the query never selected, so a layer between the generated types and the barrel is handing back the whole object:\n${only}`
      }
      if (!/TS2339/.test(only) || !/addedByTheVerifier/.test(only)) {
        return `it refused, but not this property access on the probe:\n${only}`
      }
      return null
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

check('every file this script touched is byte-identical to how it found it', () => {
  // The build is not evidence of restoration and it took a roast to see it.
  // The plant is internally consistent by construction: model, resolver, schema
  // and generated types all agree, because each was regenerated from the one
  // before it. So a run that restored NOTHING still builds, and the previous
  // version of this check reported that as everything having been put back.
  // Bytes against the snapshot, or it is not a restoration check.
  for (const path of TOUCHED) {
    if (readFileSync(path, 'utf8') !== snapshots.get(path)) return `${path.slice(ROOT.length + 1)} was left modified`
  }
  return existsSync(PROBE) ? `${PROBE.slice(ROOT.length + 1)} was left behind` : null
})

check('and the build still passes', () => {
  const build = run('npm run build')
  return build.status === 0 ? null : `the build no longer passes, which is a defect in this script:\n${(build.stdout ?? '').slice(-400)}`
})

if (failures.length) {
  process.stderr.write(`\nKN-128 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-128 verify passed.\n')
