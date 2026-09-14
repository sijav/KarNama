import { describe, expect, it } from 'vitest'
import { keyboardOf, type Keyboard } from './keyboard'

// A field that answers for the attributes it is given and nothing else, as a
// rendered input does.
const fieldWith = (attributes: Readonly<Record<string, string>>) => ({
  getAttribute: (name: string) => attributes[name] ?? null,
})

// The sign-in number's own declarations, typed so they read as values.
const NUMBER: Keyboard = { type: 'tel', inputMode: 'tel', enterKeyHint: 'send', autoComplete: 'tel' }

describe("a field's keyboard, KN-464", () => {
  it('is read off the four attributes a phone reads, by their names in the markup', () => {
    expect(keyboardOf(fieldWith({ type: 'tel', inputmode: 'tel', enterkeyhint: 'send', autocomplete: 'tel' }))).toEqual(NUMBER)
  })

  it('is null for each attribute the field does not declare', () => {
    expect(keyboardOf(fieldWith({}))).toEqual({ type: null, inputMode: null, enterKeyHint: null, autoComplete: null })
  })
})
