import { ConfigService } from '@nestjs/config'
import 'reflect-metadata'
import { describe, expect, it, vi } from 'vitest'
import { AuthService, phoneNumber } from './auth.service.js'
import type { AuthDatabase } from './database.service.js'
import type { SmsService } from './sms.service.js'

/**
 * The auth service's own refusals, KN-486: the ones the GraphQL tests never reach.
 * Its database and its SMS sender are stand-ins, so nothing here reaches either.
 */
const PHONE = '09123456789'
const SECRET = 'a-unit-test-secret-that-is-32-characters-or-more'
// A token in the shape the service accepts.
const TOKEN = 'a'.repeat(43)

const serviceWith = (database: Record<string, unknown>, config: Record<string, string> = { AUTH_SECRET: SECRET }) =>
  new AuthService(database as unknown as AuthDatabase, new ConfigService(config), {
    ready: vi.fn(),
    send: vi.fn(),
  } as unknown as SmsService)

describe('phone numbers, KN-486', () => {
  it.each([
    ['Persian', '۰۹۱۲ ۳۴۵ ۶۷۸۹'],
    ['Arabic-Indic', '٠٩١٢٣٤٥٦٧٨٩'],
  ])('reads a number written in %s digits', (_digits, typed) => {
    expect(phoneNumber(typed)).toBe(PHONE)
  })

  it.each(['0912345678', '08123456789', 'not a number'])('refuses %s', (typed) => {
    expect(() => phoneNumber(typed)).toThrow('INVALID_PHONE')
  })
})

describe("the auth service's refusals, KN-486", () => {
  it.each([
    ['no secret', {}],
    ['a secret shorter than 32 characters', { AUTH_SECRET: 'short' }],
  ])('counts nothing with %s', async (_case, config) => {
    const query = vi.fn()
    await expect(serviceWith({ query }, config).limit('sms-ip:203.0.113.9', 10)).rejects.toThrow('AUTH_NOT_CONFIGURED')
    expect(query).not.toHaveBeenCalled()
  })

  it('signs nobody in when the transaction gives back neither a refusal nor a login', async () => {
    const database = { query: vi.fn().mockResolvedValue({ rows: [{ count: 1 }] }), transaction: vi.fn().mockResolvedValue({}) }
    await expect(serviceWith(database).verify(PHONE, '12345', '203.0.113.9')).rejects.toThrow('UNAUTHENTICATED')
  })

  it.each([
    ['a name of spaces', '   '],
    ['a name over 100 characters', 'a'.repeat(101)],
  ])('refuses %s, and saves nothing', async (_case, name) => {
    const query = vi.fn().mockResolvedValue({ rows: [{ id: 'account-1', phone: PHONE, name: '', since: '2026-09-15' }] })
    await expect(serviceWith({ query }).saveName(TOKEN, name)).rejects.toThrow('INVALID_NAME')
    // The account was looked up, and nothing was written.
    expect(query).toHaveBeenCalledOnce()
  })

  it('saves a name of exactly 100 characters', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ id: 'account-1', phone: PHONE, name: '', since: '2026-09-15' }] })
    await expect(serviceWith({ query }).saveName(TOKEN, 'a'.repeat(100))).resolves.toMatchObject({ name: 'a'.repeat(100) })
    expect(query).toHaveBeenCalledTimes(2)
  })
})
