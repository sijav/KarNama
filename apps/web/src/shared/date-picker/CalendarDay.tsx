import { Box, ButtonBase } from '@mui/material'
import type { KeyboardEventHandler } from 'react'
import { unstyledText, type SemanticToken } from '../../theme/tokens'

// The props are documented in story-docs, not here, KN-207.
export interface CalendarDayProps {
  label: string | null
  name?: string
  friday?: boolean
  today?: boolean
  selected?: boolean
  disabled?: boolean
  tabbable?: boolean
  onKeyDown?: KeyboardEventHandler<HTMLButtonElement>
  onSelect: () => void
}

// Node 773:16113 binds no variable to its sizes: a 34 by 32 cell round a 28
// circle at radius 14, today's ring one inside it.
const CELL = { width: 34, height: 32 } as const
const CIRCLE = 28
const RING = 1
// The keyboard's ring, which the file does not draw: two of border/focus one
// clear of the circle, apart from today's one inside it, KN-294.
const FOCUS_RING = 2
const FOCUS_GAP = 1
// The variants' reactions: the hover's 120 ms and the choice's 150 ms, ease out.
const HOVER_MS = 120
const SELECT_MS = 150

const plainText = unstyledText.calendarDay
const markedText = unstyledText.calendarDayMarked

// The number's colour, in the order the states win: off, chosen, today, Friday.
const inkOf = (friday: boolean, today: boolean, selected: boolean, disabled: boolean): SemanticToken => {
  if (disabled) return 'text/disabled'
  if (selected) return 'text/on-accent'
  if (today) return 'text/brand'
  return friday ? 'red/500' : 'text/primary'
}

// Date Picker / Day, node 773:16113, KN-754: one day of the month calendar, in
// nine variants. Its number is 13 on 20, in text/primary, in red/500 on a
// Friday, in text/brand at Medium with a ring of border/focus on today, in
// text/on-accent at Medium on the bg/brand/default circle when chosen, and in
// text/disabled when the field does not allow it. Under the pointer the circle
// fills with bg/surface-secondary, except on the chosen day. A cell with no day
// keeps its room and draws nothing. A press on the chosen day keeps it chosen;
// clearing is the field's own link. A day that is off is still reached, for a
// keyboard reading the month, and takes no press.
export const CalendarDay = ({
  label,
  name,
  friday = false,
  today = false,
  selected = false,
  disabled = false,
  tabbable = false,
  onKeyDown,
  onSelect,
}: CalendarDayProps) => {
  if (label === null) return <Box component="span" sx={{ display: 'block', ...CELL }} />
  const marked = (today || selected) && !disabled
  const text = marked ? markedText : plainText
  return (
    <ButtonBase
      disableRipple
      tabIndex={tabbable ? 0 : -1}
      aria-label={name}
      aria-current={today ? 'date' : undefined}
      aria-disabled={disabled ? true : undefined}
      onKeyDown={onKeyDown}
      onClick={() => {
        if (!disabled) onSelect()
      }}
      sx={(theme) => {
        const colour = theme.karnama.semantic
        return {
          ...CELL,
          flexShrink: 0,
          fontFamily: 'inherit',
          color: colour[inkOf(friday, today, selected, disabled)],
          cursor: disabled ? 'default' : 'pointer',
          transition: `color ${SELECT_MS}ms ease-out`,
          '& > span': {
            boxSizing: 'border-box',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: CIRCLE,
            height: CIRCLE,
            borderRadius: `${CIRCLE / 2}px`,
            borderStyle: 'solid',
            borderWidth: today && !selected ? RING : 0,
            borderColor: colour['border/focus'],
            backgroundColor: selected && !disabled ? colour['bg/brand/default'] : 'transparent',
            fontSize: `${text.size}px`,
            lineHeight: `${text.lineHeight}px`,
            fontWeight: text.weight,
            letterSpacing: text.letterSpacing,
            transition: `background-color ${selected ? SELECT_MS : HOVER_MS}ms ease-out`,
          },
          ...(selected || disabled
            ? {}
            : { '@media (hover: hover)': { '&:hover > span': { backgroundColor: colour['bg/surface-secondary'] } } }),
          '&.Mui-focusVisible > span': {
            outlineStyle: 'solid',
            outlineWidth: FOCUS_RING,
            outlineColor: colour['border/focus'],
            outlineOffset: FOCUS_GAP,
          },
          '@media (prefers-reduced-motion: reduce)': { '&, & > span': { transition: 'none' } },
        }
      }}
    >
      <span>{label}</span>
    </ButtonBase>
  )
}
