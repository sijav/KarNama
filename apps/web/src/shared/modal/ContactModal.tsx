import { useLingui } from '@lingui/react'
import { Box } from '@mui/material'
import { useState, type ReactNode } from 'react'
import { spacing } from '../../theme/tokens'
import { Button } from '../button'
import { Input } from '../input'
import { Select, type SelectOption } from '../select'
import { PanelModal } from './PanelModal'

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
export interface ContactModalProps {
  open: boolean
  mode: 'add' | 'edit'
  initial?: ContactModalValues
  jobs: readonly SelectOption[]
  onSave: (values: ContactModalValues) => void
  onCancel: () => void
  onDelete?: () => void
}

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
export const ContactModal = ({ open, mode, initial, jobs, onSave, onCancel, onDelete }: ContactModalProps) => {
  const { i18n } = useLingui()
  const start = initial ?? EMPTY
  const [values, setValues] = useState(start)
  const [tried, setTried] = useState(false)
  // React's pattern for state that follows a prop, adjusted during render: an
  // opening, or another record, starts the form again.
  const [seen, setSeen] = useState({ open, start })
  if (seen.open !== open || seen.start !== start) {
    setSeen({ open, start })
    setValues(start)
    setTried(false)
  }
  const set = (field: keyof Omit<ContactModalValues, 'jobId'>) => (value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
  }
  const nameMissing = values.name.trim() === ''
  const save = () => {
    setTried(true)
    if (!nameMissing) onSave({ ...values, name: values.name.trim() })
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
          <Button onClick={save}>{i18n._('Save')}</Button>
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
      <Input
        label={i18n._('Full name')}
        placeholder={i18n._('e.g. Sara Mohammadi')}
        value={values.name}
        onChange={set('name')}
        {...(tried && nameMissing ? { error: i18n._('Write the full name') } : {})}
      />
      <Pair>
        <Input label={i18n._('Role')} placeholder={i18n._('e.g. HR specialist')} value={values.role} onChange={set('role')} />
        <Input label={i18n._('Company')} placeholder={i18n._('e.g. Digikala')} value={values.company} onChange={set('company')} />
      </Pair>
      <Pair>
        <Input label={i18n._('Email')} placeholder={EMAIL_EXAMPLE} value={values.email} onChange={set('email')} />
        <Input label={i18n._('Phone')} placeholder={i18n._('0912 000 0000')} value={values.phone} onChange={set('phone')} />
      </Pair>
      <Input label={i18n._('Social link')} placeholder={SOCIAL_EXAMPLE} value={values.linkedin} onChange={set('linkedin')} />
      <Select
        label={i18n._('Related job opportunity')}
        placeholder={i18n._('Choose a job opportunity…')}
        options={jobs}
        value={values.jobId === null ? [] : [values.jobId]}
        onChange={(next) => {
          setValues((current) => ({ ...current, jobId: next[0] ?? null }))
        }}
      />
    </PanelModal>
  )
}
