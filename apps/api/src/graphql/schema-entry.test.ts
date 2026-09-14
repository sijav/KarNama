import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * The schema entry, run as a real process.
 *
 * It is excluded from coverage, so this is what stops that from meaning
 * unchecked, and a subprocess is what CI and a developer actually run. It starts
 * only runs that answer before the schema is loaded, KN-403: a start that checks
 * or generates loads NestJS and GraphQL, most of a second of CPU in a fresh
 * process, and a test that paid for it four times failed the gate whenever the
 * machine was busy, KN-167. What those commands decide is tested in process in
 * `schema-command.test.ts`, and `npm run build` runs the built `check`.
 *
 * Skipped when `dist` is absent rather than failing: `npm test` before
 * `npm run build` is a normal thing to do.
 */
const ROOT = join(import.meta.dirname, '..', '..')
const ENTRY = join(ROOT, 'dist', 'graphql', 'schema-entry.js')

const run = (args: string[]) => spawnSync(process.execPath, [ENTRY, ...args], { cwd: ROOT, encoding: 'utf8' })

describe.skipIf(!existsSync(ENTRY))('the built schema entry', () => {
  it('refuses an unknown command, non-zero, and names it', () => {
    const result = run(['sprinkle'])
    expect(result.status).toBe(1)
    expect(result.stderr).toBe('unknown command "sprinkle", expected generate or check\n')
  })

  it('refuses to run with no command at all', () => {
    const result = run([])
    expect(result.status).toBe(1)
    expect(result.stderr).toBe('unknown command "", expected generate or check\n')
  })
})
