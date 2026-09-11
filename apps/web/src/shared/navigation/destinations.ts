import { useLingui } from '@lingui/react'
import type { Theme } from '@mui/material'
import type { IconName } from '../icon'

// The three places the product goes, in the order the sidebar and the tab bar
// draw them, DESIGN.md section 3: the board, adding a job opportunity, and the
// network page. Job detail is a modal, never a destination.
export type Destination = 'jobs' | 'add' | 'network'

export const DESTINATIONS: readonly { id: Destination; icon: IconName }[] = [
  { id: 'jobs', icon: 'file' },
  { id: 'add', icon: 'plus' },
  { id: 'network', icon: 'user' },
]

// Each destination's name, in the terminology of DESIGN.md: «فرصت‌های شغلی من»,
// «افزودن فرصت شغلی», «شبکه من».
export const useDestinationName = () => {
  const { i18n } = useLingui()
  return (destination: Destination) => {
    if (destination === 'jobs') return i18n._('My job opportunities')
    if (destination === 'add') return i18n._('Add job opportunity')
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
