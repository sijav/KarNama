import { useLingui } from '@lingui/react'
import { Box, Stack, useMediaQuery, type Theme } from '@mui/material'
import { useState } from 'react'
import { usePreferences } from '../core/preferences'
import { columnOrder, contactsOf, jobsIn, tokenOf, useRecords, type JobEntry } from '../core/records'
import { AddJobModal, type JobDraft } from '../shared/add-job'
import { BulkActionBar } from '../shared/bulk-action-bar'
import { Button, type ButtonVariant } from '../shared/button'
import { EmptyState } from '../shared/empty-state'
import { FilterChip } from '../shared/filter-chip'
import { Input } from '../shared/input'
import { JobCard, type JobCardLayout } from '../shared/job-card'
import { formatDay, JobModal, type JobSaved } from '../shared/job-modal'
import { AddColumn, EmptyColumn, KanbanColumn } from '../shared/kanban-column'
import { ChangeStatusModal, ConfirmModal, ContactModal, Modal, type ContactModalValues } from '../shared/modal'
import { PageHeader } from '../shared/page-header'
import { SearchBar } from '../shared/search-bar'
import { SortControl, type SortOrder } from '../shared/sort-control'
import { spacing } from '../theme/tokens'

/**
 * The board: a column per status, its cards in it, KN-043.
 *
 * Everything it decides is in `core/records`; this lays the components out and
 * carries what is open. No API yet, KN-037 to KN-039: the board is held in the
 * browser and kept there between visits, so the screens could be built and
 * looked at, the owner's instruction of 2026-09-12.
 */

// Node 241:2's board, the columns 24 apart in a row that scrolls sideways.
const COLUMN_GAP = spacing.lg

// The order the board opens in, typed so the lint rule reads it as a value and
// not as copy: a literal handed to a generic loses the union that exempts it.
const NEWEST: SortOrder = 'newest'

// The search bar's own width before it gives way, node 155:92's 320, and the
// room the tab bar needs under the page on a phone. Neither binds a variable.
const SEARCH_WIDTH = 320

// The rename modal takes the Confirm modal's width, node 150:92's 360: one
// field and two actions, the same shape.
const RENAME_WIDTH = 360

// The quiet action beside a primary one, typed so the lint rule reads it as a
// value rather than as copy.
const QUIET: ButtonVariant = 'text'

// The two card layouts, typed for the same reason.
const DESKTOP: JobCardLayout = 'desktop'
const MOBILE: JobCardLayout = 'mobile'

export interface JobsScreenProps {
  /** Opens the add flow, which is what the add destination is, KN-042. */
  addOpen?: boolean
  /** Said when the add flow closes, so the address can go back to the board. */
  onAddClose?: () => void
}

