import { useLingui } from '@lingui/react'
import type { Theme } from '@mui/material'
import type { IconName } from '../icon'
import type { Destination } from './destinationIds'

export type { Destination }

// The places the navigation draws, each in the order it draws them, DESIGN.md
// section 3. Job detail is a modal, never a destination. Their ids live in
// destinationIds.ts, which the build reads too, KN-505.
interface Entry {
  id: Destination
  icon: IconName
}

// The sidebar's three, 185:11 as the original draws it: the board, the Stats
// page and the network page, KN-796. Adding left it for the board's own button.
export const DESTINATIONS: readonly Entry[] = [
  { id: 'jobs', icon: 'file' },
  { id: 'stats', icon: 'chart' },
  { id: 'network', icon: 'user' },
]

// The tab bar's three, 185:19: the board, adding and the network page. A phone's
// board has no add button of its own, so adding stays here until Tab Bar v2,
// KN-783, draws the sidebar's three and moves adding into the page header.
export const TAB_DESTINATIONS: readonly Entry[] = [
  { id: 'jobs', icon: 'file' },
  { id: 'add', icon: 'plus' },
  { id: 'network', icon: 'user' },
]

// Each destination's name, in the terminology of DESIGN.md: «فرصت‌های شغلی من»,
// «افزودن فرصت شغلی», «آمار من», «شبکه من».
export const useDestinationName = () => {
  const { i18n } = useLingui()
  return (destination: Destination) => {
    if (destination === 'jobs') return i18n._('My job opportunities')
    if (destination === 'add') return i18n._('Add job opportunity')
    if (destination === 'stats') return i18n._('My stats')
    return i18n._('My network')
  }
}

// What a destination's control says to a screen reader when it is the page
// the reader is on.
type Current = 'page'
export const CURRENT: Current = 'page'

// The keyboard's ring, three pixels drawn inside a control's edge, as the Icon
// Button's. Under an sx key, which the lint rule reads as CSS.
const EDGE = 1
const FOCUS_RING = 3
export const insetRing = {
  sx: (theme: Theme, radius: number) => ({
    '&.Mui-focusVisible::after': {
      content: '""',
      position: 'absolute',
      inset: EDGE,
      borderRadius: `${Math.max(radius - EDGE, 0)}px`,
      borderStyle: 'solid',
      borderWidth: FOCUS_RING,
      borderColor: theme.karnama.semantic['border/focus'],
      pointerEvents: 'none',
    },
  }),
}
