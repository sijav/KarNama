import { useLingui } from '@lingui/react'
import { Box, Stack, useMediaQuery, type Theme } from '@mui/material'
import { useLayoutEffect, useRef, useState } from 'react'
import { usePreferences } from '../core/preferences'
import { contactMatches, useRecords, type ContactEntry } from '../core/records'
import { formatCount } from '../i18n/formatCount'
import { BulkActionBar } from '../shared/bulk-action-bar'
import { ContactCard } from '../shared/contact-card'
import { EmptyState } from '../shared/empty-state'
import { IconButton } from '../shared/icon-button'
import { ConfirmModal, ContactModal, type ContactModalValues } from '../shared/modal'
import { PageHeader } from '../shared/page-header'
import { SearchBar, type SearchBarLayout } from '../shared/search-bar'
import { Tooltip } from '../shared/tooltip'
import { spacing } from '../theme/tokens'
import { band, gutterOf } from './band'

/**
 * The network: the people met on the way to a job, KN-056.
 *
 * Page-map row 5. The contacts are the reader's own records, not a field of a
 * job opportunity, and one may name the job opportunity it came from. The grid
 * repeats over the inline axis with the array in its natural order, so it reads
 * right to left and row by row in Persian and mirrors in English with no
 * reversal anywhere in the code, DESIGN.md section 9.
 */

// The search bar is 320 from md up, the contacts toolbar's own instance
// `252:48`, the same as the board's, and the page's own width below that,
// KN-315 and KN-443. It was capped at 480, which the file draws nowhere.
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

// The props are documented in story-docs, not here, KN-207.
export interface NetworkScreenProps {
  onSelecting?: (selecting: boolean) => void
  onSignOut?: () => void
}

