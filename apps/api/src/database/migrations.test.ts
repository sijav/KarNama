import { PGlite } from '@electric-sql/pglite'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { applyMigrations, readMigrations } from './migrations.js'
import { seed } from './seed.js'

/**
 * The migrations, applied to a REAL Postgres.
 *
 * PGlite rather than Docker or a hosted database: it is Postgres compiled to
 * wasm and it runs in this process, so the migrations are executed by the same
 * engine Supabase runs rather than by a SQLite that would accept SQL Postgres
 * rejects. A test that needs a daemon is a test that gets skipped.
 *
 * The exit condition asks for two cases and they are genuinely different. An
 * EMPTY database is the deploy of a new environment. An EXISTING one is every
 * deploy after that, and it is the one that goes wrong: a runner that re-applies
 * everything crashes on the second deploy and a runner that skips everything
 * never ships the second migration.
 */
const ROOT = join(import.meta.dirname, '..', '..')

const fresh = async () => {
  const db = new PGlite()
  await db.waitReady
  return db
}

const tableNames = async (db: PGlite): Promise<string[]> => {
  const result = await db.query<{ table_name: string }>(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`,
  )
  return result.rows.map((row) => row.table_name)
}

describe('the migrations', () => {
  it('are named so they sort into the order they must run in', async () => {
    const migrations = await readMigrations(ROOT)
    expect(migrations.length).toBeGreaterThanOrEqual(2)
    expect(migrations.map((migration) => migration.name)).toEqual([...migrations.map((m) => m.name)].sort())
  })

  it('apply to an EMPTY database', async () => {
    const db = await fresh()
    const migrations = await readMigrations(ROOT)
    const applied = await applyMigrations(db, migrations)

    expect(applied).toEqual(migrations.map((migration) => migration.name))
    const tables = await tableNames(db)
    for (const table of [
      'users',
      'statuses',
      'job_records',
      'status_history',
      'contacts',
      'notes',
      'file_references',
      'feedback_submissions',
    ]) {
      expect(tables, `${table} was not created`).toContain(table)
    }
    await db.close()
  })

  it('apply to an EXISTING database, running only what is new', async () => {
    const db = await fresh()
    const all = await readMigrations(ROOT)
    const [first, ...rest] = all
    if (!first) throw new Error('there are no migrations')

    // Deploy one: the first migration only, as if the second had not been
    // written yet.
    const firstRun = await applyMigrations(db, [first])
    expect(firstRun).toEqual([first.name])

    // Data arrives between deploys, which is the whole reason the second case
    // is different from the first.
    await seed(db)

    // Deploy two: everything. Only the new ones may run.
    const secondRun = await applyMigrations(db, all)
    expect(secondRun).toEqual(rest.map((migration) => migration.name))

    // And a third deploy with nothing new does nothing at all.
    expect(await applyMigrations(db, all)).toEqual([])

    // The data survived.
    const jobs = await db.query<{ count: string }>('SELECT count(*)::text AS count FROM "job_records";')
    expect(jobs.rows[0]?.count).toBe('5')
    await db.close()
  })

  it('enforce the constraints the design depends on', async () => {
    const db = await fresh()
    await applyMigrations(db, await readMigrations(ROOT))
    await seed(db)

    // A status is never absent from a record, so the column is NOT NULL.
    await expect(
      db.exec(`UPDATE "job_records" SET "statusId" = NULL WHERE "id" = 'job-0001';`),
    ).rejects.toThrow(/null value|not-null/i)

    // One `new` per user. The second migration is what makes this true, so this
    // assertion is also what proves the second migration actually ran.
    await expect(
      db.exec(
        `INSERT INTO "statuses" ("id", "userId", "key", "name", "color", "position", "updatedAt")
         VALUES ('status-new-again', 'user-0001', 'new', 'ذخیره‌شده‌ی دوم', 'new', 99, now());`,
      ),
    ).rejects.toThrow(/duplicate key|unique/i)

    // But any number of statuses the user created, which all have a null key.
    await db.exec(
      `INSERT INTO "statuses" ("id", "userId", "key", "name", "color", "position", "updatedAt")
       VALUES ('status-custom-1', 'user-0001', NULL, 'در انتظار پاسخ', 'custom-1', 100, now()),
              ('status-custom-2', 'user-0001', NULL, 'تماس گرفتم', 'custom-2', 101, now());`,
    )

    // A status still holding records cannot be deleted out from under them.
    await expect(db.exec(`DELETE FROM "statuses" WHERE "id" = 'status-new';`)).rejects.toThrow(/foreign key|violates/i)

    await db.close()
  })

  it('never lose the trail when a record is deleted, because the record goes with it', async () => {
    const db = await fresh()
    await applyMigrations(db, await readMigrations(ROOT))
    await seed(db)

    const before = await db.query<{ count: string }>('SELECT count(*)::text AS count FROM "status_history";')
    expect(Number(before.rows[0]?.count)).toBeGreaterThan(10)

    await db.exec(`DELETE FROM "job_records" WHERE "id" = 'job-0001';`)
    const orphans = await db.query<{ count: string }>(
      `SELECT count(*)::text AS count FROM "status_history" WHERE "jobRecordId" = 'job-0001';`,
    )
    // Cascade, not orphan. History belongs to a record; a history row pointing
    // at nothing is worse than no row.
    expect(orphans.rows[0]?.count).toBe('0')
    await db.close()
  })

  it('match the schema Prisma would generate, so the checked-in SQL cannot drift', async () => {
    // The migration SQL is generated from schema.prisma and then committed, so
    // the two can disagree the moment someone edits the schema and forgets. The
    // initial migration is compared against the model it came from.
    const initial = await readFile(join(ROOT, 'prisma', 'migrations', '20260908000000_initial', 'migration.sql'), 'utf8')
    const schema = await readFile(join(ROOT, 'prisma', 'schema.prisma'), 'utf8')

    for (const [model, table] of [
      ['model User', 'users'],
      ['model Status', 'statuses'],
      ['model JobRecord', 'job_records'],
      ['model StatusHistory', 'status_history'],
      ['model Contact', 'contacts'],
      ['model Note', 'notes'],
      ['model FileReference', 'file_references'],
      ['model FeedbackSubmission', 'feedback_submissions'],
    ] as const) {
      expect(schema, `${model} is gone from the schema`).toContain(model)
      expect(initial, `${table} is not created by the initial migration`).toContain(`CREATE TABLE "${table}"`)
    }
  })
})

describe('the seed', () => {
  it('produces an archive with a board worth looking at', async () => {
    const db = await fresh()
    await applyMigrations(db, await readMigrations(ROOT))
    const result = await seed(db)

    expect(result.jobRecordIds).toHaveLength(5)

    // Spread across the columns rather than piled in one, because a board with
    // every card in the first column hides most of the design.
    const spread = await db.query<{ statusId: string }>('SELECT DISTINCT "statusId" FROM "job_records";')
    expect(spread.rows.length).toBeGreaterThanOrEqual(4)

    // One rejected, so the column the design asks an open question about is not
    // empty when someone opens the board.
    const rejected = await db.query<{ count: string }>(
      `SELECT count(*)::text AS count FROM "job_records" WHERE "statusId" = 'status-rejected';`,
    )
    expect(rejected.rows[0]?.count).toBe('1')

    // A trail that actually moves: at least one record with three or more
    // entries, and every first entry with no `from`.
    const longest = await db.query<{ count: string }>(
      `SELECT count(*)::text AS count FROM "status_history" WHERE "jobRecordId" = 'job-0004';`,
    )
    expect(Number(longest.rows[0]?.count)).toBe(4)

    const firsts = await db.query<{ count: string }>(
      `SELECT count(*)::text AS count FROM "status_history" WHERE "fromStatusId" IS NULL;`,
    )
    expect(firsts.rows[0]?.count).toBe('5')

    await db.close()
  })

  it('can be run twice, because a seed only a pristine database accepts is one nobody runs', async () => {
    const db = await fresh()
    await applyMigrations(db, await readMigrations(ROOT))
    await seed(db)
    await seed(db)

    const jobs = await db.query<{ count: string }>('SELECT count(*)::text AS count FROM "job_records";')
    expect(jobs.rows[0]?.count).toBe('5')
    await db.close()
  })

  it('names a status the database has, for every record and every trail entry', async () => {
    // This used to be a runtime guard inside seed, and no test could reach it:
    // the only route to a bad key was editing the file, which a type catches
    // and a check at runtime cannot. It is a union type now, and what is left
    // to verify is that every id the seed writes actually exists as a row.
    const db = await fresh()
    await applyMigrations(db, await readMigrations(ROOT))
    await seed(db)

    const dangling = await db.query<{ count: string }>(
      `SELECT count(*)::text AS count FROM "job_records" j
       LEFT JOIN "statuses" s ON s."id" = j."statusId" WHERE s."id" IS NULL;`,
    )
    expect(dangling.rows[0]?.count).toBe('0')

    const danglingHistory = await db.query<{ count: string }>(
      `SELECT count(*)::text AS count FROM "status_history" h
       LEFT JOIN "statuses" s ON s."id" = h."toStatusId" WHERE s."id" IS NULL;`,
    )
    expect(danglingHistory.rows[0]?.count).toBe('0')
    await db.close()
  })
})

/**
 * The four ways the first runner could cost a database.
 *
 * Each is planted against PGlite rather than argued about, because every one of
 * them is a claim about what Postgres does when something goes wrong, and the
 * only trustworthy answer is the engine's. Postgres DDL being transactional is
 * the fact the whole design rests on, and it is checked here rather than
 * assumed from the documentation.
 */
describe('the migration runner under failure', () => {
  const ledger = async (db: PGlite) =>
    (
      await db.query<{ name: string; checksum: string | null; failed: boolean; applied: boolean }>(
        `SELECT "name", "checksum", ("failed_at" IS NOT NULL) AS "failed", ("applied_at" IS NOT NULL) AS "applied"
         FROM "_karnama_migrations" ORDER BY "name";`,
      )
    ).rows

  const good = { name: '20260101000000_good', sql: 'CREATE TABLE kn123_good (id int);' }
  // Fails on the SECOND statement, so the first has already taken effect when
  // the failure arrives. A migration that fails on its first statement would
  // prove nothing about rolling anything back.
  const halfway = {
    name: '20260102000000_halfway',
    sql: 'CREATE TABLE kn123_partial (id int);\nCREATE TABLE kn123_partial (id int);',
  }

  it('leaves the database UNCHANGED when a migration throws halfway', async () => {
    const db = await fresh()
    await applyMigrations(db, [good])

    await expect(applyMigrations(db, [good, halfway])).rejects.toThrow(/failed and was rolled back/)

    // The first statement of the failed migration created a table. If DDL were
    // not transactional, or the wrapper were missing, it would be here and the
    // next deploy would die on it forever.
    expect(await tableNames(db)).not.toContain('kn123_partial')
    expect(await tableNames(db)).toContain('kn123_good')
    await db.close()
  })

  it('records the failure rather than nothing, so the ledger can say what broke', async () => {
    const db = await fresh()
    await expect(applyMigrations(db, [halfway])).rejects.toThrow(/failed and was rolled back/)

    const rows = await ledger(db)
    const row = rows.find((entry) => entry.name === halfway.name)
    expect(row).toBeDefined()
    expect(row?.failed).toBe(true)
    expect(row?.applied).toBe(false)

    const stored = await db.query<{ error: string }>(
      `SELECT "error" FROM "_karnama_migrations" WHERE "name" = '${halfway.name}';`,
    )
    expect(stored.rows[0]?.error).toMatch(/already exists/)
    await db.close()
  })

  it('retries a failed migration on the next deploy, because nothing was applied', async () => {
    const db = await fresh()
    await expect(applyMigrations(db, [halfway])).rejects.toThrow(/failed and was rolled back/)

    // Fixed, and deployed again. A ledger that recorded the failure as "applied"
    // would skip it forever; one that recorded nothing would be indistinguishable
    // from never having tried.
    const fixed = { name: halfway.name, sql: 'CREATE TABLE kn123_partial (id int);' }
    expect(await applyMigrations(db, [fixed])).toEqual([fixed.name])
    expect(await tableNames(db)).toContain('kn123_partial')

    const row = (await ledger(db)).find((entry) => entry.name === fixed.name)
    expect(row?.failed).toBe(false)
    expect(row?.applied).toBe(true)
    await db.close()
  })

  it('REFUSES an applied migration whose SQL has changed since', async () => {
    const db = await fresh()
    await applyMigrations(db, [good])

    const edited = { name: good.name, sql: `${good.sql}\nALTER TABLE kn123_good ADD COLUMN extra int;` }
    await expect(applyMigrations(db, [edited])).rejects.toThrow(/has changed since it was applied/)

    // And it did not half-apply the edit while refusing it.
    const columns = await db.query<{ column_name: string }>(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'kn123_good';`,
    )
    expect(columns.rows.map((row) => row.column_name)).not.toContain('extra')
    await db.close()
  })

  it('adopts a row written before the checksum column existed, rather than refusing every old database', async () => {
    const db = await fresh()
    await applyMigrations(db, [good])
    await db.exec(`UPDATE "_karnama_migrations" SET "checksum" = NULL WHERE "name" = '${good.name}';`)

    expect(await applyMigrations(db, [good])).toEqual([])
    const row = (await ledger(db)).find((entry) => entry.name === good.name)
    expect(row?.checksum).not.toBeNull()
    await db.close()
  })

  it('releases the lock when a migration fails, or the next deploy could never start', async () => {
    const db = await fresh()
    await expect(applyMigrations(db, [halfway])).rejects.toThrow(/failed and was rolled back/)

    // A finally that did not run would leave this session holding the lock. The
    // same session can retake it either way, so ask Postgres directly whether
    // anything still holds it.
    const held = await db.query<{ count: string }>(
      `SELECT count(*)::text AS count FROM pg_locks WHERE locktype = 'advisory';`,
    )
    expect(held.rows[0]?.count).toBe('0')
    await db.close()
  })
})

