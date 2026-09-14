import { useLingui } from '@lingui/react'
import { Box, Button, Menu, MenuItem, type Theme } from '@mui/material'
import { useId, useState, type MouseEvent } from 'react'
import { usePreferences } from '../../core/preferences'
import { localeOrder, locales, type Locale } from '../../i18n'
import { spacing, type as typeScale } from '../../theme/tokens'
import { LanguageFlag } from '../language-flag'

export interface LanguageSwitchProps {
  /** `sidebar` fills its row, `header` sits as a trailing action. Both are drawn chrome. */
  placement?: 'sidebar' | 'header'
}

// In the sidebar the switch is drawn as one more Nav Item at rest, 184:9, and
// laid out as the Nav Item lays out its own row: 44 tall, radius md, 12 of
// padding and 8 between the 20 column at its inline start, which holds the
// flag, and the name at 14 and Medium in text/secondary, on
// bg/surface-secondary when hovered. So the name starts where every Nav Item's
// name starts. The keyboard's ring is three pixels inside it, as the Nav
// Item's. Under an sx key, which the lint rule reads as CSS.
const ROW = 44
const EDGE = 1
const FOCUS_RING = 3
const sidebarRow = {
  sx: (theme: Theme) => {
    const colour = theme.karnama.semantic
    return {
      position: 'relative',
      flexShrink: 0,
      justifyContent: 'flex-start',
      gap: `${spacing.xs}px`,
      boxSizing: 'border-box',
      width: '100%',
      minWidth: 0,
      height: ROW,
      paddingBlock: 0,
      paddingInline: `${spacing.sm}px`,
      borderRadius: `${theme.karnama.radius.md}px`,
      fontFamily: 'inherit',
      fontSize: `${typeScale.body.size}px`,
      fontWeight: typeScale.label.weight,
      lineHeight: 'normal',
      letterSpacing: 0,
      // A button centres its text, and the name fills the row, so it would sit
      // in the middle of it.
      textAlign: 'start',
      textTransform: 'none',
      color: colour['text/secondary'],
      '&:hover': { backgroundColor: colour['bg/surface-secondary'] },
      '&.Mui-focusVisible::after': {
        content: '""',
        position: 'absolute',
        inset: EDGE,
        borderRadius: `${theme.karnama.radius.md - EDGE}px`,
        borderStyle: 'solid',
        borderWidth: FOCUS_RING,
        borderColor: colour['border/focus'],
        pointerEvents: 'none',
      },
    } as const
  },
}

/**
 * The control that changes the language.
 *
 * `DESIGN.md` fixes where it goes and the rule is that it adds no new chrome:
 * on desktop the bottom of the sidebar `185:11`, below the nav items, where
 * there is already empty space; on mobile the Page Header `155:56` as an
 * optional trailing action, because the tab bar carries the three drawn
 * destinations and a fourth entry would change the design. This component is
 * the control itself; the Sidebar, KN-027, and the Page Header, KN-021, put it
 * in those two places.
 *
 * Each language names itself in its own language, «فارسی» and English, which is
 * the one case where a label must NOT be translated: a reader who cannot read
 * the current language has to be able to find their own. The flag of its
 * region leads each name, the owner's addition of 2026-09-14, KN-479, for the
 * same reader: a flag is found before a word in a script one cannot read. It is
 * decorative, since the name beside it is the control's name.
 */
export const LanguageSwitch = ({ placement = 'sidebar' }: LanguageSwitchProps) => {
  const { locale, setLocale } = usePreferences()
  const { i18n } = useLingui()
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const menuId = useId()

  const open = (event: MouseEvent<HTMLElement>) => {
    setAnchor(event.currentTarget)
  }
  const close = () => {
    setAnchor(null)
  }
  const choose = (next: Locale) => () => {
    setLocale(next)
    close()
  }

  return (
    <>
      <Button
        onClick={open}
        color="inherit"
        size="small"
        aria-haspopup="menu"
        aria-controls={anchor ? menuId : undefined}
        aria-expanded={anchor ? true : undefined}
        disableRipple={placement === 'sidebar'}
        sx={placement === 'sidebar' ? sidebarRow.sx : { justifyContent: 'center', width: 'auto', gap: `${spacing.xs}px` }}
      >
        <LanguageFlag locale={locale} />
        {/* The name gives way with an ellipsis rather than widening its row, as a Nav Item's label does. */}
        <Box component="span" sx={{ flex: '1 1 auto', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {locales[locale]}
        </Box>
      </Button>
      <Menu id={menuId} anchorEl={anchor} open={anchor !== null} onClose={close} slotProps={{ list: { 'aria-label': i18n._('Language') } }}>
        {localeOrder.map((value) => (
          <MenuItem key={value} selected={value === locale} onClick={choose(value)} sx={{ gap: `${spacing.xs}px` }}>
            <LanguageFlag locale={value} />
            {locales[value]}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
