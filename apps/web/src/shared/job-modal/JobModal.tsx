import { useLingui } from '@lingui/react'
import { Box, ButtonBase, Dialog, useMediaQuery, type Theme } from '@mui/material'
import { useId, useRef, useState, type ReactNode } from 'react'
import { usePreferences } from '../../core/preferences'
import { statusGroups, tokenOf } from '../../core/records'
import { spacing, type as typeScale } from '../../theme/tokens'
import { AddContact } from '../add-contact'
import { JobArea, JobFields, JobPart, missingFields, validPostingUrl, type JobDraft } from '../add-job'
import { Button } from '../button'
import type { ContactCardContact } from '../contact-card'
import { HistoryRow, type HistoryRowProps } from '../history'
import { Icon } from '../icon'
import { IconButton } from '../icon-button'
import { Input, type InputDirection } from '../input'
import { CardMenu } from '../menu'
import { DISSOLVE_MS, modalScrim, UnsavedModal } from '../modal'
import { PopoverClose } from '../popover-close'
import { CompanyMatch, RelatedPerson, type CompanyMatchPerson, type Copied } from '../related-person'
import type { SourceLists } from '../source-picker'
import { StatusControl, type StatusOption } from '../status-picker'
import { Tabs } from '../tabs'
import { fileKind, fileSize, formatDay } from './format'

// A field of latin data: a phone number, an email or a link runs left to right
// whatever the page does, KN-458. Typed so the lint rule reads it as a value
// rather than as copy.
const LATIN: InputDirection = 'ltr'

// The five tabs in the order 210:276 draws them: the information, the note, the
// related people, the files, and the history last, «تاریخچه».
export type JobModalTab = 'info' | 'note' | 'contacts' | 'files' | 'history'
const TABS: readonly JobModalTab[] = ['info', 'note', 'contacts', 'files', 'history']
const isTab = (value: string): value is JobModalTab => TABS.some((tab) => tab === value)
const INFO: JobModalTab = 'info'

// A file of the job opportunity; its size in bytes and the day it was added.
export interface JobFile {
  id: string
  name: string
  size: number
  addedAt: string
}

// One change of status: the status it moved to, by id, when, and whether the
// reader made it or the product did.
export interface StatusChange {
  id: string
  status: string
  at: string
  automatic: boolean
}

// A person linked to the job opportunity, and the tag they carry in the
// network, none until the records hold tags, KN-738.
export interface JobContact {
  id: string
  contact: ContactCardContact
  tag?: string | null
}

// An interview round as the history shows it: its title, the day it was on, and
// what is said after the day, its time and its result. What a round holds and
// how its words are made is the record's, KN-733.
export interface InterviewRound {
  id: string
  title: string
  at: string
  detail: string
}

// Everything the modal shows of a job opportunity.
export interface JobRecord {
  /** Which record this is, so the modal can tell one from another, KN-363. */
  id: string
  draft: JobDraft
  description: string
  skills: readonly string[]
  note: string
  noteEditedAt: string | null
  contacts: readonly JobContact[]
  files: readonly JobFile[]
  history: readonly StatusChange[]
  rounds?: readonly InterviewRound[]
}

// What saving hands over: the fields with the status the header holds, which
// the handoff records with «ذخیره», the description and the note.
export interface JobSaved extends JobDraft {
  description: string
  note: string
}

// The props are documented in story-docs, not here, KN-207.
export interface JobModalProps {
  open: boolean
  job: JobRecord
  statuses: readonly StatusOption[]
  sources: SourceLists
  matches: readonly CompanyMatchPerson[]
  tab?: JobModalTab
  onStatusChange: (status: string) => void
  onAddStatus: () => void
  onSave: (job: JobSaved) => void
  onDelete: () => void
  onClose: () => void
  onAddContact: () => void
  onConnectContact: (id: string) => void
  onUnlinkContact: (id: string) => void
  onCopied?: (what: Copied) => void
  onAddFiles: (files: File[]) => void
  onDownloadFile: (id: string) => void
  onEditHistory?: (id: string) => void
}

// Node 210:276's measures that bind no variable: 720 by 617; the posting's
// open button a 44 square, the field's height; the file's tile 40; the note
// 200 tall; the close at 20, Popover / Close's; and the file's one pixel
// strokes, with the keyboard's ring three inside, as the Icon Button's.
const WIDTH = 720
const HEIGHT = 617
const OPEN_LINK = 44
const FILE_TILE = 40
const NOTE_HEIGHT = 200
const CLOSE = 20
const EDGE = 1
const FOCUS_RING = 3

