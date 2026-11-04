import { useState } from 'react'
import { newId, type ContactEntry } from '../core/records'
import type { PersonLabel } from '../shared/label-picker'
import type { ContactModalProps, ContactModalValues } from '../shared/modal'

/**
 * What the screens hand the person modal, the network's add and edit and the
 * job modal's people, from records that keep one job opportunity a person and
 * no labels until KN-738: a person's one link and no label, the reader's labels
 * held while the page is, and a save's first link kept. KN-822 and KN-816 draw
 * both on the records' own.
 */

/** A kept person as the modal edits them. */
export const asValues = (held: ContactEntry): ContactModalValues => ({
  name: held.contact.name,
  role: held.contact.role ?? '',
  company: held.contact.company ?? '',
  label: null,
  email: held.contact.email ?? '',
  phone: held.contact.phone ?? '',
  linkedin: held.contact.linkedin ?? '',
  jobIds: held.jobId === null ? [] : [held.jobId],
})

// What a label's id starts with, typed so the lint rule reads it as a name.
type Prefix = 'label'
const LABEL: Prefix = 'label'

/**
 * The reader's own relationship labels, held while the page is: one made,
 * renamed or deleted in the modal shows as the Label Picker draws it, and none
 * is kept, on a person or otherwise, past the page.
 */
export const useVisitLabels = (): Pick<ContactModalProps, 'labels' | 'onCreateLabel' | 'onRenameLabel' | 'onDeleteLabel'> => {
  const [labels, setLabels] = useState<readonly PersonLabel[]>([])
  return {
    labels,
    onCreateLabel: (name) => {
      const made: PersonLabel = { id: newId(LABEL), name, people: 0 }
      setLabels((held) => [...held, made])
      return made.id
    },
    onRenameLabel: (id, name) => {
      setLabels((held) => held.map((label) => (label.id === id ? { ...label, name } : label)))
    },
    onDeleteLabel: (id) => {
      setLabels((held) => held.filter((label) => label.id !== id))
    },
  }
}
