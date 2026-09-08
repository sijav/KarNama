import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * The entry file, run as a real process.
 *
 * It is the one file in this workspace excluded from coverage, so this is what
 * stops that exclusion from meaning "unchecked". Coverage cannot see a
 * subprocess, but a subprocess is exactly what a deploy runs, so what is
 * verified here is closer to the thing than an in-process call would be.
 *
 * It runs the BUILD, so it is skipped when dist is absent rather than failing:
 * `npm test` before `npm run build` is a normal thing to do, and a test that
 * fails for that reason teaches people to ignore it. The KN-034 verifier builds
 * first and then runs the suite, so the skip cannot hide a real failure there.
 */
const ROOT = join(import.meta.dirname, '..', '..')
const ENTRY = join(ROOT, 'dist', 'database', 'cli-entry.js')

const run = (args: string[], env: Record<string, string>) =>
  spawnSync(process.execPath, [ENTRY, ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    env: { ...process.env, ...env },
  })

describe.skipIf(!existsSync(ENTRY))('the built entry file', () => {
  it('refuses to run at all without the environment, and says which variable', () => {
    const result = run(['migrate'], { WEB_ORIGIN: '', DATABASE_URL: '' })
    expect(result.status).toBe(1)
    expect(`${result.stdout}${result.stderr}`).toMatch(/cannot start[\s\S]*WEB_ORIGIN/)
  })

  it('reports an unknown command rather than doing something', () => {
    // Points at a closed port on purpose. The command is rejected before any
    // connection matters, and if that ever stops being true this test starts
    // failing with a connection error, which is the right kind of loud.
    const result = run(['definitely-not-a-command'], {
      WEB_ORIGIN: 'http://localhost:5173',
      DATABASE_URL: 'postgresql://user:pass@127.0.0.1:1/none',
    })
    expect(result.status).toBe(1)
    expect(`${result.stdout}${result.stderr}`).toMatch(/unknown command|ECONNREFUSED|connect/i)
  })
})
