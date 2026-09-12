import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createHash, createHmac, randomBytes, randomInt, randomUUID, timingSafeEqual } from 'node:crypto'
import { z } from 'zod'
import { AuthDatabase } from './database.service.js'
import { fail } from './errors.js'
import { SmsService } from './sms.service.js'

const accountSchema = z.object({ id: z.string(), phone: z.string(), name: z.string(), since: z.string() })
const challengeSchema = z.object({ hash: z.string(), expires: z.coerce.date(), attempts: z.number().int() })
const digest = (value: string) => createHash('sha256').update(value).digest('hex')
const digits = (value: string) =>
  value
    .replace(/[\u06f0-\u06f9]/gu, (n) => String(n.charCodeAt(0) - 0x06f0))
    .replace(/[\u0660-\u0669]/gu, (n) => String(n.charCodeAt(0) - 0x0660))

export const phoneNumber = (value: string) => {
  const phone = digits(value)
    .replace(/[\s()-]/gu, '')
    .replace(/^(?:\+98|0098)/u, '0')
    .replace(/^9/u, '09')
  if (!/^09\d{9}$/u.test(phone)) return fail('INVALID_PHONE')
  return phone
}

@Injectable()
export class AuthService {
  constructor(
    private readonly db: AuthDatabase,
    private readonly config: ConfigService,
    private readonly sms: SmsService,
  ) {}

  private hmac(value: string) {
    const secret = this.config.get<string>('AUTH_SECRET')
    if (!secret || secret.length < 32) return fail('AUTH_NOT_CONFIGURED')
    return createHmac('sha256', secret).update(value).digest('hex')
  }

  async limit(key: string, maximum: number) {
    const result = await this.db.query(
      `INSERT INTO auth_limits (key, started, count) VALUES ($1, NOW(), 1)
      ON CONFLICT (key) DO UPDATE SET
        started = CASE WHEN auth_limits.started < NOW() - INTERVAL '1 hour' THEN NOW() ELSE auth_limits.started END,
        count = CASE WHEN auth_limits.started < NOW() - INTERVAL '1 hour' THEN 1 ELSE auth_limits.count + 1 END
      WHERE auth_limits.started < NOW() - INTERVAL '1 hour' OR auth_limits.count < $2 RETURNING count`,
      [this.hmac(key), maximum],
    )
    if (!result.rows.length) fail('RATE_LIMITED')
  }

  async requestCode(typed: string, ip: string) {
    const phone = phoneNumber(typed)
    this.sms.ready()
    await this.limit(`sms-ip:${ip}`, 10)
    await this.limit(`sms-phone:${phone}`, 5)
    const code = String(randomInt(10000, 100000))
    const hash = this.hmac(`${phone}:${code}`)
    const result = await this.db.query(
      `INSERT INTO auth_challenges (phone, hash, sent, expires, attempts)
      VALUES ($1, $2, NOW(), NOW() + INTERVAL '2 minutes', 0)
      ON CONFLICT (phone) DO UPDATE SET hash = EXCLUDED.hash, sent = NOW(), expires = EXCLUDED.expires, attempts = 0
      WHERE auth_challenges.sent <= NOW() - INTERVAL '1 minute' RETURNING phone`,
      [phone, hash],
    )
    if (!result.rows.length) return fail('RESEND_TOO_SOON')
    try {
      await this.sms.send(phone, code)
    } catch {
      await this.db.query('DELETE FROM auth_challenges WHERE phone = $1 AND hash = $2', [phone, hash])
      return fail('SMS_DELIVERY_FAILED')
    }
    return { phone, retryAfterSeconds: 60, expiresInSeconds: 120 }
  }

  async verify(typed: string, input: string, ip: string) {
    const phone = phoneNumber(typed)
    await this.limit(`verify-ip:${ip}`, 60)
    const hash = this.hmac(`${phone}:${digits(input.trim())}`)
    const result = await this.db.transaction(async (client) => {
      const found = await client.query('SELECT hash, expires, attempts FROM auth_challenges WHERE phone = $1 FOR UPDATE', [phone])
      const parsed = challengeSchema.safeParse(found.rows[0])
      if (!parsed.success || parsed.data.expires.getTime() <= Date.now()) return { error: 'CODE_EXPIRED' }
      const challenge = parsed.data
      if (challenge.attempts >= 5) return { error: 'CODE_LOCKED' }
      if (!timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(challenge.hash, 'hex'))) {
        await client.query('UPDATE auth_challenges SET attempts = attempts + 1 WHERE phone = $1', [phone])
        return { error: 'CODE_WRONG' }
      }
      await client.query('DELETE FROM auth_challenges WHERE phone = $1', [phone])
      const saved = await client.query(
        `INSERT INTO users (id, phone, "updatedAt") VALUES ($1, $2, NOW())
        ON CONFLICT (phone) DO UPDATE SET "updatedAt" = NOW()
        RETURNING id, phone, COALESCE(name, '') AS name, "createdAt"::text AS since`,
        [randomUUID(), phone],
      )
      const account = accountSchema.parse(saved.rows[0])
      const token = randomBytes(32).toString('base64url')
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      await client.query('INSERT INTO auth_sessions (hash, "userId", expires) VALUES ($1, $2, $3)', [digest(token), account.id, expiresAt])
      return { login: { token, expiresAt, account } }
    })
    if (result.error) return fail(result.error)
    if (!result.login) return fail('UNAUTHENTICATED')
    return result.login
  }

  async account(token: string) {
    if (!/^[\w-]{43}$/u.test(token)) return fail('UNAUTHENTICATED')
    const found = await this.db.query(
      `SELECT u.id, u.phone, COALESCE(u.name, '') AS name, u."createdAt"::text AS since
      FROM auth_sessions s JOIN users u ON u.id = s."userId" WHERE s.hash = $1 AND s.expires > NOW()`,
      [digest(token)],
    )
    const account = accountSchema.safeParse(found.rows[0])
    if (!account.success) return fail('UNAUTHENTICATED')
    return account.data
  }

  async saveName(token: string, name: string) {
    const account = await this.account(token)
    const trimmed = name.trim()
    if (trimmed.length < 1 || trimmed.length > 100) return fail('INVALID_NAME')
    await this.db.query('UPDATE users SET name = $1, "updatedAt" = NOW() WHERE id = $2', [trimmed, account.id])
    return { ...account, name: trimmed }
  }

  async signOut(token: string) {
    await this.db.query('DELETE FROM auth_sessions WHERE hash = $1', [digest(token)])
    return true
  }
}
