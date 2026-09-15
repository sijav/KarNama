import { useLingui } from '@lingui/react'
import { Box, Stack, useMediaQuery, type Theme } from '@mui/material'
import { useEffect, useId, useLayoutEffect, useRef, useState, type SyntheticEvent } from 'react'
import { usePreferences } from '../core/preferences'
import { columnOrder, contactsOf, jobsIn, tokenOf, useRecords, type JobEntry } from '../core/records'
import { AddJobModal, type AddJobModalProps, type JobDraft } from '../shared/add-job'
import { BulkActionBar } from '../shared/bulk-action-bar'
import { Button, type ButtonType, type ButtonVariant } from '../shared/button'
import { EmptyState } from '../shared/empty-state'
import { FilterChip } from '../shared/filter-chip'
import { Input } from '../shared/input'
import { JobCard, type JobCardLayout } from '../shared/job-card'
import { formatDay, JobModal } from '../shared/job-modal'
import { AddColumn, EmptyColumn, KanbanColumn, type KanbanColumnProps } from '../shared/kanban-column'
import { ChangeStatusModal, ConfirmModal, ContactModal, Modal, type ContactModalValues } from '../shared/modal'
import { PageHeader } from '../shared/page-header'
import { SearchBar, type SearchBarLayout } from '../shared/search-bar'
import { SortControl, type SortOrder } from '../shared/sort-control'
import { spacing } from '../theme/tokens'
import { band, gutterOf } from './band'

/**
 * The board: a column per status, its cards in it, KN-043.
 *
 * Everything it decides is in `core/records`; this lays the components out and
 * carries what is open. No API yet, KN-037 to KN-039: the board is held in the
 * browser and kept there between visits, so the screens could be built and
 * looked at, the owner's instruction of 2026-09-12.
 */

// Node 241:33, the columns 16 apart in a row that scrolls sideways, KN-481.
const COLUMN_GAP = spacing.md

// The order the board opens in, typed so the lint rule reads it as a value and
// not as copy: a literal handed to a generic loses the union that exempts it.
const NEWEST: SortOrder = 'newest'
const DROP_SAVED: NonNullable<KanbanColumnProps['dropFeedback']> = 'saved'
const DROP_HOVER: NonNullable<KanbanColumnProps['dropFeedback']> = 'hover'

// The search bar's own width before it gives way, node 155:92's 320, and the
// room the tab bar needs under the page on a phone. Neither binds a variable.
const SEARCH_WIDTH = 320

// The rename modal takes the Confirm modal's width, node 150:92's 360: one
// field and two actions, the same shape.
const RENAME_WIDTH = 360

// The quiet action beside a primary one, typed so the lint rule reads it as a
// value rather than as copy.
const QUIET: ButtonVariant = 'text'

// The button that finishes a form, typed for the same reason.
const SUBMIT: ButtonType = 'submit'

// Focusable on purpose and not in the tab order: somewhere to put a reader
// whose own control was just deleted, KN-344.
const LOOSE = -1

// The two card layouts, typed for the same reason, and the search bar's two,
// which are the same words for the same pair of screens, KN-315.
const DESKTOP: JobCardLayout = 'desktop'
const MOBILE: JobCardLayout = 'mobile'
const WIDE_BAR: SearchBarLayout = 'desktop'
const NARROW_BAR: SearchBarLayout = 'mobile'

export interface JobsScreenProps {
  /** Opens the add flow, which is what the add destination is, KN-042. */
  addOpen?: boolean
  /** Said when the add flow closes, so the address can go back to the board. */
  onAddClose?: () => void
  /** Said while anything is selected, so the shell can give the foot of the screen to the bulk bar, KN-356. */
  onSelecting?: (selecting: boolean) => void
  /** Signs the reader out, from the Page Header's controls on a phone, KN-478. */
  onSignOut?: () => void
  /** Reads a pasted link or text into the add flow's Review step: the server's reader, which the shell fills in, KN-495. */
  onExtract: AddJobModalProps['onExtract']
}

