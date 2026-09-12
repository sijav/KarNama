import { useLingui } from '@lingui/react'
import { Box } from '@mui/material'
import { useId, useState, type ReactNode } from 'react'
import { spacing } from '../../theme/tokens'
import { Button, type ButtonType } from '../button'
import { Input, type InputDirection } from '../input'
import { Select, type SelectOption } from '../select'
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
  email: string
  phone: string
  linkedin: string
  jobId: string | null
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
  jobs: readonly SelectOption[]
  onSave: (values: ContactModalValues) => void
  onCancel: () => void
  /** Drawn only while editing, but taken either way so a caller can pass one shape. */
  onDelete?: () => void
}

/**
 * Adding takes no record; editing takes the id it is editing and the record,
 * which is undefined until it has loaded. A union rather than optional props,
 * so an Edit that forgets which record it is on cannot be written at all.
 */
export type ContactModalProps =
  // Adding can start from something, a job opportunity already chosen when the
  // person is added from inside one, but it has no record and no id.
  | (ContactModalShared & { mode: 'add'; recordId?: never; initial?: ContactModalValues })
  | (ContactModalShared & { mode: 'edit'; recordId: string; initial: ContactModalRecord | undefined })

// Node 270:152's width, which binds no variable.
const WIDTH = 560

// The email's example, an address and not copy: the same in every language.
type EmailExample = 'name@example.com'
const EMAIL_EXAMPLE: EmailExample = 'name@example.com'
type SocialExample = 'linkedin.com/in/…'
const SOCIAL_EXAMPLE: SocialExample = 'linkedin.com/in/…'

const EMPTY: ContactModalValues = { name: '', role: '', company: '', email: '', phone: '', linkedin: '', jobId: null }

// Two fields side by side, 16 apart, each half the row, as 270:152 pairs the
// company with the role and the phone with the email.
const Pair = ({ children }: { children: ReactNode }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: `${spacing.md}px` }}>{children}</Box>
)

// The Contact Modal of node 270:152, Add and Edit, on the panel modal: the full
// name, the role and the company, the email and the phone, the social link and
// the job opportunity the contact belongs to. A contact saves with a full name
// and nothing else, the owner's decision of KN-071, so only the name can be in
// error. Edit opens filled from the record and offers the delete. Cancel,
// Escape, the close and the scrim discard what was typed; each opening starts
// from the record, or from nothing.
export const ContactModal = ({ open, mode, initial, recordId, jobs, onSave, onCancel, onDelete }: ContactModalProps) => {
  const { i18n } = useLingui()
  const [values, setValues] = useState<ContactModalValues>(EMPTY)
  const [tried, setTried] = useState(false)
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
    setTried(false)
  }

  // Only a record that says it is THIS record. A page that has been told to
  // edit B while it still holds A's values must show nothing of A's, or a
  // reader typing in that one render would write A's details into B.
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
  const set = (field: keyof Omit<ContactModalValues, 'jobId'>) => (value: string) => {
    change({ ...shown, [field]: value })
  }
  const formId = useId()
  const nameMissing = shown.name.trim() === ''
  const save = () => {
    setTried(true)
    if (!nameMissing) onSave({ ...shown, name: shown.name.trim() })
  }
  return (
    <PanelModal
      open={open}
      title={mode === 'add' ? i18n._('Add contact') : i18n._('Edit contact')}
      width={WIDTH}
      onClose={onCancel}
      actions={
        <>
          <Button variant="ghost" onClick={onCancel}>
            {i18n._('Cancel')}
          </Button>
          <Button type={SUBMIT} form={formId}>
            {i18n._('Save')}
          </Button>
        </>
      }
      {...(mode === 'edit' && onDelete !== undefined
        ? {
            aside: (
              <Button variant="destructive" onClick={onDelete}>
                {i18n._('Delete contact')}
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
          save()
        }}
        // The form draws no box of its own, so the fields stay direct children
        // of the modal's body and its gaps are unchanged, KN-463.
        sx={{ display: 'contents' }}
      >
        <Input
          label={i18n._('Full name')}
          placeholder={i18n._('e.g. Sara Mohammadi')}
          value={shown.name}
          onChange={set('name')}
          {...(tried && nameMissing ? { error: i18n._('Write the full name') } : {})}
        />
        <Pair>
          <Input label={i18n._('Role')} placeholder={i18n._('e.g. HR specialist')} value={shown.role} onChange={set('role')} />
          <Input label={i18n._('Company')} placeholder={i18n._('e.g. Digikala')} value={shown.company} onChange={set('company')} />
        </Pair>
        <Pair>
          <Input label={i18n._('Email')} direction={LATIN} placeholder={EMAIL_EXAMPLE} value={shown.email} onChange={set('email')} />
          <Input label={i18n._('Phone')} direction={LATIN} placeholder={i18n._('0912 000 0000')} value={shown.phone} onChange={set('phone')} />
        </Pair>
        <Input label={i18n._('Social link')} direction={LATIN} placeholder={SOCIAL_EXAMPLE} value={shown.linkedin} onChange={set('linkedin')} />
        <Select
          label={i18n._('Related job opportunity')}
          placeholder={i18n._('Choose a job opportunity…')}
          options={jobs}
          value={shown.jobId === null ? [] : [shown.jobId]}
          onChange={(next) => {
            change({ ...shown, jobId: next[0] ?? null })
          }}
        />
      </Box>
    </PanelModal>
  )
}
