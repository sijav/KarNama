import { useLingui } from '@lingui/react'
import { Box, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material'
import { useId } from 'react'
import { localeOrder, locales, type Locale } from '../../i18n'
import type { ColorSchemePreference } from '../../theme/useColorScheme'
import { Button } from '../button'
import { Modal } from '../modal'

const schemes: readonly ColorSchemePreference[] = ['light', 'dark', 'system']

export interface SettingsDialogProps {
  open: boolean
  locale: Locale
  colorScheme: ColorSchemePreference
  loaded: boolean
  onClose: () => void
  onLocaleChange: (locale: Locale) => void
  onColorSchemeChange: (scheme: ColorSchemePreference) => void
  onLoadSamples: () => void
}

export const SettingsDialog = ({
  open,
  locale,
  colorScheme,
  loaded,
  onClose,
  onLocaleChange,
  onColorSchemeChange,
  onLoadSamples,
}: SettingsDialogProps) => {
  const { i18n } = useLingui()
  const languageId = useId()
  const themeId = useId()
  return (
    <Modal
      open={open}
      title={i18n._('Settings')}
      width={420}
      onClose={onClose}
      actions={<Button onClick={onClose}>{i18n._('Done')}</Button>}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, overflowY: 'auto' }}>
        <FormControl>
          <FormLabel id={languageId}>{i18n._('Language')}</FormLabel>
          <RadioGroup aria-labelledby={languageId} value={locale}>
            {localeOrder.map((language) => (
              <FormControlLabel
                key={language}
                value={language}
                control={
                  <Radio
                    onChange={() => {
                      onLocaleChange(language)
                    }}
                  />
                }
                label={locales[language]}
              />
            ))}
          </RadioGroup>
        </FormControl>
        <FormControl>
          <FormLabel id={themeId}>{i18n._('Theme')}</FormLabel>
          <RadioGroup aria-labelledby={themeId} value={colorScheme}>
            {schemes.map((scheme) => (
              <FormControlLabel
                key={scheme}
                value={scheme}
                control={
                  <Radio
                    onChange={() => {
                      onColorSchemeChange(scheme)
                    }}
                  />
                }
                label={scheme === 'light' ? i18n._('Light') : scheme === 'dark' ? i18n._('Dark') : i18n._('Use device setting')}
              />
            ))}
          </RadioGroup>
        </FormControl>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box component="p" sx={{ m: 0, color: 'text.secondary' }}>
            {i18n._(
              'Add 30 fictional jobs and 6 contacts to test the app. Your existing records are kept; repeated loads do not add duplicates.',
            )}
          </Box>
          <Button variant="secondary" onClick={onLoadSamples}>
            {i18n._('Load sample data')}
          </Button>
          {loaded ? <Box role="status">{i18n._('Sample data loaded. Open your board or network to explore it.')}</Box> : null}
        </Box>
      </Box>
    </Modal>
  )
}
