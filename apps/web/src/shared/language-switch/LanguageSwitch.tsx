import { useLingui } from '@lingui/react'
import { Menu, MenuItem, useTheme } from '@mui/material'
import { useId, useRef, useState } from 'react'
import { usePreferences } from '../../core/preferences'
import { localeOrder, locales, type Locale } from '../../i18n'
import { inlineEndOf, inlineStartOf } from '../../theme/sides'
import { spacing } from '../../theme/tokens'
import { IconButton } from '../icon-button'
import { LanguageFlag } from '../language-flag'
import { Tooltip } from '../tooltip'

// The props are documented in story-docs, not here, KN-207.
export interface LanguageSwitchProps {
  placement?: 'sidebar' | 'header'
}

// The control that changes the language: an Icon Button whose icon is the
// current language's flag, the owner's of 2026-09-14, KN-479 and KN-478. Its
// name says what it is, «زبان»; its tip is the current language's own name, the
// one label that must NOT be translated, since a reader who cannot read the
// interface has to be able to find their own language. The menu lists both,
// each in its own language beside its flag.
//
// The menu opens where there is room and never over its button. At the
// sidebar's foot it opens above the button, hanging from its inline start so it
// runs into the sidebar; in a phone's Page Header it opens below, hanging from
// its inline end, the Menu's way. MUI's Popover places by left and right and
// does not mirror, so each side is worked out for the direction. It opens
// instantly, as every menu does.
export const LanguageSwitch = ({ placement = 'sidebar' }: LanguageSwitchProps) => {
  const { locale, setLocale } = usePreferences()
  const { i18n } = useLingui()
  const { direction } = useTheme()
  const button = useRef<HTMLButtonElement>(null)
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const menuId = useId()
  const above = placement === 'sidebar'
  const side = above ? inlineStartOf(direction) : inlineEndOf(direction)

  const close = () => {
    setAnchor(null)
  }
  const choose = (next: Locale) => () => {
    setLocale(next)
    close()
  }

  return (
    <>
      <Tooltip title={locales[locale]}>
        <IconButton
          ref={button}
          icon={<LanguageFlag locale={locale} />}
          aria-label={i18n._('Language')}
          aria-haspopup="menu"
          aria-expanded={anchor ? true : undefined}
          aria-controls={anchor ? menuId : undefined}
          onClick={() => {
            setAnchor(button.current)
          }}
        />
      </Tooltip>
      <Menu
        id={menuId}
        anchorEl={anchor}
        open={anchor !== null}
        onClose={close}
        transitionDuration={0}
        anchorOrigin={{ vertical: above ? 'top' : 'bottom', horizontal: side }}
        transformOrigin={{ vertical: above ? 'bottom' : 'top', horizontal: side }}
        slotProps={{
          // 4 clear of the button, on whichever side it opens to.
          paper: { sx: { marginTop: above ? `-${spacing['2xs']}px` : `${spacing['2xs']}px` } },
          list: { 'aria-label': i18n._('Language') },
        }}
      >
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
