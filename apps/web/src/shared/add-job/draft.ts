import type { EmploymentType, JobLevel } from '../job-selects'

// A job opportunity as the add modal holds it before it is saved, DESIGN.md
// section 4: the three required fields, title, company and status, and the
// optional ones the form draws, 150:94. Dates are ISO calendar days; salary
// and experience may be ranges or other descriptive text.
export interface JobDraft {
  title: string
  company: string
  employmentTypes: EmploymentType[]
  location: string
  experience: string
  jobLevel: JobLevel | null
  postedAt: string
  salary: string
  source: string
  expiresAt: string
  postingUrl: string
  status: string
  description?: string
}

// The form with nothing in it, in the status a new job opportunity starts in.
export const emptyDraft = (status: string): JobDraft => ({
  title: '',
  company: '',
  employmentTypes: [],
  location: '',
  experience: '',
  jobLevel: null,
  postedAt: '',
  salary: '',
  source: '',
  expiresAt: '',
  postingUrl: '',
  status,
})

// Whether what was pasted is a link rather than the text of a posting: one
// run of text with no space, starting with http or https.
export const isLink = (source: string): boolean => /^https?:\/\/\S+$/iu.test(source.trim())

// The draft reading a posting gives, over the empty one: what was found, and
// the pasted link as the posting's link when reading found none.
export const draftFrom = (status: string, source: string, found: Partial<JobDraft>): JobDraft => {
  const draft = { ...emptyDraft(status), ...(isLink(source) ? {} : { description: source.trim() }), ...found }
  return draft.postingUrl === '' && isLink(source) ? { ...draft, postingUrl: source.trim() } : draft
}

// Missing required values and invalid optional values share inline feedback.
export type Missing = 'title' | 'company' | 'postedAt' | 'expiresAt' | 'postingUrl'
const REQUIRED: readonly Missing[] = ['title', 'company']
const POSTED: Missing = 'postedAt'
const EXPIRES: Missing = 'expiresAt'
const LINK: Missing = 'postingUrl'
const validDay = (value: string): boolean => {
  if (value === '') return true
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(value)) return false
  const [year = 0, month = 1, day = 1] = value.split('-').map(Number)
  const date = new Date(0)
  date.setUTCFullYear(year, month - 1, day)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export const validPostingUrl = (value: string): boolean => {
  if (value.trim() === '') return true
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

export const missingFields = (draft: JobDraft): Missing[] => {
  const invalid = REQUIRED.filter((field) => draft[field].trim() === '')
  if (!validDay(draft.postedAt)) invalid.push(POSTED)
  if (
    !validDay(draft.expiresAt) ||
    (validDay(draft.postedAt) && draft.postedAt !== '' && draft.expiresAt !== '' && draft.expiresAt < draft.postedAt)
  ) {
    invalid.push(EXPIRES)
  }
  if (!validPostingUrl(draft.postingUrl)) invalid.push(LINK)
  return invalid
}

// Whether the reader has put anything in the form, which is what makes
// leaving it ask first.
export const hasContent = (draft: JobDraft): boolean =>
  draft.employmentTypes.length > 0 ||
  draft.jobLevel !== null ||
  [
    draft.title,
    draft.company,
    draft.location,
    draft.experience,
    draft.postedAt,
    draft.salary,
    draft.source,
    draft.expiresAt,
    draft.postingUrl,
    draft.description ?? '',
  ].some((value) => value.trim() !== '')
