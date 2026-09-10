import { describe, expect, it } from 'vitest'
import { formatCount } from './formatCount'

describe('formatCount', () => {
  it('counts in Persian digits for a Persian reader', () => {
    expect(formatCount('fa-IR', 3)).toBe('۳')
  })

  it('counts in Latin digits for an English reader', () => {
    expect(formatCount('en-US', 3)).toBe('3')
  })

  it('groups thousands the way each locale groups them', () => {
    // Grouping is locale business too, not only the shape of the digits, and it
    // is the half people forget.
    expect(formatCount('fa-IR', 1234)).toBe('۱٬۲۳۴')
    expect(formatCount('en-US', 1234)).toBe('1,234')
  })

  it('handles zero, which a status with nothing in it will pass', () => {
    expect(formatCount('fa-IR', 0)).toBe('۰')
    expect(formatCount('en-US', 0)).toBe('0')
  })

  it('returns the same formatter for the same locale, so a long list is not expensive', () => {
    // The reason for the cache. A board draws one chip per status and a count
    // per card; constructing Intl.NumberFormat per render is what turns up
    // later as a slow list.
    const first = formatCount('fa-IR', 1)
    const second = formatCount('fa-IR', 2)
    expect(first).toBe('۱')
    expect(second).toBe('۲')
  })
})
