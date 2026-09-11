import { useLingui } from '@lingui/react'
import { useState } from 'react'
import { Button } from '../button'
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
const CHANGE_STATUS_WIDTH = 420

// The Change Status modal of node 150:93, 420 wide: the Status Picker, and
// Cancel then Confirm at the inline end. A choice waits in the modal until
// Confirm hands it over; Cancel, Escape, the close and the scrim leave the
// status as it was. Each opening starts from the status the job has.
export const ChangeStatusModal = ({ open, statuses, value, onConfirm, onCancel, onAdd }: ChangeStatusModalProps) => {
  const { i18n } = useLingui()
  const [pending, setPending] = useState(value)
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
            onClick={() => {
              onConfirm(pending)
            }}
          >
            {i18n._('Confirm')}
          </Button>
        </>
      }
    >
      <StatusPicker statuses={statuses} value={pending} onChange={setPending} onAdd={onAdd} />
    </Modal>
  )
}
