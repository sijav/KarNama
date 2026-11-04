import { useLingui } from '@lingui/react'
import { useState } from 'react'
import { usePreferences } from '../../core/preferences'
import { formatCount } from '../../i18n/formatCount'
import { quoted } from '../quoted'
import { Button } from '../button'
import { Select } from '../select'
import type { StatusOption } from '../status-picker'
import { Modal, ModalText } from './Modal'

// The props are documented in story-docs, not here, KN-207.
export interface DeleteStatusModalProps {
  open: boolean
  name: string
  count: number
  destinations: readonly StatusOption[]
  onDelete: (destination: string | null) => void
  onCancel: () => void
}

// Node 919:2885's width, which binds no variable.
const DELETE_STATUS_WIDTH = 440

// Modal / Delete Status, node 919:2885: deleting a stage the reader made. The
// shell at 440, «حذف وضعیت «…»؟» as its title. Cards=None says the stage leaves
// the board and holds nothing, with Cancel and Delete status; Cards=Has says how
// many job opportunities it holds and asks where they go, a Select of the other
// stages under it starting on the first the caller gives, with Cancel and Delete
// and move, which is off while there is nowhere to move them. Cancel takes focus
// as it opens, as the Confirm modal's does; the close, Escape and the scrim
// cancel too.
export const DeleteStatusModal = ({ open, name, count, destinations, onDelete, onCancel }: DeleteStatusModalProps) => {
  const { i18n } = useLingui()
  const { locale } = usePreferences()
  // The stage chosen in the Select, forgotten each time the modal opens, so a
  // second stage's question starts on its own first choice.
  const [chosen, setChosen] = useState<string | null>(null)
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setChosen(null)
  }
  const destination = destinations.some((option) => option.id === chosen) ? chosen : (destinations[0]?.id ?? null)
  const holds = count > 0
  const one = new Intl.PluralRules(locale).select(count) === 'one'
  return (
    <Modal
      open={open}
      title={`${i18n._('Delete the status')} ${quoted(i18n, name)}${i18n._('?')}`}
      width={DELETE_STATUS_WIDTH}
      onClose={onCancel}
      actions={
        <>
          <Button variant="ghost" autoFocus onClick={onCancel}>
            {i18n._('Cancel')}
          </Button>
          <Button
            variant="destructive"
            disabled={holds && destination === null}
            onClick={() => {
              onDelete(holds ? destination : null)
            }}
          >
            {holds ? i18n._('Delete and move') : i18n._('Delete status')}
          </Button>
        </>
      }
    >
      {holds ? (
        <>
          <ModalText>
            {`${formatCount(locale, count)} ${one ? i18n._('job opportunity is in this status.') : i18n._('job opportunities are in this status.')} ${
              one ? i18n._('Choose where it goes once the status is deleted.') : i18n._('Choose where they go once the status is deleted.')
            }`}
          </ModalText>
          <Select
            label={one ? i18n._('Move the job opportunity to') : i18n._('Move the job opportunities to')}
            options={destinations.map((option) => ({ value: option.id, label: option.name }))}
            value={destination === null ? [] : [destination]}
            onChange={([picked]) => {
              if (picked !== undefined) setChosen(picked)
            }}
          />
        </>
      ) : (
        <ModalText>{i18n._('This status is removed from the board. There are no job opportunities in it.')}</ModalText>
      )}
    </Modal>
  )
}
