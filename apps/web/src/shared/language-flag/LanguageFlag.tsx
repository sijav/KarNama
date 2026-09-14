import { Box } from '@mui/material'
import { IR, US } from 'country-flag-icons/react/3x2'
import type { Locale } from '../../i18n'
import { iconSize } from '../../theme/tokens'

// The props are documented in story-docs, not here, KN-207.
export interface LanguageFlagProps {
  locale: Locale
  'aria-label'?: string
}

// A language's flag is its region's: fa-IR takes Iran's, en-US the United
// States'. The flags are country-flag-icons', since the owner's word of
// 2026-09-14 was to "just install a package and use the package". Typed over
// every locale, so a locale added without a flag does not compile, and imported
// by name, so the build keeps these two of the package's flags and no others.
const FLAGS: Record<Locale, typeof IR> = { 'fa-IR': IR, 'en-US': US }

// The package draws every flag three wide by two tall; here it fills the 20
// pixel icon column. A flag with a white edge would vanish into a white
// surface, so a one pixel hairline of border/default rings it, drawn over the
// flag rather than around it, which keeps the flag 20 wide.
const WIDTH = iconSize.md
const HEIGHT = (iconSize.md * 2) / 3
const EDGE = 1

// A language's flag, decorative unless it is given a name, when it is an image
// with that name, as the Icon is. Beside the language's written name it takes
// none, since the name already says it.
export const LanguageFlag = ({ locale, 'aria-label': label }: LanguageFlagProps) => (
  <Box
    component="span"
    {...(label === undefined ? { 'aria-hidden': true } : { role: 'img', 'aria-label': label })}
    sx={(theme) => ({
      position: 'relative',
      display: 'inline-block',
      flexShrink: 0,
      width: WIDTH,
      height: HEIGHT,
      overflow: 'hidden',
      borderRadius: `${theme.karnama.radius.sm}px`,
      '&::after': {
        content: '""',
        position: 'absolute',
        inset: 0,
        borderRadius: 'inherit',
        borderStyle: 'solid',
        borderWidth: EDGE,
        borderColor: theme.karnama.semantic['border/default'],
        pointerEvents: 'none',
      },
    })}
  >
    <Box component={FLAGS[locale]} sx={{ display: 'block', width: '100%', height: '100%' }} />
  </Box>
)