// What an outside link carries, so the page it opens cannot reach back, on
// the open button and through the «…».
type Rel = 'noopener noreferrer'
const OUTSIDE: Rel = 'noopener noreferrer'
type Features = 'noopener,noreferrer'
const OUTSIDE_WINDOW: Features = 'noopener,noreferrer'

// The rows' layouts, the related person's and the history's, by the screen's
// width, typed so the lint rule reads them as values.
type Layout = NonNullable<HistoryRowProps['layout']>
const DESKTOP: Layout = 'desktop'
const MOBILE: Layout = 'mobile'

// A rule of border/default. Over the footer, and inside the Info tab between
// its parts.
const Rule = () => (
  <Box
    component="hr"
    sx={(theme) => ({
      margin: 0,
      border: 0,
      flexShrink: 0,
      height: `${EDGE}px`,
      backgroundColor: theme.karnama.semantic['border/default'],
    })}
  />
)

// The keyboard's ring, three pixels drawn inside a control's edge. Under an sx
// key, which the lint rule reads as CSS.
const ring = {
  sx: (colour: string, radius: number) => ({
    '&.Mui-focusVisible::after, &:focus-visible::after': {
      content: '""',
      position: 'absolute',
      inset: EDGE,
      borderRadius: `${radius - EDGE}px`,
      borderStyle: 'solid',
      borderWidth: FOCUS_RING,
      borderColor: colour,
      pointerEvents: 'none',
    },
    outline: 'none',
  }),
}

// One row of the history: a change of status or an interview round, by when.
type Entry =
  { kind: 'status'; id: string; at: string; change: StatusChange } | { kind: 'round'; id: string; at: string; round: InterviewRound }

