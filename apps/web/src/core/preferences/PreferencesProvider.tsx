import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react'
import type { Locale } from '../../i18n'
import type { ColorSchemePreference } from '../../theme/useColorScheme'
import { defaults, readPreferences, writePreferences, type Preferences } from './storage'

export interface PreferencesValue extends Preferences {
  setLocale: (locale: Locale) => void
  setColorScheme: (scheme: ColorSchemePreference) => void
}

/**
 * The context is created with the defaults rather than with `undefined`.
 *
 * A component rendered outside the provider then gets Persian and light instead
 * of throwing, which is what a story or a test that only cares about layout
 * wants. The setters are no-ops there, and that is honest: there is nowhere to
 * put the value.
 */
export const PreferencesContext = createContext<PreferencesValue>({
  ...defaults,
  setLocale: () => undefined,
  setColorScheme: () => undefined,
})

export interface PreferencesProviderProps {
  /**
   * Seeds the state instead of what is stored. It is the INITIAL value, not a
   * pin: a user who then changes the language changes it.
   *
   * That distinction cost a story. When this was a permanent override,
   * Storybook's toolbar pinned the locale, so clicking English in the switch
   * updated the state and the label went on saying فارسی, because the override
   * won every render. A control nothing can move is not a control. Storybook
   * remounts the provider on a toolbar change, so seeding gives both: stories
   * that render deterministically in a chosen language, and a switch that works
   * inside them.
   */
  initial?: Partial<Preferences>
  children: ReactNode
}

export const PreferencesProvider = ({ initial, children }: PreferencesProviderProps) => {
  // Read once, lazily, so a browser that throws on localStorage costs one guarded
  // call rather than one per render.
  const [stored, setStored] = useState<Preferences>(() => ({ ...readPreferences(), ...initial }))

  const update = useCallback((next: Preferences) => {
    setStored(next)
    writePreferences(next)
  }, [])

  const { locale, colorScheme } = stored

  // The two fields are the dependencies, not the object they came from. An
  // object rebuilt on every render is a new reference every render, so
  // depending on it would rebuild the context value every time and re-render
  // every consumer, which is the whole thing `useMemo` is here to avoid.
  const contextValue = useMemo<PreferencesValue>(
    () => ({
      locale,
      colorScheme,
      setLocale: (next: Locale) => {
        update({ locale: next, colorScheme })
      },
      setColorScheme: (next: ColorSchemePreference) => {
        update({ locale, colorScheme: next })
      },
    }),
    [locale, colorScheme, update],
  )

  return <PreferencesContext.Provider value={contextValue}>{children}</PreferencesContext.Provider>
}
