import { describe, expect, it } from 'vitest'
import { fileNameFor, storyDocFor, TITLE_SHAPE } from './catalog'

describe('fileNameFor', () => {
  it('turns a story title into its markdown file name', () => {
    expect(fileNameFor('Shared/LanguageSwitch')).toBe('Shared-LanguageSwitch.md')
    expect(fileNameFor('App/Shell')).toBe('App-Shell.md')
  })

  it('flattens every level, not only the first', () => {
    expect(fileNameFor('A/B/C')).toBe('A-B-C.md')
  })
})

describe('TITLE_SHAPE', () => {
  it('accepts the titles this repository uses', () => {
    for (const title of ['Shared/LanguageSwitch', 'App/Shell', 'Foundations/Tokens', 'Core/PreferencesProvider']) {
      expect(TITLE_SHAPE.test(title)).toBe(true)
    }
  })

  it.each(['Has Space/Thing', 'Trailing/', '/Leading', 'has-dash/Thing', 'Dot.ted/Thing', ''])(
    'rejects %j, which would not survive the round trip to a file name',
    (title) => {
      // The point of the shape: `A-B` and `A/B` must not collapse onto one file.
      expect(TITLE_SHAPE.test(title)).toBe(false)
    },
  )
})

describe('storyDocFor', () => {
  it('loads the English entry for a real story', () => {
    const doc = storyDocFor('Shared/LanguageSwitch', 'en-US')
    expect(doc).not.toBeNull()
    expect(doc?.description).toContain('Switches the interface language')
    expect(Object.keys(doc?.props ?? {})).toEqual(['placement'])
  })

  it('loads the Persian entry for the same story, with the same structure', () => {
    const fa = storyDocFor('Shared/LanguageSwitch', 'fa-IR')
    const en = storyDocFor('Shared/LanguageSwitch', 'en-US')
    expect(fa).not.toBeNull()
    // Different prose, same shape. That is what the guard enforces repo-wide and
    // what makes the two languages interchangeable at render time.
    expect(fa?.description).not.toBe(en?.description)
    expect(Object.keys(fa?.props ?? {})).toEqual(Object.keys(en?.props ?? {}))
    expect(Object.keys(fa?.stories ?? {})).toEqual(Object.keys(en?.stories ?? {}))
  })

  it('is null for a title with no file, rather than throwing', () => {
    // The Docs page renders a visible "no entry" note from this null. A throw
    // would blank the page and say less than the note does.
    expect(storyDocFor('Nope/Missing', 'en-US')).toBeNull()
  })

  it('caches, so a second read returns the very same object', () => {
    const first = storyDocFor('App/Shell', 'en-US')
    expect(storyDocFor('App/Shell', 'en-US')).toBe(first)
  })

  it('caches a miss too, so a missing file is not re-read on every render', () => {
    expect(storyDocFor('Nope/Missing', 'fa-IR')).toBeNull()
    expect(storyDocFor('Nope/Missing', 'fa-IR')).toBeNull()
  })
})
