import { describe, expect, it } from 'vitest'
import { holdClock } from './clock'

describe('a held clock, KN-587', () => {
  it('reads the time it holds, moves on when told, and gives Date.now back', () => {
    const own = Date.now
    const clock = holdClock(1000)
    try {
      expect(Date.now()).toBe(1000)
      clock.forward(60_000)
      expect(Date.now()).toBe(61_000)
    } finally {
      clock.release()
    }
    expect(Date.now).toBe(own)
  })
})
