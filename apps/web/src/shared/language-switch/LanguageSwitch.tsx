import { useLingui } from '@lingui/react'
import { Button, Menu, MenuItem, type Theme } from '@mui/material'
import { useId, useState, type MouseEvent } from 'react'
import { usePreferences } from '../../core/preferences'
import { localeOrder, locales, type Locale } from '../../i18n'
import { iconSize, spacing, type as typeScale } from '../../theme/tokens'

export interface LanguageSwitchProps {
  /** `sidebar` fills its row, `header` sits as a trailing action. Both are drawn chrome. */
  placement?: 'sidebar' | 'header'
}

// In the sidebar the switch is drawn as one more Nav Item at rest, 184:9: 44
// tall, radius md, 14 at Medium in text/secondary, bg/surface-secondary when
// hovered, its name where the items' names start, since the icon set has no
// language glyph and the rule is to add no chrome, DESIGN.md section 5. The
// keyboard's ring is three pixels inside it, as the Nav Item's. Under an sx
// key, which the lint rule reads as CSS.
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
      boxSizing: 'border-box',
      width: '100%',
      minWidth: 0,
      height: ROW,
      paddingBlock: 0,
      paddingInlineStart: `${spacing.sm + iconSize.md + spacing.xs}px`,
      paddingInlineEnd: `${spacing.sm}px`,
      borderRadius: `${theme.karnama.radius.md}px`,
      fontFamily: 'inherit',
      fontSize: `${typeScale.body.size}px`,
      fontWeight: typeScale.label.weight,
      lineHeight: 'normal',
      letterSpacing: 0,
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
 * the current language has to be able to find their own.
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
        sx={placement === 'sidebar' ? sidebarRow.sx : { justifyContent: 'center', width: 'auto' }}
      >
        {locales[locale]}
      </Button>
      <Menu id={menuId} anchorEl={anchor} open={anchor !== null} onClose={close} slotProps={{ list: { 'aria-label': i18n._('Language') } }}>
        {localeOrder.map((value) => (
          <MenuItem key={value} selected={value === locale} onClick={choose(value)}>
            {locales[value]}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
