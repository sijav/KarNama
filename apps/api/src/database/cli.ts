import { pathToFileURL } from 'node:url'
import pg from 'pg'
import { parseEnv } from '../config/env.js'
import { applyMigrations, readMigrations, type SqlRunner } from './migrations.js'
import { seed } from './seed.js'

/**
 * `migrate` and `seed`, against the real database in `DATABASE_URL`.
 *
 * The same functions the tests drive through PGlite, given a different client.
 * That is the whole reason `SqlRunner` is one method: the migration runner and
 * the seed have no idea which Postgres they are talking to, so what the tests
 * prove is what a deploy does rather than something shaped like it.
 */
export interface DatabaseClient {
  connect: () => Promise<void>
  query: (sql: string) => Promise<unknown>
  end: () => Promise<void>
}

/**
 * The narrowest thing this file needs, so a test can supply one without a cast
 * and without a running Postgres. `pg.Client` satisfies it structurally.
 *
 * The alternative was to exclude this file from coverage, which is precisely
 * the mistake a roast has already found once here: the excluded file is always
 * the one a deploy depends on.
 */
export const connectWithPg = (connectionString: string): DatabaseClient => {
  const client = new pg.Client({ connectionString })
  // Wrapped rather than returned directly: `pg.Client.connect()` resolves with
  // the client itself, and this interface says it resolves with nothing. The
  // difference is not cosmetic, it is what stops a caller depending on a return
  // value that a different client would not have.
  return {
    connect: async () => {
      await client.connect()
    },
    query: (sql: string) => client.query(sql),
    end: () => client.end(),
  }
}

const runnerFor = (client: DatabaseClient): SqlRunner => ({
  // `pg` answers with one result object; PGlite answers with an array of them,
  // one per statement. The array is the shape the runner expects, so a single
  // result is wrapped rather than the runner being taught two shapes.
  exec: async (sql: string) => [await client.query(sql)],
})

export const runCommand = async (
  command: string,
  connectionString: string,
  connect: (url: string) => DatabaseClient = connectWithPg,
): Promise<string> => {
  const client = connect(connectionString)
  await client.connect()
  try {
    const runner = runnerFor(client)
    if (command === 'migrate') {
      const applied = await applyMigrations(runner, await readMigrations(process.cwd()))
      return applied.length === 0 ? 'Nothing to migrate.' : `Applied ${String(applied.length)}: ${applied.join(', ')}`
    }
    if (command === 'seed') {
      const result = await seed(runner)
      return `Seeded ${String(result.jobRecordIds.length)} job opportunities for ${result.userId}.`
    }
    throw new Error(`unknown command "${command}", expected migrate or seed`)
  } finally {
    // Always, including after the unknown-command throw: a CLI that leaves a
    // connection open is a CLI that hangs instead of exiting.
    await client.end()
  }
}

/** Was this module run, or imported? The ESM spelling of `require.main === module`. */
export const isEntrypoint = (moduleUrl: string, argv: readonly string[]): boolean => {
  const entry = argv[1]
  return entry !== undefined && moduleUrl === pathToFileURL(entry).href
}

/**
 * The command line, as a function, so it can be tested without a subprocess.
 *
 * Everything that decides anything lives here; the guard below is one line that
 * chooses whether to call it. That split is deliberate: a roast has already
 * found that the file excluded from coverage is always the one a deploy depends
 * on, so nothing here is excluded and the only thing no test reaches is the
 * guard itself.
 */
export const main = async (
  argv: readonly string[],
  environment: Record<string, string | undefined>,
  write: (stream: 'out' | 'err', text: string) => void,
  connect?: (url: string) => DatabaseClient,
): Promise<number> => {
  try {
    // The same environment schema the server uses, so a seed against a missing
    // DATABASE_URL fails the same way and with the same message as a boot does.
    const env = parseEnv(environment)
    const message = await runCommand(argv[2] ?? '', env.DATABASE_URL, connect ?? connectWithPg)
    write('out', `${message}\n`)
    return 0
  } catch (error: unknown) {
    write('err', `${error instanceof Error ? error.message : String(error)}\n`)
    return 1
  }
}
