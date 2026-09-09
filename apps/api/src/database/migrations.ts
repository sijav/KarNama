import { createHash } from 'node:crypto'
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

/** Doubling is the whole escape rule for a Postgres string literal. */
const quote = (value: string): string => `'${value.replace(/'/g, "''")}'`

/**
 * The identity of a migration's SQL.
 *
 * Whitespace included, deliberately: a reformat of an applied migration IS a
 * change, because the database ran the old text and will never run the new one.
 */
export const checksumOf = (sql: string): string => createHash('sha256').update(sql).digest('hex')

/**
 * One fixed key, so every deployer contends on the same lock.
 *
 * Arbitrary, and it must never change: two versions of this runner holding
 * different keys would not exclude each other, which is the failure the lock
 * exists to prevent, arriving silently.
 */
const LOCK_KEY = 8_231_123

/**
 * Migration SQL may not manage its own transaction, because this runner wraps
 * it in one. Prisma does not emit transaction control, so this guards against a
 * hand-written migration rather than against the generator.
 *
 * This has to be SQL-aware rather than a keyword search, and a roast proved why
 * by getting three cases past the line-anchored version that preceded it:
 *
 * - `CREATE TABLE x (id int); COMMIT;` on ONE line. The wrapper closes early,
 *   the DDL commits, a later statement fails, the ROLLBACK has nothing left to
 *   undo, and the ledger records a failure for a migration that really ran. The
 *   next deploy replays it and dies on the table that now exists.
 * - `ABORT;`, which is ROLLBACK under another name and was not in the list.
 *   The DDL is discarded and the ledger INSERT then runs outside any
 *   transaction and commits SUCCESS. The migration is recorded as applied, the
 *   table does not exist, and every later deploy skips it. Silent, permanent.
 * - `END;`, which is COMMIT under another name.
 *
 * And it must not fire on the other side: `DO $$ BEGIN ... END $$` is ordinary
 * PL/pgSQL, and a keyword inside a string or a comment is just text. So the
 * noise is removed first and then each statement is judged by what it STARTS
 * with, which is the only place transaction control can appear.
 */
const CONTROL_KEYWORDS = /^(BEGIN|COMMIT|ROLLBACK|ABORT|END|START\s+TRANSACTION|SAVEPOINT|RELEASE\s+SAVEPOINT)\b/i

/**
 * Splits SQL into statements, ignoring semicolons inside anything quoted.
 *
 * A scanner rather than a list of replacements, and the difference is not
 * stylistic. The version this replaced stripped dollar-quoted bodies, then
 * comments, then strings, each pass independent of the others, and a roast
 * broke it with:
 *
 *     SELECT '$tag$'; ABORT; SELECT '$tag$';
 *
 * The dollar-quote pass ran first and saw `$tag$ ... $tag$` spanning two
 * ORDINARY strings, so it erased everything between them, `ABORT` included.
 * The migration then rolled itself back and the ledger recorded it as APPLIED,
 * with the table absent and every later deploy skipping it.
 *
 * Quoting in SQL is sequential: whichever construct OPENS first owns everything
 * until it closes. That cannot be expressed as independent passes, so this
 * reads left to right once and never looks at the same character twice.
 */
