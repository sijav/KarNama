import { describe, expect, it } from 'vitest'
import { isBlank } from './blank'

// Each of these, alone, carries nothing to read.
const NOTHING: [string, string][] = [
  ['the empty string', ''],
  ['spaces, a tab and a newline', ' \t\n'],
  ['a no-break space', '\u00a0'],
  ['an ideographic space', '\u3000'],
  ['a byte order mark', '\ufeff'],
  ['a zero-width space', '\u200b'],
  ['a zero-width non-joiner', '\u200c'],
  ['a zero-width joiner', '\u200d'],
  ['a left-to-right mark', '\u200e'],
  ['a right-to-left mark', '\u200f'],
  ['a word joiner', '\u2060'],
  ['a soft hyphen', '\u00ad'],
  ['the Arabic number sign', '\u0600'],
  ['a combining acute accent with no letter under it', '\u0301'],
  ['the combining grapheme joiner', '\u034f'],
  ['variation selector 16', '\ufe0f'],
  ['a supplementary variation selector', '\u{e0100}'],
  ['the Hangul filler', '\u3164'],
  ['the Hangul choseong filler', '\u115f'],
  ['the braille blank', '\u2800'],
]

// Each of these, alone, is something to read.
const SOMETHING: [string, string][] = [
  ['a Persian letter', 'ب'],
  ['a Latin letter', 'x'],
  ['a Persian digit', '۲'],
  ['the Persian question mark', '؟'],
  ['a warning sign', '⚠'],
  ['the tatweel', 'ـ'],
]

// A real message: the Input's own Persian error, which has a zero-width
// non-joiner in it already.
const MESSAGE = 'این فیلد نمی‌تواند خالی باشد'

describe('isBlank', () => {
  it.each(NOTHING)('%s alone is blank', (_, text) => {
    expect(isBlank(text)).toBe(true)
  })

  it('all of them together are still blank', () => {
    expect(isBlank(NOTHING.map(([, text]) => text).join(''))).toBe(true)
  })

  it.each(NOTHING)('a real message with %s inside it is not blank', (_, text) => {
    expect(isBlank(`${MESSAGE.slice(0, 3)}${text}${MESSAGE.slice(3)}`)).toBe(false)
  })

  it.each(SOMETHING)('%s alone is not blank', (_, text) => {
    expect(isBlank(text)).toBe(false)
  })

  it.each(SOMETHING)('%s among the blank characters is not blank', (_, text) => {
    expect(isBlank(`\u200c${text}\u2800`)).toBe(false)
  })

  it('the real message is not blank, and keeps its zero-width non-joiner', () => {
    expect(MESSAGE).toContain('\u200c')
    expect(isBlank(MESSAGE)).toBe(false)
  })
})
