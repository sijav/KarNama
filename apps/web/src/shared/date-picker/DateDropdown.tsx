import { useLingui } from '@lingui/react'
import { Box, Fade, Popover, useMediaQuery, useTheme } from '@mui/material'
import { useState } from 'react'
import { inlineStartOf } from '../../theme/sides'
import { spacing } from '../../theme/tokens'
import { Button } from '../button'
import { popoverPaper } from '../popover'
import { ClearLink } from './ClearLink'
import { DateShortcut } from './DateShortcut'
import { addDays, isOff } from './month'
import { MonthCalendar } from './MonthCalendar'

// The props are documented in story-docs, not here, KN-207.
export interface DateDropdownProps {
  anchorEl: HTMLElement | null
  label: string
  value: string | null
  today: string
  min?: string | null
  max?: string | null
  shortcuts?: boolean
  onConfirm: (day: string) => void
  onClear: () => void
  onClose: () => void
}

// Node 774:16896's width, the redesign's date popover's, and the 6 between its
// shortcuts, neither bound.
const WIDTH = 276
const SHORTCUT_GAP = 6
// The handoff's small window: 200 ms to open, as the field's press opens it
// with Smart Animate, and 150 to close.
const OPEN_MS = 200
const CLOSE_MS = 150
type Query = '(prefers-reduced-motion: reduce)'
const LESS_MOTION: Query = '(prefers-reduced-motion: reduce)'

interface PanelProps {
  value: string | null
  today: string
  min: string | null
  max: string | null
  shortcuts: boolean
  onConfirm: (day: string) => void
  onClear: () => void
  onClose: () => void
}

// What the dropdown holds, mounted each time it opens, so the day it starts on
// is the field's.
const Panel = ({ value, today, min, max, shortcuts, onConfirm, onClear, onClose }: PanelProps) => {
  const { i18n } = useLingui()
  const [chosen, setChosen] = useState(value)
  // The posted date's shortcuts, today and the two days before it, each hidden
  // when the field does not allow its day, as the handoff says.
  const offered = shortcuts
    ? [
        { day: today, label: i18n._('Today') },
        { day: addDays(today, -1), label: i18n._('Yesterday') },
        { day: addDays(today, -2), label: i18n._('Two days ago') },
      ].filter((shortcut) => !isOff(shortcut.day, min, max))
    : []
  return (
    <>
      {offered.length === 0 ? null : (
        <Box sx={{ display: 'flex', gap: `${SHORTCUT_GAP}px` }}>
          {offered.map((shortcut) => (
            <DateShortcut
              key={shortcut.day}
              label={shortcut.label}
              onClick={() => {
                setChosen(shortcut.day)
              }}
            />
          ))}
        </Box>
      )}
      <MonthCalendar today={today} selected={chosen} min={min} max={max} onSelect={setChosen} />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: `${spacing.xs}px` }}>
        {value === null ? null : <ClearLink onClick={onClear} />}
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="text" size="S" onClick={onClose}>
          {i18n._('Cancel')}
        </Button>
        <Button
          variant="primary"
          size="S"
          onClick={() => {
            if (chosen === null) onClose()
            else onConfirm(chosen)
          }}
        >
          {i18n._('Confirm')}
        </Button>
      </Box>
    </>
  )
}

// Date Picker / Dropdown, node 774:16896, KN-756: the form's date field's
// calendar, in the redesign's popover panel at 276. From the top: the posted
// date's three shortcuts, «امروز», «دیروز» and «پریروز», when it has them; the
// month, filling 242; and the footer, «پاک کردن» at the inline start when the
// field has a date, then Cancel and Confirm at the inline end. A press on a day
// or a shortcut only chooses it; Confirm puts it in the field and closes;
// Cancel, Escape and a press outside close with no change; the clear link
// empties the field and closes. The form's own save records the change. It
// hangs 4 under the field from its inline start, fading in over 200 ms and out
// over 150; a named dialog, named by the field, whose focus starts on the panel
// as the interview result's does.
export const DateDropdown = ({
  anchorEl,
  label,
  value,
  today,
  min = null,
  max = null,
  shortcuts = false,
  onConfirm,
  onClear,
  onClose,
}: DateDropdownProps) => {
  const start = inlineStartOf(useTheme().direction)
  const still = useMediaQuery(LESS_MOTION)
  return (
    <Popover
      open={anchorEl !== null}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: start }}
      transformOrigin={{ vertical: 'top', horizontal: start }}
      slots={{ transition: Fade }}
      transitionDuration={still ? 0 : { enter: OPEN_MS, exit: CLOSE_MS }}
      slotProps={{
        paper: {
          role: 'dialog',
          'aria-label': label,
          sx: (theme) => ({ ...popoverPaper.sx(theme, WIDTH), marginTop: `${spacing['2xs']}px` }),
        },
      }}
    >
      <Panel
        value={value}
        today={today}
        min={min}
        max={max}
        shortcuts={shortcuts}
        onConfirm={onConfirm}
        onClear={onClear}
        onClose={onClose}
      />
    </Popover>
  )
}
