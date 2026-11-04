import { useLingui } from '@lingui/react'
import { Box } from '@mui/material'
import { spacing } from '../../theme/tokens'
import { IconButton } from '../icon-button'
import { LanguageSwitch } from '../language-switch'
import { SettingsControl } from '../settings'

// The props are documented in story-docs, not here, KN-207.
export interface ShellControlsProps {
  placement: 'sidebar' | 'header'
  onSignOut?: () => void
}

// The shell's own controls, the owner's of 2026-09-14, KN-478: the language,
// settings and signing out, as Icon Buttons named by their label tips, each with
// a description of what its name does not say, KN-848, in that order from the
// inline start and 12 apart, as the compact Contact Card sets its Icon
// Buttons. The sidebar holds them at its foot and a phone's Page Header after
// its action, so both draw them from here and the two cannot drift.
export const ShellControls = ({ placement, onSignOut }: ShellControlsProps) => {
  const { i18n } = useLingui()
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: `${spacing.sm}px` }}>
      <LanguageSwitch placement={placement} />
      <SettingsControl />
      {onSignOut === undefined ? null : (
        <IconButton
          icon="log-out"
          aria-label={i18n._('Sign out')}
          description={i18n._('Signs you out of your account on this device')}
          onClick={onSignOut}
        />
      )}
    </Box>
  )
}
