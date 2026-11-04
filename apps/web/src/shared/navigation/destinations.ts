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

// The three the sidebar and the tab bar draw, as the original's 185:11 and Tab
// Bar v2, 1273:103863, draw them: the board, the Stats page and the network page,
// KN-796 and KN-783. Adding left both for the board's own header button, KN-850,
// and `/add` keeps its address without a place in either.
export const DESTINATIONS: readonly Entry[] = [
  { id: 'jobs', icon: 'file' },
  { id: 'stats', icon: 'chart' },
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
