import { afterEach, describe, expect, it, vi } from 'vitest'
import { getServerSnapshot, getSnapshot, resolveScheme, subscribe, useSystemScheme } from './useColorScheme'

/**
 * The three halves of the external store are tested directly rather than
 * through the hook, because what can go wrong here is not React: it is the
 * guard around `matchMedia`, which decides whether this module can be imported
 * at all by the node project, and the listener cleanup, which decides whether a
 * long Storybook session leaks one listener per story.
 */
const stubMatchMedia = (matches: boolean) => {
  const listeners = new Set<() => void>()
  const media = {
    matches,
    addEventListener: vi.fn((_event: string, listener: () => void) => listeners.add(listener)),
    removeEventListener: vi.fn((_event: string, listener: () => void) => listeners.delete(listener)),
  }
  vi.stubGlobal('window', { matchMedia: vi.fn(() => media) })
  return { media, listeners }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('reading the system colour scheme', () => {
  it('says light when there is no window to ask', () => {
    // The node project imports this module. Without the guard the import alone
    // throws, and the failure reads like a bug in whatever was being tested.
    expect(getSnapshot()).toBe('light')
  })

  it('says light when the window has no matchMedia', () => {
    vi.stubGlobal('window', {})
    expect(getSnapshot()).toBe('light')
  })

  it('reports dark when the system says dark, and light when it does not', () => {
    stubMatchMedia(true)
    expect(getSnapshot()).toBe('dark')
    vi.unstubAllGlobals()
    stubMatchMedia(false)
    expect(getSnapshot()).toBe('light')
  })

  it('falls back to light with no window at all, which is the design default', () => {
    expect(getServerSnapshot()).toBe('light')
  })
})

describe('the hook itself', () => {
  it('reads the store and falls back to light where there is no window', async () => {
    // Rendered through `react-dom/server` rather than left to the Storybook
    // project. It IS exercised there, by every story, and the coverage of it is
    // thrown away: a file touched by both the node and the browser project
    // reports only the node project's counters, so a function reached solely
    // from a story reads as uncovered. Filed as KN-103, because the same
    // overwrite silently overstates coverage everywhere else.
    const { renderToString } = await import('react-dom/server')
    const { createElement } = await import('react')
    const Probe = () => createElement('span', null, useSystemScheme())
    expect(renderToString(createElement(Probe))).toContain('light')
  })
})

describe('resolving a preference against the system', () => {
  it('follows the system only when the preference is system', () => {
    expect(resolveScheme('system', 'dark')).toBe('dark')
    expect(resolveScheme('system', 'light')).toBe('light')
  })

  it('ignores the system when the user has chosen', () => {
    // Both directions, because "dark wins" and "the choice wins" look identical
    // when the system happens to agree.
    expect(resolveScheme('dark', 'light')).toBe('dark')
    expect(resolveScheme('light', 'dark')).toBe('light')
  })
})

describe('subscribing to changes', () => {
  it('does nothing, harmlessly, where there is no matchMedia', () => {
    const unsubscribe = subscribe(() => undefined)
    expect(unsubscribe).toBeTypeOf('function')
    expect(() => {
      unsubscribe()
    }).not.toThrow()
  })

  it('adds a listener and removes exactly that listener on cleanup', () => {
    const { media, listeners } = stubMatchMedia(false)
    const onChange = vi.fn()

    const unsubscribe = subscribe(onChange)
    expect(media.addEventListener).toHaveBeenCalledTimes(1)
    expect(listeners.size).toBe(1)

    unsubscribe()
    expect(media.removeEventListener).toHaveBeenCalledTimes(1)
    // The set, not just the call count: passing a different function to
    // removeEventListener leaves the listener attached and still counts as one
    // call, which is the shape of leak this is written to catch.
    expect(listeners.size).toBe(0)
  })
})
