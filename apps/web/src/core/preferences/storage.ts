import { isLocale, type Locale } from '../../i18n'
import type { ColorSchemePreference } from '../../theme/useColorScheme'

/**
 * The two choices a user makes about how the app looks, and where they are kept.
 *
 * One store for both, because they are the same problem: a preference the whole
 * tree needs, that has to survive a reload, and that has exactly one control.
 * Building two would mean two places to forget to persist.
 *
 * Reading and writing are separated from React on purpose. `localStorage`
 * throws in a private window in some browsers and is simply absent in the node
 * test project, and a provider that discovers that at render time takes the
 * whole tree down with it.
 */
export interface Preferences {
  locale: Locale
  colorScheme: ColorSchemePreference
}

export const STORAGE_KEY = 'karnama.preferences'

/** Persian and light, which is what the design draws. */
export const defaults: Preferences = { locale: 'fa-IR', colorScheme: 'light' }

const isColorScheme = (value: unknown): value is ColorSchemePreference =>
  value === 'light' || value === 'dark' || value === 'system'

/**
 * Reads what is stored, falling back a field at a time.
 *
 * A field at a time rather than all or nothing: a stored value from an older
 * version with one unknown field should not throw away the field that is still
 * good, and a user who picked dark last month should keep it after the locale
 * list changes.
 */
const storage = (): Storage | undefined => {
  // `globalThis.localStorage` is typed as always present and is not: it is
  // absent in the node test project and throws on ACCESS, not just on use, in a
  // browser with site data blocked. The try is around the read of the property
  // itself for that reason.
  try {
    return globalThis.localStorage
  } catch {
    return undefined
  }
}

export const readPreferences = (): Preferences => {
  let parsed: unknown
  try {
    const raw = storage()?.getItem(STORAGE_KEY)
    // Private windows, storage disabled, no window at all, nothing stored yet.
    // Defaults are correct in every one of those cases and none of them is an
    // error worth surfacing.
    if (typeof raw !== 'string') return defaults
    parsed = JSON.parse(raw)
  } catch {
    return defaults
  }
  if (typeof parsed !== 'object' || parsed === null) return defaults

  const stored: Record<string, unknown> = { ...parsed }
  const locale = stored.locale
  const colorScheme = stored.colorScheme
  return {
    locale: typeof locale === 'string' && isLocale(locale) ? locale : defaults.locale,
    colorScheme: isColorScheme(colorScheme) ? colorScheme : defaults.colorScheme,
  }
}

/** Writes, and says whether it worked, because a silent failure here is a bug report. */
export const writePreferences = (preferences: Preferences): boolean => {
  try {
    const store = storage()
    if (!store) return false
    store.setItem(STORAGE_KEY, JSON.stringify(preferences))
    return true
  } catch {
    return false
  }
}
