import { describe, expect, it } from 'vitest'
import { formatClock } from './formatClock'

describe('formatClock, KN-587', () => {
  it("writes the file's clock in Persian digits for a Persian reader", () => {
    // Node 407:6996 draws «ارسال دوباره‌ی کد تا ۰۰:۵۹».
    expect(formatClock('fa-IR', 59)).toBe('۰۰:۵۹')
    expect(formatClock('fa-IR', 60)).toBe('۰۱:۰۰')
  })

  it('writes it in Latin digits for an English reader', () => {
    expect(formatClock('en-US', 59)).toBe('00:59')
    expect(formatClock('en-US', 60)).toBe('01:00')
  })

  it('writes the end of a count as a clock too', () => {
    expect(formatClock('fa-IR', 0)).toBe('۰۰:۰۰')
    expect(formatClock('en-US', 0)).toBe('00:00')
  })
})
