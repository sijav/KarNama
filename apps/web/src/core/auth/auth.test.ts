import { describe, expect, it } from 'vitest'
import {
  CODE_LENGTH,
  checkCode,
  isPhone,
  latinDigits,
  makeCode,
  needsName,
  normalisePhone,
  readSession,
  sendCode,
  sessionFor,
} from './auth'

describe('the number a reader types', () => {
  it.each([
    ['09120000000', '09120000000'],
    ['۰۹۱۲۰۰۰۰۰۰۰', '09120000000'],
    ['٠٩١٢٠٠٠٠٠٠٠', '09120000000'],
    ['0912 000 0000', '09120000000'],
    ['0912-000-0000', '09120000000'],
    ['+989120000000', '09120000000'],
    ['00989120000000', '09120000000'],
    ['9120000000', '09120000000'],
  ])('reads %s as %s', (typed, stored) => {
    expect(normalisePhone(typed)).toBe(stored)
    expect(isPhone(typed)).toBe(true)
  })

  it.each([
    ['too short', '0912000'],
    ['too long', '091200000001'],
    ['a landline', '02112345678'],
    ['letters', '0912abcdefg'],
    ['nothing', ''],
  ])('refuses %s', (_case, typed) => {
    expect(normalisePhone(typed)).toBeNull()
    expect(isPhone(typed)).toBe(false)
  })

  it('writes every digit in Latin and leaves everything else alone', () => {
    expect(latinDigits('۰۹-abc')).toBe('09-abc')
  })
})

describe('the code the mock sends', () => {
  it('is five digits, and keeps its leading zeros', () => {
    expect(makeCode(() => 0)).toBe('00000')
    expect(makeCode(() => 0.99999)).toHaveLength(CODE_LENGTH)
    expect(makeCode()).toMatch(/^\d{5}$/)
  })

  it('is for one number and expires', () => {
    const sent = sendCode('09120000000', 1000, () => 0.12345)
    expect(sent.phone).toBe('09120000000')
    expect(sent.expiresAt).toBeGreaterThan(1000)
  })

  it.each([
    ['the right code', 0, null],
    ['a wrong code', 0, 'wrong'],
    ['the right code too late', 10 * 60 * 1000, 'expired'],
  ])('answers %s', (_case, later, problem) => {
    const sent = sendCode('09120000000', 0, () => 0.5)
    const typed = problem === 'wrong' ? '00000' : sent.code
    expect(checkCode(sent, typed, later)).toBe(problem)
  })

  it('is expired when there is no code at all, which is what a fresh page has', () => {
    expect(checkCode(null, '12345', 0)).toBe('expired')
  })

  it('reads a code typed in Persian digits', () => {
    const sent = { phone: '09120000000', code: '12345', expiresAt: 10_000 }
    expect(checkCode(sent, '۱۲۳۴۵', 0)).toBeNull()
  })
})

describe('the session', () => {
  it('has no name until the first login gives one', () => {
    const fresh = sessionFor('09120000000', '2026-09-12T00:00:00.000Z')
    expect(needsName(fresh)).toBe(true)
    expect(needsName({ ...fresh, name: 'سارا' })).toBe(false)
    expect(needsName({ ...fresh, name: '   ' })).toBe(true)
  })

  it('reads back what was stored, and nothing else', () => {
    const kept = sessionFor('09120000000', '2026-09-12T00:00:00.000Z', 'سارا')
    expect(readSession(JSON.parse(JSON.stringify(kept)))).toEqual(kept)
  })

  it.each([
    ['null', null],
    ['a primitive', 7],
    ['a session with no phone', { name: 'a', since: 'b' }],
    ['a session whose phone is not one', { phone: '123', name: 'a', since: 'b' }],
    ['a session whose name is not text', { phone: '09120000000', name: 2, since: 'b' }],
  ])('refuses %s', (_case, raw) => {
    expect(readSession(raw)).toBeNull()
  })
})
