import type { I18n } from '@lingui/core'
import type { EmploymentType, JobLevel } from './values'

// Each value's name in the reader's language, from the catalog.
export const employmentTypeLabels = (i18n: I18n): Record<EmploymentType, string> => ({
  'full-time': i18n._('Full-time'),
  'part-time': i18n._('Part-time'),
  project: i18n._('Project-based'),
  contract: i18n._('Contract'),
  internship: i18n._('Internship'),
  remote: i18n._('Remote'),
  freelance: i18n._('Freelance'),
  temporary: i18n._('Temporary'),
})

export const jobLevelLabels = (i18n: I18n): Record<JobLevel, string> => ({
  worker: i18n._('Worker'),
  employee: i18n._('Employee'),
  specialist: i18n._('Specialist'),
  'senior-specialist': i18n._('Senior specialist'),
  'middle-manager': i18n._('Middle manager'),
  'senior-manager': i18n._('Deputy or senior manager'),
  'chief-executive': i18n._('Chief executive'),
})
