import { useLingui } from '@lingui/react'
import { Box } from '@mui/material'
import { spacing } from '../../theme/tokens'
import { Input } from '../input'
import { EmploymentTypeSelect, JobLevelSelect } from '../job-selects'
import { StatusPicker, type StatusOption } from '../status-picker'
import type { JobDraft, Missing } from './draft'

export interface JobFormProps {
  draft: JobDraft
  statuses: readonly StatusOption[]
  missing: readonly Missing[]
  onChange: (draft: JobDraft) => void
  onAddStatus: () => void
}

// The form of node 150:94, 420 tall inside the modal's 606, scrolling beyond.
const FORM_HEIGHT = 420

// The two fields that can be missing, typed so the lint rule reads them as
// values and not as copy.
const TITLE: Missing = 'title'
const COMPANY: Missing = 'company'

// The form of Review and Manual, one form, DESIGN.md section 4: the only
// difference is whether it arrives filled. Two columns of 248 with 16 between,
// from the inline start: the title and the company, both required; employment
// type and location; experience and level; the posting and the salary; the
// source and the expiry; then the posting's link across the row, and the
// status. On a phone's width, one column. It scrolls in its 420, its bar in the
// modal's padding at the inline end so the fields keep their width.
export const JobForm = ({ draft, statuses, missing, onChange, onAddStatus }: JobFormProps) => {
  const { i18n } = useLingui()
  const text = (key: 'location' | 'experience' | 'postedAt' | 'salary' | 'source' | 'expiresAt' | 'postingUrl', label: string) => (
    <Input
      label={label}
      value={draft[key]}
      onChange={(value) => {
        onChange({ ...draft, [key]: value })
      }}
    />
  )
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: `${spacing.md}px`,
        maxHeight: FORM_HEIGHT,
        overflowY: 'auto',
        marginInlineEnd: `-${spacing.lg}px`,
        paddingInlineEnd: `${spacing.lg}px`,
      }}
    >
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, alignItems: 'start', gap: `${spacing.md}px` }}>
        <Input
          label={i18n._('Job title')}
          required
          value={draft.title}
          onChange={(title) => {
            onChange({ ...draft, title })
          }}
          {...(missing.includes(TITLE) ? { error: i18n._('Write the job title') } : {})}
        />
        <Input
          label={i18n._('Company name')}
          required
          value={draft.company}
          onChange={(company) => {
            onChange({ ...draft, company })
          }}
          {...(missing.includes(COMPANY) ? { error: i18n._('Write the company name') } : {})}
        />
        <EmploymentTypeSelect
          value={draft.employmentTypes}
          onChange={(employmentTypes) => {
            onChange({ ...draft, employmentTypes })
          }}
        />
        {text('location', i18n._('Location'))}
        {text('experience', i18n._('Required experience'))}
        <JobLevelSelect
          value={draft.jobLevel}
          onChange={(jobLevel) => {
            onChange({ ...draft, jobLevel })
          }}
        />
        {text('postedAt', i18n._('Posted on'))}
        {text('salary', i18n._('Salary'))}
        {text('source', i18n._('Source'))}
        {text('expiresAt', i18n._('Expires on'))}
      </Box>
      {text('postingUrl', i18n._('Posting link'))}
      <StatusPicker
        statuses={statuses}
        value={draft.status}
        onChange={(status) => {
          onChange({ ...draft, status })
        }}
        onAdd={onAddStatus}
      />
    </Box>
  )
}
