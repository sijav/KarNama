import { CacheProvider } from '@emotion/react'
import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { useEffect, useMemo, type ReactNode } from 'react'
import { directionFor, type Locale } from '../i18n'
import { cacheFor } from '../theme/rtl'
import { buildTheme } from '../theme/theme'
import { resolveScheme, useSystemScheme, type ColorSchemePreference } from '../theme/useColorScheme'

export interface AppProvidersProps {
  /** Which catalog and which direction. Persian is the default; English is the source. */
  locale: Locale
  /** Light, dark, or follow the operating system. Light is the design; dark is derived. */
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
export const AppProviders = ({ locale, colorScheme = 'light', children }: AppProvidersProps) => {
  const direction = directionFor(locale)
  const scheme = resolveScheme(colorScheme, useSystemScheme())
  const theme = useMemo(() => buildTheme(direction, scheme), [direction, scheme])
  const cache = useMemo(() => cacheFor(direction), [direction])

  // Activated during render, not in an effect. An effect runs after the first
  // paint, so the tree would render once against the previous catalog and then
  // swap, which is a visible flash of the wrong language on every switch.
  // `activate` is idempotent, and the guard keeps it from looping.
  if (i18n.locale !== locale) i18n.activate(locale)

  // The document element carries dir and lang, not a wrapper div: a portalled
  // MUI Menu or Dialog renders outside the tree, so a direction set on a
  // wrapper would leave every popover laid out the wrong way round.
  useEffect(() => {
    // Property assignment rather than setAttribute, so no string literal is
    // passed to a DOM call. That matters beyond style: exempting setAttribute
    // from the lingui rule, which is what the literal 'dir' needed, also
    // exempted setAttribute('aria-label', 'Delete this application'), which is
    // untranslated copy a screen reader reads out. KN-087.
    document.documentElement.dir = direction
    document.documentElement.lang = locale
  }, [direction, locale])

  return (
    <I18nProvider i18n={i18n}>
      <CacheProvider value={cache}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </CacheProvider>
    </I18nProvider>
  )
}