export const JobsScreen = ({ addOpen = false, onAddClose }: JobsScreenProps) => {
  const { i18n } = useLingui()
  const { locale } = usePreferences()
  const records = useRecords()
  const columns = columnOrder(records.statuses)
  const first = columns[0]?.id ?? ''

  const [search, setSearch] = useState('')
  const [order, setOrder] = useState<SortOrder>(NEWEST)
  const [selected, setSelected] = useState<readonly string[]>([])
  // Rejected opens collapsed, the owner's KN-070: it is the status that grows
  // fastest and the one a reader looks at least.
  const [open, setOpen] = useState<readonly string[]>([])
  // Which column the add flow is adding to, or null for closed. Adding is a
  // destination as well as a button, KN-042, so the address opens it too:
  // taken together rather than copied into state, which would need an effect to
  // follow the address and a second one to put it back.
  const [adding, setAdding] = useState<string | null>(null)
  const [reading, setReading] = useState<string | null>(null)
  const [moving, setMoving] = useState<readonly string[] | null>(null)
  const [deleting, setDeleting] = useState<readonly string[] | null>(null)
  // Which column a phone is showing. The board scrolls sideways on a desktop
  // and a phone gets one column with the status chosen above it, node 241:176.
  const [chosen, setChosen] = useState<string | null>(null)
  // A person being written from inside the job modal: their id when one is
  // being edited, null for a new one, undefined when that modal is closed.
  const [person, setPerson] = useState<{ id: string | null; values: ContactModalValues } | undefined>(undefined)
  // A column being renamed: its id and the name as it is being typed.
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null)
  const wide = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'), { noSsr: true })

  const addingTo = adding ?? (addOpen ? first : null)
  const showing = columns.find((column) => column.id === chosen) ?? columns[0]
  const nameOf = (id: string) => records.statuses.find((entry) => entry.id === id)?.name ?? ''
  const job = records.jobs.find((entry) => entry.id === reading)
  const isCollapsed = (id: string) => tokenOf(records.statuses, id) === 'rejected' && !open.includes(id)
  const cardsOf = (id: string) => jobsIn(records.jobs, id, search, order)
  // The column's own size, which is what says whether it can be deleted: the
  // searched count reads zero while a search hides its cards, and deleting it
  // then would take the hidden job opportunities with it, KN-422.
  const sizeOf = (id: string) => records.jobs.filter((entry) => entry.draft.status === id).length
  // How many the search found anywhere on the board, which is what says whether
  // it found nothing rather than each column being empty on its own.
  const found = columns.reduce((total, column) => total + cardsOf(column.id).length, 0)

  // Only the job opportunities that are still there: one deleted from its own
  // card, or by another tab, must not be counted or acted on, KN-422.
  const held = selected.filter((id) => records.jobs.some((entry) => entry.id === id))

  const select = (id: string, wanted: boolean) => {
    setSelected((was) => (wanted ? [...was, id] : was.filter((held) => held !== id)))
  }

  const addJob = (draft: JobDraft) => {
    records.addJob(draft)
    setAdding(null)
    // The flow is done, so the address leaves it too: saving from the add
    // DESTINATION would otherwise reopen the modal over the board the moment it
    // closed, since the address still asked for it, KN-044.
    onAddClose?.()
  }

  const save = (saved: JobSaved) => {
    if (job) records.saveJob(job.id, saved)
    // Saving is the end of reading it: the modal closes, as every other modal
    // in the product does when its work is done.
    setReading(null)
  }

  const move = (status: string) => {
    if (moving) records.moveJobs(moving, status)
    setMoving(null)
    setSelected([])
  }

  const remove = () => {
    if (deleting) records.deleteJobs(deleting)
    setDeleting(null)
    setSelected([])
    if (deleting?.includes(reading ?? '')) setReading(null)
  }

  const card = (entry: JobEntry) => (
    <JobCard
      key={entry.id}
      // A phone gets the card's phone layout, which carries its own menu. The
      // desktop card folds delete and select behind a hover, KN-341, and a
      // phone has no hover: without this the board on a phone offered no way
      // to delete a job opportunity or move it, found while KN-415 drove every
      // handler of this screen from a story.
      layout={wide ? DESKTOP : MOBILE}
      title={entry.draft.title}
      company={entry.draft.company}
      date={entry.draft.postedAt === '' ? '' : formatDay(locale, entry.draft.postedAt)}
      status={nameOf(entry.draft.status)}
      link={entry.draft.postingUrl === '' ? null : entry.draft.postingUrl}
      selected={selected.includes(entry.id)}
      onOpen={() => {
        setReading(entry.id)
      }}
      onSelectedChange={(wanted) => {
        select(entry.id, wanted)
      }}
      onDelete={() => {
        setDeleting([entry.id])
      }}
      onChangeStatus={() => {
        setMoving([entry.id])
      }}
    />
  )

  return (
    <Stack sx={{ gap: `${spacing.lg}px`, minHeight: 0, flex: '1 1 auto' }}>
      <PageHeader
        title={i18n._('My job opportunities')}
        // The action is the desktop's. On a phone the header already carries
        // the language switch, KN-355, and the tab bar carries adding as a
        // destination of its own, so a third control here only takes the room
        // the title needs and leaves it cut.
        {...(wide
          ? {
              action: (
                <Button
                  onClick={() => {
                    setAdding(first)
                  }}
                >
                  {i18n._('Add job opportunity')}
                </Button>
              ),
            }
          : {})}
      />

      <Stack direction="row" sx={{ gap: `${spacing.sm}px`, alignItems: 'center', flexWrap: 'wrap' }}>
        <Box sx={{ flex: `1 1 ${SEARCH_WIDTH}px`, minWidth: 0 }}>
          <SearchBar value={search} onChange={setSearch} />
        </Box>
        <SortControl value={order} onChange={setOrder} />
      </Stack>

      {records.jobs.length === 0 || found === 0 ? (
        <EmptyState
          title={records.jobs.length === 0 ? i18n._('You have not added a job posting yet') : i18n._('No results found')}
          body={
            records.jobs.length === 0
              ? i18n._('Add your first posting by its link or its text, and follow it from here.')
              : i18n._('Nothing matches this search. Try other words or remove the filters.')
          }
          actionLabel={i18n._('Add job opportunity')}
          onAction={() => {
            setAdding(first)
          }}
        />
      ) : wide ? (
        <Box
          sx={{
            display: 'flex',
            gap: `${COLUMN_GAP}px`,
            overflowX: 'auto',
            // The columns take the room the board has and scroll their cards
            // inside it, between the header and the pinned Add Card row: with
            // no height a column grows with its list instead, KN-422.
            alignItems: 'stretch',
            flex: '1 1 auto',
            minHeight: 0,
            pb: 2,
            // A column keeps the width the design gives it, 300, and the row
            // scrolls: without this the columns share the room out between them
            // and a board of nine is nine slivers.
            '& > *': { flexShrink: 0 },
          }}
        >
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              name={column.name}
              colour={column.token}
              count={sizeOf(column.id)}
              collapsed={isCollapsed(column.id)}
              onExpand={() => {
                setOpen((was) => [...was, column.id])
              }}
              onAdd={() => {
                setAdding(column.id)
              }}
              onRename={() => {
                setRenaming({ id: column.id, name: column.name })
              }}
              onColourChange={(colour) => {
                records.recolourStatus(column.id, colour)
              }}
              onDelete={() => {
                records.deleteStatus(column.id)
              }}
            >
              {cardsOf(column.id).map(card)}
            </KanbanColumn>
          ))}
          <AddColumn
            onAdd={() => {
              records.addStatus(i18n._('New status'))
            }}
          />
        </Box>
      ) : (
        // The phone's board, node 241:176: the statuses as chips in a row that
        // scrolls sideways, and the chosen one's cards below, alone.
        <Stack sx={{ gap: `${spacing.md}px`, minHeight: 0 }}>
          <Box sx={{ display: 'flex', gap: `${spacing.xs}px`, overflowX: 'auto', '& > *': { flexShrink: 0 } }}>
            {columns.map((column) => (
              <FilterChip
                key={column.id}
                label={column.name}
                count={cardsOf(column.id).length}
                selected={column.id === showing?.id}
                onToggle={() => {
                  setChosen(column.id)
                }}
              />
            ))}
          </Box>
          <Stack sx={{ gap: `${spacing.sm}px` }}>
            {showing && cardsOf(showing.id).length > 0 ? (
              cardsOf(showing.id).map(card)
            ) : (
              // What the column says when it holds nothing, node 241:46, which
              // a phone needs as much as the desktop does, KN-422.
              <EmptyColumn />
            )}
          </Stack>
        </Stack>
      )}

      <BulkActionBar
        type="jobs"
        count={held.length}
        onClear={() => {
          setSelected([])
        }}
        onDelete={() => {
          setDeleting(held)
        }}
        onChangeStatus={() => {
          setMoving(held)
        }}
        onSelectAll={() => {
          setSelected(records.jobs.map((entry) => entry.id))
        }}
      />

      <AddJobModal
        open={addingTo !== null}
        statuses={records.statuses}
        status={addingTo ?? first}
        onExtract={(source) => Promise.resolve({ postingUrl: source })}
        onSave={addJob}
        onAddStatus={() => {
          records.addStatus(i18n._('New status'))
        }}
        onClose={() => {
          setAdding(null)
          onAddClose?.()
        }}
      />

      {job ? (
        <JobModal
          open
          // The people kept against this job opportunity are the network's,
          // named here rather than held inside the job, KN-056.
          job={{ ...job, contacts: contactsOf(records.contacts, job.id) }}
          statuses={records.statuses}
          onStatusChange={(status) => {
            records.moveJob(job.id, status)
          }}
          onAddStatus={() => {
            records.addStatus(i18n._('New status'))
          }}
          onSave={save}
          onDelete={() => {
            setDeleting([job.id])
          }}
          onClose={() => {
            setReading(null)
          }}
          // The related people are the network's records, kept against this
          // job opportunity, so what is added here is on the network page too.
          onAddContact={() => {
            setPerson({ id: null, values: { name: '', role: '', company: '', email: '', phone: '', linkedin: '', jobId: job.id } })
          }}
          onOpenContact={(id) => {
            const held = records.contacts.find((entry) => entry.id === id)
            if (held) {
              setPerson({
                id: held.id,
                values: {
                  name: held.contact.name,
                  role: held.contact.role ?? '',
                  company: held.contact.company ?? '',
                  email: held.contact.email ?? '',
                  phone: held.contact.phone ?? '',
                  linkedin: held.contact.linkedin ?? '',
                  jobId: held.jobId,
                },
              })
            }
          }}
          onDeleteContact={(id) => {
            records.deleteContacts([id])
          }}
          onAddFiles={(files) => {
            records.addFiles(job.id, files)
          }}
          onDownloadFile={(id) => {
            records.downloadFile(id)
          }}
        />
      ) : null}

      <ContactModal
        open={person !== undefined}
        mode={person?.id === null || person?.id === undefined ? 'add' : 'edit'}
        {...(person ? { initial: person.values } : {})}
        jobs={records.jobs.map((entry) => ({ value: entry.id, label: entry.draft.title }))}
        onSave={(values) => {
          const contact = {
            name: values.name.trim(),
            role: values.role.trim() === '' ? null : values.role.trim(),
            company: values.company.trim() === '' ? null : values.company.trim(),
            email: values.email.trim() === '' ? null : values.email.trim(),
            phone: values.phone.trim() === '' ? null : values.phone.trim(),
            linkedin: values.linkedin.trim() === '' ? null : values.linkedin.trim(),
            job: records.jobs.find((entry) => entry.id === values.jobId)?.draft.title ?? null,
          }
          if (person?.id === null || person?.id === undefined) records.addContact(contact, values.jobId)
          else records.saveContact(person.id, contact, values.jobId)
          setPerson(undefined)
        }}
        onCancel={() => {
          setPerson(undefined)
        }}
      />

      <Modal
        open={renaming !== null}
        title={i18n._('Rename')}
        width={RENAME_WIDTH}
        onClose={() => {
          setRenaming(null)
        }}
        actions={
          <>
            <Button
              variant={QUIET}
              onClick={() => {
                setRenaming(null)
              }}
            >
              {i18n._('Cancel')}
            </Button>
            <Button
              onClick={() => {
                if (renaming && renaming.name.trim() !== '') records.renameStatus(renaming.id, renaming.name.trim())
                setRenaming(null)
              }}
            >
              {i18n._('Save')}
            </Button>
          </>
        }
      >
        <Input
          label={i18n._('Status')}
          value={renaming?.name ?? ''}
          onChange={(name) => {
            setRenaming((was) => (was ? { ...was, name } : was))
          }}
        />
      </Modal>

      <ChangeStatusModal
        open={moving !== null}
        statuses={records.statuses}
        value={records.jobs.find((entry) => entry.id === moving?.[0])?.draft.status ?? first}
        onConfirm={move}
        onCancel={() => {
          setMoving(null)
        }}
        onAdd={() => {
          records.addStatus(i18n._('New status'))
        }}
      />

      <ConfirmModal
        open={deleting !== null}
        title={i18n._('Delete this job opportunity?')}
        body={i18n._('This job opportunity is deleted for good and cannot be brought back.')}
        confirmLabel={i18n._('Delete')}
        onConfirm={remove}
        onCancel={() => {
          setDeleting(null)
        }}
      />
    </Stack>
  )
}
