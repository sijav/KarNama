import { useLingui } from '@lingui/react'
import { Box, ButtonBase } from '@mui/material'
import { useState } from 'react'
import { spacing } from '../../theme/tokens'
import { Icon } from '../icon'
import { ChangeStatusModal } from '../modal'
import { StatusChip } from '../status-chip'
import type { StatusOption } from './StatusPicker'

// The props are documented in story-docs, not here, KN-207.
export interface StatusControlProps {
  statuses: readonly StatusOption[]
  value: string
  onChange: (id: string) => void
  onAdd: () => void
}

// Node 199:21 draws the caret at 14, which is none of the icon sizes and binds
// no variable, and the pressed edge at one and a half, an inset shadow over the
// one pixel border since Chromium floors a border of 1.5, KN-282.
const CARET = 14
const EDGE = 1
const PRESSED_EDGE = 1.5
const FOCUS_RING = 3

// The Status Control of node 199:21, Default, Hover and Pressed: the small
// Status Chip and a caret in a pill, the clickable wrapper the card and the job
// modal put round a chip that stays display only. It opens the Change Status
// modal, 150:93, as the file draws it over the job modal at 377:6244, KN-337:
// a named dialog opening on the chosen status. Confirm there hands the choice
// over; Cancel and Escape change nothing. Either way focus is back on the
// control.
export const StatusControl = ({ statuses, value, onChange, onAdd }: StatusControlProps) => {
  const { i18n } = useLingui()
  const [open, setOpen] = useState(false)
  const current = statuses.find((option) => option.id === value)
  const close = () => {
    setOpen(false)
  }
  return (
    <>
      <ButtonBase
        disableRipple
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={current === undefined ? i18n._('Status') : `${i18n._('Status')}: ${current.name}`}
        onClick={() => {
          setOpen(true)
        }}
        sx={(theme) => {
          const colour = theme.karnama.semantic
          return {
            position: 'relative',
            gap: `${spacing['2xs']}px`,
            paddingBlock: `${spacing['2xs']}px`,
            paddingInlineStart: `${spacing['2xs']}px`,
            paddingInlineEnd: `${spacing.xs}px`,
            borderRadius: `${theme.karnama.radius.full}px`,
            backgroundColor: colour['bg/surface'],
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              borderStyle: 'solid',
              borderWidth: EDGE,
              borderColor: colour['border/default'],
              pointerEvents: 'none',
            },
            '&:hover': { backgroundColor: colour['bg/surface-secondary'] },
            // Pressed, 199:20, while the picker is open as while it is held.
            '&:active, &[aria-expanded="true"]': {
              backgroundColor: colour['bg/surface-secondary'],
              boxShadow: `inset 0 0 0 ${PRESSED_EDGE}px ${colour['border/focus']}`,
            },
            '&:active::before, &[aria-expanded="true"]::before': { borderColor: colour['border/focus'] },
            '&.Mui-focusVisible::after': {
              content: '""',
              position: 'absolute',
              inset: EDGE,
              borderRadius: 'inherit',
              borderStyle: 'solid',
              borderWidth: FOCUS_RING,
              borderColor: colour['border/focus'],
              pointerEvents: 'none',
            },
          }
        }}
      >
        {current === undefined ? null : <StatusChip status={current.token} label={current.name} size="S" />}
        <Box component="span" sx={{ display: 'inline-flex', width: CARET, height: CARET, '& > svg': { width: '100%', height: '100%' } }}>
          <Icon name="chevron-down" size="sm" />
        </Box>
      </ButtonBase>
      <ChangeStatusModal
        open={open}
        statuses={statuses}
        value={value}
        onConfirm={(id) => {
          close()
          onChange(id)
        }}
        onCancel={close}
        onAdd={() => {
          close()
          onAdd()
        }}
      />
    </>
  )
}
