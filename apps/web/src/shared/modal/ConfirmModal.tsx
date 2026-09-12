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
  /**
   * The control that asked for this, captured when it was asked for.
   *
   * A function, read as this closes: the caller keeps it in a ref, and a ref
   * read during render is neither allowed nor meaningful. Not read from the
   * page when the modal opens either: by then the control may already be gone,
   * which is exactly the case this is for, KN-344.
   */
  opener?: () => HTMLElement | null
  /** Where focus goes when the opener did not survive, read as it closes. */
  fallback?: () => HTMLElement | null
}

// Node 150:92's width, which binds no variable.
const CONFIRM_WIDTH = 360

// The Confirm modal of node 150:92, 360 wide, for deleting or archiving: its
// question as the title, what cannot be undone in text/secondary, and Cancel
// then the Destructive action at the inline end. Cancel takes focus as it
// opens, so the key a keyboard presses first changes nothing; Escape, the
// close and a press on the scrim all cancel.
export const ConfirmModal = ({ open, title, body, confirmLabel, onConfirm, onCancel, opener, fallback }: ConfirmModalProps) => {
  const { i18n } = useLingui()

  // MUI puts focus back on whatever had it when this opened, and when the
  // action just deleted that thing, focus() on a detached element does nothing
  // and the reader is left on the page body, KN-344. So once the dissolve is
  // over, and only if the opener is gone, focus goes where the caller says the
  // reader should carry on from.
  const settle = () => {
    if (opener?.()?.isConnected === true) return
    fallback?.()?.focus()
  }

  return (
    <Modal
      open={open}
      title={title}
      width={CONFIRM_WIDTH}
      onClose={onCancel}
      {...(fallback === undefined ? {} : { onClosed: settle })}
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