// The Job Modal of node 210:276, editable where it stands, the file's
// description says: no separate view and edit. The header holds the title and
// the company and, at its other end, the Status Control, the More Button with
// the «…» menu of 894:75677, and the 20 close; then the five tabs, their panel
// scrolling in the body; then the footer, «ذخیره» and «انصراف» at the inline end.
// The handoff of 2026-11-03: every tab is edited where it stands and «ذخیره» is
// off until something differs from the record; a stage chosen in the header is
// recorded with «ذخیره», and an outcome is handed to the page at once, which
// closes the modal for the board's undo; closing with a difference asks in the
// Unsaved modal. What is typed in any tab is held here, so switching tabs loses
// none of it.
export const JobModal = ({
  open,
  job,
  statuses,
  sources,
  matches,
  tab: asked = INFO,
  onStatusChange,
  onAddStatus,
  onSave,
  onDelete,
  onClose,
  onAddContact,
  onConnectContact,
  onUnlinkContact,
  onCopied,
  onAddFiles,
  onDownloadFile,
  onEditHistory,
}: JobModalProps) => {
  const { i18n } = useLingui()
  const { locale } = usePreferences()
  const phone = !useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const layout = phone ? MOBILE : DESKTOP
  const titleId = useId()
  const formId = useId()
  const picker = useRef<HTMLInputElement>(null)
  const more = useRef<HTMLButtonElement>(null)
  const [tab, setTab] = useState(asked)
  const [draft, setDraft] = useState(job.draft)
  const [description, setDescription] = useState(job.description)
  const [note, setNote] = useState(job.note)
  const [tried, setTried] = useState(false)
  const [menu, setMenu] = useState<HTMLElement | null>(null)
  const [asking, setAsking] = useState(false)
  // Each opening starts from the record, and so does being handed a DIFFERENT
  // record while open, KN-363: a page that swaps the job under an open modal
  // used to draw the new record's header over the old one's editable fields,
  // and Save wrote those fields onto the new record. The test is the id, not
  // the object: the provider builds a new object on every change, so anything
  // comparing identity would throw away what a reader is typing whenever
  // anything else on the board moved. React's pattern for state that follows a
  // prop, adjusted during render.
  const [seen, setSeen] = useState({ open, asked, id: job.id })
  if (open !== seen.open || asked !== seen.asked || job.id !== seen.id) {
    setSeen({ open, asked, id: job.id })
    setTab(asked)
    // Only while it is open: an id that changes as it closes is simply
    // remembered, and the next opening starts from whatever record is current.
    if (open && (!seen.open || job.id !== seen.id)) {
      setDraft(job.draft)
      setDescription(job.description)
      setNote(job.note)
      // With the rest, or the first record's refusals would be shown against
      // the second's fields.
      setTried(false)
      setMenu(null)
      setAsking(false)
    }
  }

  const { stages, outcomes } = statusGroups(statuses)
  // Whether anything differs from the record, which turns «ذخیره» on and makes
  // leaving ask. The draft is compared by what it holds; it is built from the
  // record's by spreading, so its fields keep their order.
  const changed = JSON.stringify(draft) !== JSON.stringify(job.draft) || description !== job.description || note !== job.note
  // A stage waits for «ذخیره»; an outcome is the page's at once, KN-812.
  const chooseStatus = (id: string) => {
    if (outcomes.some((outcome) => outcome.id === id)) onStatusChange(id)
    else setDraft((current) => ({ ...current, status: id }))
  }
  const save = () => {
    if (missingFields(draft).length > 0) {
      setTried(true)
      setTab(INFO)
      return
    }
    onSave({ ...draft, title: draft.title.trim(), company: draft.company.trim(), description, note })
  }
  // The close, Escape, the scrim and «انصراف»: with a difference, ask first.
  const leave = () => {
    if (changed) setAsking(true)
    else onClose()
  }

  const link = draft.postingUrl.trim()
  const linkable = link !== '' && validPostingUrl(link)
  const units = { kilobytes: i18n._('KB'), megabytes: i18n._('MB') }
  // The small line, 12 at 400 on the automatic height. Under an sx key, which
  // the lint rule reads as CSS.
  const small = { sx: { fontSize: `${typeScale.label.size}px`, lineHeight: 'normal', fontWeight: typeScale.body.weight } }

  const info = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${spacing.md}px` }}>
      <JobFields draft={draft} missing={tried ? missingFields(draft) : []} sources={sources} onChange={setDraft} />
      {/* The Link Row, 296:73: the field and, when there is a link, the
          button that opens the posting, 8 after it at the field's foot. */}
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: `${spacing.xs}px` }}>
        <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
          <Input
            label={i18n._('Posting link')}
            type="url"
            enterKeyHint="done"
            {...(tried && !validPostingUrl(draft.postingUrl) ? { error: i18n._('Enter a valid http or https link') } : {})}
            direction={LATIN}
            value={draft.postingUrl}
            onChange={(postingUrl) => {
              setDraft({ ...draft, postingUrl })
            }}
          />
        </Box>
        {linkable ? (
          <Box
            component="a"
            href={link}
            target="_blank"
            rel={OUTSIDE}
            aria-label={i18n._('Open the posting link')}
            sx={(theme) => ({
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              width: OPEN_LINK,
              height: OPEN_LINK,
              borderRadius: `${theme.karnama.radius.md}px`,
              backgroundColor: theme.karnama.semantic['bg/surface-secondary'],
              color: theme.karnama.semantic['text/secondary'],
              '&:hover': { color: theme.karnama.semantic['text/primary'] },
              ...ring.sx(theme.karnama.semantic['border/focus'], theme.karnama.radius.md),
            })}
          >
            <Icon name="external-link" size="sm" color="inherit" />
          </Box>
        ) : null}
      </Box>
      <Rule />
      <JobPart icon="note" title={i18n._('Job description and responsibilities')}>
        <JobArea label={i18n._('Job description and responsibilities')} value={description} onChange={setDescription} />
      </JobPart>
      {job.skills.length === 0 ? null : (
        <JobPart icon="tag" title={i18n._('Required skills')}>
          <Box component="ul" sx={{ display: 'flex', flexWrap: 'wrap', gap: `${spacing.xs}px`, margin: 0, padding: 0, listStyle: 'none' }}>
            {job.skills.map((skill) => (
              <Box
                component="li"
                key={skill}
                sx={(theme) => ({
                  ...small.sx,
                  fontWeight: typeScale.label.weight,
                  paddingBlock: `${spacing['2xs']}px`,
                  paddingInline: `${spacing.xs}px`,
                  borderRadius: `${theme.karnama.radius.full}px`,
                  backgroundColor: theme.karnama.semantic['bg/surface-secondary'],
                  color: theme.karnama.semantic['text/secondary'],
                })}
              >
                {skill}
              </Box>
            ))}
          </Box>
        </JobPart>
      )}
    </Box>
  )

  // The note, 210:127, 200 tall, and when it was last edited.
  const noteTab = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${spacing.md}px` }}>
      <JobArea label={i18n._('Note')} value={note} onChange={setNote} height={NOTE_HEIGHT} />
      {job.noteEditedAt === null ? null : (
        <Box sx={(theme) => ({ ...small.sx, color: theme.karnama.semantic['text/secondary'] })}>
          {`${i18n._('Last edited:')} ${formatDay(locale, job.noteEditedAt)}`}
        </Box>
      )}
    </Box>
  )

  // The related people, 210:208: the Company Match at the top, which draws
  // nothing with nobody to link; the Related Person rows in their list, a box of
  // bg/surface at radius md with an edge of border/default inside and a rule
  // between rows; and «+ افزودن نفر». A row's remove only unlinks the person.
  const people = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${spacing.md}px` }}>
      <CompanyMatch company={job.draft.company} people={matches} onConnect={onConnectContact} />
      {job.contacts.length === 0 ? null : (
        <Box
          component="ul"
          aria-label={i18n._('Related people')}
          sx={(theme) => ({
            margin: 0,
            padding: 0,
            listStyle: 'none',
            overflow: 'hidden',
            borderRadius: `${theme.karnama.radius.md}px`,
            borderStyle: 'solid',
            borderWidth: EDGE,
            borderColor: theme.karnama.semantic['border/default'],
            backgroundColor: theme.karnama.semantic['bg/surface'],
            '& > li + li': {
              borderTopStyle: 'solid',
              borderTopWidth: EDGE,
              borderTopColor: theme.karnama.semantic['border/default'],
            },
          })}
        >
          {job.contacts.map(({ id, contact, tag }) => (
            <li key={id}>
              <RelatedPerson
                name={contact.name}
                role={contact.role}
                company={contact.company}
                tag={tag ?? null}
                email={contact.email}
                phone={contact.phone}
                layout={layout}
                onUnlink={() => {
                  onUnlinkContact(id)
                }}
                {...(onCopied === undefined ? {} : { onCopied })}
              />
            </li>
          ))}
        </Box>
      )}
      <AddContact onClick={onAddContact} />
    </Box>
  )

  // The files, 210:275: each a row of the 40 tile, the name and its size, day
  // and kind, and the download at the other end; then the drop zone, where a
  // file can be dropped or chosen.
  const files = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${spacing.md}px` }}>
      {job.files.map((file) => (
        <Box
          key={file.id}
          sx={(theme) => ({
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: `${spacing.sm}px`,
            paddingBlock: `${spacing.sm}px`,
            paddingInline: `${spacing.md}px`,
            borderRadius: `${theme.karnama.radius.md}px`,
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              borderStyle: 'solid',
              borderWidth: EDGE,
              borderColor: theme.karnama.semantic['border/default'],
              pointerEvents: 'none',
            },
          })}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: `${spacing.sm}px`, minWidth: 0 }}>
            <Box
              aria-hidden
              sx={(theme) => ({
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                width: FILE_TILE,
                height: FILE_TILE,
                borderRadius: `${theme.karnama.radius.md}px`,
                backgroundColor: theme.karnama.semantic['bg/surface-secondary'],
              })}
            >
              <Icon name="file" size="md" />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${spacing['2xs']}px`, minWidth: 0 }}>
              <Box
                component="span"
                sx={(theme) => ({
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontSize: `${typeScale.body.size}px`,
                  lineHeight: 'normal',
                  fontWeight: typeScale.label.weight,
                  color: theme.karnama.semantic['text/primary'],
                })}
              >
                {file.name}
              </Box>
              <Box component="span" sx={(theme) => ({ ...small.sx, color: theme.karnama.semantic['text/secondary'] })}>
                {[fileSize(locale, file.size, units), formatDay(locale, file.addedAt), fileKind(file.name)]
                  .filter((part) => part !== '')
                  .join(' · ')}
              </Box>
            </Box>
          </Box>
          <ButtonBase
            disableRipple
            aria-label={`${i18n._('Download')} ${file.name}`}
            onClick={() => {
              onDownloadFile(file.id)
            }}
            sx={(theme) => ({
              position: 'relative',
              flexShrink: 0,
              width: spacing.xl,
              height: spacing.xl,
              borderRadius: `${theme.karnama.radius.md}px`,
              backgroundColor: theme.karnama.semantic['bg/surface-secondary'],
              color: theme.karnama.semantic['text/secondary'],
              '&:hover': { color: theme.karnama.semantic['text/primary'] },
              ...ring.sx(theme.karnama.semantic['border/focus'], theme.karnama.radius.md),
            })}
          >
            <Icon name="download" size="sm" color="inherit" />
          </ButtonBase>
        </Box>
      ))}
      <Box
        onDragOver={(event) => {
          event.preventDefault()
        }}
        onDrop={(event) => {
          event.preventDefault()
          const dropped = [...event.dataTransfer.files]
          if (dropped.length > 0) onAddFiles(dropped)
        }}
        sx={(theme) => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: `${spacing.xs}px`,
          padding: `${spacing.md}px`,
          borderRadius: `${theme.karnama.radius.md}px`,
          backgroundColor: theme.karnama.semantic['bg/surface-secondary'],
          fontSize: `${typeScale.body.size}px`,
          lineHeight: `${typeScale.body.lineHeight}px`,
          color: theme.karnama.semantic['text/secondary'],
        })}
      >
        {i18n._('Drop a file here')}
        <Button
          variant="secondary"
          size="S"
          onClick={() => {
            picker.current?.click()
          }}
        >
          {i18n._('Choose file')}
        </Button>
        <input
          ref={picker}
          type="file"
          multiple
          hidden
          onChange={(event) => {
            // A choice cancelled adds nothing; the field is emptied so the
            // same file can be chosen again.
            const chosen = [...(event.target.files ?? [])]
            event.target.value = ''
            if (chosen.length > 0) onAddFiles(chosen)
          }}
        />
      </Box>
    </Box>
  )

  // The history, 760:47508: the changes of status and the interview rounds,
  // newest first, each a History / Row, the job's first entry, when it was
  // saved, locked. A page that changes their dates is asked to by a row's date,
  // and the hint says so 16 above the list; one that does not offers neither.
  const entries = [
    ...job.history.map((change): Entry => ({ kind: 'status', id: change.id, at: change.at, change })),
    ...(job.rounds ?? []).map((round): Entry => ({ kind: 'round', id: round.id, at: round.at, round })),
  ].sort((first, second) => second.at.localeCompare(first.at))
  const saved = [...job.history].sort((first, second) => first.at.localeCompare(second.at))[0]?.id
  const historyTab = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${spacing.md}px` }}>
      {onEditHistory === undefined ? null : (
        <Box sx={(theme) => ({ ...small.sx, color: theme.karnama.semantic['text/secondary'] })}>
          {i18n._('You can change the date of each stage.')}
        </Box>
      )}
      <Box component="ol" aria-label={i18n._('History')} sx={{ margin: 0, padding: 0, listStyle: 'none' }}>
        {entries.map((entry, at) => {
          const shared = {
            date: formatDay(locale, entry.at),
            lineAbove: at > 0,
            lineBelow: at < entries.length - 1,
            locked: entry.id === saved,
            layout,
            ...(onEditHistory === undefined
              ? {}
              : {
                  onEdit: () => {
                    onEditHistory(entry.id)
                  },
                }),
          }
          return (
            <li key={entry.id}>
              {entry.kind === 'status' ? (
                <HistoryRow
                  kind={entry.kind}
                  status={{
                    token: tokenOf(statuses, entry.change.status),
                    name: statuses.find((status) => status.id === entry.change.status)?.name ?? entry.change.status,
                  }}
                  source={entry.change.automatic ? i18n._('Automatic') : i18n._('Manual')}
                  {...shared}
                />
              ) : (
                <HistoryRow kind={entry.kind} title={entry.round.title} source={entry.round.detail} {...shared} />
              )}
            </li>
          )
        })}
      </Box>
    </Box>
  )

  const labels: Record<JobModalTab, string> = {
    info: i18n._('Job opportunity info'),
    note: i18n._('Note'),
    contacts: i18n._('Related people'),
    files: i18n._('Files'),
    history: i18n._('History'),
  }
  const panels: Record<JobModalTab, ReactNode> = { info, note: noteTab, contacts: people, files, history: historyTab }

  return (
    <>
      <Dialog
        open={open}
        onClose={leave}
        aria-labelledby={titleId}
        transitionDuration={DISSOLVE_MS}
        slotProps={{
          backdrop: { sx: modalScrim.sx },
          paper: {
            sx: (theme) => ({
              boxSizing: 'border-box',
              width: WIDTH,
              height: HEIGHT,
              maxWidth: `calc(100% - ${2 * spacing.md}px)`,
              maxHeight: `calc(100% - ${2 * spacing.md}px)`,
              margin: `${spacing.md}px`,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              borderRadius: `${theme.karnama.radius.lg}px`,
              backgroundColor: theme.karnama.semantic['bg/surface'],
              backgroundImage: 'none',
              boxShadow: theme.karnama.elevation.modal,
            }),
          },
        }}
      >
        {/* The Header, 210:3: 24 above and at the sides, 16 below; the title
            and the company at the inline start, the Status Control, the More
            Button and the close at the end, 12 apart. */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            gap: `${spacing.sm}px`,
            paddingTop: `${spacing.lg}px`,
            paddingInline: `${spacing.lg}px`,
            paddingBottom: `${spacing.md}px`,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${spacing['2xs']}px`, minWidth: 0 }}>
            <Box
              component="h2"
              id={titleId}
              sx={(theme) => ({
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: `${typeScale['heading/m'].size}px`,
                lineHeight: 'normal',
                fontWeight: typeScale['heading/m'].weight,
                color: theme.karnama.semantic['text/primary'],
              })}
            >
              {job.draft.title}
            </Box>
            <Box
              component="span"
              sx={(theme) => ({
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: `${typeScale.body.size}px`,
                lineHeight: `${typeScale.body.lineHeight}px`,
                color: theme.karnama.semantic['text/secondary'],
              })}
            >
              {job.draft.company}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, gap: `${spacing.sm}px` }}>
            <StatusControl stages={stages} outcomes={outcomes} value={draft.status} onChange={chooseStatus} onAdd={onAddStatus} />
            <IconButton
              ref={more}
              icon="more"
              aria-label={i18n._('Job opportunity actions')}
              aria-haspopup="menu"
              aria-expanded={menu !== null}
              onClick={() => {
                setMenu(more.current)
              }}
            />
            <PopoverClose size={CLOSE} aria-label={i18n._('Close')} onClick={leave} />
          </Box>
        </Box>
        {/* The tabs, 210:14, edge to edge, and the chosen one's panel scrolling
            in the body's 24, 210:27. */}
        <Box
          component="form"
          id={formId}
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            save()
          }}
          sx={{
            flex: '1 1 auto',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            '& > div': { flex: '1 1 auto', minHeight: 0, display: 'flex', flexDirection: 'column' },
            // The row keeps its 44 however tall the panel's content, which
            // takes what is left and scrolls in it.
            '& .MuiTabs-root': { flexShrink: 0 },
            '& [role="tabpanel"]': { flex: '1 1 0', minHeight: 0, overflowY: 'auto', padding: `${spacing.lg}px`, outline: 'none' },
          }}
        >
          <Tabs
            aria-label={i18n._('Job opportunity sections')}
            value={tab}
            onChange={(chosen) => {
              if (isTab(chosen)) setTab(chosen)
            }}
            tabs={TABS.map((value) => ({ value, label: labels[value], panel: panels[value] }))}
          />
        </Box>
        <Rule />
        {/* The Footer, 210:86: «انصراف» and «ذخیره» at the inline end, 12 apart,
            in 16 and 24; «ذخیره» off until something changes. */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            flexShrink: 0,
            gap: `${spacing.sm}px`,
            paddingBlock: `${spacing.md}px`,
            paddingInline: `${spacing.lg}px`,
          }}
        >
          <Button variant="ghost" onClick={leave}>
            {i18n._('Cancel')}
          </Button>
          <Button type="submit" form={formId} disabled={!changed}>
            {i18n._('Save')}
          </Button>
        </Box>
      </Dialog>
      <CardMenu
        anchorEl={menu}
        onClose={() => {
          setMenu(null)
        }}
        {...(linkable
          ? {
              onOpenLink: () => {
                window.open(link, '_blank', OUTSIDE_WINDOW)
              },
            }
          : {})}
        // The delete is handed over once the menu has closed: the page remembers
        // what has focus as it asks, KN-344, and that is then the More Button, which
        // a delete backed out of leaves focus on, not a menu item already gone.
        onDelete={() => {
          window.setTimeout(() => {
            more.current?.focus()
            onDelete()
          })
        }}
      />
      <UnsavedModal
        open={asking}
        onSave={() => {
          setAsking(false)
          save()
        }}
        onDiscard={() => {
          setAsking(false)
          onClose()
        }}
        onKeepEditing={() => {
          setAsking(false)
        }}
      />
    </>
  )
}
