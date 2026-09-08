import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

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

const run = (args: string[], cwd: string) => spawnSync(process.execPath, [ENTRY, ...args], { cwd, encoding: 'utf8' })

describe.skipIf(!existsSync(ENTRY))('the built schema command', () => {
  it('checks the committed schema and finds it current', () => {
    const result = run(['check'], ROOT)
    expect(result.status).toBe(0)
    expect(`${result.stdout}${result.stderr}`).toContain('matches the resolvers')
  })

  it('fails, non-zero, when the schema on disk is stale', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'karnama-schema-entry-'))
    await writeFile(join(dir, 'schema.gql'), 'type Query { notTheRealSchema: String! }\n')

    const result = run(['check'], dir)
    expect(result.status).toBe(1)
    expect(`${result.stdout}${result.stderr}`).toMatch(/stale[\s\S]*schema:generate/)
  })

  it('generates into an empty directory, needing no server and no environment', async () => {
    // No DATABASE_URL, no WEB_ORIGIN, no port. That is the whole point of the
    // card: the contract used to appear only when the application booted.
    const dir = await mkdtemp(join(tmpdir(), 'karnama-schema-entry-'))
    const result = run(['generate'], dir)

    expect(result.status).toBe(0)
    const written = await readFile(join(dir, 'schema.gql'), 'utf8')
    expect(written).toContain('health: Health!')
    // And the generated file is byte for byte what is committed.
    expect(written).toBe(await readFile(join(ROOT, 'schema.gql'), 'utf8'))
  })

  it('refuses an unknown command', () => {
    const result = run(['sprinkle'], ROOT)
    expect(result.status).toBe(1)
    expect(`${result.stdout}${result.stderr}`).toContain('unknown command')
  })
})
