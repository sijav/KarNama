import { useLingui } from '@lingui/react'
import { Box, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material'
import { useId } from 'react'
import { isLocale, localeOrder, locales, type Locale } from '../../i18n'
import type { ColorSchemePreference } from '../../theme/useColorScheme'
import { Button } from '../button'
import { LanguageFlag } from '../language-flag'
import { Modal } from '../modal'
import { Select } from '../select'

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
        {/* The language from the Select, each named in its own language and led by its flag, the owner's of 2026-09-14, KN-480. */}
        <Select
          label={i18n._('Language')}
          options={localeOrder.map((language) => ({
            value: language,
            label: locales[language],
            leading: <LanguageFlag locale={language} />,
          }))}
          value={[locale]}
          onChange={(next) => {
            for (const chosen of next.filter(isLocale)) {
              onLocaleChange(chosen)
            }
          }}
        />
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
        {/* The status region is ALWAYS in the page and empty until the load
            finishes, KN-618: a region inserted already holding its line is not
            announced by every screen reader, only a change to a region already
            there is, which is why the Input keeps its alert mounted too, KN-287.
            It sits outside the gapped group rather than in it, and carries its own
            top spacing only when it has something to say: the group is a flex
            column, so an empty third item there would open 8px under the button,
            measured, and moving it out to the body would only trade that for the
            body's 12. In block flow an empty region costs nothing. */}
        <Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box component="p" sx={{ m: 0, color: 'text.secondary' }}>
              {i18n._(
                'Add 30 fictional jobs and 6 contacts to test the app. Your existing records are kept; repeated loads do not add duplicates.',
              )}
            </Box>
            <Button variant="secondary" onClick={onLoadSamples}>
              {i18n._('Load sample data')}
            </Button>
          </Box>
          <Box role="status" sx={{ mt: loaded ? 2 : 0 }}>
            {loaded ? i18n._('Sample data loaded. Open your board or network to explore it.') : null}
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}
