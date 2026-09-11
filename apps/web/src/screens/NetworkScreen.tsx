import { useLingui } from '@lingui/react'
import { Box, Stack } from '@mui/material'
import { useState } from 'react'
import { contactMatches, useRecords, type ContactEntry } from '../core/records'
import { BulkActionBar } from '../shared/bulk-action-bar'
import { Button } from '../shared/button'
import { ContactCard } from '../shared/contact-card'
import { EmptyState } from '../shared/empty-state'
import { ConfirmModal, ContactModal, type ContactModalValues } from '../shared/modal'
import { PageHeader } from '../shared/page-header'
import { SearchBar } from '../shared/search-bar'
import { spacing } from '../theme/tokens'

/**
 * The network: the people met on the way to a job, KN-056.
 *
 * Page-map row 5. The contacts are the reader's own records, not a field of a
 * job opportunity, and one may name the job opportunity it came from. The grid
 * repeats over the inline axis with the array in its natural order, so it reads
 * right to left and row by row in Persian and mirrors in English with no
 * reversal anywhere in the code, DESIGN.md section 9.
 */

// Node 248:116's card is 280 across, and the search bar 480 at most here.
const CARD_WIDTH = 280
const SEARCH_WIDTH = 480

/** An empty person, for the add modal. */
const NOBODY: ContactModalValues = { name: '', role: '', company: '', email: '', phone: '', linkedin: '', jobId: null }

const asValues = (held: ContactEntry): ContactModalValues => ({
  name: held.contact.name,
  role: held.contact.role ?? '',
  company: held.contact.company ?? '',
  email: held.contact.email ?? '',
  phone: held.contact.phone ?? '',
  linkedin: held.contact.linkedin ?? '',
  jobId: held.jobId,
})

export const NetworkScreen = () => {
  const { i18n } = useLingui()
  const records = useRecords()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<readonly string[]>([])
  // Who is being written: an id when one is being edited, null for a new one,
  // and undefined when the modal is closed.
  const [editing, setEditing] = useState<{ id: string | null; values: ContactModalValues } | undefined>(undefined)
  const [deleting, setDeleting] = useState<readonly string[] | null>(null)

  const shown = records.contacts.filter((held) => contactMatches(held, search))
  const jobs = records.jobs.map((job) => ({ value: job.id, label: job.draft.title }))
  const titleOf = (jobId: string | null) => records.jobs.find((job) => job.id === jobId)?.draft.title ?? null
  const editingId = editing?.id ?? null

  const save = (values: ContactModalValues) => {
    const contact = {
      name: values.name.trim(),
      role: values.role.trim() === '' ? null : values.role.trim(),
      company: values.company.trim() === '' ? null : values.company.trim(),
      email: values.email.trim() === '' ? null : values.email.trim(),
      phone: values.phone.trim() === '' ? null : values.phone.trim(),
      linkedin: values.linkedin.trim() === '' ? null : values.linkedin.trim(),
      job: titleOf(values.jobId),
    }
    if (editingId === null) records.addContact(contact, values.jobId)
    else records.saveContact(editingId, contact, values.jobId)
    setEditing(undefined)
  }

  const remove = () => {
    if (deleting) records.deleteContacts(deleting)
    setDeleting(null)
    setSelected([])
  }

  const nobodyYet = records.contacts.length === 0

  return (
    <Stack sx={{ gap: `${spacing.lg}px`, flex: '1 1 auto', minHeight: 0 }}>
      <PageHeader
        title={i18n._('My network')}
        action={
          <Button
            onClick={() => {
              setEditing({ id: null, values: NOBODY })
            }}
          >
            {i18n._('Add contact')}
          </Button>
        }
      />

      <Box sx={{ maxWidth: SEARCH_WIDTH }}>
        <SearchBar value={search} onChange={setSearch} />
      </Box>

      {shown.length === 0 ? (
        <EmptyState
          title={nobodyYet ? i18n._('You have not added anyone to your network yet') : i18n._('No results found')}
          body={
            nobodyYet
              ? i18n._('Keep the people you meet on the way to a job here: recruiters, managers, future teammates.')
              : i18n._('Nothing matches this search. Try other words or remove the filters.')
          }
          actionLabel={i18n._('Add contact')}
          onAction={() => {
            setEditing({ id: null, values: NOBODY })
          }}
        />
      ) : (
        <Box sx={{ display: 'grid', gap: `${spacing.md}px`, gridTemplateColumns: `repeat(auto-fill, minmax(${CARD_WIDTH}px, 1fr))` }}>
          {shown.map((held) => (
            <ContactCard
              key={held.id}
              contact={held.contact}
              selected={selected.includes(held.id)}
              onOpen={() => {
                setEditing({ id: held.id, values: asValues(held) })
              }}
              onSelectedChange={(wanted) => {
                setSelected((was) => (wanted ? [...was, held.id] : was.filter((id) => id !== held.id)))
              }}
              onDelete={() => {
                setDeleting([held.id])
              }}
            />
          ))}
        </Box>
      )}

      <BulkActionBar
        type="contacts"
        count={selected.length}
        onClear={() => {
          setSelected([])
        }}
        onDelete={() => {
          setDeleting(selected)
        }}
        onSelectAll={() => {
          setSelected(shown.map((held) => held.id))
        }}
      />

      <ContactModal
        open={editing !== undefined}
        mode={editingId === null ? 'add' : 'edit'}
        {...(editing ? { initial: editing.values } : {})}
        {...(editingId === null ? {} : { recordId: editingId })}
        jobs={jobs}
        onSave={save}
        onCancel={() => {
          setEditing(undefined)
        }}
        {...(editingId === null
          ? {}
          : {
              onDelete: () => {
                setDeleting([editingId])
                setEditing(undefined)
              },
            })}
      />

      <ConfirmModal
        open={deleting !== null}
        title={i18n._('Delete contact')}
        body={i18n._('This contact is deleted for good and cannot be brought back.')}
        confirmLabel={i18n._('Delete')}
        onConfirm={remove}
        onCancel={() => {
          setDeleting(null)
        }}
      />
    </Stack>
  )
}
