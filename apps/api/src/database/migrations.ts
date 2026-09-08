import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'

/**
 * Reads the checked-in migrations, in order.
 *
 * Prisma 7 no longer keeps the connection URL in the schema, and `prisma
 * migrate deploy` wants a live database, so the SQL is read and applied by
 * whatever has a connection. That is what lets the migration test run against
 * an in-process Postgres with no server and no Docker: the same files, in the
 * same order, executed by a different client.
 *
 * Ordering is by DIRECTORY NAME, which is how Prisma orders them too. The
 * timestamp prefix is the whole mechanism, so a migration added without one
 * would silently sort somewhere unintended, and that is checked rather than
 * assumed.
 */
export interface Migration {
  name: string
  sql: string
}

const NAME_PATTERN = /^\d{14}_[a-z0-9_]+$/

export const migrationsDirectory = (root: string): string => join(root, 'prisma', 'migrations')

export const readMigrations = async (root: string): Promise<Migration[]> => {
  const dir = migrationsDirectory(root)
  const entries = await readdir(dir, { withFileTypes: true })
  const names = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()

  if (names.length === 0) throw new Error(`no migrations found in ${dir}`)

  const misnamed = names.filter((name) => !NAME_PATTERN.test(name))
  if (misnamed.length) {
    throw new Error(`migration directories must be <14 digits>_<snake_case>, these are not: ${misnamed.join(', ')}`)
  }

  return Promise.all(
    names.map(async (name) => ({ name, sql: await readFile(join(dir, name, 'migration.sql'), 'utf8') })),
  )
}

/** Anything that can run SQL. Both PGlite and a Postgres client fit. */
export interface SqlRunner {
  exec: (sql: string) => Promise<unknown>
}

/**
 * Applies the migrations that have not been applied yet, recording each one.
 *
 * The ledger is the point: applying to an EXISTING database has to skip what is
 * already there, and a runner that re-ran everything would drop the difference
 * between the two cases the exit condition asks about.
 */
export const applyMigrations = async (runner: SqlRunner, migrations: Migration[]): Promise<string[]> => {
  await runner.exec(`CREATE TABLE IF NOT EXISTS "_karnama_migrations" (
    "name" TEXT PRIMARY KEY,
    "applied_at" TIMESTAMPTZ NOT NULL DEFAULT now()
  );`)

  const applied: string[] = []
  for (const migration of migrations) {
    const already = await runner.exec(
      `SELECT 1 FROM "_karnama_migrations" WHERE "name" = '${migration.name.replace(/'/g, "''")}';`,
    )
    if (hasRows(already)) continue

    await runner.exec(migration.sql)
    await runner.exec(`INSERT INTO "_karnama_migrations" ("name") VALUES ('${migration.name.replace(/'/g, "''")}');`)
    applied.push(migration.name)
  }
  return applied
}

/**
 * PGlite's `exec` returns an array of results, one per statement. A single
 * SELECT is the first of them, and "did it find anything" is the length of its
 * rows. Written as a guard rather than a cast so a client that answers in a
 * different shape fails loudly here instead of silently reporting no rows and
 * re-running every migration.
 */
const hasRows = (result: unknown): boolean => {
  if (!Array.isArray(result)) throw new Error('the SQL runner did not answer with an array of results')
  const first: unknown = result[0]
  if (typeof first !== 'object' || first === null || !('rows' in first)) {
    throw new Error('the SQL runner returned a result with no rows field')
  }
  const { rows } = first
  if (!Array.isArray(rows)) throw new Error('the SQL runner returned a rows field that is not an array')
  return rows.length > 0
}
