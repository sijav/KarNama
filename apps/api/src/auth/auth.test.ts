import { PGlite } from '@electric-sql/pglite'
import type { INestApplication } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import { Server } from 'node:http'
import { join } from 'node:path'
import 'reflect-metadata'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { AppModule } from '../app.module.js'
import { applyMigrations, readMigrations } from '../database/migrations.js'
import { ExtractionService } from '../extraction/extraction.service.js'
import { AuthService } from './auth.service.js'
import { AuthDatabase, type SqlClient } from './database.service.js'
import { SmsService } from './sms.service.js'

const resultSchema = z.object({
  data: z.record(z.string(), z.unknown()).nullable().optional(),
  errors: z.array(z.object({ extensions: z.object({ code: z.string() }) })).optional(),
})
const loginSchema = z.object({ token: z.string(), account: z.object({ id: z.string(), phone: z.string(), name: z.string() }) })
const PHONE = '09123456789'
const SEND = 'mutation($phone:String!){requestLoginCode(phone:$phone){phone retryAfterSeconds expiresInSeconds}}'
const VERIFY = 'mutation($phone:String!,$code:String!){verifyLoginCode(phone:$phone,code:$code){token account{id phone name}}}'

describe('server authentication through GraphQL and Postgres', () => {
  let app: INestApplication
  const db = new PGlite()
  const deliveries: { phone: string; code: string }[] = []
  const sms = {
    ready: vi.fn(),
    send: vi.fn((phone: string, code: string) => {
      deliveries.push({ phone, code })
      return Promise.resolve()
    }),
  }
  const sql: SqlClient = { query: (query, values) => db.query<Record<string, unknown>>(query, values) }
  const database = {
    query: sql.query,
    transaction: <T>(run: (client: SqlClient) => Promise<T>) =>
      db.transaction((tx) => run({ query: (query, values) => tx.query<Record<string, unknown>>(query, values) })),
  }

  beforeAll(async () => {
    await applyMigrations(db, await readMigrations(join(import.meta.dirname, '../..')))
    const config = new ConfigService({
      AUTH_SECRET: 'integration-test-secret-only-32-characters',
      NODE_ENV: 'test',
      ALLOW_DEMO_EXTRACTION: 'false',
    })
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(AuthDatabase)
      .useValue(database)
      .overrideProvider(ConfigService)
      .useValue(config)
      .overrideProvider(SmsService)
      .useValue(sms)
      .compile()
    app = module.createNestApplication()
    await app.init()
  }, 60_000)
  afterAll(async () => {
    await app.close()
    await db.close()
  })

  const post = async (query: string, variables: Record<string, string> = {}, token = '') => {
    const server: unknown = app.getHttpServer()
    if (!(server instanceof Server)) throw new Error('No HTTP server')
    const operation = request(server).post('/graphql')
    if (token) operation.set('Authorization', `Bearer ${token}`)
    const response = await operation.send({ query, variables })
    return resultSchema.parse(response.body)
  }
  const latestCode = () => {
    const delivery = deliveries.at(-1)
    if (!delivery) throw new Error('No SMS sent')
    return delivery.code
  }

  it('normalizes phone digits, sends privately, rejects guesses, saves the name and revokes the session', async () => {
    const sent = await post(SEND, { phone: '+98 912 345 6789' })
    expect(sent.errors).toBeUndefined()
    expect(sent.data?.requestLoginCode).toEqual({ phone: PHONE, retryAfterSeconds: 60, expiresInSeconds: 120 })
    expect(deliveries.at(-1)?.phone).toBe(PHONE)
    expect(JSON.stringify(sent)).not.toContain(latestCode())
    expect((await post(SEND, { phone: PHONE })).errors?.[0]?.extensions.code).toBe('RESEND_TOO_SOON')
    const wrong = latestCode() === '11111' ? '22222' : '11111'
    expect((await post(VERIFY, { phone: PHONE, code: wrong })).errors?.[0]?.extensions.code).toBe('CODE_WRONG')
    const login = loginSchema.parse((await post(VERIFY, { phone: PHONE, code: latestCode() })).data?.verifyLoginCode)
    expect(login.account.name).toBe('')
    expect(login.token).toMatch(/^[\w-]{43}$/u)
    expect((await post(VERIFY, { phone: PHONE, code: latestCode() })).errors?.[0]?.extensions.code).toBe('CODE_EXPIRED')
    expect((await post('mutation{saveAccountName(name:"  Scenario Tester  "){name}}', {}, login.token)).data?.saveAccountName).toEqual({
      name: 'Scenario Tester',
    })
    expect((await post('{currentAccount{phone name}}', {}, login.token)).data?.currentAccount).toEqual({
      phone: PHONE,
      name: 'Scenario Tester',
    })
    const stored = await db.query<{ hash: string }>('SELECT hash FROM auth_sessions')
    expect(stored.rows[0]?.hash).not.toBe(login.token)
    expect((await post('mutation{signOut}', {}, login.token)).data?.signOut).toBe(true)
    expect((await post('{currentAccount{id}}', {}, login.token)).errors?.[0]?.extensions.code).toBe('UNAUTHENTICATED')
  })

  it('locks a code after five bad attempts and rejects an expired code', async () => {
    const phone = '09123456780'
    await post(SEND, { phone })
    const code = latestCode()
    const wrong = code === '11111' ? '22222' : '11111'
    for (let i = 0; i < 5; i++) expect((await post(VERIFY, { phone, code: wrong })).errors?.[0]?.extensions.code).toBe('CODE_WRONG')
    expect((await post(VERIFY, { phone, code })).errors?.[0]?.extensions.code).toBe('CODE_LOCKED')
    await db.query("UPDATE auth_challenges SET expires = NOW() - INTERVAL '1 second' WHERE phone = $1", [phone])
    expect((await post(VERIFY, { phone, code })).errors?.[0]?.extensions.code).toBe('CODE_EXPIRED')
  })

  it('requires a server session before extraction and refuses a fabricated browser identity', async () => {
    expect((await post('mutation{extractJob(source:"Frontend developer"){title}}')).errors?.[0]?.extensions.code).toBe('UNAUTHENTICATED')
    expect((await post('{currentAccount{id}}', {}, 'fake-token')).errors?.[0]?.extensions.code).toBe('UNAUTHENTICATED')
  })

  it('does not report delivery success when the SMS provider fails', async () => {
    sms.send.mockRejectedValueOnce(new Error('provider offline'))
    const phone = '09123456781'
    expect((await post(SEND, { phone })).errors).toHaveLength(1)
    expect((await db.query('SELECT * FROM auth_challenges WHERE phone = $1', [phone])).rows).toHaveLength(0)
  })

  it('enforces and resets its durable rate counter', async () => {
    const service = app.get(AuthService)
    await service.limit('isolated-rate-test', 2)
    await service.limit('isolated-rate-test', 2)
    await expect(service.limit('isolated-rate-test', 2)).rejects.toThrow('RATE_LIMITED')
    await db.exec("UPDATE auth_limits SET started = NOW() - INTERVAL '2 hours'")
    await expect(service.limit('isolated-rate-test', 2)).resolves.toBeUndefined()
  })

  it('only enables anonymous extraction explicitly and enforces durable demo limits', async () => {
    const config = app.get(ConfigService)
    const extraction = vi.spyOn(app.get(ExtractionService), 'extract').mockResolvedValue({
      title: 'Demo engineer',
      company: 'Example',
      employmentTypes: [],
      location: '',
      experience: '',
      jobLevel: null,
      postedAt: '',
      expiresAt: '',
      salary: '',
      source: '',
      postingUrl: '',
      description: '',
    })
    const query = 'mutation{extractJob(source:"Frontend developer"){title}}'
    try {
      config.set('ALLOW_DEMO_EXTRACTION', 'true')
      await db.exec('DELETE FROM auth_limits')
      expect((await post(query, {}, 'fake-token')).errors?.[0]?.extensions.code).toBe('UNAUTHENTICATED')
      expect((await post('{currentAccount{id}}')).errors?.[0]?.extensions.code).toBe('UNAUTHENTICATED')
      for (let i = 0; i < 10; i++) expect((await post(query)).data?.extractJob).toEqual({ title: 'Demo engineer' })
      expect((await post(query)).errors?.[0]?.extensions.code).toBe('RATE_LIMITED')
      expect(extraction).toHaveBeenCalledTimes(10)
      await db.exec('DELETE FROM auth_limits')
      for (let i = 0; i < 20; i++) await app.get(AuthService).limit('extract-demo:global', 20)
      expect((await post(query)).errors?.[0]?.extensions.code).toBe('RATE_LIMITED')
      expect(extraction).toHaveBeenCalledTimes(10)
      config.set('ALLOW_DEMO_EXTRACTION', 'false')
      expect((await post(query)).errors?.[0]?.extensions.code).toBe('UNAUTHENTICATED')
    } finally {
      config.set('ALLOW_DEMO_EXTRACTION', 'false')
      extraction.mockRestore()
    }
  })
})
