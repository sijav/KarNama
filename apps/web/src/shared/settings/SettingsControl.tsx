import { useLingui } from '@lingui/react'
import { useState } from 'react'
import { usePreferences } from '../../core/preferences'
import { useRecords } from '../../core/records'
import { Button } from '../button'
import { SettingsDialog } from './SettingsDialog'

export const SettingsControl = () => {
  const { i18n } = useLingui()
  const preferences = usePreferences()
  const { loadSamples } = useRecords()
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  return (
    <>
      <Button
        variant="text"
        onClick={() => {
          setOpen(true)
        }}
      >
        {i18n._('Settings')}
      </Button>
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
      />
    </>
  )
}
