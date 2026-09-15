import { ConfigService } from '@nestjs/config'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthDatabase, type SqlClient } from './database.service.js'

/**
 * The Postgres adapter, with `pg` replaced, KN-486. Every other test swaps the
 * whole adapter for PGlite, so its own pool, queries and transactions never ran.
 */
type Query = (sql: string, values?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }>

const pg = vi.hoisted(() => {
  const client = { query: vi.fn<Query>(), release: vi.fn<() => void>() }
  const pool = { query: vi.fn<Query>(), connect: vi.fn<() => Promise<typeof client>>(), end: vi.fn<() => Promise<void>>() }
  const opened: unknown[] = []
  // A constructor that hands back the one pool, and remembers what it was given.
  function Pool(options: unknown) {
    opened.push(options)
    return pool
  }
  return { client, pool, opened, Pool }
})

vi.mock('pg', () => ({ Pool: pg.Pool }))

afterEach(() => {
  vi.clearAllMocks()
  vi.unstubAllEnvs()
  pg.opened.length = 0
})

describe('the Postgres adapter, KN-486', () => {
  it('opens a pool of five from DATABASE_URL, and will not start without one', () => {
    new AuthDatabase(new ConfigService())
    expect(pg.opened).toEqual([{ connectionString: process.env.DATABASE_URL, max: 5, connectionTimeoutMillis: 10_000 }])
    vi.stubEnv('DATABASE_URL', undefined)
    expect(() => new AuthDatabase(new ConfigService())).toThrow()
  })

  it('passes a query with a copy of its values, and none when given none', async () => {
    pg.pool.query.mockResolvedValue({ rows: [{ id: 1 }] })
    const database = new AuthDatabase(new ConfigService())
    const values = ['a', 1]
    await expect(database.query('SELECT $1, $2', values)).resolves.toEqual({ rows: [{ id: 1 }] })
    expect(pg.pool.query).toHaveBeenCalledWith('SELECT $1, $2', ['a', 1])
    expect(pg.pool.query.mock.calls[0]?.[1]).not.toBe(values)
    await database.query('SELECT 1')
    expect(pg.pool.query).toHaveBeenLastCalledWith('SELECT 1', [])
  })

  it('commits the work of a transaction, gives back its result, and releases the client', async () => {
    pg.pool.connect.mockResolvedValue(pg.client)
    pg.client.query.mockResolvedValue({ rows: [] })
    const work = async (client: SqlClient) => {
      await client.query('INSERT INTO t VALUES (1)')
      return 'kept'
    }
    await expect(new AuthDatabase(new ConfigService()).transaction(work)).resolves.toBe('kept')
    expect(pg.client.query.mock.calls.map(([sql]) => sql)).toEqual(['BEGIN', 'INSERT INTO t VALUES (1)', 'COMMIT'])
    expect(pg.client.release).toHaveBeenCalledOnce()
  })

  it('rolls back a transaction whose work fails, throws that failure, and still releases the client', async () => {
    pg.pool.connect.mockResolvedValue(pg.client)
    pg.client.query.mockResolvedValue({ rows: [] })
    const failure = new Error('a constraint refused the row')
    await expect(new AuthDatabase(new ConfigService()).transaction(() => Promise.reject(failure))).rejects.toBe(failure)
    expect(pg.client.query.mock.calls.map(([sql]) => sql)).toEqual(['BEGIN', 'ROLLBACK'])
    expect(pg.client.release).toHaveBeenCalledOnce()
  })

  it('ends the pool when the module is destroyed', async () => {
    await new AuthDatabase(new ConfigService()).onModuleDestroy()
    expect(pg.pool.end).toHaveBeenCalledOnce()
  })
})
