// The job record's two enumerated fields, DESIGN.md "Enumerated field values".

// Eight employment types, the owner's decision of 2026-09-10, KN-073: the six
// node 408:487 lists, in its order, then freelance and temporary. A job holds
// more than one.
export type EmploymentType = 'full-time' | 'part-time' | 'project' | 'contract' | 'internship' | 'remote' | 'freelance' | 'temporary'
export const EMPLOYMENT_TYPES: readonly EmploymentType[] = [
  'full-time',
  'part-time',
  'project',
  'contract',
  'internship',
  'remote',
  'freelance',
  'temporary',
]
export const isEmploymentType = (value: string): value is EmploymentType => EMPLOYMENT_TYPES.some((type) => type === value)

// Seven job levels, provisional until KN-073 settles them. A job holds one.
export type JobLevel = 'worker' | 'employee' | 'specialist' | 'senior-specialist' | 'middle-manager' | 'senior-manager' | 'chief-executive'
export const JOB_LEVELS: readonly JobLevel[] = [
  'worker',
  'employee',
  'specialist',
  'senior-specialist',
  'middle-manager',
  'senior-manager',
  'chief-executive',
]
export const isJobLevel = (value: string): value is JobLevel => JOB_LEVELS.some((level) => level === value)
