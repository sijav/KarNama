// Local integration fixture, never loaded by the production API.
import 'reflect-metadata'
import { PGlite } from '@electric-sql/pglite'
import { ConfigService } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import { resolve } from 'node:path'

if (process.env.NODE_ENV !== 'test') throw new Error('Run this fixture with NODE_ENV=test')
process.env.WEB_ORIGIN = 'http://127.0.0.1:5174'
process.env.DATABASE_URL = 'postgresql://fixture:fixture@localhost/unused'
const { AppModule } = await import('../../apps/api/dist/app.module.js')
const { AuthDatabase } = await import('../../apps/api/dist/auth/database.service.js')
const { SmsService } = await import('../../apps/api/dist/auth/sms.service.js')
const { applyMigrations, readMigrations } = await import('../../apps/api/dist/database/migrations.js')
const db = new PGlite()
await applyMigrations(db, await readMigrations(resolve(import.meta.dirname, '../../apps/api')))
const codes = new Map()
const database = {
  query: (sql, values) => db.query(sql, values),
  transaction: (run) => db.transaction((tx) => run({ query: (sql, values) => tx.query(sql, values) })),
}
globalThis.fetch = async (url, options) => {
  if (url !== 'https://api.openai.com/v1/responses') throw new Error('Unexpected external request in fixture')
  const { input } = JSON.parse(options.body)
  if (input.includes('fail extraction')) return new Response('', { status: 503 })
  const fields = { title: 'Frontend developer', company: 'Example', employmentTypes: ['full-time', 'remote'], location: 'Berlin', experience: '3 years', jobLevel: 'specialist', postedAt: '2026-09-12', expiresAt: '', salary: 'EUR 60,000', source: '', postingUrl: '', description: input }
  return Response.json({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(fields) }] }] })
}
const module = await Test.createTestingModule({ imports: [AppModule] })
  .overrideProvider(AuthDatabase).useValue(database)
  .overrideProvider(ConfigService).useValue(new ConfigService({ NODE_ENV: 'test', AUTH_SECRET: 'local-fixture-secret-32-characters-only', OPENAI_API_KEY: 'fixture', OPENAI_EXTRACTION_MODEL: 'fixture' }))
  .overrideProvider(SmsService).useValue({ ready() {}, async send(phone, code) { codes.set(phone, code) } }).compile()
const app = module.createNestApplication()
app.enableCors({ origin: ['http://127.0.0.1:5174', 'http://localhost:4173'], credentials: true })
app.getHttpAdapter().get('/__test__/code', (req, res) => res.json({ code: codes.get(req.query.phone) }))
await app.listen(4400, '127.0.0.1')
console.log('Local-only scenario fixture on 127.0.0.1:4400. SMS and AI providers are test doubles.')
const close = async () => { await app.close(); await db.close(); process.exit(0) }
process.on('SIGINT', close)
process.on('SIGTERM', close)
