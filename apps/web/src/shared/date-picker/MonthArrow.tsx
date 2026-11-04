import { useLingui } from '@lingui/react'
import { ButtonBase } from '@mui/material'
import { Icon } from '../icon'

// The props are documented in story-docs, not here, KN-207.
export interface MonthArrowProps {
  direction: 'next' | 'previous'
  onClick: () => void
}

// Node 848:2238 binds no variable to its 28 square; its radius of 8 is
// radius/md, which it leaves unbound.
const SQUARE = 28
// The chevron is the icon set's one, `chevron-down`, turned a quarter, as the
// file turns it.
const QUARTER = 90
// The hover's reaction, 120 ms, ease out.
const HOVER_MS = 120
// The keyboard's ring, which the file does not draw: three inside, as the Icon
// Button's, KN-294.
const FOCUS_RING = 3

// Date Picker / Nav Arrow, node 848:2238, KN-754: the month calendar's turn to
// the month before or after, Default and Hover. A 16 chevron in
// text/secondary that points the way the days run, the next month to the
// inline end and the previous to the inline start, so left for the next month
// in Persian; under the pointer the square fills with bg/surface-secondary.
export const MonthArrow = ({ direction, onClick }: MonthArrowProps) => {
  const { i18n } = useLingui()
  return (
    <ButtonBase
      disableRipple
      aria-label={direction === 'next' ? i18n._('Next month') : i18n._('Previous month')}
      onClick={onClick}
      sx={(theme) => {
        const colour = theme.karnama.semantic
        // chevron-down turned clockwise points left: the next month in
        // right to left, the previous one in left to right.
        const clockwise = (direction === 'next') === (theme.direction === 'rtl')
        return {
          position: 'relative',
          flexShrink: 0,
          width: SQUARE,
          height: SQUARE,
          borderRadius: `${theme.karnama.radius.md}px`,
          color: colour['text/secondary'],
          transition: `background-color ${HOVER_MS}ms ease-out`,
          '& > svg': { transform: `rotate(${clockwise ? QUARTER : -QUARTER}deg)` },
          '@media (hover: hover)': { '&:hover': { backgroundColor: colour['bg/surface-secondary'] } },
          '&.Mui-focusVisible::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            borderStyle: 'solid',
            borderWidth: FOCUS_RING,
            borderColor: colour['border/focus'],
            pointerEvents: 'none',
          },
          '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        }
      }}
    >
      <Icon name="chevron-down" size="sm" color="inherit" />
    </ButtonBase>
  )
}
