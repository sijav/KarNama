import { useLingui } from '@lingui/react'
import { Box, Stack, useMediaQuery, type Theme } from '@mui/material'
import { useRef, useState } from 'react'
import { contactMatches, useRecords, type ContactEntry } from '../core/records'
import { BulkActionBar } from '../shared/bulk-action-bar'
import { Button } from '../shared/button'
import { ContactCard } from '../shared/contact-card'
import { EmptyState } from '../shared/empty-state'
import { ConfirmModal, ContactModal, type ContactModalValues } from '../shared/modal'
import { PageHeader } from '../shared/page-header'
import { SearchBar, type SearchBarLayout } from '../shared/search-bar'
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

// Node 248:116's card is 280 across. The search bar is 320 from md up, the
// contacts toolbar's own instance `252:48`, the same as the board's, and the
// page's own width below that, KN-315 and KN-443. It was capped at 480, which
// the file draws nowhere.
const CARD_WIDTH = 280
const SEARCH_WIDTH = 320

// The bar follows the screen it is on, as the board's cards do, KN-315.
const DESKTOP: SearchBarLayout = 'desktop'
const MOBILE: SearchBarLayout = 'mobile'

// Focusable on purpose and not in the tab order, KN-344.
const LOOSE = -1

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
  // The control that asked to delete, kept as it asks, KN-344. The route from
  // inside the contact modal is why it cannot be read when the confirmation
  // opens: that modal closes in the same breath, so its Delete is already gone.
  const asked = useRef<HTMLElement | null>(null)
  const remember = () => {
    const active = window.document.activeElement
    asked.current = active instanceof HTMLElement ? active : null
  }
  const page = useRef<HTMLDivElement | null>(null)

  const [search, setSearch] = useState('')
  const wide = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'), { noSsr: true })
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
    <Stack ref={page} tabIndex={LOOSE} sx={{ gap: `${spacing.lg}px`, flex: '1 1 auto', minHeight: 0 }}>
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

      {/* 320 from md up, the contacts toolbar's own instance `252:48`, and the
          whole page below it, where the file draws 358 inside the page's 16
          gutters, `252:421`. A cap at every width made the phone's bar 320 and
          left the rest of the row empty, KN-443. */}
      <Box sx={{ maxWidth: { xs: 'none', md: SEARCH_WIDTH } }}>
        <SearchBar
          value={search}
          onChange={setSearch}
          layout={wide ? DESKTOP : MOBILE}
          label={i18n._('Search contacts')}
          placeholder={i18n._('Search in name, role or company')}
        />
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
                remember()
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
          remember()
          setDeleting(selected)
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
                remember()
                setDeleting([editingId])
                setEditing(undefined)
              },
            })}
      />

      <ConfirmModal
        open={deleting !== null}
        opener={() => asked.current}
        // Where a reader carries on from when the card they were standing on is
        // the one they deleted: the first person still here, else the page,
        // which takes focus for this and nothing else.
        fallback={() => page.current?.querySelector('article button') ?? page.current}
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
