import { useLingui } from '@lingui/react'
import { useState } from 'react'
import { usePreferences } from '../../core/preferences'
import { useRecords } from '../../core/records'
import { IconButton } from '../icon-button'
import { SettingsDialog } from './SettingsDialog'

// The props are documented in story-docs, not here, KN-207.
export interface SettingsControlProps {
  onSignOut?: () => void
}

// Settings as an Icon Button, the owner's of 2026-09-14, KN-478. The file draws
// no settings, so it takes the gear the icon set gained for it, is named
// «تنظیمات», which its label tip shows, KN-848, and its description says what
// the dialog holds, since one that repeated the name would be heard twice.
// Given a way to sign out, its dialog carries it, as a phone's header needs
// since the gear is the one control it has room for, KN-850.
export const SettingsControl = ({ onSignOut }: SettingsControlProps) => {
  const { i18n } = useLingui()
  const preferences = usePreferences()
  const { loadSamples } = useRecords()
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  return (
    <>
      <IconButton
        icon="settings"
        aria-label={i18n._('Settings')}
        description={i18n._('Language, theme and sample data')}
        aria-haspopup="dialog"
        onClick={() => {
          setOpen(true)
        }}
      />
      <SettingsDialog
        open={open}
        locale={preferences.locale}
        colorScheme={preferences.colorScheme}
        loaded={loaded}
        onClose={() => {
          setOpen(false)
        }}
        onLocaleChange={preferences.setLocale}
        onColorSchemeChange={preferences.setColorScheme}
        onLoadSamples={() => {
          loadSamples()
          setLoaded(true)
        }}
        {...(onSignOut === undefined
          ? {}
          : {
              onSignOut: () => {
                setOpen(false)
                onSignOut()
              },
            })}
      />
    </>
  )
}