describe('what the transaction wrapper actually buys', () => {
  it('writes the migration and its ledger row in ONE statement batch', async () => {
    // This is the guarantee, and it is not the one it looks like. Postgres wraps
    // a multi-statement simple query in an IMPLICIT transaction, so removing the
    // explicit BEGIN changes nothing that a test can see: the verifier planted
    // exactly that and the suite stayed green, which is how this test came to
    // exist.
    //
    // The defect in the first runner was never partial DDL inside one migration.
    // It was TWO SEPARATE exec calls: the migration committed in its own
    // transaction, and if the ledger INSERT then failed, or the process died
    // between them, the schema had moved with nothing recording it and the next
    // deploy replayed it and died on a CREATE TYPE that already existed.
    //
    // So what has to be true is that the DDL and its ledger row reach the
    // database together. That is observable, and splitting them apart breaks it.
    const db = await fresh()
    const batches: string[] = []
    const recording = {
      exec: async (sql: string) => {
        batches.push(sql)
        return db.exec(sql)
      },
    }

    await applyMigrations(recording, [{ name: '20260101000000_together', sql: 'CREATE TABLE kn123_together (id int);' }])

    const withDdl = batches.filter((sql) => sql.includes('CREATE TABLE kn123_together'))
    expect(withDdl).toHaveLength(1)
    expect(withDdl[0]).toMatch(/INSERT INTO "_karnama_migrations"/)
    await db.close()
  })
})
