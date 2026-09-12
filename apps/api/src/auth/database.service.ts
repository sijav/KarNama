import { Injectable, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Pool } from 'pg'

export interface SqlClient {
  query: (sql: string, values?: (string | number)[]) => Promise<{ rows: Record<string, unknown>[] }>
}

@Injectable()
export class AuthDatabase implements OnModuleDestroy {
  private readonly pool: Pool

  constructor(config: ConfigService) {
    this.pool = new Pool({ connectionString: config.getOrThrow<string>('DATABASE_URL'), max: 5, connectionTimeoutMillis: 10_000 })
  }

  query(sql: string, values: readonly (string | number)[] = []) {
    return this.pool.query<Record<string, unknown>>(sql, [...values])
  }

  async transaction<T>(run: (client: SqlClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect()
    try {
      await client.query('BEGIN')
      const result = await run(client)
      await client.query('COMMIT')
      return result
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  async onModuleDestroy() {
    await this.pool.end()
  }
}
