#!/usr/bin/env node
// Fails when `src/generated.ts` no longer matches the API's committed schema.
//
// It regenerates into a TEMPORARY directory and compares. It never writes into
// `src/`, and that is the point: the API's build used to run its generator
// before comparing, so a stale artefact always passed because the build had
// repaired the evidence it was supposed to reject. A roast rated that critical
// and the same mistake is one line away here.
//
// Run by `npm run build` in this workspace, which the root build delegates to,
// so the guarantee holds for the command people actually run.

import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const COMMITTED = join(ROOT, 'src', 'generated.ts')
const UPDATE = 'npm run codegen:update --workspace @karnama/graphql'

/** @param {string} message */
const fail = (message) => {
  process.stderr.write(`${message}\n`)
  process.exit(1)
}

let committed
try {
  committed = readFileSync(COMMITTED, 'utf8')
} catch {
  fail(`src/generated.ts is not committed. Run: ${UPDATE}`)
}

// A config that writes somewhere else. Generated rather than kept as a second
// checked-in file, so the real config stays the only description of what is
// produced and this one cannot drift from it.
const scratch = mkdtempSync(join(tmpdir(), 'karnama-codegen-'))
const outputPath = join(scratch, 'generated.ts').replaceAll('\\', '/')
const configPath = join(scratch, 'codegen.check.mts')

try {
  writeFileSync(
    configPath,
    [
      `import config from ${JSON.stringify(join(ROOT, 'codegen.ts').replaceAll('\\', '/'))}`,
      '',
      'const entries = Object.values(config.generates ?? {})',
      'const first = entries[0]',
      'if (!first) throw new Error("the codegen config generates nothing")',
      '',
      'export default {',
      '  ...config,',
      `  schema: ${JSON.stringify(join(ROOT, '..', '..', 'apps', 'api', 'schema.gql').replaceAll('\\', '/'))},`,
      `  generates: { ${JSON.stringify(outputPath)}: first },`,
      '}',
    ].join('\n'),
  )

  const result = spawnSync(`npx graphql-codegen --config ${JSON.stringify(configPath)}`, {
    cwd: ROOT,
    encoding: 'utf8',
    shell: true,
    env: { ...process.env, FORCE_COLOR: '0' },
  })
  if (result.status !== 0) {
    fail(`codegen failed while checking:\n${result.stdout}${result.stderr}`)
  }

  const fresh = readFileSync(outputPath, 'utf8')
  if (fresh !== committed) {
    fail(`src/generated.ts is stale: the API schema has changed. Run: ${UPDATE}`)
  }
  process.stdout.write('src/generated.ts matches the API schema.\n')
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