const splitStatements = (sql: string): string[] => {
  const statements: string[] = []
  let current = ''
  let index = 0

  const skipQuoted = (close: string, backslashEscapes: boolean): void => {
    index += close.length
    while (index < sql.length) {
      if (backslashEscapes && sql[index] === '\\') {
        index += 2
        continue
      }
      if (sql.startsWith(close + close, index)) {
        index += close.length * 2
        continue
      }
      if (sql.startsWith(close, index)) {
        index += close.length
        return
      }
      index += 1
    }
  }

  while (index < sql.length) {
    const rest = sql.slice(index)

    if (rest.startsWith('--')) {
      // EITHER line terminator. Postgres ends a line comment at a bare
      // carriage return too, and searching only for \n meant `-- c\rABORT;`
      // was swallowed as comment text while the server executed the ABORT.
      const lineFeed = sql.indexOf('\n', index)
      const carriageReturn = sql.indexOf('\r', index)
      const ends = [lineFeed, carriageReturn].filter((at) => at !== -1)
      index = ends.length === 0 ? sql.length : Math.min(...ends)
      // A comment is WHITESPACE, not nothing. Postgres says so, and deleting it
      // instead joined the tokens either side: `ABORT/**/WORK` became
      // `ABORTWORK`, which the guard did not recognise while Postgres read it
      // as `ABORT WORK` and rolled the migration back. The ledger then recorded
      // it APPLIED with no table, and every later deploy skipped it. Found by a
      // roast, and it is the same defect this card exists to remove.
      current += ' '
      continue
    }
    if (rest.startsWith('/*')) {
      // Block comments NEST in Postgres, unlike C.
      let depth = 1
      index += 2
      while (index < sql.length && depth > 0) {
        if (sql.startsWith('/*', index)) {
          depth += 1
          index += 2
        } else if (sql.startsWith('*/', index)) {
          depth -= 1
          index += 2
        } else index += 1
      }
      current += ' '
      continue
    }
    // E'...' and e'...' take backslash escapes; ordinary '...' does not, under
    // the standard_conforming_strings default.
    if (/^[eE]'/.test(rest)) {
      index += 1
      skipQuoted("'", true)
      current += ' '
      continue
    }
    if (rest.startsWith("'")) {
      skipQuoted("'", false)
      current += ' '
      continue
    }
    if (rest.startsWith('"')) {
      skipQuoted('"', false)
      // A quoted identifier is still an identifier, so leave something behind
      // rather than nothing: `"begin"` as a table name must not read as BEGIN,
      // but it must also not vanish and let the next word start the statement.
      current += ' identifier '
      continue
    }
    // A `$` may only open a dollar quote when it does not continue an
    // identifier. Postgres allows `$` inside an unquoted name, so in `a$b$c`
    // the middle is part of the identifier, and reading it as a quote swallowed
    // whatever followed, transaction control included.
    const previous = index === 0 ? '' : sql.slice(index - 1, index)
    // Unicode, not ASCII. Postgres accepts accented and non-Latin letters in an
    // unquoted identifier, so `é$tag$` is a name and an ASCII-only test read the
    // `$` as opening a quoted body and swallowed whatever followed.
    const continuesIdentifier = /[\p{L}\p{N}_$]/u.test(previous)
    const dollar = continuesIdentifier ? null : /^\$([A-Za-z_]\w*)?\$/.exec(rest)
    if (dollar) {
      const tag = dollar[0]
      const end = sql.indexOf(tag, index + tag.length)
      index = end === -1 ? sql.length : end + tag.length
      current += ' '
      continue
    }
    if (rest.startsWith(';')) {
      statements.push(current)
      current = ''
      index += 1
      continue
    }
    // `slice` rather than an index, which is `string | undefined` under
    // noUncheckedIndexedAccess and cannot be concatenated without a claim the
    // loop bound already guarantees.
    current += sql.slice(index, index + 1)
    index += 1
  }

  statements.push(current)
  return statements
}

const managesItsOwnTransaction = (sql: string): boolean =>
  splitStatements(sql).some((statement) => CONTROL_KEYWORDS.test(statement.trim()))

const LEDGER = `
  CREATE TABLE IF NOT EXISTS "_karnama_migrations" (
    "name" TEXT PRIMARY KEY,
    "applied_at" TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  ALTER TABLE "_karnama_migrations" ADD COLUMN IF NOT EXISTS "checksum" TEXT;
  ALTER TABLE "_karnama_migrations" ADD COLUMN IF NOT EXISTS "failed_at" TIMESTAMPTZ;
  ALTER TABLE "_karnama_migrations" ADD COLUMN IF NOT EXISTS "error" TEXT;
  ALTER TABLE "_karnama_migrations" ALTER COLUMN "applied_at" DROP NOT NULL;
`

export interface ApplyOptions {
  /** How many times to ask for the lock before giving up. */
  readonly lockAttempts?: number
  /** Milliseconds between attempts. */
  readonly lockRetryMs?: number
}

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Takes the run lock, or refuses.
 *
 * `pg_try_advisory_lock` rather than `pg_advisory_lock`, which BLOCKS: a deploy
 * that hangs forever is worse than one that fails, because the second tells you
 * what happened. Bounded retries cover the ordinary case of two deployers
 * starting seconds apart.
 */
const takeLock = async (runner: SqlRunner, attempts: number, retryMs: number): Promise<void> => {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const answer = await runner.exec(`SELECT pg_try_advisory_lock(${String(LOCK_KEY)}) AS "got";`)
    const [row] = rowsOf(answer)
    if (row !== undefined && typeof row === 'object' && row !== null && 'got' in row && row.got === true) return
    if (attempt < attempts) await wait(retryMs)
  }
  throw new Error(
    `another deploy is already migrating: could not take the migration lock after ${String(attempts)} attempt(s)`,
  )
}

interface LedgerRow {
  readonly checksum: string | null
  readonly failed: boolean
}

const ledgerRow = async (runner: SqlRunner, name: string): Promise<LedgerRow | undefined> => {
  const answer = await runner.exec(
    `SELECT "checksum", ("failed_at" IS NOT NULL) AS "failed" FROM "_karnama_migrations" WHERE "name" = ${quote(name)};`,
  )
  const [row] = rowsOf(answer)
  if (row === undefined || typeof row !== 'object' || row === null) return undefined
  const checksum = 'checksum' in row && typeof row.checksum === 'string' ? row.checksum : null
  return { checksum, failed: 'failed' in row && row.failed === true }
}

