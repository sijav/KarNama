import { useLingui } from '@lingui/react'
import { Box, Stack, useMediaQuery, type Theme } from '@mui/material'
import { PageHeader } from '../shared/page-header'
import { band } from './band'

// The props are documented in story-docs, not here, KN-207.
export interface StatsScreenProps {
  onSignOut?: () => void
}

// The Stats page's place, the sidebar's «آمار من», KN-796: its Header band with
// the Page Header, as the board and the network open theirs, and nothing under
// it yet. The page itself, section 1062:54412, is KN-823, which fills it.
export const StatsScreen = ({ onSignOut }: StatsScreenProps) => {
  const { i18n } = useLingui()
  const wide = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'), { noSsr: true })
  return (
    <Stack sx={{ flex: '1 1 auto', minHeight: 0 }}>
      <Box component="header" sx={band.sx(wide)}>
        <PageHeader title={i18n._('My stats')} {...(onSignOut === undefined ? {} : { onSignOut })} />
      </Box>
    </Stack>
  )
}
