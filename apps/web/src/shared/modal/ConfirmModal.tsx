import { useLingui } from '@lingui/react'
import { Box } from '@mui/material'
import { type as typeScale } from '../../theme/tokens'
import { Button } from '../button'
import { Modal } from './Modal'

// The props are documented in story-docs, not here, KN-207.
export interface ConfirmModalProps {
  open: boolean
  title: string
  body: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}

// Node 150:92's width, which binds no variable.
const CONFIRM_WIDTH = 360

// The Confirm modal of node 150:92, 360 wide, for deleting or archiving: its
// question as the title, what cannot be undone in text/secondary, and Cancel
// then the Destructive action at the inline end. Cancel takes focus as it
// opens, so the key a keyboard presses first changes nothing; Escape, the
// close and a press on the scrim all cancel.
export const ConfirmModal = ({ open, title, body, confirmLabel, onConfirm, onCancel }: ConfirmModalProps) => {
  const { i18n } = useLingui()
  return (
    <Modal
      open={open}
      title={title}
      width={CONFIRM_WIDTH}
      onClose={onCancel}
      actions={
        <>
          <Button variant="ghost" autoFocus onClick={onCancel}>
            {i18n._('Cancel')}
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <Box
        component="p"
        sx={(theme) => ({
          margin: 0,
          fontSize: `${typeScale.body.size}px`,
          lineHeight: `${typeScale.body.lineHeight}px`,
          fontWeight: typeScale.body.weight,
          color: theme.karnama.semantic['text/secondary'],
        })}
      >
        {body}
      </Box>
    </Modal>
  )
}
