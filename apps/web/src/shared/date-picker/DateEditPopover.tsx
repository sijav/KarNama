import { useLingui } from '@lingui/react'
import { Box, Fade, Popover, useMediaQuery, useTheme } from '@mui/material'
import { useId, useState } from 'react'
import { inlineEndOf, inlineStartOf } from '../../theme/sides'
import { spacing, unstyledText } from '../../theme/tokens'
import { popoverPaper } from '../popover'
import { PopoverClose } from '../popover-close'
import { atTime, dayOf, minutesOf } from './month'
import { MonthCalendar } from './MonthCalendar'
import { DateActions, ShortcutRow, type ShortcutKind } from './parts'
import { TimeField } from './TimeField'

// The props are documented in story-docs, not here, KN-207.
export interface DateEditPopoverProps {
  anchorEl: HTMLElement | null
  title: string
  helper?: string | null
  value: string | null
  withTime?: boolean
  today: string
  min?: string | null
  max?: string | null
  shortcuts?: ShortcutKind | null
  clearable?: boolean
  beside?: boolean
  onSave: (value: string) => void
  onClear: () => void
  onClose: () => void
}

// Node 774:16705's width, the redesign's date popover's, which binds no
// variable, and the room it needs at most below its card: the frames' 502
// with a time and 427 without, each with a month of six weeks.
const WIDTH = 276
const TALLEST = { withTime: 534, withoutTime: 459 } as const
// The handoff's small window: 200 ms to open and 150 to close.
const OPEN_MS = 200
const CLOSE_MS = 150
type Query = '(prefers-reduced-motion: reduce)'
const LESS_MOTION: Query = '(prefers-reduced-motion: reduce)'

const titleText = unstyledText.dateEditTitle
const helperText = unstyledText.dateEditHelper

interface PanelProps {
  title: string
  titleId: string
  helper: string | null
  value: string | null
  withTime: boolean
  today: string
  min: string | null
  max: string | null
  shortcuts: ShortcutKind | null
  onSave: (value: string) => void
  onClear: (() => void) | undefined
  onClose: () => void
}

// What the popover holds, mounted each time it opens, so the day and the time it
// starts on are the field's.
const Panel = ({ title, titleId, helper, value, withTime, today, min, max, shortcuts, onSave, onClear, onClose }: PanelProps) => {
  const { i18n } = useLingui()
  const [day, setDay] = useState(value === null ? null : dayOf(value))
  const [time, setTime] = useState(value === null ? null : minutesOf(value))
  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box
          component="h2"
          id={titleId}
          sx={(theme) => ({
            margin: 0,
            fontSize: `${titleText.size}px`,
            lineHeight: `${titleText.lineHeight}px`,
            fontWeight: titleText.weight,
            letterSpacing: titleText.letterSpacing,
            color: theme.karnama.semantic['text/primary'],
          })}
        >
          {title}
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <PopoverClose aria-label={i18n._('Close')} onClick={onClose} />
      </Box>
      {shortcuts === null ? null : <ShortcutRow kind={shortcuts} today={today} min={min} max={max} onChoose={setDay} />}
      <MonthCalendar today={today} selected={day} min={min} max={max} onSelect={setDay} />
      {withTime ? <TimeField value={time} onChange={setTime} /> : null}
      {helper === null ? null : (
        <Box
          component="p"
          sx={(theme) => ({
            margin: 0,
            fontSize: `${helperText.size}px`,
            lineHeight: `${helperText.lineHeight}px`,
            fontWeight: helperText.weight,
            letterSpacing: helperText.letterSpacing,
            color: theme.karnama.semantic['text/secondary'],
          })}
        >
          {helper}
        </Box>
      )}
      <DateActions
        action={i18n._('Save')}
        onAction={() => {
          if (day === null) onClose()
          else onSave(withTime && time !== null ? atTime(day, time) : day)
        }}
        onCancel={onClose}
        onClear={value === null ? undefined : onClear}
      />
    </>
  )
}

// Popover / ویرایش تاریخ (تقویم), node 774:16705, KN-757: the calendar a card's
// or the history's date opens, in the redesign's popover panel at 276. Type
// تاریخ or تاریخ و ساعت by Time List Closed, Open and Hover. From the top: the
// head, the title at the inline start and Popover / Close at the inline end; a
// past date's or an interview's shortcuts; the month, filling 242; with a time,
// the time field and its Time List; the helper; and the actions, the clear link
// when the field may be emptied and has a date, then Cancel and Save. A press
// on a day, a shortcut or a time only chooses it; Save hands the day, or the
// day at its time, over and closes; Close, Cancel, Escape and a press outside
// close with no change. It hangs 4 under its anchor, the card, from the inline
// start, or 4 beside it at the inline end, level with its top, when the room
// below is short or when asked, as the history's row asks; it fades in over
// 200 ms and out over 150. A dialog named by its title, whose focus starts on
// the panel.
export const DateEditPopover = ({
  anchorEl,
  title,
  helper = null,
  value,
  withTime = false,
  today,
  min = null,
  max = null,
  shortcuts = null,
  clearable = false,
  beside = false,
  onSave,
  onClear,
  onClose,
}: DateEditPopoverProps) => {
  const theme = useTheme()
  const titleId = useId()
  const still = useMediaQuery(LESS_MOTION)
  const start = inlineStartOf(theme.direction)
  const end = inlineEndOf(theme.direction)
  const rtl = theme.direction === 'rtl'
  // The room under the anchor, read as it opens.
  const room = anchorEl === null ? Infinity : window.innerHeight - anchorEl.getBoundingClientRect().bottom
  const aside = beside || room < (withTime ? TALLEST.withTime : TALLEST.withoutTime) + spacing['2xs']
  return (
    <Popover
      open={anchorEl !== null}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={aside ? { vertical: 'top', horizontal: end } : { vertical: 'bottom', horizontal: start }}
      transformOrigin={{ vertical: 'top', horizontal: start }}
      slots={{ transition: Fade }}
      transitionDuration={still ? 0 : { enter: OPEN_MS, exit: CLOSE_MS }}
      slotProps={{
        paper: {
          role: 'dialog',
          'aria-labelledby': titleId,
          // Beside the anchor the gap is horizontal; MUI places by left, so it is
          // the left margin, the anchor's side of the panel, which the RTL plugin
          // must not turn into the right.
          sx: (paperTheme) => ({
            ...popoverPaper.sx(paperTheme, WIDTH),
            ...(aside ? { marginLeft: `${rtl ? -spacing['2xs'] : spacing['2xs']}px /* @noflip */` } : { marginTop: `${spacing['2xs']}px` }),
          }),
        },
      }}
    >
      <Panel
        title={title}
        titleId={titleId}
        helper={helper}
        value={value}
        withTime={withTime}
        today={today}
        min={min}
        max={max}
        shortcuts={shortcuts}
        onSave={onSave}
        onClear={clearable ? onClear : undefined}
        onClose={onClose}
      />
    </Popover>
  )
}
