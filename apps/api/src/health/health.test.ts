import 'reflect-metadata'

import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { readFile } from 'node:fs/promises'
import type { Server } from 'node:http'
import { join } from 'node:path'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { z } from 'zod'
import { AppModule } from '../app.module.js'

/**
 * The whole application, booted, queried over HTTP.
 *
 * Not a unit test of the resolver, on purpose. What can go wrong here is not
 * the three fields it returns: it is that decorator metadata did not survive
 * the build, so the schema comes out with the wrong types or the container
 * cannot construct the resolver at all. Neither shows up in a unit test that
 * calls the method directly, and both show up here.
 *
 * The response body is PARSED rather than asserted on directly. supertest types
 * it as `any`, and reaching into an `any` is both a lint failure and the thing
 * that lets a test pass against a response shaped nothing like the one it
 * claims to check.
 */
const healthResponse = z.object({
  data: z.object({
    health: z.object({
      status: z.string(),
      environment: z.string(),
      uptimeSeconds: z.number(),
    }),
  }),
})

const errorResponse = z.object({
  errors: z.array(z.object({ message: z.string() })).min(1),
})

describe('the running API', () => {
  let app: INestApplication

  beforeAll(async () => {
    // The environment lives in vitest.setup.ts, not here: ConfigModule
    // validates when app.module is IMPORTED, and an ESM import is hoisted
    // above anything a beforeAll could set.
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleRef.createNestApplication()
    await app.init()
  }, 60_000)

  afterAll(async () => {
    await app.close()
  })

  // supertest wants the http server and Nest types `getHttpServer` as `any`.
  // Narrowed with a type PREDICATE rather than a cast: `as` would be the first
  // one in the repository and it would assert exactly the thing worth checking.
  // The predicate is a real check, so a Nest that ever hands back something
  // else fails here with a sentence instead of failing inside supertest.
  const isServer = (value: unknown): value is Server =>
    typeof value === 'object' && value !== null && 'listen' in value && 'address' in value

  const server = (): Server => {
    const raw: unknown = app.getHttpServer()
    if (!isServer(raw)) throw new Error('the application has no http server to query')
    return raw
  }

  const post = (query: string) => request(server()).post('/graphql').send({ query })

  it('answers the health query', async () => {
    const response = await post('{ health { status environment uptimeSeconds } }')

    expect(response.status).toBe(200)
    const { data } = healthResponse.parse(response.body)
    expect(data.health.status).toBe('ok')
    expect(data.health.environment).toBe('test')
    // From the process rather than a constant, so a stubbed value would fail.
    expect(data.health.uptimeSeconds).toBeGreaterThanOrEqual(0)
  })

  it('writes a schema whose types survived the decorator metadata', async () => {
    // The failure this catches: swc or tsc drops `emitDecoratorMetadata` and
    // every field comes out as the wrong type, or the whole ObjectType is
    // missing. The generated schema is where that is visible.
    const schema = await readFile(join(process.cwd(), 'schema.gql'), 'utf8')
    expect(schema).toContain('type Health {')
    expect(schema).toContain('status: String!')
    expect(schema).toContain('environment: String!')
    expect(schema).toContain('uptimeSeconds: Float!')
    expect(schema).toContain('health: Health!')
  })

  it('rejects an unknown field, which is how a schema proves it is a schema', async () => {
    const { errors } = errorResponse.parse((await post('{ health { nothingLikeThis } }')).body)
    expect(errors[0]?.message).toContain('nothingLikeThis')
  })
})