/**
 * Applies the migrations that have not been applied yet, recording each one.
 *
 * Four things this does that the first version did not, each of them a way the
 * first version could cost a database:
 *
 * - **One transaction per migration**, covering the DDL AND its ledger row.
 *   Separate statements meant a failure between them left schema changes with
 *   nothing recording them, so the next deploy replayed the migration and died
 *   permanently on a `CREATE TYPE` that already existed. Postgres DDL is
 *   transactional, which was measured rather than assumed: a `ROLLBACK` undoes
 *   a `CREATE TYPE`.
 * - **A run lock**, so two deployers cannot both read "not applied" and both
 *   apply.
 * - **A recorded failure**, so the ledger can say "this broke" instead of
 *   staying silent and looking identical to "never attempted".
 * - **A checksum**, so an applied migration edited afterwards is refused
 *   instead of silently skipped.
 *
 * The order inside the catch is forced and is not a style choice. A failed
 * statement leaves the session ABORTED, and every later statement fails with
 * "current transaction is aborted" until an explicit `ROLLBACK`. Write the
 * failure row before rolling back and it is the rollback error you see, naming
 * the wrong cause.
 */
export const applyMigrations = async (
  runner: SqlRunner,
  migrations: Migration[],
  options: ApplyOptions = {},
): Promise<string[]> => {
  const offender = migrations.find((migration) => managesItsOwnTransaction(migration.sql))
  if (offender) {
    throw new Error(
      `migration ${offender.name} manages its own transaction, which this runner already does. ` +
        `If this is a SQL-standard function body written as BEGIN ATOMIC ... END, write the body as a ` +
        `dollar-quoted block instead: the scanner cannot tell that BEGIN from a transaction, and refusing ` +
        `a valid migration loudly is the safe side of that trade. See TECH-DEBT 12.`,
    )
  }

  // The lock comes FIRST, before the ledger exists. An earlier version created
  // the ledger first and carried a comment claiming two racing runners would
  // both succeed because every statement was idempotent. That was wrong:
  // `CREATE TABLE IF NOT EXISTS` is not race safe, and two sessions can both
  // see the table as absent and one then fail on a catalog uniqueness
  // violation. Advisory locks depend on no user table, so nothing forced that
  // order in the first place.
  await takeLock(runner, options.lockAttempts ?? 30, options.lockRetryMs ?? 1000)

  try {
    await runner.exec(LEDGER)
    const applied: string[] = []
    for (const migration of migrations) {
      const checksum = checksumOf(migration.sql)
      const row = await ledgerRow(runner, migration.name)

      if (row && !row.failed) {
        // A row written by the version of this runner that had no checksum
        // column. Adopting it is right: the migration DID run, and refusing
        // every database that predates the column would make the check useless
        // exactly where it is needed.
        if (row.checksum === null) {
          await runner.exec(
            `UPDATE "_karnama_migrations" SET "checksum" = ${quote(checksum)} WHERE "name" = ${quote(migration.name)};`,
          )
          continue
        }
        if (row.checksum !== checksum) {
          throw new Error(
            `migration ${migration.name} has changed since it was applied: the database ran ${row.checksum} and the file is now ${checksum}. ` +
              `An applied migration cannot be edited; add a new one.`,
          )
        }
        continue
      }

      try {
        await runner.exec(
          `BEGIN;\n${migration.sql}\n` +
            `INSERT INTO "_karnama_migrations" ("name", "checksum", "applied_at", "failed_at", "error") ` +
            `VALUES (${quote(migration.name)}, ${quote(checksum)}, now(), NULL, NULL) ` +
            `ON CONFLICT ("name") DO UPDATE SET "checksum" = EXCLUDED."checksum", "applied_at" = now(), ` +
            `"failed_at" = NULL, "error" = NULL;\nCOMMIT;`,
        )
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error)
        // ROLLBACK FIRST. See the note above: the session is aborted and every
        // statement until the rollback fails with the same unhelpful message.
        await runner.exec('ROLLBACK;')
        await runner.exec(
          `INSERT INTO "_karnama_migrations" ("name", "checksum", "applied_at", "failed_at", "error") ` +
            `VALUES (${quote(migration.name)}, ${quote(checksum)}, NULL, now(), ${quote(reason.slice(0, 1000))}) ` +
            `ON CONFLICT ("name") DO UPDATE SET "checksum" = EXCLUDED."checksum", "applied_at" = NULL, ` +
            `"failed_at" = now(), "error" = EXCLUDED."error";`,
        )
        throw new Error(`migration ${migration.name} failed and was rolled back: ${reason}`, { cause: error })
      }
      applied.push(migration.name)
    }
    return applied
  } finally {
    await runner.exec(`SELECT pg_advisory_unlock(${String(LOCK_KEY)});`)
  }
}

/**
 * PGlite's `exec` returns an array of results, one per statement. A single
 * SELECT is the first of them. Written as a guard rather than a cast so a
 * client that answers in a different shape fails loudly here instead of
 * silently reporting no rows and re-running every migration.
 *
 * It returns the rows rather than only whether there are any, because the
 * ledger now carries a checksum and a failure state that have to be READ. A
 * predicate was enough when the only question was "has this run".
 */
const rowsOf = (result: unknown): unknown[] => {
  if (!Array.isArray(result)) throw new Error('the SQL runner did not answer with an array of results')
  const first: unknown = result[0]
  if (typeof first !== 'object' || first === null || !('rows' in first)) {
    throw new Error('the SQL runner returned a result with no rows field')
  }
  const { rows } = first
  if (!Array.isArray(rows)) throw new Error('the SQL runner returned a rows field that is not an array')
  return rows
}
