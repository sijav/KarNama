import { mkdtemp, mkdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { PGlite } from '@electric-sql/pglite'
import { applyMigrations, readMigrations, type SqlRunner } from './migrations.js'

const freshDb = async () => {
  const db = new PGlite()
  await db.waitReady
  return db
}

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

describe('transaction control hidden inside a migration', () => {
  // Found by a roast, and both cases are the failure this whole card exists to
  // remove, arriving through the guard rather than around it. The first regex
  // matched only at the START of a line and knew only four keywords.
  const runnerOver = (db: { exec: (sql: string) => Promise<unknown> }): SqlRunner => ({ exec: (sql) => db.exec(sql) })

  it('refuses an inline COMMIT, which would commit the DDL and leave the ledger behind', async () => {
    // `CREATE TABLE x; COMMIT;` on ONE line closes the wrapper early. The DDL
    // commits, the next statement fails, the rollback has nothing to undo, and
    // the ledger records a failure for a migration that actually ran. The next
    // deploy replays it and dies on the table that already exists.
    const db = await freshDb()
    await expect(
      applyMigrations(runnerOver(db), [
        { name: '20260101000000_inline', sql: 'CREATE TABLE probe_inline (id int); COMMIT;\nCREATE TABLE probe_inline (id int);' },
      ]),
    ).rejects.toThrow(/manages its own transaction/)
    await db.close()
  })

  it('refuses ABORT, which would record success for a migration that did nothing', async () => {
    // The worst of the set. ABORT rolls the wrapper back, so the DDL vanishes,
    // and the ledger INSERT then runs outside any transaction and COMMITS a
    // successful row. The migration is recorded as applied, the table does not
    // exist, and every later deploy skips it. Silent and permanent.
    const db = await freshDb()
    await expect(
      applyMigrations(runnerOver(db), [{ name: '20260101000000_abort', sql: 'CREATE TABLE probe_abort (id int);\nABORT;' }]),
    ).rejects.toThrow(/manages its own transaction/)
    await db.close()
  })

  it('refuses END, which is COMMIT under another name', async () => {
    const db = await freshDb()
    await expect(
      applyMigrations(runnerOver(db), [{ name: '20260101000000_end', sql: 'CREATE TABLE probe_end (id int);\nEND;' }]),
    ).rejects.toThrow(/manages its own transaction/)
    await db.close()
  })

  it('ACCEPTS a DO block, whose BEGIN and END belong to PL/pgSQL rather than to a transaction', async () => {
    // The other half of the same fix, and the reason a keyword search is not
    // enough: this is valid, common, and must not be rejected.
    const db = await freshDb()
    const applied = await applyMigrations(runnerOver(db), [
      {
        name: '20260101000000_do',
        sql: "DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'probe_enum') THEN CREATE TYPE probe_enum AS ENUM ('a'); END IF; END $$;",
      },
    ])
    expect(applied).toEqual(['20260101000000_do'])
    await db.close()
  })

  it('ACCEPTS a migration whose text merely mentions a keyword in a string or a comment', async () => {
    const db = await freshDb()
    const applied = await applyMigrations(runnerOver(db), [
      {
        name: '20260101000000_mentions',
        sql: "-- COMMIT is mentioned here\nCREATE TABLE probe_mentions (note text DEFAULT 'ROLLBACK; BEGIN;');",
      },
    ])
    expect(applied).toEqual(['20260101000000_mentions'])
    await db.close()
  })
})

describe('the ledger DDL and the lock', () => {
  it('takes the lock BEFORE creating the ledger, because CREATE TABLE IF NOT EXISTS is not race safe', async () => {
    // Two sessions can both see the table as absent and one then fails with a
    // catalog uniqueness violation despite IF NOT EXISTS. Advisory locks do not
    // depend on any user table, so the lock can and must come first. The comment
    // this replaced claimed both runners would succeed, which was simply wrong.
    const statements: string[] = []
    const runner: SqlRunner = {
      exec: (sql: string) => {
        statements.push(sql)
        if (sql.startsWith('SELECT pg_try_advisory_lock')) return Promise.resolve([{ rows: [{ got: true }] }])
        return Promise.resolve([{ rows: [] }])
      },
    }
    await applyMigrations(runner, [])
    expect(statements[0]).toMatch(/pg_try_advisory_lock/)
    expect(statements.findIndex((sql) => sql.includes('_karnama_migrations'))).toBeGreaterThan(0)
  })
})

describe('transaction control hidden behind quoting', () => {
  const runnerOver = (db: { exec: (sql: string) => Promise<unknown> }): SqlRunner => ({ exec: (sql) => db.exec(sql) })

  // Both payloads are a roast's, run against the real runner. Each defeated a
  // version of the guard that stripped quoting with independent passes: the
  // dollar-quote pass saw `$tag$ ... $tag$` spanning two ORDINARY strings and
  // erased the command between them.
  it('refuses an ABORT hidden between two strings that look like dollar quotes', async () => {
    // Recorded APPLIED with no table, and every later deploy skipped it.
    const db = await freshDb()
    await expect(
      applyMigrations(runnerOver(db), [
        { name: '20260101000000_hidden_abort', sql: "CREATE TABLE probe (id int);\nSELECT '$tag$'; ABORT; SELECT '$tag$';" },
      ]),
    ).rejects.toThrow(/manages its own transaction/)
    await db.close()
  })

  it('refuses a COMMIT hidden the same way', async () => {
    const db = await freshDb()
    await expect(
      applyMigrations(runnerOver(db), [
        {
          name: '20260101000000_hidden_commit',
          sql: "CREATE TABLE probe (id int);\nSELECT '$tag$'; COMMIT; SELECT '$tag$';\nCREATE TABLE probe (id int);",
        },
      ]),
    ).rejects.toThrow(/manages its own transaction/)
    await db.close()
  })

  it('ACCEPTS a quoted identifier that happens to be a transaction keyword', async () => {
    // The other direction. "commit" as a column name is legal and must not be
    // mistaken for the command.
    const db = await freshDb()
    const applied = await applyMigrations(runnerOver(db), [
      { name: '20260101000000_quoted', sql: 'CREATE TABLE probe_quoted ("commit" int, "end" text);' },
    ])
    expect(applied).toEqual(['20260101000000_quoted'])
    await db.close()
  })

  it('ACCEPTS a semicolon and a keyword inside an escaped string', async () => {
    const db = await freshDb()
    const applied = await applyMigrations(runnerOver(db), [
      // String.raw, because writing this through a shell heredoc silently ate
      // the backslash and turned the SQL into a real ABORT statement. The test
      // then failed and the lexer was right, which cost a debugging round.
      { name: '20260101000000_escaped', sql: String.raw`CREATE TABLE probe_escaped (note text DEFAULT E'a\'b; ABORT;');` },
    ])
    expect(applied).toEqual(['20260101000000_escaped'])
    await db.close()
  })

  it('ACCEPTS a doubled quote, which keeps the string open rather than ending it', async () => {
    // `'it''s'` is how SQL escapes a quote, and it is the case that decides
    // whether the scanner ends a string too early. If it did, everything after
    // the apostrophe would be read as statements and the ABORT below would be
    // treated as real, refusing a perfectly valid migration.
    const db = await freshDb()
    const applied = await applyMigrations(runnerOver(db), [
      { name: '20260101000000_doubled', sql: "CREATE TABLE probe_doubled (note text DEFAULT 'it''s; ABORT; fine');" },
    ])
    expect(applied).toEqual(['20260101000000_doubled'])

    // And the default really is the whole string, so the scanner did not
    // quietly swallow part of it.
    const stored = await db.query<{ column_default: string }>(
      `SELECT column_default FROM information_schema.columns WHERE table_name = 'probe_doubled';`,
    )
    expect(stored.rows[0]?.column_default).toContain("it''s; ABORT; fine")
    await db.close()
  })

  it('ACCEPTS a doubled quote inside a quoted identifier', async () => {
    const db = await freshDb()
    const applied = await applyMigrations(runnerOver(db), [
      { name: '20260101000000_doubled_ident', sql: 'CREATE TABLE probe_ident ("a""b; ABORT" int);' },
    ])
    expect(applied).toEqual(['20260101000000_doubled_ident'])
    await db.close()
  })

  it('ACCEPTS a keyword inside a nested block comment', async () => {
    const db = await freshDb()
    const applied = await applyMigrations(runnerOver(db), [
      { name: '20260101000000_nested', sql: '/* outer /* inner ABORT; */ still comment */\nCREATE TABLE probe_nested (id int);' },
    ])
    expect(applied).toEqual(['20260101000000_nested'])
    await db.close()
  })
})

describe('malformed SQL the scanner still has to survive', () => {
  const runnerOver = (db: { exec: (sql: string) => Promise<unknown> }): SqlRunner => ({ exec: (sql) => db.exec(sql) })

  it('handles a line comment that runs to the end of the file with no newline', async () => {
    const db = await freshDb()
    const applied = await applyMigrations(runnerOver(db), [
      { name: '20260101000000_trailing', sql: 'CREATE TABLE probe_trailing (id int);\n-- ABORT; and then nothing' },
    ])
    expect(applied).toEqual(['20260101000000_trailing'])
    await db.close()
  })

  it('does not hang or crash on an unterminated dollar quote', async () => {
    // Malformed, so the database will reject it. What matters here is that the
    // scanner reaches the end rather than looping, and that the rejection is
    // the DATABASE's rather than a crash inside the guard.
    const db = await freshDb()
    await expect(
      applyMigrations(runnerOver(db), [{ name: '20260101000000_unterminated', sql: 'CREATE TABLE probe_open (id int); DO $$ BEGIN' }]),
    ).rejects.toThrow(/failed and was rolled back/)
    await db.close()
  })

  it('records a failure when the client throws something that is not an Error', async () => {
    // Clients throw strings. The failure row and the message have to survive
    // that, or the ledger records nothing for the one case nobody anticipated.
    const db = await freshDb()
    const runner: SqlRunner = {
      exec: (sql: string) => {
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- being a badly behaved driver IS the subject; see TECH-DEBT 9
        if (sql.startsWith('BEGIN;')) return Promise.reject('a bare string, not an Error')
        return db.exec(sql)
      },
    }
    await expect(
      applyMigrations(runner, [{ name: '20260101000000_string_throw', sql: 'CREATE TABLE probe_string (id int);' }]),
    ).rejects.toThrow(/a bare string, not an Error/)

    const stored = await db.query<{ error: string; failed: boolean }>(
      `SELECT "error", ("failed_at" IS NOT NULL) AS "failed" FROM "_karnama_migrations" WHERE "name" = '20260101000000_string_throw';`,
    )
    expect(stored.rows[0]?.failed).toBe(true)
    expect(stored.rows[0]?.error).toContain('a bare string')
    await db.close()
  })
})

describe('waiting for the lock rather than racing', () => {
  it('waits, then applies, once the lock becomes free', async () => {
    // The clause says a second run WAITS. Refusing after N attempts proves it
    // does not race; it does not prove it ever gets in. This is the other half.
    const db = await freshDb()
    let denials = 2
    const runner: SqlRunner = {
      exec: (sql: string) => {
        if (sql.startsWith('SELECT pg_try_advisory_lock') && denials > 0) {
          denials -= 1
          return Promise.resolve([{ rows: [{ got: false }] }])
        }
        return db.exec(sql)
      },
    }

    const applied = await applyMigrations(runner, [{ name: '20260101000000_after_wait', sql: 'CREATE TABLE probe_waited (id int);' }], {
      lockAttempts: 5,
      lockRetryMs: 1,
    })
    expect(applied).toEqual(['20260101000000_after_wait'])
    expect(denials).toBe(0)

    const tables = await db.query<{ table_name: string }>(
      `SELECT table_name FROM information_schema.tables WHERE table_name = 'probe_waited';`,
    )
    expect(tables.rows).toHaveLength(1)
    await db.close()
  })
})
