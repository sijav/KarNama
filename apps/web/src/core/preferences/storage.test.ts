import { afterEach, describe, expect, it, vi } from 'vitest'
import { STORAGE_KEY, defaults, readPreferences, writePreferences } from './storage'

/**
 * Storage is where a preference goes to be lost, so most of this is about the
 * ways it fails rather than the way it works: absent, throwing, holding
 * nonsense, holding a value from an older version of the app.
 */
const stubStorage = (store: Record<string, string>, throws = false) => {
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => {
      if (throws) throw new Error('storage is disabled')
      return store[key] ?? null
    },
    setItem: (key: string, value: string) => {
      if (throws) throw new Error('storage is disabled')
      store[key] = value
    },
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('reading', () => {
  it('falls back to Persian and light when there is no storage at all', () => {
    expect(readPreferences()).toEqual(defaults)
    expect(defaults).toEqual({ locale: 'fa-IR', colorScheme: 'light' })
  })

  it('falls back when storage throws, which a private window does', () => {
    stubStorage({}, true)
    expect(readPreferences()).toEqual(defaults)
  })

  it('falls back when nothing is stored', () => {
    stubStorage({})
    expect(readPreferences()).toEqual(defaults)
  })

  it('falls back when what is stored is not JSON', () => {
    stubStorage({ [STORAGE_KEY]: 'not json at all' })
    expect(readPreferences()).toEqual(defaults)
  })

  it('falls back when what is stored is JSON but not an object', () => {
    stubStorage({ [STORAGE_KEY]: '"a string"' })
    expect(readPreferences()).toEqual(defaults)
    stubStorage({ [STORAGE_KEY]: 'null' })
    expect(readPreferences()).toEqual(defaults)
  })

  it('reads a stored choice back', () => {
    stubStorage({ [STORAGE_KEY]: JSON.stringify({ locale: 'en-US', colorScheme: 'dark' }) })
    expect(readPreferences()).toEqual({ locale: 'en-US', colorScheme: 'dark' })
  })

  it('keeps the good field when the other one is unrecognised', () => {
    // The version-skew case. A locale list that changes, or a colour scheme
    // that gets renamed, should not throw away the choice that is still valid.
    stubStorage({ [STORAGE_KEY]: JSON.stringify({ locale: 'de-DE', colorScheme: 'dark' }) })
    expect(readPreferences()).toEqual({ locale: 'fa-IR', colorScheme: 'dark' })
    stubStorage({ [STORAGE_KEY]: JSON.stringify({ locale: 'en-US', colorScheme: 'sepia' }) })
    expect(readPreferences()).toEqual({ locale: 'en-US', colorScheme: 'light' })
  })

  it('accepts every colour scheme the type allows, including system', () => {
    for (const colorScheme of ['light', 'dark', 'system'] as const) {
      stubStorage({ [STORAGE_KEY]: JSON.stringify({ locale: 'fa-IR', colorScheme }) })
      expect(readPreferences().colorScheme).toBe(colorScheme)
    }
  })
})

describe('writing', () => {
  it('says false when there is nowhere to write', () => {
    // Not an error: a user in a private window still gets a working app, they
    // just get the defaults back next time. Saying so is what stops a caller
    // reporting success it did not have.
    expect(writePreferences(defaults)).toBe(false)
  })

  it('says false when the write throws', () => {
    stubStorage({}, true)
    expect(writePreferences(defaults)).toBe(false)
  })

  it('round trips through storage', () => {
    const store: Record<string, string> = {}
    stubStorage(store)
    expect(writePreferences({ locale: 'en-US', colorScheme: 'system' })).toBe(true)
    expect(readPreferences()).toEqual({ locale: 'en-US', colorScheme: 'system' })
  })
})

describe('when reading localStorage itself throws', () => {
  it('falls back rather than crashing at import time', () => {
    // Some browsers throw on ACCESS to the property, not just on use, when site
    // data is blocked. The guard is around the property read for that reason,
    // and this is the only way to reach it.
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('access to storage is denied')
      },
    })
    expect(readPreferences()).toEqual(defaults)
    expect(writePreferences(defaults)).toBe(false)
    Reflect.deleteProperty(globalThis, 'localStorage')
  })
})
