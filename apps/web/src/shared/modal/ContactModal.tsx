import { useLingui } from '@lingui/react'
import { Box } from '@mui/material'
import { useId, useState, type ReactNode } from 'react'
import { spacing } from '../../theme/tokens'
import { Button, type ButtonType } from '../button'
import { Input, type InputDirection } from '../input'
import { LabelPicker, type PersonLabel } from '../label-picker'
import { LinkedJobs, type LinkedJobItem } from '../linked-jobs'
import { PanelModal } from './PanelModal'

// A field of latin data: a phone number, an email or a link runs left to right
// whatever the page does, KN-458. Typed so the lint rule reads it as a value
// rather than as copy.
const LATIN: InputDirection = 'ltr'

// The button that finishes the form, typed for the same reason.
const SUBMIT: ButtonType = 'submit'

export interface ContactModalValues {
  name: string
  role: string
  company: string
  // The relationship label: a default's id, one of the reader's own, or none.
  label: string | null
  email: string
  phone: string
  linkedin: string
  // The job opportunities the person is linked to, in the order they were linked.
  jobIds: readonly string[]
}

// The props are documented in story-docs, not here, KN-207.
/**
 * A record the modal is editing, carrying the id of the record it belongs to.
 *
 * The id travels WITH the values, KN-386: a page loads the record after it
 * knows which record it wants, so there is a render where the modal has been
 * told the new id and still holds the old one's values. Without the id on the
 * payload the modal cannot tell that apart from the values having arrived, and
 * a reader who types in that render writes one contact's details into another's
 * record.
 */
export interface ContactModalRecord {
  id: string
  values: ContactModalValues
}

interface ContactModalShared {
  open: boolean
  jobs: readonly LinkedJobItem[]
  labels: readonly PersonLabel[]
  onCreateLabel: (name: string) => string
  onRenameLabel: (id: string, name: string) => void
  onDeleteLabel: (id: string) => void
  onSave: (values: ContactModalValues) => void
  onCancel: () => void
}

/**
 * Adding takes no record; editing takes the id it is editing, the record, which
 * is undefined until it has loaded, and the delete it offers. A union rather
 * than optional props, so an Edit that forgets which record it is on, or its
 * delete, cannot be written at all, KN-348.
 */
export type ContactModalProps =
  // Adding can start from something, a job opportunity already linked when the
  // person is added from inside one, but it has no record and no id.
  | (ContactModalShared & { mode: 'add'; recordId?: never; initial?: ContactModalValues; onDelete?: never })
  | (ContactModalShared & { mode: 'edit'; recordId: string; initial: ContactModalRecord | undefined; onDelete: () => void })

// Node 270:152's width, which binds no variable.
const WIDTH = 560

// The email's example, an address and not copy: the same in every language.
type EmailExample = 'name@example.com'
const EMAIL_EXAMPLE: EmailExample = 'name@example.com'
type SocialExample = 'linkedin.com/in/…'
const SOCIAL_EXAMPLE: SocialExample = 'linkedin.com/in/…'

const EMPTY: ContactModalValues = { name: '', role: '', company: '', label: null, email: '', phone: '', linkedin: '', jobIds: [] }

// What a save hands over: the name, the role and the company without the spaces
// round them, so a role of only spaces is nothing, KN-385; and of the job
// opportunities linked, only those still on the board, so one another tab
// deleted is let go, KN-598.
const outgoing = (values: ContactModalValues, jobs: readonly LinkedJobItem[]): ContactModalValues => ({
  ...values,
  name: values.name.trim(),
  role: values.role.trim(),
  company: values.company.trim(),
  jobIds: values.jobIds.filter((id) => jobs.some((job) => job.id === id)),
})

// Whether two forms hold the same person: every field, the label, and the same
// job opportunities, whatever order they were linked in.
const same = (one: ContactModalValues, other: ContactModalValues) =>
  one.name === other.name &&
  one.role === other.role &&
  one.company === other.company &&
  one.label === other.label &&
  one.email === other.email &&
  one.phone === other.phone &&
  one.linkedin === other.linkedin &&
  one.jobIds.length === other.jobIds.length &&
  one.jobIds.every((id) => other.jobIds.includes(id))

