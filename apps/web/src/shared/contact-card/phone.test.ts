import { describe, expect, it } from 'vitest'
import { dialable, formatPhone } from './phone'

describe('formatPhone', () => {
  it('groups a mobile number four, three and four, in Persian digits', () => {
    expect(formatPhone('fa-IR', '09121234567')).toBe('۰۹۱۲ ۱۲۳ ۴۵۶۷')
  })

  it('groups the same number in Latin digits for an English reader', () => {
    expect(formatPhone('en-US', '0912 123 4567')).toBe('0912 123 4567')
  })

  it('leaves any other number as it was typed, in the reader digits', () => {
    expect(formatPhone('fa-IR', '+44 20 7946 0000')).toBe('+۴۴ ۲۰ ۷۹۴۶ ۰۰۰۰')
  })
})

describe('dialable', () => {
  it('keeps the digits and a leading plus', () => {
    expect(dialable('0912 123 4567')).toBe('09121234567')
    expect(dialable(' +44 20 7946 0000')).toBe('+442079460000')
  })
})
