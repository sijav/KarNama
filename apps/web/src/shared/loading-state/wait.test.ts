import { describe, expect, it } from 'vitest'
import { COLD_START_AFTER_MS, untilSlow } from './wait'

describe('untilSlow', () => {
  const start = 1_000_000

  it('is the whole fifteen seconds when the wait has just begun', () => {
    expect(COLD_START_AFTER_MS).toBe(15_000)
    expect(untilSlow(start, start)).toBe(15_000)
  })

  it('counts down to the last millisecond before the wait turns slow', () => {
    expect(untilSlow(start, start + 14_999)).toBe(1)
  })

  it('is 0 from fifteen seconds on, and never below', () => {
    expect(untilSlow(start, start + 15_000)).toBe(0)
    expect(untilSlow(start, start + 60_000)).toBe(0)
  })
})
