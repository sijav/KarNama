import { useLingui } from '@lingui/react'
import { Box, Stack } from '@mui/material'
import { useState } from 'react'
import { usePreferences } from '../core/preferences'
import { columnOrder, jobsIn, tokenOf, useRecords, type JobEntry } from '../core/records'
import { AddJobModal, type JobDraft } from '../shared/add-job'
import { BulkActionBar } from '../shared/bulk-action-bar'
import { Button } from '../shared/button'
import { EmptyState } from '../shared/empty-state'
import { JobCard } from '../shared/job-card'
import { formatDay, JobModal, type JobSaved } from '../shared/job-modal'
import { AddColumn, KanbanColumn } from '../shared/kanban-column'
import { ChangeStatusModal, ConfirmModal } from '../shared/modal'
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

  const addingTo = adding ?? (addOpen ? first : null)
  const nameOf = (id: string) => records.statuses.find((entry) => entry.id === id)?.name ?? ''
  const job = records.jobs.find((entry) => entry.id === reading)
  const isCollapsed = (id: string) => tokenOf(records.statuses, id) === 'rejected' && !open.includes(id)
  const cardsOf = (id: string) => jobsIn(records.jobs, id, search, order)

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
        action={
          <Button
            onClick={() => {
              setAdding(first)
            }}
          >
            {i18n._('Add job opportunity')}
          </Button>
        }
      />

      <Stack direction="row" sx={{ gap: `${spacing.sm}px`, alignItems: 'center', flexWrap: 'wrap' }}>
        <Box sx={{ flex: `1 1 ${SEARCH_WIDTH}px`, minWidth: 0 }}>
          <SearchBar value={search} onChange={setSearch} />
        </Box>
        <SortControl value={order} onChange={setOrder} />
      </Stack>

      {records.jobs.length === 0 ? (
        <EmptyState
          title={i18n._('You have not added a job posting yet')}
          body={i18n._('Add your first posting by its link or its text, and follow it from here.')}
          actionLabel={i18n._('Add job opportunity')}
          onAction={() => {
            setAdding(first)
          }}
        />
      ) : (
        <Box
          sx={{
            display: 'flex',
            gap: `${COLUMN_GAP}px`,
            overflowX: 'auto',
            alignItems: 'flex-start',
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
              count={cardsOf(column.id).length}
              collapsed={isCollapsed(column.id)}
              onExpand={() => {
                setOpen((was) => [...was, column.id])
              }}
              onAdd={() => {
                setAdding(column.id)
              }}
              onRename={() => {
                setMoving(null)
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
      )}

      <BulkActionBar
        type="jobs"
        count={selected.length}
        onClear={() => {
          setSelected([])
        }}
        onDelete={() => {
          setDeleting(selected)
        }}
        onChangeStatus={() => {
          setMoving(selected)
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
          job={job}
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
          onAddContact={() => undefined}
          onOpenContact={() => undefined}
          onDeleteContact={() => undefined}
          onAddFiles={() => undefined}
          onDownloadFile={() => undefined}
        />
      ) : null}

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
