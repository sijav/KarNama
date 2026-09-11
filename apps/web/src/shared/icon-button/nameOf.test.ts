import { describe, expect, it } from 'vitest'
import { nameOf } from './IconButton'

describe("an icon button's name", () => {
  it('is required: a blank one is refused, null, rather than rendered nameless', () => {
    expect(nameOf('')).toBeNull()
    expect(nameOf('   ')).toBeNull()
  })

  it('passes a real one through unchanged', () => {
    expect(nameOf('Delete status')).toBe('Delete status')
  })
})
