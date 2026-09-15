import { describe, expect, it } from 'vitest'
import { latinDigits } from './digits'

describe('the digits a reader types', () => {
  it('writes every digit in Latin and leaves everything else alone', () => {
    expect(latinDigits('۰۹-abc')).toBe('09-abc')
  })
})
