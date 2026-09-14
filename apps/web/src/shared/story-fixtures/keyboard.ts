import type { InputHTMLAttributes } from 'react'

// Storybook only, like the rest of this folder: nothing that ships imports it.

/**
 * What a field tells a phone's keyboard, KN-464: its type, the keyboard it asks
 * for, what the key that finishes it says, and what may be filled in for it.
 * Each is null when the field does not say, which is what a story asserts when a
 * field must leave the browser's own choice.
 */
export interface Keyboard {
  type: InputHTMLAttributes<HTMLInputElement>['type'] | null
  inputMode: InputHTMLAttributes<HTMLInputElement>['inputMode'] | null
  enterKeyHint: InputHTMLAttributes<HTMLInputElement>['enterKeyHint'] | null
  autoComplete: InputHTMLAttributes<HTMLInputElement>['autoComplete'] | null
}

/** The keyboard a rendered field declares, read off its attributes. */
export const keyboardOf = (field: Pick<Element, 'getAttribute'>): Record<keyof Keyboard, string | null> => ({
  type: field.getAttribute('type'),
  inputMode: field.getAttribute('inputmode'),
  enterKeyHint: field.getAttribute('enterkeyhint'),
  autoComplete: field.getAttribute('autocomplete'),
})
