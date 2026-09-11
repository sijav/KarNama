import { useLingui } from '@lingui/react'
import { Select } from '../select'
import { jobLevelLabels } from './labels'
import { JOB_LEVELS, isJobLevel, type JobLevel } from './values'

// The props are documented in story-docs, not here, KN-207.
export interface JobLevelSelectProps {
  value: JobLevel | null
  disabled?: boolean
  onChange: (value: JobLevel) => void
}

// The job level on node 183:26's Select: seven levels, one at a time.
export const JobLevelSelect = ({ value, disabled = false, onChange }: JobLevelSelectProps) => {
  const { i18n } = useLingui()
  const labels = jobLevelLabels(i18n)
  return (
    <Select
      label={i18n._('Job level')}
      options={JOB_LEVELS.map((level) => ({ value: level, label: labels[level] }))}
      value={value === null ? [] : [value]}
      disabled={disabled}
      onChange={(next) => {
        const [level] = next
        if (level !== undefined && isJobLevel(level)) onChange(level)
      }}
    />
  )
}
