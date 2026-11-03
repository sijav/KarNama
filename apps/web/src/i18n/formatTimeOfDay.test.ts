import { describe, expect, it } from 'vitest'
import { formatTimeOfDay } from './formatTimeOfDay'

describe('formatTimeOfDay, KN-755', () => {
  it("writes the file's times in Persian digits for a Persian reader", () => {
    // Node 774:16897 lists ۰۹:۰۰ to ۱۱:۳۰.
    expect(formatTimeOfDay('fa-IR', 9 * 60)).toBe('۰۹:۰۰')
    expect(formatTimeOfDay('fa-IR', 11 * 60 + 30)).toBe('۱۱:۳۰')
  })

  it('writes them in Latin digits for an English reader', () => {
    expect(formatTimeOfDay('en-US', 9 * 60)).toBe('09:00')
    expect(formatTimeOfDay('en-US', 11 * 60 + 30)).toBe('11:30')
  })

  it('writes both ends of the day', () => {
    expect(formatTimeOfDay('en-US', 0)).toBe('00:00')
    expect(formatTimeOfDay('en-US', 23 * 60 + 30)).toBe('23:30')
  })
})
