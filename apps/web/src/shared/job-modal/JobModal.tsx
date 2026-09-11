import { useLingui } from '@lingui/react'
import { Box, ButtonBase, Dialog, InputBase } from '@mui/material'
import { useId, useRef, useState, type ReactNode } from 'react'
import { usePreferences } from '../../core/preferences'
import { iconSize, spacing, type as typeScale } from '../../theme/tokens'
import { JobFields, missingFields, type JobDraft } from '../add-job'
import { Button } from '../button'
import { ContactCard, type ContactCardContact } from '../contact-card'
import { Icon, type IconName } from '../icon'
import { IconButton } from '../icon-button'
import { Input } from '../input'
import { DISSOLVE_MS, modalScrim } from '../modal'
import { StatusControl, type StatusOption } from '../status-picker'
import { Tabs } from '../tabs'
import { fileKind, fileSize, formatDay } from './format'

// The five tabs, in the order the owner settled: the information, then its
// history, then the note, the related people and the files, KN-072.
export type JobModalTab = 'info' | 'history' | 'note' | 'contacts' | 'files'
const TABS: readonly JobModalTab[] = ['info', 'history', 'note', 'contacts', 'files']
const isTab = (value: string): value is JobModalTab => TABS.some((tab) => tab === value)
const INFO: JobModalTab = 'info'

// A file of the job opportunity; its size in bytes and the day it was added.
export interface JobFile {
  id: string
  name: string
  size: number
  addedAt: string
}

// One change of status: the status's name as it was, when, and whether the
// reader made it or the product did.
export interface StatusChange {
  id: string
  status: string
  at: string
  automatic: boolean
}

export interface JobContact {
  id: string
  contact: ContactCardContact
}

// Everything the modal shows of a job opportunity.
export interface JobRecord {
  draft: JobDraft
  description: string
  skills: readonly string[]
  note: string
  noteEditedAt: string | null
  contacts: readonly JobContact[]
  files: readonly JobFile[]
  history: readonly StatusChange[]
}

// What saving hands over: the fields, the description and the note, and never
// the status, which the header's Status Control changes at once. A Save pressed
// before the page hands back a job with the new status would otherwise carry
// the old one, and a page saving the whole record would write it back over the
// change, KN-364.
export interface JobSaved extends Omit<JobDraft, 'status'> {
  description: string
  note: string
}

// The props are documented in story-docs, not here, KN-207.
export interface JobModalProps {
  open: boolean
  job: JobRecord
  statuses: readonly StatusOption[]
  tab?: JobModalTab
  onStatusChange: (status: string) => void
  onAddStatus: () => void
  onSave: (job: JobSaved) => void
  onDelete: () => void
  onClose: () => void
  onAddContact: () => void
  onOpenContact: (id: string) => void
  onDeleteContact: (id: string) => void
  onAddFiles: (files: File[]) => void
  onDownloadFile: (id: string) => void
}

// Node 210:276's measures that bind no variable: 720 by 617; the posting's
// open button a 44 square, the field's height; the file's tile 40; the note
// 200 tall; and the file's one pixel strokes, with the keyboard's ring three
// inside, as the Icon Button's.
const WIDTH = 720
const HEIGHT = 617
const OPEN_LINK = 44
const FILE_TILE = 40
const NOTE_HEIGHT = 200
const EDGE = 1
const FOCUS_RING = 3

// What an outside link carries, so the page it opens cannot reach back.
type Rel = 'noopener noreferrer'
const OUTSIDE: Rel = 'noopener noreferrer'

// A rule of border/default. Across the whole modal under the tabs and over the
// footer, and inside the Info tab between its parts.
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

// A field of several lines without a label of its own, the description's and
// the note's: 12 above and below and 16 at the sides, one pixel of
// border/default inside, two of border/focus while it has focus, as the
// Input's. Named by the heading or tab it sits under.
const Area = ({ label, value, onChange, height }: { label: string; value: string; onChange: (value: string) => void; height?: number }) => (
  <InputBase
    multiline
    {...(height === undefined ? { minRows: 2 } : { rows: 1 })}
    value={value}
    onChange={(event) => {
      onChange(event.target.value)
    }}
    inputProps={{ 'aria-label': label }}
    sx={(theme) => ({
      position: 'relative',
      width: '100%',
      boxSizing: 'border-box',
      alignItems: 'flex-start',
      paddingBlock: `${spacing.sm}px`,
      paddingInline: `${spacing.md}px`,
      borderRadius: `${theme.karnama.radius.md}px`,
      backgroundColor: theme.karnama.semantic['bg/surface'],
      color: theme.karnama.semantic['text/primary'],
      fontSize: `${typeScale.body.size}px`,
      lineHeight: `${typeScale.body.lineHeight}px`,
      '& textarea': { padding: 0, resize: 'none' },
      ...(height === undefined ? {} : { height, '& textarea': { padding: 0, resize: 'none', height: '100%', overflowY: 'auto' } }),
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
      '&.Mui-focused::before': { borderWidth: 2, borderColor: theme.karnama.semantic['border/focus'] },
    })}
  />
)

