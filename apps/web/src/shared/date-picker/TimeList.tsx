import { useLingui } from '@lingui/react'
import { Box, MenuItem, MenuList } from '@mui/material'
import { useLayoutEffect, useRef } from 'react'
import { usePreferences } from '../../core/preferences'
import { formatTimeOfDay } from '../../i18n/formatTimeOfDay'
import { type as typeScale, unstyledText } from '../../theme/tokens'
import { popoverSurface } from '../popover'

// The props are documented in story-docs, not here, KN-207.
export interface TimeListProps {
  value: number | null
  onChange: (minutes: number) => void
  autoFocus?: boolean
  width?: number
}

// Node 774:16897 binds no variable to these: its 244, its 6 of padding and the
// 2 between its items; nor does 786:1753 to an item's 32, its 10 at the sides
// and its radius of 6. The keyboard's ring is the three drawn inside that the
// Select's rows take, KN-012.
const WIDTH = 244
const PADDING = 6
const GAP = 2
const ROW = 32
const SIDES = 10
const RADIUS = 6
const FOCUS_RING = 3

// Six rows show, as the file draws the list, with the chosen time the third.
const SHOWN = 6
const BEFORE = 2

// Every half-hour of a day, in minutes after midnight: the handoff's list.
export const HALF_HOURS: readonly number[] = Array.from({ length: 48 }, (_, at) => at * 30)

// Where the window opens, and focus with it, when nothing is chosen: ۰۹:۰۰, the
// file's first row.
const MORNING = 9 * 60

const text = unstyledText.timeItem

// Date Picker / Time List, node 774:16897, of Time Items, 786:1753: the
// half-hours of a day in the reader's digits on the redesign's popover
// surface, 6 inside it and 2 apart, a window of six rows that scrolls with no
// bar, since the file draws none. It opens with the chosen time third, as the
// file shows ۱۰:۰۰, or ۰۹:۰۰ first when none is chosen. MUI's MenuList makes it
// a listbox whose arrows, Home and End move through the times and whose Enter
// chooses; told to, it puts focus on the chosen time, or on ۰۹:۰۰, as it
// mounts. Where it hangs is its caller's: in the calendar popover, 4 under the
// time field at the field's width, 780:44558.
export const TimeList = ({ value, onChange, autoFocus = false, width = WIDTH }: TimeListProps) => {
  const { i18n } = useLingui()
  const { locale } = usePreferences()
  const list = useRef<HTMLUListElement>(null)
  // The time the window opens on and the list's one Tab stop: the chosen one,
  // or the morning.
  const stop = value !== null && HALF_HOURS.includes(value) ? value : MORNING
  // Only as it mounts, before it is drawn: after that the window is the reader's.
  const opening = useRef(value === stop ? HALF_HOURS.indexOf(stop) - BEFORE : HALF_HOURS.indexOf(stop))
  useLayoutEffect(() => {
    if (list.current) list.current.scrollTop = Math.max(0, opening.current) * (ROW + GAP)
  }, [])
  return (
    <Box sx={(theme) => ({ ...popoverSurface.sx(theme), width, overflow: 'hidden' })}>
      <MenuList
        ref={list}
        role="listbox"
        aria-label={i18n._('Time')}
        disablePadding
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: `${GAP}px`,
          padding: `${PADDING}px`,
          maxHeight: SHOWN * ROW + (SHOWN - 1) * GAP + 2 * PADDING,
          overflowY: 'auto',
          scrollbarWidth: 'none',
          outline: 0,
        }}
      >
        {HALF_HOURS.map((minutes) => {
          const selected = minutes === value
          return (
            <MenuItem
              key={minutes}
              role="option"
              aria-selected={selected}
              selected={selected}
              tabIndex={minutes === stop ? 0 : -1}
              autoFocus={autoFocus && minutes === stop}
              disableRipple
              onClick={() => {
                onChange(minutes)
              }}
              sx={(theme) => {
                const colour = theme.karnama.semantic
                return {
                  position: 'relative',
                  flexShrink: 0,
                  boxSizing: 'border-box',
                  minHeight: ROW,
                  height: ROW,
                  paddingBlock: 0,
                  paddingInline: `${SIDES}px`,
                  borderRadius: `${RADIUS}px`,
                  fontSize: `${text.size}px`,
                  lineHeight: `${text.lineHeight}px`,
                  fontWeight: text.weight,
                  letterSpacing: `${text.letterSpacing}px`,
                  color: colour['text/primary'],
                  // Hover, 786:1749, and the keyboard's row with it.
                  '@media (hover: hover)': { '&:hover': { backgroundColor: colour['bg/surface-secondary'] } },
                  '&.Mui-focusVisible': { backgroundColor: colour['bg/surface-secondary'] },
                  // Selected, 786:1751, whatever the pointer or the keyboard does,
                  // its time at Medium, the Label's weight.
                  '&.Mui-selected, &.Mui-selected:hover, &.Mui-selected.Mui-focusVisible': {
                    backgroundColor: colour['bg/brand/container'],
                    color: colour['text/brand'],
                    fontWeight: typeScale.label.weight,
                  },
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
                }
              }}
            >
              {formatTimeOfDay(locale, minutes)}
            </MenuItem>
          )
        })}
      </MenuList>
    </Box>
  )
}
