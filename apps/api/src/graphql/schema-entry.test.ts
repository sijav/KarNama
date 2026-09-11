import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * The schema entry, run as a real process.
 *
 * It is excluded from coverage, so this is what stops that from meaning
 * unchecked. A subprocess is also what CI and a developer actually run, so the
 * thing being verified is the command rather than a function that resembles it.
 *
 * Skipped when `dist` is absent rather than failing: `npm test` before
 * `npm run build` is a normal thing to do. The KN-120 verifier builds first, so
 * the skip cannot hide a real failure where it matters.
 */
const ROOT = join(import.meta.dirname, '..', '..')
const ENTRY = join(ROOT, 'dist', 'graphql', 'schema-entry.js')

/**
 * When a run counts as hung. Not a speed budget: a run is a fresh process that
 * loads NestJS and GraphQL, about a second at idle and several on a loaded
 * machine, and how fast that goes is the machine's, not the command's. A speed
 * budget is what failed this file at random, KN-167. This only ends a run that
 * would never end, at more than ten times the slowest start measured.
 */
const HUNG_AFTER_MS = 60_000

interface Run {
  status: number | null
  stdout: string
  stderr: string
}

/** Starts the built command without blocking the worker, and collects what it wrote. */
const run = (args: string[], cwd: string) =>
  new Promise<Run>((resolve, reject) => {
    const child = spawn(process.execPath, [ENTRY, ...args], { cwd, timeout: HUNG_AFTER_MS })
    const out: Buffer[] = []
    const err: Buffer[] = []
    child.stdout.on('data', (chunk: Buffer) => out.push(chunk))
    child.stderr.on('data', (chunk: Buffer) => err.push(chunk))
    child.on('error', reject)
    child.on('close', (status, signal) => {
      if (signal !== null) {
        const why = child.killed ? `, stopped as hung after ${HUNG_AFTER_MS} ms` : ''
        reject(new Error(`schema-entry ${args.join(' ')} ended by ${signal}${why}`))
        return
      }
      resolve({ status, stdout: Buffer.concat(out).toString('utf8'), stderr: Buffer.concat(err).toString('utf8') })
    })
  })

describe.skipIf(!existsSync(ENTRY))('the built schema command', () => {
  // The four runs start together, once, and the cases read what they wrote.
  // Four in sequence through spawnSync, which blocks the worker, each inside its
  // own case's five second budget, is how this file failed a gate at random:
  // 19.6 seconds for four runs, one of them past its budget, KN-167. Together
  // they cost about one and a half runs, and the only limit on them is
  // HUNG_AFTER_MS, so the hook's own budget is off.
  let staleDir = ''
  let emptyDir = ''
  let current: Run
  let stale: Run
  let generated: Run
  let unknown: Run

  beforeAll(async () => {
    staleDir = await mkdtemp(join(tmpdir(), 'karnama-schema-entry-'))
    await writeFile(join(staleDir, 'schema.gql'), 'type Query { notTheRealSchema: String! }\n')
    // No DATABASE_URL, no WEB_ORIGIN, no port for the generate run. That is the
    // whole point of the card: the contract used to appear only when the
    // application booted.
    emptyDir = await mkdtemp(join(tmpdir(), 'karnama-schema-entry-'))
    ;[current, stale, generated, unknown] = await Promise.all([
      run(['check'], ROOT),
      run(['check'], staleDir),
      run(['generate'], emptyDir),
      run(['sprinkle'], ROOT),
    ])
  }, 0)

  afterAll(async () => {
    await Promise.all([staleDir, emptyDir].filter(Boolean).map((dir) => rm(dir, { recursive: true, force: true })))
  })

  it('checks the committed schema and finds it current', () => {
    expect(current.status).toBe(0)
    expect(`${current.stdout}${current.stderr}`).toContain('matches the resolvers')
  })

  it('fails, non-zero, when the schema on disk is stale', () => {
    expect(stale.status).toBe(1)
    expect(`${stale.stdout}${stale.stderr}`).toMatch(/stale[\s\S]*schema:generate/)
  })

  it('generates into an empty directory, needing no server and no environment', async () => {
    expect(generated.status).toBe(0)
    const written = await readFile(join(emptyDir, 'schema.gql'), 'utf8')
    expect(written).toContain('health: Health!')
    // And the generated file is byte for byte what is committed.
    expect(written).toBe(await readFile(join(ROOT, 'schema.gql'), 'utf8'))
  })

  it('refuses an unknown command', () => {
    expect(unknown.status).toBe(1)
    expect(`${unknown.stdout}${unknown.stderr}`).toContain('unknown command')
  })
})
