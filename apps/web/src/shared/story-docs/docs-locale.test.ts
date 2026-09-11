import { describe, expect, it } from 'vitest'
import { localeIn, localeInContext, localeInEvent } from './docs-locale'

describe('localeIn', () => {
  it('reads one of our locales', () => {
    expect(localeIn({ locale: 'en-US' })).toBe('en-US')
    expect(localeIn({ locale: 'fa-IR' })).toBe('fa-IR')
  })

  it('rejects a language it does not have a catalog for', () => {
    // Not a theoretical case: a stale URL can carry any globals string, and
    // returning it would send `storyDocFor` looking for a directory that does
    // not exist.
    expect(localeIn({ locale: 'de-DE' })).toBeNull()
  })

  it.each([
    ['no locale key', {}],
    ['a non-string locale', { locale: 2 }],
    ['null', null],
    ['a primitive', 'fa-IR'],
    ['undefined', undefined],
  ])('is null for %s', (_name, input) => {
    expect(localeIn(input)).toBeNull()
  })
})

/** A docs context whose primary story's context is the one given. */
const contextGiving = (storyContext: unknown) => ({
  storyById: () => 'primary',
  getStoryContext: (story: string) => (story === 'primary' ? storyContext : undefined),
})

describe('localeInContext', () => {
  it("reads the primary story's userGlobals through storyById and getStoryContext", () => {
    expect(localeInContext(contextGiving({ userGlobals: { locale: 'en-US' }, globals: { locale: 'en-US' } }))).toBe('en-US')
  })

  it("takes the toolbar's userGlobals over the globals a story pins", () => {
    // KN-203, as the running Storybook showed it: the LanguageSwitch page with
    // the toolbar on English, whose first story pins Persian.
    expect(localeInContext(contextGiving({ userGlobals: { locale: 'en-US' }, globals: { locale: 'fa-IR' } }))).toBe('en-US')
  })

  it('is null when the page has no primary story to ask about', () => {
    const noStory = {
      storyById: (): string => {
        throw new Error('no CSF file attached')
      },
      getStoryContext: () => ({ userGlobals: { locale: 'en-US' } }),
    }
    expect(localeInContext(noStory)).toBeNull()
  })

  it.each([
    ['a context without userGlobals', { globals: { locale: 'en-US' } }],
    ['userGlobals holding no known locale', { userGlobals: { locale: 'de-DE' } }],
    ['userGlobals that are not an object', { userGlobals: 3 }],
    ['a context that is null', null],
    ['a context that is a primitive', 7],
  ])('is null for %s, which the page then says', (_name, storyContext) => {
    expect(localeInContext(contextGiving(storyContext))).toBeNull()
  })
})

describe('localeInEvent', () => {
  it("reads a globalsUpdated event's userGlobals", () => {
    expect(localeInEvent({ userGlobals: { locale: 'en-US' }, globals: { locale: 'fa-IR' } })).toBe('en-US')
  })

  it.each([
    ['an event without userGlobals', { globals: { locale: 'en-US' } }],
    ['userGlobals holding no known locale', { userGlobals: { locale: 'de-DE' } }],
    ['no event', undefined],
    ['null', null],
  ])('is null for %s', (_name, event) => {
    expect(localeInEvent(event)).toBeNull()
  })
})