export const JobsScreen = ({ addOpen = false, onAddClose, onSelecting, onSignOut, onExtract }: JobsScreenProps) => {
  const { i18n } = useLingui()
  const { locale } = usePreferences()
  const records = useRecords()
  const columns = columnOrder(records.statuses)
  // A board always has a status, so its first column is always there: a stored
  // board with none reads back as the defaults, a column holding a job opportunity
  // is never deleted, and a board holding none shows the empty state, which has no
  // column menu. Only a screen drawn outside RecordsProvider has no status, which no
  // reader meets, KN-427.
  const first = columns[0]?.id ?? ''

  const [search, setSearch] = useState('')
  const [order, setOrder] = useState<SortOrder>(NEWEST)
  const [selected, setSelected] = useState<readonly string[]>([])
  // Rejected opens collapsed, the owner's KN-070: it is the status that grows
  // fastest and the one a reader looks at least.
  const [folded, setFolded] = useState<Record<string, boolean>>({})
  const [dragging, setDragging] = useState<string | null>(null)
  const [over, setOver] = useState<string | null>(null)
  const [dragExpanded, setDragExpanded] = useState<string | null>(null)
  const [landed, setLanded] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const hoverTimer = useRef<number | undefined>(undefined)
  const hoverColumn = useRef<string | null>(null)
  const clearHover = () => {
    window.clearTimeout(hoverTimer.current)
    hoverColumn.current = null
    setOver(null)
  }
  const endDrag = () => {
    clearHover()
    setDragging(null)
    setDragExpanded(null)
  }
  useEffect(
    () => () => {
      window.clearTimeout(hoverTimer.current)
    },
    [],
  )
  useEffect(() => {
    if (!landed) return
    const timer = window.setTimeout(() => {
      setLanded(null)
    }, 1000)
    return () => {
      window.clearTimeout(timer)
    }
  }, [landed])
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
  // The person deleted from their edit form, asked about before they go, KN-348:
  // their id while the question is open, and nobody otherwise.
  const [deletingPeople, setDeletingPeople] = useState<readonly string[]>([])
  // A column being renamed: its id and the name as it is being typed.
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null)
  // The control that asked to delete, kept as it asks, KN-344: by the time the
  // confirmation closes it may not be in the page any more, and that is the
  // case this is for. A ref, because nothing renders differently for it.
  const asked = useRef<HTMLElement | null>(null)
  // And where a reader carries on from if it did go, worked out at the same
  // moment, while the cards being deleted are still in the page, KN-472.
  const landings = useRef<readonly HTMLElement[]>([])
  const board = useRef<HTMLDivElement | null>(null)
  // The desktop's row of columns and a phone's one column, where the cards are.
  const lanes = useRef<HTMLDivElement | null>(null)
  const pile = useRef<HTMLDivElement | null>(null)

  const renameFormId = useId()
  const wide = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'), { noSsr: true })

  const addingTo = adding ?? (addOpen ? first : null)
  const showing = columns.find((column) => column.id === chosen) ?? columns[0]
  const job = records.jobs.find((entry) => entry.id === reading)
  const isCollapsed = (id: string) => (folded[id] ?? tokenOf(records.statuses, id) === 'rejected') && dragExpanded !== id
  const cardsOf = (id: string) => jobsIn(records.jobs, id, search, order)
  // The column's own size, which is what says whether it can be deleted: the
  // searched count reads zero while a search hides its cards, and deleting it
  // then would take the hidden job opportunities with it, KN-422.
  const sizeOf = (id: string) => records.jobs.filter((entry) => entry.draft.status === id).length
  // What the search shows anywhere on the board: every column's cards, those in
  // a collapsed column and, on a phone, those behind the other chips among them.
  // Its size says whether the search found nothing rather than each column being
  // empty on its own, and it is all the bulk bar acts on, KN-431.
  const shown = new Set(columns.flatMap((column) => cardsOf(column.id).map((entry) => entry.id)))
  const found = shown.size

  // Only the job opportunities the search shows are counted or acted on: one the
  // search hides, or one deleted from its own card or by another tab, is not,
  // KN-422 and KN-431. One the search hides stays chosen, and counts again once
  // the search shows it.
  const held = selected.filter((id) => shown.has(id))

  const select = (id: string, wanted: boolean) => {
    setSelected((was) => (wanted ? [...was, id] : was.filter((held) => held !== id)))
  }

  // Where a reader goes on from when the job opportunities they delete take the
  // control they asked from with them, KN-472, worked out as they ask. In the
  // column of the first of them as the board shows it, the cards the deletion
  // keeps: those after it, nearest first, then those before it, nearest first,
  // then that column's Add Card row. They are chosen from the records and only
  // then found in the page, by place, since each column lays its cards out in
  // the order `cardsOf` gives.
  const landingsFor = (ids: readonly string[]) => {
    // A phone always shows a column, since a board always has a status, KN-427.
    const shownColumns = wide ? columns : showing === undefined ? [] : [showing]
    for (const [at, column] of shownColumns.entries()) {
      const cards = cardsOf(column.id)
      const index = cards.findIndex((entry) => ids.includes(entry.id))
      if (index === -1) continue
      const holder = wide ? lanes.current?.children.item(at) : pile.current
      // The row of columns and a phone's pile are in the page whenever a card that
      // can ask to be deleted is, so no reader meets a missing holder, KN-427.
      if (!holder) return []
      const kept = (entry: JobEntry) => !ids.includes(entry.id)
      const order = [...cards.slice(index + 1).filter(kept), ...cards.slice(0, index).filter(kept).reverse()]
      const titles = [...holder.querySelectorAll('article')].map((article) => article.querySelector('button'))
      const addLabel = `${i18n._('Add a job opportunity to')} ${column.name}`
      const addRow =
        wide && !isCollapsed(column.id) ? [...holder.querySelectorAll('button')].find((button) => button.ariaLabel === addLabel) : undefined
      return [...order.map((entry) => titles[cards.indexOf(entry)]), addRow].filter((element) => element instanceof HTMLElement)
    }
    return []
  }
  const remember = (ids: readonly string[]) => {
    const active = window.document.activeElement
    // Every control that asks to delete is an HTML button or menu item, and a page
    // with nothing focused gives its body, so no reader meets the null, KN-427.
    asked.current = active instanceof HTMLElement ? active : null
    landings.current = landingsFor(ids)
  }

  const addJob = (draft: JobDraft) => {
    records.addJob(draft)
    setAdding(null)
    // The flow is done, so the address leaves it too: saving from the add
    // DESTINATION would otherwise reopen the modal over the board the moment it
    // closed, since the address still asked for it, KN-044.
    onAddClose?.()
  }

  const move = (status: string) => {
    if (moving) records.moveJobs(moving, status)
    setMoving(null)
    setSelected([])
  }

  const rename = () => {
    if (renaming && renaming.name.trim() !== '') records.renameStatus(renaming.id, renaming.name.trim())
    setRenaming(null)
  }

  const remove = () => {
    if (deleting) records.deleteJobs(deleting)
    setDeleting(null)
    setSelected([])
    if (deleting?.includes(reading ?? '')) setReading(null)
  }

  // Before the paint, not after it: a normal effect would let the frame that
  // shows the bulk bar also show the tab bar under it, KN-356. Cleared when the
  // page goes, so leaving with a selection live does not leave the shell
  // thinking the next page is selecting.
  useLayoutEffect(() => {
    onSelecting?.(held.length > 0)
    return () => {
      onSelecting?.(false)
    }
  }, [held.length, onSelecting])

  const people = records.jobs.map((entry) => ({ value: entry.id, label: entry.draft.title }))
  // The person the contact modal is editing, or null while it adds or is closed:
  // narrowed once, here, so the edit's modal and handlers know their record without
  // a check no reader can fail, KN-427.
  const editing = person !== undefined && person.id !== null ? { id: person.id, values: person.values } : null

  const card = (entry: JobEntry) => (
    <JobCard
      key={entry.id}
      dragEvents={{
        draggable: wide,
        onDragStart: (event) => {
          if (event.target instanceof Element && event.target.closest('a, input')) {
            event.preventDefault()
            return
          }
          type CardTransfer = 'application/x-karnama-job'
          const format: CardTransfer = 'application/x-karnama-job'
          event.dataTransfer.setData(format, entry.id)
          event.dataTransfer.effectAllowed = 'move'
          setDragging(entry.id)
          setAnnouncement('')
        },
        onDragEnd: endDrag,
        onClickCapture: (event) => {
          if (dragging) event.stopPropagation()
        },
      }}
      // A phone gets the card's phone layout, which carries its own menu. The
      // desktop card folds delete and select behind a hover, KN-341, and a
      // phone has no hover: without this the board on a phone offered no way
      // to delete a job opportunity or move it, found while KN-415 drove every
      // handler of this screen from a story.
      layout={wide ? DESKTOP : MOBILE}
      title={entry.draft.title}
      company={entry.draft.company}
      date={entry.draft.postedAt === '' ? '' : formatDay(locale, entry.draft.postedAt)}
      status={tokenOf(records.statuses, entry.draft.status)}
      link={entry.draft.postingUrl === '' ? null : entry.draft.postingUrl}
      selected={selected.includes(entry.id)}
      // While anything is selected a phone's card offers its checkbox, as the
      // Checkbox 204:11 says; a press held on one is what starts it, KN-428.
      selecting={held.length > 0}
      onOpen={() => {
        setReading(entry.id)
      }}
      onSelectedChange={(wanted) => {
        select(entry.id, wanted)
      }}
      onDelete={() => {
        remember([entry.id])
        setDeleting([entry.id])
      }}
      onChangeStatus={() => {
        setMoving([entry.id])
      }}
    />
  )

  // Nothing to lay out: no job opportunity yet, or none this search finds.
  const empty = records.jobs.length === 0 || found === 0

  return (
    <Stack ref={board} tabIndex={LOOSE} sx={{ position: 'relative', minWidth: 0, minHeight: 0, flex: '1 1 auto' }}>
      <Box role="status" sx={{ position: 'absolute', inset: 0, width: 1, height: 1, overflow: 'hidden', clipPath: 'inset(50%)' }}>
        {announcement}
      </Box>
      {/* The Header band, 241:17 and 241:147: the Page Header, the toolbar
          and, on a phone, the status chips, KN-481. */}
      <Box component="header" sx={band.sx(wide)}>
        <PageHeader
          title={i18n._('My job opportunities')}
          {...(onSignOut === undefined ? {} : { onSignOut })}
          // The action is the desktop's. On a phone the header already carries
          // the shell's own controls, KN-478, and the tab bar carries adding as a
          // destination of its own, so one more control here only takes the room
          // the title needs and leaves it cut. The file draws it there, KN-515.
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

        {/* The toolbar, 367:5362: the search bar's own 320 at the inline start
            and the sort at the inline end. On a phone the bar takes the row and
            the sort wraps under it, a row the file does not draw, KN-516. */}
        <Stack direction="row" sx={{ gap: `${spacing.sm}px`, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Box sx={{ flex: wide ? `0 1 ${SEARCH_WIDTH}px` : `1 1 ${SEARCH_WIDTH}px`, minWidth: 0 }}>
            <SearchBar value={search} onChange={setSearch} layout={wide ? WIDE_BAR : NARROW_BAR} />
          </Box>
          <SortControl value={order} onChange={setOrder} />
        </Stack>

        {wide || empty ? null : (
          // The phone's status switcher, node 241:159: the statuses as chips in
          // a row that scrolls sideways, closing the band.
          <Box sx={{ display: 'flex', flexShrink: 0, gap: `${spacing.xs}px`, overflowX: 'auto', '& > *': { flexShrink: 0 } }}>
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
        )}
      </Box>

      {empty ? (
        <Box sx={{ padding: `${gutterOf(wide)}px` }}>
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
        </Box>
      ) : wide ? (
        <Box
          ref={lanes}
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
            // Node 241:33's 32 on every side, inside the row that scrolls.
            padding: `${gutterOf(wide)}px`,
            // A column keeps the width the design gives it, 300, and the row
            // scrolls: without this the columns share the room out between them
            // and a board of nine is nine slivers.
            '& > *': { flexShrink: 0 },
          }}
        >
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              dragEvents={{
                onDragOver: (event) => {
                  if (!dragging) return
                  event.preventDefault()
                  event.dataTransfer.dropEffect = 'move'
                  if (hoverColumn.current === column.id) return
                  clearHover()
                  hoverColumn.current = column.id
                  setOver(column.id)
                  if (isCollapsed(column.id)) {
                    hoverTimer.current = window.setTimeout(() => {
                      setDragExpanded(column.id)
                    }, 500)
                  }
                },
                onDragLeave: (event) => {
                  if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return
                  clearHover()
                },
                onDrop: (event) => {
                  if (!dragging) return
                  event.preventDefault()
                  const source = records.jobs.find((entry) => entry.id === dragging)
                  if (source && source.draft.status !== column.id) {
                    records.moveJob(source.id, column.id)
                    setLanded(column.id)
                    setAnnouncement(`${source.draft.title}: ${column.name}`)
                  }
                  endDrag()
                },
              }}
              stableDropTarget={dragging !== null && (isCollapsed(column.id) || dragExpanded === column.id)}
              dropFeedback={landed === column.id ? DROP_SAVED : over === column.id ? DROP_HOVER : undefined}
              name={column.name}
              colour={column.token}
              count={sizeOf(column.id)}
              collapsed={isCollapsed(column.id)}
              onExpand={() => {
                setFolded((was) => ({ ...was, [column.id]: false }))
              }}
              onCollapse={() => {
                setFolded((was) => ({ ...was, [column.id]: true }))
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
        // The phone's column, node 241:176: the chosen status's cards alone,
        // 12 apart and 16 in, under the band's chips.
        <Stack
          ref={pile}
          sx={{
            gap: `${spacing.sm}px`,
            padding: `${gutterOf(wide)}px`,
            minHeight: 0,
            minWidth: 0,
            flex: '1 1 0',
            overflowY: 'auto',
            '& > *': { flexShrink: 0 },
          }}
        >
          {showing && cardsOf(showing.id).length > 0 ? (
            cardsOf(showing.id).map(card)
          ) : (
            // What the column says when it holds nothing, node 241:46, which
            // a phone needs as much as the desktop does, KN-422.
            <EmptyColumn />
          )}
        </Stack>
      )}

      <BulkActionBar
        type="jobs"
        count={held.length}
        onClear={() => {
          setSelected([])
        }}
        onDelete={() => {
          remember(held)
          setDeleting(held)
        }}
        onChangeStatus={() => {
          setMoving(held)
        }}
        onSelectAll={() => {
          // What the search found, in place of what was chosen, KN-431.
          setSelected([...shown])
        }}
      />

      <AddJobModal
        open={addingTo !== null}
        statuses={records.statuses}
        status={addingTo ?? first}
        onExtract={onExtract}
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
          // Written here, where the job is known, since the modal is drawn only while
          // its job exists, KN-427. Saving is the end of reading it: the modal closes,
          // as every other modal in the product does when its work is done.
          onSave={(saved) => {
            records.saveJob(job.id, saved)
            setReading(null)
          }}
          onDelete={() => {
            remember([job.id])
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
            // The job modal offers only the people contactsOf read for this job in the
            // same render, so the person is always found, KN-427.
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

      {/* Adding and editing are different shapes, KN-386: an Edit carries the
          id it is on and the record that belongs to it, so a form cannot be
          filled from one contact and saved onto another. */}
      {editing === null ? (
        <ContactModal
          open={person !== undefined}
          mode="add"
          // Added from inside a job opportunity, the form starts with that job
          // chosen, KN-056.
          {...(person ? { initial: person.values } : {})}
          jobs={people}
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
            records.addContact(contact, values.jobId)
            setPerson(undefined)
          }}
          onCancel={() => {
            setPerson(undefined)
          }}
        />
      ) : (
        <ContactModal
          open
          mode="edit"
          recordId={editing.id}
          initial={editing}
          jobs={people}
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
            records.saveContact(editing.id, contact, values.jobId)
            setPerson(undefined)
          }}
          onCancel={() => {
            setPerson(undefined)
          }}
          // Asked about first, as the network page asks, KN-348: the edit closes
          // into the confirmation, and nobody goes until it is confirmed.
          onDelete={() => {
            setDeletingPeople([editing.id])
            setPerson(undefined)
          }}
        />
      )}

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
            <Button type={SUBMIT} form={renameFormId}>
              {i18n._('Save')}
            </Button>
          </>
        }
      >
        <Box
          component="form"
          noValidate
          id={renameFormId}
          onSubmit={(event: SyntheticEvent) => {
            event.preventDefault()
            rename()
          }}
          // Draws no box of its own, so the modal's layout is unchanged, KN-463.
          sx={{ display: 'contents' }}
        >
          <Input
            label={i18n._('Status')}
            enterKeyHint="done"
            value={renaming?.name ?? ''}
            onChange={(name) => {
              // With no rename open this field is out of the keyboard's reach: Enter
              // closes the modal and focus is back on the column's menu button at once,
              // before the dissolve ends, so a key pressed straight after lands there,
              // measured three times for KN-427.
              setRenaming((was) => (was ? { ...was, name } : was))
            }}
          />
        </Box>
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
        opener={() => asked.current}
        // Where a reader carries on from when what they deleted was also what
        // they were standing on: the first place worked out as they asked that is
        // still in the page, KN-472, else the board itself, which takes focus for
        // this and nothing else.
        fallback={() => landings.current.find((element) => element.isConnected) ?? board.current}
        title={i18n._('Delete this job opportunity?')}
        body={i18n._('This job opportunity is deleted for good and cannot be brought back.')}
        confirmLabel={i18n._('Delete')}
        onConfirm={remove}
        onCancel={() => {
          setDeleting(null)
        }}
      />

      <ConfirmModal
        open={deletingPeople.length > 0}
        title={i18n._('Delete contact')}
        body={i18n._('This contact is deleted for good and cannot be brought back.')}
        confirmLabel={i18n._('Delete')}
        onConfirm={() => {
          records.deleteContacts(deletingPeople)
          setDeletingPeople([])
        }}
        onCancel={() => {
          setDeletingPeople([])
        }}
      />
    </Stack>
  )
}