// Two fields side by side, 16 apart, each half the row, as 270:152 pairs the
// company with the role and the phone with the email.
const Pair = ({ children }: { children: ReactNode }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${spacing.md}px` }}>{children}</Box>
)

// The Contact Modal of node 270:152 as the redesign draws it, Add and Edit, on
// the panel modal: «افزودن به شبکه» or «ویرایش اطلاعات»; the full name, the role
// beside the company, the relationship label, the email beside the phone, the
// social link, and the job opportunities the person is linked to. A person
// saves with a full name and nothing else, the owner's decision of KN-071, so
// the primary, «افزودن» or «ذخیره», is off until there is a name and, in Edit,
// until something differs from the record. Edit opens filled from the record
// and offers «حذف از شبکه» at the footer's inline start. Cancel, Escape, the
// close and the scrim discard what was typed; each opening starts from the
// record, or from nothing. Labels made, renamed or deleted here are the
// reader's, and change at once.
export const ContactModal = ({
  open,
  mode,
  initial,
  recordId,
  jobs,
  labels,
  onCreateLabel,
  onRenameLabel,
  onDeleteLabel,
  onSave,
  onCancel,
  onDelete,
}: ContactModalProps) => {
  const { i18n } = useLingui()
  const [values, setValues] = useState<ContactModalValues>(EMPTY)
  // React's pattern for state that follows a prop, adjusted during render: an
  // opening, or another record by its id, starts the form again. Never a new
  // object with the same record in it, which a parent that renders again for a
  // query or a timer hands over, and which put the record back over what was
  // being typed, KN-347.
  // The form FOLLOWS the record until the reader edits it, and never after,
  // KN-386. That makes a record arriving late, and a record arriving after its
  // own id, the same case: while nothing has been typed, what the form shows is
  // simply whatever record is currently known.
  const [edited, setEdited] = useState(false)
  const [seen, setSeen] = useState({ open, recordId, mode })
  if (seen.open !== open || seen.recordId !== recordId || seen.mode !== mode) {
    setSeen({ open, recordId, mode })
    setValues(EMPTY)
    setEdited(false)
  }

  // For an edit, only a record that says it is THIS record: a page told to edit
  // B while it still holds A's values must show nothing of A's, or a reader
  // typing in that one render would write A's details into B. For an add, what
  // the form starts from.
  const known = mode === 'edit' ? (initial?.id === recordId ? initial.values : undefined) : initial
  const shown = edited ? values : (known ?? EMPTY)

  const change = (next: ContactModalValues) => {
    setValues(next)
    setEdited(true)
  }
  const set = (field: 'name' | 'role' | 'company' | 'email' | 'phone' | 'linkedin') => (value: string) => {
    change({ ...shown, [field]: value })
  }
  const formId = useId()
  const leaving = outgoing(shown, jobs)
  // The primary is off until it can save, so the form submits only when it can:
  // a disabled default button takes Enter from the fields with it.
  const ready = leaving.name !== '' && (mode === 'add' || !same(leaving, outgoing(known ?? EMPTY, jobs)))
  const linked = leaving.jobIds.flatMap((id) => jobs.filter((job) => job.id === id))
  return (
    <PanelModal
      open={open}
      title={mode === 'add' ? i18n._('Add to network') : i18n._('Edit details')}
      width={WIDTH}
      onClose={onCancel}
      actions={
        <>
          <Button variant="ghost" onClick={onCancel}>
            {i18n._('Cancel')}
          </Button>
          <Button type={SUBMIT} form={formId} disabled={!ready}>
            {mode === 'add' ? i18n._('Add') : i18n._('Save')}
          </Button>
        </>
      }
      {...(mode === 'edit'
        ? {
            aside: (
              <Button variant="destructive" onClick={onDelete}>
                {i18n._('Delete from network')}
              </Button>
            ),
          }
        : {})}
    >
      <Box
        component="form"
        noValidate
        id={formId}
        onSubmit={(event) => {
          event.preventDefault()
          onSave(leaving)
        }}
        // The form draws no box of its own, so the fields stay direct children
        // of the modal's body and its gaps are unchanged, KN-463.
        sx={{ display: 'contents' }}
      >
        <Input
          label={i18n._('Full name')}
          autoComplete="off"
          enterKeyHint="done"
          placeholder={i18n._('e.g. Sara Mohammadi')}
          value={shown.name}
          onChange={set('name')}
        />
        <Pair>
          <Input
            label={i18n._('Role')}
            autoComplete="off"
            enterKeyHint="done"
            placeholder={i18n._('e.g. HR specialist')}
            value={shown.role}
            onChange={set('role')}
          />
          <Input
            label={i18n._('Company')}
            autoComplete="off"
            enterKeyHint="done"
            placeholder={i18n._('e.g. Digikala')}
            value={shown.company}
            onChange={set('company')}
          />
        </Pair>
        <LabelPicker
          value={shown.label}
          labels={labels}
          onChange={(label) => {
            change({ ...shown, label })
          }}
          onCreate={(name) => {
            change({ ...shown, label: onCreateLabel(name) })
          }}
          onRename={onRenameLabel}
          onDelete={(id) => {
            onDeleteLabel(id)
            if (shown.label === id) change({ ...shown, label: null })
          }}
        />
        <Pair>
          <Input
            label={i18n._('Email')}
            type="email"
            autoComplete="off"
            enterKeyHint="done"
            direction={LATIN}
            placeholder={EMAIL_EXAMPLE}
            value={shown.email}
            onChange={set('email')}
          />
          <Input
            label={i18n._('Phone')}
            type="tel"
            autoComplete="off"
            enterKeyHint="done"
            direction={LATIN}
            placeholder={i18n._('0912 000 0000')}
            value={shown.phone}
            onChange={set('phone')}
          />
        </Pair>
        <Input
          label={i18n._('Social link')}
          type="url"
          autoComplete="off"
          enterKeyHint="done"
          direction={LATIN}
          placeholder={SOCIAL_EXAMPLE}
          value={shown.linkedin}
          onChange={set('linkedin')}
        />
        <LinkedJobs
          linked={linked}
          jobs={jobs}
          // Linked Jobs offers only what is not linked yet.
          onLink={(id) => {
            change({ ...shown, jobIds: [...shown.jobIds, id] })
          }}
          onUnlink={(id) => {
            change({ ...shown, jobIds: shown.jobIds.filter((entry) => entry !== id) })
          }}
        />
      </Box>
    </PanelModal>
  )
}