export const NetworkScreen = ({ onSelecting, onSignOut }: NetworkScreenProps) => {
  const { i18n } = useLingui()
  const { locale } = usePreferences()
  const records = useRecords()
  // The control that asked to delete, kept as it asks, KN-344. The route from
  // inside the contact modal is why it cannot be read when the confirmation
  // opens: that modal closes in the same breath, so its Delete is already gone.
  const asked = useRef<HTMLElement | null>(null)
  // And where a reader carries on from if it did go, worked out at the same
  // moment, while the people being deleted are still in the page, KN-472.
  const landings = useRef<readonly HTMLElement[]>([])
  const page = useRef<HTMLDivElement | null>(null)
  const grid = useRef<HTMLDivElement | null>(null)

  // Two values, KN-695, as the board keeps them: what the FIELD shows, following
  // every key, and what the page FILTERS BY, handed over once typing pauses.
  const [typedSearch, setTypedSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const wide = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'), { noSsr: true })
  const [selected, setSelected] = useState<readonly string[]>([])
  // Who is being written: an id when one is being edited, null for a new one,
  // and undefined when the modal is closed.
  const [editing, setEditing] = useState<{ id: string | null; values: ContactModalValues } | undefined>(undefined)
  const [deleting, setDeleting] = useState<readonly string[] | null>(null)

  const shown = records.contacts.filter((held) => contactMatches(held, appliedSearch))
  // Only the people the search shows are counted or deleted by the bar: one the
  // search hides stays chosen, and counts again once the search shows them,
  // KN-532, as the board's held does since KN-431.
  const shownIds = new Set(shown.map((held) => held.id))
  const chosen = selected.filter((id) => shownIds.has(id))

  // Where a reader goes on from when the people they delete take the control
  // they asked from with them, KN-472, worked out as they ask: the people the
  // deletion keeps, after the first of them in the grid's reading order, nearest
  // first, then those before it. They are chosen from the records and only then
  // found in the page, by place, since the grid lays its cards out in `shown`
  // order.
  const remember = (ids: readonly string[]) => {
    const active = window.document.activeElement
    asked.current = active instanceof HTMLElement ? active : null
    const index = shown.findIndex((held) => ids.includes(held.id))
    const kept = (held: ContactEntry) => !ids.includes(held.id)
    const order: ContactEntry[] =
      index === -1 ? [] : [...shown.slice(index + 1).filter(kept), ...shown.slice(0, index).filter(kept).reverse()]
    const names = [...(grid.current?.querySelectorAll('article') ?? [])].map((article) => article.querySelector('button'))
    landings.current = order.map((held) => names[shown.indexOf(held)]).filter((element) => element instanceof HTMLElement)
  }

  // Before the paint, not after it: a normal effect would let the frame that
  // shows the bulk bar also show the tab bar under it, KN-356. Cleared when the
  // page goes, so leaving with a selection live does not leave the shell
  // thinking the next page is selecting.
  useLayoutEffect(() => {
    onSelecting?.(chosen.length > 0)
    return () => {
      onSelecting?.(false)
    }
  }, [chosen.length, onSelecting])
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
  // How many are going: one is this contact, several are these, KN-432. Held while the
  // confirmation dissolves, so its copy does not turn singular as it closes.
  const [going, setGoing] = useState(0)
  if (deleting !== null && deleting.length !== going) setGoing(deleting.length)

  return (
    <Stack ref={page} tabIndex={LOOSE} sx={{ flex: '1 1 auto', minHeight: 0 }}>
      {/* The Header band, 252:36 and 252:412: the Page Header over the
          toolbar, KN-481. */}
      <Box component="header" sx={band.sx(wide)}>
        <PageHeader
          title={i18n._('My network')}
          {...(onSignOut === undefined ? {} : { onSignOut })}
          // Add contact is an Icon Button, the owner's of 2026-09-14, KN-478,
          // where the file draws Button M; its tip says what the name does not.
          action={
            <Tooltip title={i18n._('Adds a person to your network')}>
              <IconButton
                icon="user-plus"
                aria-label={i18n._('Add contact')}
                aria-haspopup="dialog"
                onClick={() => {
                  setEditing({ id: null, values: NOBODY })
                }}
              />
            </Tooltip>
          }
        />

        {/* 320 from md up, the contacts toolbar's own instance `252:48`, and
            the whole row below it, where the file draws 358 inside the band's
            16 gutters, `252:421`. A cap at every width made the phone's bar 320
            and left the rest of the row empty, KN-443. The cap reads the same
            flag as the bar's height, so the two cannot disagree, KN-452. */}
        <Box sx={{ maxWidth: wide ? SEARCH_WIDTH : 'none' }}>
          <SearchBar
            value={typedSearch}
            onChange={setTypedSearch}
            onSearch={setAppliedSearch}
            layout={wide ? DESKTOP : MOBILE}
            label={i18n._('Search contacts')}
            placeholder={i18n._('Search in name, role or company')}
          />
        </Box>
      </Box>

      <Box sx={{ padding: `${gutterOf(wide)}px` }}>
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
          // The Grid, 252:53, two columns as wide as each other and 24 apart
          // from md up; the List, 252:425, one column 12 apart below it.
          <Box
            ref={grid}
            sx={{
              display: 'grid',
              gap: `${wide ? spacing.lg : spacing.sm}px`,
              gridTemplateColumns: wide ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 1fr)',
            }}
          >
            {shown.map((held) => (
              <ContactCard
                key={held.id}
                contact={held.contact}
                selected={selected.includes(held.id)}
                // A phone chooses by holding a person, and while anyone is
                // chosen every card shows its checkbox, KN-533.
                phone={!wide}
                selecting={chosen.length > 0}
                onOpen={() => {
                  setEditing({ id: held.id, values: asValues(held) })
                }}
                onSelectedChange={(wanted) => {
                  setSelected((was) => (wanted ? [...was, held.id] : was.filter((id) => id !== held.id)))
                }}
                onDelete={() => {
                  remember([held.id])
                  setDeleting([held.id])
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      <BulkActionBar
        type="contacts"
        count={chosen.length}
        onClear={() => {
          setSelected([])
        }}
        onDelete={() => {
          remember(chosen)
          setDeleting(chosen)
        }}
      />

      {/* Adding and editing are different shapes, KN-386: an Edit carries the
          id it is on and the record that belongs to it. */}
      {editingId === null ? (
        <ContactModal
          open={editing !== undefined}
          mode="add"
          jobs={jobs}
          onSave={save}
          onCancel={() => {
            setEditing(undefined)
          }}
        />
      ) : (
        <ContactModal
          open={editing !== undefined}
          mode="edit"
          recordId={editingId}
          initial={editing === undefined ? undefined : { id: editingId, values: editing.values }}
          jobs={jobs}
          onSave={save}
          onCancel={() => {
            setEditing(undefined)
          }}
          onDelete={() => {
            remember([editingId])
            setDeleting([editingId])
            setEditing(undefined)
          }}
        />
      )}

      <ConfirmModal
        open={deleting !== null}
        opener={() => asked.current}
        // Where a reader carries on from when the card they were standing on is
        // the one they deleted: the first place worked out as they asked that is
        // still in the page, KN-472, else the page, which takes focus for this
        // and nothing else.
        fallback={() => landings.current.find((element) => element.isConnected) ?? page.current}
        title={going > 1 ? i18n._('Delete these contacts?') : i18n._('Delete contact')}
        // Their count in the reader's own digits goes beside the message, never inside it.
        body={
          going > 1
            ? `${formatCount(locale, going)} ${i18n._('contacts are deleted for good and cannot be brought back.')}`
            : i18n._('This contact is deleted for good and cannot be brought back.')
        }
        confirmLabel={i18n._('Delete')}
        onConfirm={remove}
        onCancel={() => {
          setDeleting(null)
        }}
      />
    </Stack>
  )
}
