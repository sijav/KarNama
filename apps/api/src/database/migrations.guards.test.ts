import { mkdtemp, mkdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { applyMigrations, readMigrations, type SqlRunner } from './migrations.js'

/**
 * The guards in the migration runner, exercised.
 *
 * These are not defensive decoration: each one is a real external condition. A
 * migrations directory can genuinely be empty on a bad checkout, a directory
 * can genuinely be added without a timestamp prefix, and the SQL runner is an
 * interface two different clients implement, so its answer shape is exactly the
 * kind of thing that changes under you.
 *
 * The distinction matters. A guard against something only an edit to the same
 * file could cause belongs in the type system, and one was moved there. A guard
 * against the world belongs here, with a test.
 */
const withMigrationDirs = async (names: string[]): Promise<string> => {
  const root = await mkdtemp(join(tmpdir(), 'karnama-migrations-'))
  await mkdir(join(root, 'prisma', 'migrations'), { recursive: true })
  for (const name of names) {
    await mkdir(join(root, 'prisma', 'migrations', name), { recursive: true })
    await writeFile(join(root, 'prisma', 'migrations', name, 'migration.sql'), 'SELECT 1;')
  }
  return root
}

describe('reading the migrations', () => {
  it('refuses an empty migrations directory', async () => {
    const root = await withMigrationDirs([])
    await expect(readMigrations(root)).rejects.toThrow(/no migrations found/)
  })

  it('refuses a directory without a timestamp prefix, because ordering IS the prefix', async () => {
    const root = await withMigrationDirs(['20260101000000_fine', 'add_a_column'])
    await expect(readMigrations(root)).rejects.toThrow(/add_a_column/)
  })

  it('refuses a name with characters that would sort unpredictably', async () => {
    const root = await withMigrationDirs(['20260101000000_Fine_But_Capitalised'])
    await expect(readMigrations(root)).rejects.toThrow(/must be/)
  })

  it('reads them in order, whatever order the filesystem lists them in', async () => {
    const root = await withMigrationDirs(['20260301000000_third', '20260101000000_first', '20260201000000_second'])
    const migrations = await readMigrations(root)
    expect(migrations.map((migration) => migration.name)).toEqual([
      '20260101000000_first',
      '20260201000000_second',
      '20260301000000_third',
    ])
  })
})

describe('applying them through an unfamiliar client', () => {
  const migration = { name: '20260101000000_first', sql: 'SELECT 1;' }

  // The lock has to be granted or nothing downstream runs, so the fake answers
  // it and then hands the answer under test to the ledger read.
  const runnerAnswering = (answer: unknown): SqlRunner => ({
    exec: (sql: string) => {
      if (sql.startsWith('SELECT pg_try_advisory_lock')) return Promise.resolve([{ rows: [{ got: true }] }])
      if (sql.startsWith('SELECT "checksum"')) return Promise.resolve(answer)
      return Promise.resolve([{ rows: [] }])
    },
  })

  it('refuses an answer that is not an array of results', async () => {
    await expect(applyMigrations(runnerAnswering({ rows: [] }), [migration])).rejects.toThrow(/array of results/)
  })

  it('refuses a result with no rows field', async () => {
    await expect(applyMigrations(runnerAnswering([{ affected: 0 }]), [migration])).rejects.toThrow(/no rows field/)
    await expect(applyMigrations(runnerAnswering([null]), [migration])).rejects.toThrow(/no rows field/)
  })

  it('refuses a rows field that is not an array', async () => {
    await expect(applyMigrations(runnerAnswering([{ rows: 3 }]), [migration])).rejects.toThrow(/not an array/)
  })

  it('treats a name with a quote in it as data, not as SQL', async () => {
    // The ledger is written with an interpolated name, so a name containing a
    // quote would break out of the string. Nothing generates such a name today,
    // and the escaping is one character, so this is cheap insurance against the
    // day something does.
    const statements: string[] = []
    const runner: SqlRunner = {
      exec: (sql: string) => {
        statements.push(sql)
        if (sql.startsWith('SELECT pg_try_advisory_lock')) return Promise.resolve([{ rows: [{ got: true }] }])
        return Promise.resolve([{ rows: [] }])
      },
    }
    await applyMigrations(runner, [{ name: "20260101000000_o'brien", sql: 'SELECT 1;' }])
    expect(statements.some((sql) => sql.includes("'20260101000000_o''brien'"))).toBe(true)
  })

  it('refuses to start when the lock is held, without running a single migration', async () => {
    // The concurrency clause. Two PGlite instances cannot share a dataDir, so
    // the second runner is represented by a lock that is already taken, which
    // is the only thing the losing runner would actually observe.
    const statements: string[] = []
    const runner: SqlRunner = {
      exec: (sql: string) => {
        statements.push(sql)
        if (sql.startsWith('SELECT pg_try_advisory_lock')) return Promise.resolve([{ rows: [{ got: false }] }])
        return Promise.resolve([{ rows: [] }])
      },
    }
    await expect(
      applyMigrations(runner, [{ name: '20260101000000_first', sql: 'CREATE TABLE never_created (id int);' }], {
        lockAttempts: 2,
        lockRetryMs: 0,
      }),
    ).rejects.toThrow(/another deploy is already migrating/)

    // Waited rather than raced: it asked twice and never ran the migration.
    expect(statements.filter((sql) => sql.startsWith('SELECT pg_try_advisory_lock'))).toHaveLength(2)
    expect(statements.some((sql) => sql.includes('never_created'))).toBe(false)
  })

  it('refuses a migration that manages its own transaction', async () => {
    // The runner wraps every migration in one, so a migration containing its
    // own COMMIT would close that wrapper early and the ledger row would land
    // outside it, which is the exact defect all of this exists to remove.
    const runner: SqlRunner = { exec: () => Promise.resolve([{ rows: [] }]) }
    await expect(
      applyMigrations(runner, [{ name: '20260101000000_first', sql: 'BEGIN;\nSELECT 1;\nCOMMIT;' }]),
    ).rejects.toThrow(/manages its own transaction/)
  })
})
