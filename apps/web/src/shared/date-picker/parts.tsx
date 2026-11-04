import { useLingui } from '@lingui/react'
import { Box } from '@mui/material'
import { spacing } from '../../theme/tokens'
import { Button } from '../button'
import { ClearLink } from './ClearLink'
import { DateShortcut } from './DateShortcut'
import { addDays, isOff } from './month'

// The parts the date dropdown, 774:16896, and the calendar popover, 774:16705,
// share, so the two cannot drift: the shortcuts' row and the footer.

/** A past date's shortcuts, today and the two days before it, or an interview's, today and the two after. */
export type ShortcutKind = 'past' | 'future'

// The 6 between the shortcuts, which neither node binds.
const SHORTCUT_GAP = 6

interface ShortcutRowProps {
  kind: ShortcutKind
  today: string
  min: string | null
  max: string | null
  onChoose: (day: string) => void
}

// The shortcuts, 6 apart from the inline start, each hidden when the field does
// not allow its day, as the handoff says; nothing when none is left.
export const ShortcutRow = ({ kind, today, min, max, onChoose }: ShortcutRowProps) => {
  const { i18n } = useLingui()
  const step = kind === 'past' ? -1 : 1
  const offered = [
    { day: today, label: i18n._('Today') },
    { day: addDays(today, step), label: kind === 'past' ? i18n._('Yesterday') : i18n._('Tomorrow') },
    { day: addDays(today, 2 * step), label: kind === 'past' ? i18n._('Two days ago') : i18n._('In two days') },
  ].filter((shortcut) => !isOff(shortcut.day, min, max))
  if (offered.length === 0) return null
  return (
    <Box sx={{ display: 'flex', gap: `${SHORTCUT_GAP}px` }}>
      {offered.map((shortcut) => (
        <DateShortcut
          key={shortcut.day}
          label={shortcut.label}
          onClick={() => {
            onChoose(shortcut.day)
          }}
        />
      ))}
    </Box>
  )
}

interface DateActionsProps {
  action: string
  onAction: () => void
  onCancel: () => void
  onClear?: (() => void) | undefined
}

// The footer, 8 apart: the clear link at the inline start when there is
// something to clear, then Button S Text «انصراف» and the Primary action,
// «تأیید» or «ذخیره», at the inline end.
export const DateActions = ({ action, onAction, onCancel, onClear }: DateActionsProps) => {
  const { i18n } = useLingui()
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: `${spacing.xs}px` }}>
      {onClear === undefined ? null : <ClearLink onClick={onClear} />}
      <Box sx={{ flexGrow: 1 }} />
      <Button variant="text" size="S" onClick={onCancel}>
        {i18n._('Cancel')}
      </Button>
      <Button variant="primary" size="S" onClick={onAction}>
        {action}
      </Button>
    </Box>
  )
}
