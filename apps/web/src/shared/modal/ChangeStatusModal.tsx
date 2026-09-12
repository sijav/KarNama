import { useLingui } from '@lingui/react'
import { Box } from '@mui/material'
import { useId, useState, type SyntheticEvent } from 'react'
import { Button, type ButtonType } from '../button'
import { StatusPicker, type StatusOption } from '../status-picker'
import { Modal } from './Modal'

// The props are documented in story-docs, not here, KN-207.
export interface ChangeStatusModalProps {
  open: boolean
  statuses: readonly StatusOption[]
  value: string
  onConfirm: (id: string) => void
  onCancel: () => void
  onAdd: () => void
}

// Node 150:93's width, which binds no variable.
// The button that finishes the form, typed so the lint rule reads it as a
// value rather than as copy.
const SUBMIT: ButtonType = 'submit'

const CHANGE_STATUS_WIDTH = 420

// The Change Status modal of node 150:93, 420 wide: the Status Picker, and
// Cancel then Confirm at the inline end. A choice waits in the modal until
// Confirm hands it over; Cancel, Escape, the close and the scrim leave the
// status as it was. Each opening starts from the status the job has, with
// focus on it, so the arrows move from there, KN-337.
export const ChangeStatusModal = ({ open, statuses, value, onConfirm, onCancel, onAdd }: ChangeStatusModalProps) => {
  const { i18n } = useLingui()
  const [pending, setPending] = useState(value)
  const formId = useId()
  // React's pattern for state that follows a prop, adjusted during render: an
  // opening, or a new status from outside, starts again from it.
  const [seen, setSeen] = useState({ open, value })
  if (seen.open !== open || seen.value !== value) {
    setSeen({ open, value })
    setPending(value)
  }
  return (
    <Modal
      open={open}
      title={i18n._('Change status')}
      width={CHANGE_STATUS_WIDTH}
      onClose={onCancel}
      actions={
        <>
          <Button variant="ghost" onClick={onCancel}>
            {i18n._('Cancel')}
          </Button>
          <Button
            type={SUBMIT}
            form={formId}
          >
            {i18n._('Confirm')}
          </Button>
        </>
      }
    >
      <Box
        component="form"
        noValidate
        id={formId}
        onSubmit={(event: SyntheticEvent) => {
          event.preventDefault()
          onConfirm(pending)
        }}
        // Draws no box of its own, so the modal's own layout is unchanged,
        // KN-463.
        sx={{ display: 'contents' }}
      >
        <StatusPicker statuses={statuses} value={pending} onChange={setPending} onAdd={onAdd} autoFocus />
      </Box>
    </Modal>
  )
}