// A part of the Info tab under its heading, 210:56: a 16 icon and the title at
// 14 and SemiBold, 8 above what it heads.
const Part = ({ icon, title, children }: { icon: IconName; title: string; children: ReactNode }) => (
  <Box component="section" sx={{ display: 'flex', flexDirection: 'column', gap: `${spacing.xs}px` }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: `${spacing.xs}px` }}>
      <Icon name={icon} size="sm" />
      <Box
        component="h3"
        sx={(theme) => ({
          margin: 0,
          fontSize: `${typeScale.body.size}px`,
          lineHeight: `${typeScale.body.lineHeight}px`,
          fontWeight: typeScale['heading/m'].weight,
          color: theme.karnama.semantic['text/primary'],
        })}
      >
        {title}
      </Box>
    </Box>
    {children}
  </Box>
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

// The Job Modal of node 210:276, editable where it stands, the file's
// description says: no separate view and edit. The header holds the title and
// the company and, at its other end, the Status Control, which changes the
// status at once, and the close; then the five tabs, their panel scrolling in
// the body; then the footer, Cancel and Save at the inline start and the
// delete at the end, as the Contact Modal's Edit draws them. The history is
// its own tab, second, the owner's KN-072, newest first. What is typed in the
// Info tab and the note is held here, so switching tabs loses none of it.
export const JobModal = ({
  open,
  job,
  statuses,
  tab: asked = INFO,
  onStatusChange,
  onAddStatus,
  onSave,
  onDelete,
  onClose,
  onAddContact,
  onOpenContact,
  onDeleteContact,
  onAddFiles,
  onDownloadFile,
}: JobModalProps) => {
  const { i18n } = useLingui()
  const { locale } = usePreferences()
  const titleId = useId()
  const picker = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState(asked)
  const [draft, setDraft] = useState(job.draft)
  const [description, setDescription] = useState(job.description)
  const [note, setNote] = useState(job.note)
  const [tried, setTried] = useState(false)
  // Each opening starts from the record, and the tab follows the one asked
  // for: React's pattern for state that follows a prop, adjusted during render.
  const [seen, setSeen] = useState({ open, asked })
  if (open !== seen.open || asked !== seen.asked) {
    setSeen({ open, asked })
    setTab(asked)
    if (open && !seen.open) {
      setDraft(job.draft)
      setDescription(job.description)
      setNote(job.note)
      setTried(false)
    }
  }

  const save = () => {
    if (missingFields(draft).length > 0) {
      setTried(true)
      setTab(INFO)
      return
    }
    // The status is the record's: the header changes it at once, not Save.
    const { status: _status, ...fields } = draft
    onSave({ ...fields, title: draft.title.trim(), company: draft.company.trim(), description, note })
  }

  const history = [...job.history].sort((first, second) => second.at.localeCompare(first.at))
  const units = { kilobytes: i18n._('KB'), megabytes: i18n._('MB') }
  // The small line, 12 at 400 on the automatic height. Under an sx key, which
  // the lint rule reads as CSS.
  const small = { sx: { fontSize: `${typeScale.label.size}px`, lineHeight: 'normal', fontWeight: typeScale.body.weight } }

  const info = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${spacing.md}px` }}>
      <JobFields draft={draft} missing={tried ? missingFields(draft) : []} onChange={setDraft} />
      {/* The Link Row, 296:73: the field and, when there is a link, the
          button that opens the posting, at the field's foot. */}
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: `${spacing.xs}px` }}>
        <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
          <Input
            label={i18n._('Posting link')}
            value={draft.postingUrl}
            onChange={(postingUrl) => {
              setDraft({ ...draft, postingUrl })
            }}
          />
        </Box>
        {draft.postingUrl.trim() === '' ? null : (
          <Box
            component="a"
            href={draft.postingUrl.trim()}
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
        )}
      </Box>
      <Rule />
      <Part icon="note" title={i18n._('Job description and responsibilities')}>
        <Area label={i18n._('Job description and responsibilities')} value={description} onChange={setDescription} />
      </Part>
      {job.skills.length === 0 ? null : (
        <Part icon="tag" title={i18n._('Required skills')}>
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
        </Part>
      )}
    </Box>
  )

  // The status history, newest first, 210:75: the status's name at 14 and
  // Medium, and on the other side the day and who made the change.
  const changes = (
    <Box component="ol" sx={{ display: 'flex', flexDirection: 'column', gap: `${spacing.xs}px`, margin: 0, padding: 0, listStyle: 'none' }}>
      {history.map((change) => (
        <Box
          component="li"
          key={change.id}
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: `${spacing.xs}px` }}
        >
          <Box
            component="span"
            sx={(theme) => ({
              fontSize: `${typeScale.body.size}px`,
              lineHeight: `${typeScale.body.lineHeight}px`,
              fontWeight: typeScale.label.weight,
              color: theme.karnama.semantic['text/primary'],
            })}
          >
            {change.status}
          </Box>
          <Box component="span" sx={(theme) => ({ ...small.sx, color: theme.karnama.semantic['text/secondary'] })}>
            {`${formatDay(locale, change.at)} · ${change.automatic ? i18n._('Automatic') : i18n._('Manual')}`}
          </Box>
        </Box>
      ))}
    </Box>
  )

  // The note, 210:127, 200 tall, and when it was last edited.
  const noteTab = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${spacing.md}px` }}>
      <Area label={i18n._('Note')} value={note} onChange={setNote} height={NOTE_HEIGHT} />
      {job.noteEditedAt === null ? null : (
        <Box sx={(theme) => ({ ...small.sx, color: theme.karnama.semantic['text/secondary'] })}>
          {`${i18n._('Last edited:')} ${formatDay(locale, job.noteEditedAt)}`}
        </Box>
      )}
    </Box>
  )

  // The related people, 210:170: each the compact Contact Card, and the dashed
  // «+ افزودن مخاطب» after them, 46 tall, dashed 6 and 4 in the file and CSS's
  // own dash here.
  const people = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${spacing.md}px` }}>
      {job.contacts.map(({ id, contact }) => (
        <ContactCard
          key={id}
          contact={contact}
          layout="compact"
          onOpen={() => {
            onOpenContact(id)
          }}
          onSelectedChange={() => undefined}
          onDelete={() => {
            onDeleteContact(id)
          }}
        />
      ))}
      <ButtonBase
        disableRipple
        onClick={onAddContact}
        sx={(theme) => ({
          position: 'relative',
          gap: `${spacing.xs}px`,
          paddingBlock: `${spacing.sm}px`,
          borderRadius: `${theme.karnama.radius.md}px`,
          borderStyle: 'dashed',
          borderWidth: EDGE,
          borderColor: theme.karnama.semantic['border/default'],
          fontFamily: 'inherit',
          fontSize: `${typeScale.body.size}px`,
          lineHeight: `${typeScale.body.lineHeight}px`,
          fontWeight: typeScale.label.weight,
          color: theme.karnama.semantic['text/brand'],
          ...ring.sx(theme.karnama.semantic['border/focus'], theme.karnama.radius.md),
        })}
      >
        <Icon name="plus" size="sm" color="inherit" />
        {i18n._('Add contact')}
      </ButtonBase>
    </Box>
  )

  // The files, 210:233: each a row of the 40 tile, the name and what it is,
  // and the download at the other end; then the drop zone, where a file can
  // be dropped or chosen.
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
                {[fileKind(file.name), fileSize(locale, file.size, units), formatDay(locale, file.addedAt)]
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

  const labels: Record<JobModalTab, string> = {
    info: i18n._('Job opportunity info'),
    history: i18n._('History'),
    note: i18n._('Note'),
    contacts: i18n._('Related people'),
    files: i18n._('Files'),
  }
  const panels: Record<JobModalTab, ReactNode> = { info, history: changes, note: noteTab, contacts: people, files }

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
      {/* The Header, 210:3: 24 above and at the sides, 16 below. */}
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
          <StatusControl statuses={statuses} value={job.draft.status} onChange={onStatusChange} onAdd={onAddStatus} />
          <Box sx={{ display: 'inline-flex', margin: `-${(spacing.xl - iconSize.md) / 2}px` }}>
            <IconButton icon="x" iconSize="md" aria-label={i18n._('Close')} onClick={onClose} />
          </Box>
        </Box>
      </Box>
      {/* The tabs, 210:14, edge to edge, and the chosen one's panel scrolling
          in the body's 24, 210:27. */}
      <Box
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
      {/* The Footer, 210:86: Cancel and Save at the inline start, the delete at
          the end, in 16 and 24. */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          gap: `${spacing.sm}px`,
          paddingBlock: `${spacing.md}px`,
          paddingInline: `${spacing.lg}px`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: `${spacing.sm}px` }}>
          <Button variant="ghost" onClick={onClose}>
            {i18n._('Cancel')}
          </Button>
          <Button onClick={save}>{i18n._('Save')}</Button>
        </Box>
        <Button variant="destructive" onClick={onDelete}>
          {i18n._('Delete job opportunity')}
        </Button>
      </Box>
    </Dialog>
  )
}
