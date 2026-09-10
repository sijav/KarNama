import { describe, expect, it } from 'vitest'
import { localeIn, localeInContext } from './docs-locale'

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

describe('localeInContext', () => {
  it.each([
    ['globals directly on the context', { globals: { locale: 'en-US' } }],
    ['globals under store', { store: { globals: { locale: 'en-US' } } }],
    ['globals under store.userGlobals', { store: { userGlobals: { globals: { locale: 'en-US' } } } }],
    ['globals under userGlobals', { userGlobals: { globals: { locale: 'en-US' } } }],
  ])('finds the locale with %s', (_name, context) => {
    expect(localeInContext(context)).toBe('en-US')
  })

  it('takes the first candidate that yields a locale, ignoring earlier empty ones', () => {
    expect(localeInContext({ globals: {}, store: { globals: { locale: 'fa-IR' } } })).toBe('fa-IR')
  })

  it.each([
    ['an empty object', {}],
    ['null', null],
    ['a primitive', 7],
    ['a store that is not an object', { store: 'nope' }],
    ['a userGlobals that is not an object', { store: { userGlobals: 3 } }],
    ['globals present but holding no known locale', { globals: { locale: 'de-DE' } }],
  ])('is null for %s', (_name, context) => {
    expect(localeInContext(context)).toBeNull()
  })
})
