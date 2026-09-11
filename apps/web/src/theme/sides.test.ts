import { describe, expect, it } from 'vitest'
import { acrossTo, type ArrowPress } from './sides'

// The keys a test presses, typed, so they are values and not copy.
type Key = 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown' | 'Tab'
type Direction = 'rtl' | 'ltr'
const RTL: Direction = 'rtl'
const LTR: Direction = 'ltr'
const press = (key: Key, modified: Partial<Omit<ArrowPress, 'key'>> = {}): ArrowPress => ({
  key,
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  ...modified,
})

// Nine radios, the Color Picker's count, the fourth chosen.
const COUNT = 9
const AT = 3

describe('the left and right arrows of a radio row, KN-301', () => {
  it('move the way they point left to right: left to the previous radio, right to the next', () => {
    expect(acrossTo(press('ArrowLeft'), LTR, AT, COUNT)).toBe(AT - 1)
    expect(acrossTo(press('ArrowRight'), LTR, AT, COUNT)).toBe(AT + 1)
  })

  it('move the way they point right to left, where the next radio sits on the left', () => {
    expect(acrossTo(press('ArrowLeft'), RTL, AT, COUNT)).toBe(AT + 1)
    expect(acrossTo(press('ArrowRight'), RTL, AT, COUNT)).toBe(AT - 1)
  })

  it('wrap at either end, as the browsers wrap their own radio groups', () => {
    expect(acrossTo(press('ArrowRight'), LTR, COUNT - 1, COUNT)).toBe(0)
    expect(acrossTo(press('ArrowLeft'), LTR, 0, COUNT)).toBe(COUNT - 1)
    expect(acrossTo(press('ArrowLeft'), RTL, COUNT - 1, COUNT)).toBe(0)
    expect(acrossTo(press('ArrowRight'), RTL, 0, COUNT)).toBe(COUNT - 1)
  })

  it('leave up, down and every other key to the browser', () => {
    for (const key of ['ArrowUp', 'ArrowDown', 'Tab'] satisfies Key[]) {
      expect(acrossTo(press(key), LTR, AT, COUNT)).toBeNull()
      expect(acrossTo(press(key), RTL, AT, COUNT)).toBeNull()
    }
  })

  it('leave a modified arrow to the browser, as the engines leave it', () => {
    expect(acrossTo(press('ArrowLeft', { altKey: true }), RTL, AT, COUNT)).toBeNull()
    expect(acrossTo(press('ArrowRight', { ctrlKey: true }), LTR, AT, COUNT)).toBeNull()
    expect(acrossTo(press('ArrowLeft', { metaKey: true }), LTR, AT, COUNT)).toBeNull()
  })

  it('leave a key pressed on something in the row that is not one of its radios', () => {
    expect(acrossTo(press('ArrowLeft'), RTL, -1, COUNT)).toBeNull()
  })
})
