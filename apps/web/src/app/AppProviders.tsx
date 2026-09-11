import { CacheProvider } from '@emotion/react'
import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { useLayoutEffect, useMemo, type ReactNode } from 'react'
import { PreferencesProvider, usePreferences } from '../core/preferences'
import { directionFor, i18nFor, type Locale } from '../i18n'
import { cacheFor } from '../theme/rtl'
import { buildTheme } from '../theme/theme'
import { resolveScheme, useSystemScheme, type ColorSchemePreference } from '../theme/useColorScheme'

export interface AppProvidersProps {
  /**
   * Forces the catalog and direction, overriding what the user has stored.
   * Storybook's toolbar drives the tree through this; the app leaves it unset
   * and follows the preference.
   */
  locale?: Locale
  /** Forces the colour scheme the same way. Light is the design; dark is derived. */
  colorScheme?: ColorSchemePreference
  children: ReactNode
}

/**
 * Everything a rendered KarNama tree needs: the catalog, the direction, the
 * emotion cache that flips logical properties, and the theme built from the
 * tokens.
 *
 * A story or a test renders this directly, which is why it takes the locale as
 * a prop rather than reading it from anywhere: Storybook's language toolbar
 * drives the same component the app does, so the four combinations the done
 * gate asks for are the same code path rather than a lookalike.
 */
export const AppProviders = ({ locale, colorScheme, children }: AppProvidersProps) => (
  // Keyed on the seed so a Storybook toolbar change remounts the provider and
  // takes effect, while a user's own change inside a story still sticks. Both
  // are needed: deterministic stories, and a switch that actually switches.
  <PreferencesProvider
    key={`${locale ?? ''}-${colorScheme ?? ''}`}
    initial={{ ...(locale ? { locale } : {}), ...(colorScheme ? { colorScheme } : {}) }}
  >
    <ThemedTree>{children}</ThemedTree>
  </PreferencesProvider>
)

/**
 * Split from `AppProviders` because it has to be INSIDE the preferences
 * provider to read them. One component cannot both provide a context and
 * consume it in the same render.
 */
const ThemedTree = ({ children }: { children: ReactNode }) => {
  const { locale, colorScheme } = usePreferences()
  const direction = directionFor(locale)
  const scheme = resolveScheme(colorScheme, useSystemScheme())
  const theme = useMemo(() => buildTheme(direction, scheme), [direction, scheme])
  const cache = useMemo(() => cacheFor(direction), [direction])

  // The catalog for this locale, its own instance, KN-134. A switch hands the
  // provider another instance, and @lingui/react 6's provider reads it through
  // useSyncExternalStore on a store made from the prop, so the new language is
  // in the same render: no flash of the old one, and no state of another
  // component changed while this one renders, which activating the shared
  // instance here did.
  const catalog = i18nFor(locale)

  // The document element carries dir and lang, not a wrapper div: a portalled
  // MUI Menu or Dialog renders outside the tree, so a direction set on a
  // wrapper would leave every popover laid out the wrong way round.
  //
  // A layout effect, so it lands in the same commit as the tree and before
  // the browser paints it. A passive effect runs after that first paint: the
  // flash of the wrong direction the catalog above is activated during render
  // to avoid, on every load with a stored English preference, and Storybook
  // starts a play function before it runs, KN-250.
  useLayoutEffect(() => {
    // Property assignment rather than setAttribute, so no string literal is
    // passed to a DOM call. That matters beyond style: exempting setAttribute
    // from the lingui rule, which is what the literal 'dir' needed, also
    // exempted setAttribute('aria-label', 'Delete this application'), which is
    // untranslated copy a screen reader reads out. KN-087.
    document.documentElement.dir = direction
    document.documentElement.lang = locale
    // The shared instance, for code outside the tree, follows after the commit,
    // where changing it updates no component during another's render.
    i18n.activate(locale)
  }, [direction, locale])

  return (
    <I18nProvider i18n={catalog}>
      <CacheProvider value={cache}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </CacheProvider>
    </I18nProvider>
  )
}
