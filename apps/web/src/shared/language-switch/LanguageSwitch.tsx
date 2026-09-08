import { useLingui } from '@lingui/react'
import { Button, Menu, MenuItem } from '@mui/material'
import { useId, useState, type MouseEvent } from 'react'
import { usePreferences } from '../../core/preferences'
import { localeOrder, locales, type Locale } from '../../i18n'

export interface LanguageSwitchProps {
  /** `sidebar` fills its row, `header` sits as a trailing action. Both are drawn chrome. */
  placement?: 'sidebar' | 'header'
}

/**
 * The control that changes the language.
 *
 * `DESIGN.md` fixes where it goes and the rule is that it adds no new chrome:
 * on desktop the bottom of the sidebar `185:11`, below the nav items, where
 * there is already empty space; on mobile the Page Header `155:56` as an
 * optional trailing action, because the tab bar carries the three drawn
 * destinations and a fourth entry would change the design. This component is
 * the control itself. Putting it in those two places belongs to the cards that
 * build them, and neither exists yet.
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
        sx={{ justifyContent: placement === 'sidebar' ? 'flex-start' : 'center', width: placement === 'sidebar' ? '100%' : 'auto' }}
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
