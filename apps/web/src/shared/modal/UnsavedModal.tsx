import { useLingui } from '@lingui/react'
import { Button } from '../button'
import { Modal, ModalText } from './Modal'

// The props are documented in story-docs, not here, KN-207.
export interface UnsavedModalProps {
  open: boolean
  onSave: () => void
  onDiscard: () => void
  onKeepEditing: () => void
}

// Node 893:3780's width, which binds no variable, the Confirm modal's.
const UNSAVED_WIDTH = 360

// Modal / Unsaved, node 893:3780: asked when a modal holding unsaved changes is
// closed. The shell at 360: «تغییرات ذخیره نشده» as the title, what closing
// without saving loses in Body text/secondary, and at the inline end the
// Secondary «بستن بدون ذخیره» then the Primary «ذخیره», the main action at the
// very end, as the file's description says. The close, Escape and a press on
// the scrim go back to the modal, as its × does. Save takes focus as it opens,
// so Enter keeps the changes.
export const UnsavedModal = ({ open, onSave, onDiscard, onKeepEditing }: UnsavedModalProps) => {
  const { i18n } = useLingui()
  return (
    <Modal
      open={open}
      title={i18n._('Unsaved changes')}
      width={UNSAVED_WIDTH}
      onClose={onKeepEditing}
      actions={
        <>
          <Button variant="secondary" onClick={onDiscard}>
            {i18n._('Close without saving')}
          </Button>
          <Button autoFocus onClick={onSave}>
            {i18n._('Save')}
          </Button>
        </>
      }
    >
      <ModalText>{i18n._('If you close without saving, the changes you made will be lost.')}</ModalText>
    </Modal>
  )
}
