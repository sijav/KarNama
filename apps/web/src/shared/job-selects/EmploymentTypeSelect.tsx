import { useLingui } from '@lingui/react'
import { Select } from '../select'
import { employmentTypeLabels } from './labels'
import { EMPLOYMENT_TYPES, isEmploymentType, type EmploymentType } from './values'

// The props are documented in story-docs, not here, KN-207.
export interface EmploymentTypeSelectProps {
  value: readonly EmploymentType[]
  disabled?: boolean
  onChange: (value: EmploymentType[]) => void
}

// The file's own specimen of node 183:26, «نوع همکاری»: the eight employment
// types, more than one at a time.
export const EmploymentTypeSelect = ({ value, disabled = false, onChange }: EmploymentTypeSelectProps) => {
  const { i18n } = useLingui()
  const labels = employmentTypeLabels(i18n)
  return (
    <Select
      label={i18n._('Employment type')}
      options={EMPLOYMENT_TYPES.map((type) => ({ value: type, label: labels[type] }))}
      value={value}
      multiple
      disabled={disabled}
      onChange={(next) => {
        onChange(next.filter(isEmploymentType))
      }}
    />
  )
}
