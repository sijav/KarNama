import { createTheme, type Theme } from '@mui/material/styles'
import { darkSemantic, darkStatus } from './darkMode'
import { elevation, fontFamily, radius, semantic, spacing, status, type as typeScale } from './tokens'

/** Light is the design. Dark is derived from it, see `darkMode.ts`. */
export type ColorScheme = 'light' | 'dark'

/**
 * The MUI theme, generated from the token set rather than written by hand.
 *
 * Everything a component needs resolves through here. A component that states a
 * colour, a spacing or a radius literal is a defect even when the value happens
 * to be right, because the next change to the design silently misses it.
 */
/**
 * The token values are widened to `string` here on purpose.
 *
 * `tokens.ts` is `as const`, so `semantic['bg/page']` has the literal type
 * `"#f6f7f9"`. That is right at the source, where it stops a typo. It is wrong
 * on the theme, where the same slot holds the DERIVED dark value: a component
 * reading `theme.karnama.semantic['bg/page']` would otherwise be typed as
 * "exactly the light hex", which is false in dark mode and would push whoever
 * hit it towards a cast.
 */
export type ThemeColours = Record<keyof typeof semantic, string>
export type ThemeStatuses = Record<keyof typeof status, { base: string; container: string }>

declare module '@mui/material/styles' {
  interface Theme {
    karnama: {
      status: ThemeStatuses
      elevation: typeof elevation
      radius: typeof radius
      semantic: ThemeColours
    }
  }
  interface ThemeOptions {
    karnama?: Theme['karnama']
  }
}

const role = (name: keyof typeof typeScale) => {
  const { size, lineHeight, weight, letterSpacing } = typeScale[name]
  return {
    fontFamily,
    fontSize: size,
    lineHeight: `${lineHeight}px`,
    fontWeight: weight,
    letterSpacing: `${letterSpacing}px`,
  }
}

export const buildTheme = (direction: 'rtl' | 'ltr', scheme: ColorScheme = 'light'): Theme => {
  // One set of names, two sets of values. Every component reads the names, so
  // nothing below the theme knows or cares which scheme is active, and adding a
  // third scheme later is a third table rather than a sweep of components.
  //
  // Annotated as `string` deliberately. `tokens.ts` is `as const`, so its values
  // have literal types like `"#2563eb"`, and a derived value is a plain string.
  // Widening here is where the two meet; leaving it to inference makes every
  // consumer of the theme demand the light literal.
  const colour: ThemeColours = scheme === 'dark' ? darkSemantic : semantic
  const statuses: ThemeStatuses = scheme === 'dark' ? darkStatus : status

  return createTheme({
    direction,
    // MUI's spacing unit is the 2xs step, so theme.spacing(2) is xs, (3) is sm,
    // (4) is md and so on. Every step in the scale is a whole multiple of 4,
    // which is why the design has no 2, 6 or 10: those were corrected to 4, 8
    // and 12 when the file was tokenised.
    spacing: spacing['2xs'],
    shape: { borderRadius: radius.md },
    palette: {
      mode: scheme,
      background: { default: colour['bg/page'], paper: colour['bg/surface'] },
      // light is the brand CONTAINER, a fill: in dark a navy tint of the brand hue,
      // not a lighter blue, so nothing should use it as one, KN-272.
      primary: { main: colour['bg/brand/default'], dark: colour['bg/brand/hover'], light: colour['bg/brand/container'], contrastText: colour['text/on-accent'] },
      error: { main: colour['bg/danger/default'], dark: colour['bg/danger/hover'], contrastText: colour['text/on-accent'] },
      text: { primary: colour['text/primary'], secondary: colour['text/secondary'], disabled: colour['text/disabled'] },
      divider: colour['border/default'],
    },
    typography: {
      fontFamily,
      h1: role('heading/l'),
      h2: role('heading/m'),
      subtitle1: role('title'),
      body1: role('body'),
      caption: role('label'),
    },
    karnama: { status: statuses, elevation, radius, semantic: colour },
  })
}
