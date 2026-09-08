import { PGlite } from '@electric-sql/pglite'
import { describe, expect, it } from 'vitest'
import { pathToFileURL } from 'node:url'
import { connectWithPg, isEntrypoint, main, runCommand, type DatabaseClient } from './cli.js'

/**
 * The CLI, driven against a real Postgres through a fake CLIENT.
 *
 * Two things are being separated. Whether the SQL works is settled by the
 * migration tests. What is left here is the adapter: `pg` answers with one
 * result object and PGlite answers with an array of them, and a runner taught
 * the wrong shape reports every migration as already applied and silently ships
 * nothing.
 *
 * So the client is fake and the database is real: every statement goes to
 * PGlite, wrapped the way `pg` would wrap it, which is the exact seam where an
 * adapter bug lives.
 */
const pgShapedClient = (db: PGlite): DatabaseClient => ({
  connect: () => Promise.resolve(),
  // One result object rather than an array, which is what `pg` returns and what
  // `runnerFor` has to wrap.
  query: async (sql: string) => {
    const results = await db.exec(sql)
    return results[results.length - 1]
  },
  end: () => Promise.resolve(),
})

const freshDb = async () => {
  const db = new PGlite()
  await db.waitReady
  return db
}

describe('the database CLI', () => {
  it('migrates, then reports nothing to do on a second run', async () => {
    const db = await freshDb()
    const client = pgShapedClient(db)

    expect(await runCommand('migrate', 'ignored', () => client)).toMatch(/^Applied 2: /)
    expect(await runCommand('migrate', 'ignored', () => client)).toBe('Nothing to migrate.')
    await db.close()
  })

  it('seeds a migrated database and says what it wrote', async () => {
    const db = await freshDb()
    const client = pgShapedClient(db)

    await runCommand('migrate', 'ignored', () => client)
    expect(await runCommand('seed', 'ignored', () => client)).toBe('Seeded 5 job opportunities for user-0001.')
    await db.close()
  })

  it('refuses an unknown command and still closes the connection', async () => {
    const db = await freshDb()
    let ended = false
    const client: DatabaseClient = {
      ...pgShapedClient(db),
      end: () => {
        ended = true
        return Promise.resolve()
      },
    }

    await expect(runCommand('drop-everything', 'ignored', () => client)).rejects.toThrow(/unknown command/)
    // The finally. A CLI that leaves the connection open hangs instead of
    // exiting, and the failure looks like a slow database rather than a bug.
    expect(ended).toBe(true)
    await db.close()
  })

  it('builds a real client when no factory is given', () => {
    // Constructed, not connected. The default argument is the one line nothing
    // else exercises, and a typo in it is a failure on the first deploy rather
    // than a failure here.
    const built = connectWithPg('postgresql://user:pass@127.0.0.1:1/none')
    expect(built).toHaveProperty('connect')
    expect(built).toHaveProperty('query')
    expect(built).toHaveProperty('end')
  })
})

describe('the command line itself', () => {
  const collect = () => {
    const written: { stream: string; text: string }[] = []
    return { written, write: (stream: 'out' | 'err', text: string) => written.push({ stream, text }) }
  }

  const environment = { WEB_ORIGIN: 'http://localhost:5173', DATABASE_URL: 'postgresql://user:pass@127.0.0.1:1/none' }

  it('runs a command and reports success on stdout', async () => {
    const db = await freshDb()
    const client = pgShapedClient(db)
    const { written, write } = collect()

    expect(await main(['node', 'cli.js', 'migrate'], environment, write, () => client)).toBe(0)
    expect(written[0]?.stream).toBe('out')
    expect(written[0]?.text).toMatch(/^Applied 2: /)
    await db.close()
  })

  it('reports a bad command on stderr and answers with a failing exit code', async () => {
    const db = await freshDb()
    const client = pgShapedClient(db)
    const { written, write } = collect()

    expect(await main(['node', 'cli.js', 'nonsense'], environment, write, () => client)).toBe(1)
    expect(written[0]?.stream).toBe('err')
    expect(written[0]?.text).toMatch(/unknown command/)
    await db.close()
  })

  it('fails the same way a boot does when the environment is incomplete', async () => {
    // The point of sharing the schema with the server: a seed against a missing
    // DATABASE_URL says the same sentence, so whoever reads a failed job does
    // not have to learn two error formats.
    const { written, write } = collect()
    expect(await main(['node', 'cli.js', 'seed'], {}, write)).toBe(1)
    expect(written[0]?.text).toMatch(/cannot start[\s\S]*DATABASE_URL/)
  })

  it('knows whether it was run or imported', () => {
    const url = pathToFileURL('/tmp/cli.js').href
    expect(isEntrypoint(url, ['node', '/tmp/cli.js', 'migrate'])).toBe(true)
    expect(isEntrypoint(url, ['node', '/tmp/other.js'])).toBe(false)
    // No argv[1] at all, which is how an embedded runtime invokes a module.
    expect(isEntrypoint(url, ['node'])).toBe(false)
  })
})

describe('the default client', () => {
  it('connects, queries and ends through pg, and fails against a closed port', async () => {
    // Not a mock. The three methods `connectWithPg` wraps are the seam between
    // this code and the driver, and the only way to know they are wired to the
    // right thing is to call them. A closed port makes that cheap: connect
    // rejects, which is the correct behaviour and covers the wrapper.
    const client = connectWithPg('postgresql://user:pass@127.0.0.1:1/none')
    await expect(client.connect()).rejects.toThrow()
    await expect(client.query('SELECT 1;')).rejects.toThrow()
    await expect(client.end()).resolves.not.toThrow()
  })

  it('defaults the command to the empty string when none is given', async () => {
    const db = await freshDb()
    const client = pgShapedClient(db)
    const { written, write } = collectWrites()
    // `main(['node', 'cli.js'])` with no third argument: the `?? ''` is what
    // turns that into an unknown command rather than a crash.
    expect(await main(['node', 'cli.js'], defaultEnvironment, write, () => client)).toBe(1)
    expect(written[0]?.text).toMatch(/unknown command ""/)
    await db.close()
  })

  it('falls back to the real client when no factory is given', async () => {
    // No fourth argument, so `connect ?? connectWithPg` takes its right hand
    // side. The URL points at a closed port, so it fails, which is the point:
    // what is being checked is that the default is wired at all, not that a
    // connection succeeds.
    const { written, write } = collectWrites()
    expect(await main(['node', 'cli.js', 'migrate'], defaultEnvironment, write)).toBe(1)
    expect(written[0]?.stream).toBe('err')
  }, 30_000)

  it('reports a thrown non-Error without pretending it was one', async () => {
    const client: DatabaseClient = {
      connect: () => Promise.resolve(),
      // A driver that rejects with a string rather than an Error. Real drivers
      // do this, which is why `main` has a branch for it, and the rule that
      // forbids it here is right about production code and wrong about a test
      // whose whole subject is the badly behaved case. Recorded in TECH-DEBT.
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
      query: () => Promise.reject('a driver that throws a string'),
      end: () => Promise.resolve(),
    }
    const { written, write } = collectWrites()
    expect(await main(['node', 'cli.js', 'migrate'], defaultEnvironment, write, () => client)).toBe(1)
    expect(written[0]?.text).toContain('a driver that throws a string')
  })
})

const collectWrites = () => {
  const written: { stream: string; text: string }[] = []
  return { written, write: (stream: 'out' | 'err', text: string) => written.push({ stream, text }) }
}

const defaultEnvironment = { WEB_ORIGIN: 'http://localhost:5173', DATABASE_URL: 'postgresql://user:pass@127.0.0.1:1/none' }
