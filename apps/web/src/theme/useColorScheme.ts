import { useSyncExternalStore } from 'react'
import type { ColorScheme } from './theme'

/** What the user asked for. `system` is a preference, not a colour. */
export type ColorSchemePreference = ColorScheme | 'system'

const QUERY = '(prefers-color-scheme: dark)'

const canMatch = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function'

/**
 * `useSyncExternalStore` rather than `useState` plus an effect.
 *
 * The effect version had to call `setState` in the effect body to catch a
 * preference that changed between the first render and the effect, which
 * React's own lint rejects as a cascading render and which is genuinely the
 * wrong shape: the operating system's colour scheme is an external store, and
 * this is the hook for reading one. It also means no state to get out of step
 * and no cleanup to forget.
 *
 * `matchMedia` is guarded because this module is imported by the node unit
 * project as well as the browser one, and an unguarded call turns a test run
 * into a crash that reads like a bug in the component under test.
 */
export const subscribe = (onChange: () => void) => {
  if (!canMatch()) return () => undefined
  const media = window.matchMedia(QUERY)
  media.addEventListener('change', onChange)
  return () => {
    media.removeEventListener('change', onChange)
  }
}

export const getSnapshot = (): ColorScheme => (canMatch() && window.matchMedia(QUERY).matches ? 'dark' : 'light')

/** Light when there is no window to ask, which is the design's own default. */
export const getServerSnapshot = (): ColorScheme => 'light'

/**
 * The whole decision, as a pure function.
 *
 * Kept separate from the hook so it can be tested in the node project against
 * both inputs. It was a hook wrapping `useSyncExternalStore`, and the wrapper
 * was the one thing in the file no test could reach: hooks need a renderer, so
 * the rule that actually decides what colour the app is went uncovered while
 * the plumbing around it did not.
 */
export const resolveScheme = (preference: ColorSchemePreference, system: ColorScheme): ColorScheme =>
  preference === 'system' ? system : preference

/** The store, read the way React wants an external store read. */
export const useSystemScheme = (): ColorScheme => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
