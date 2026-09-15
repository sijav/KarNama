import type { EmploymentType, JobLevel } from '../job-selects'
import { isDay } from './days'

// A job opportunity as the add modal holds it before it is saved, DESIGN.md
// section 4: the three required fields, title, company and status, and the
// optional ones the form draws, 150:94. Dates are ISO calendar days, or, on a job
// kept before the date picker, a date as its reader wrote it, KN-494; salary and
// experience may be ranges or other descriptive text.
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
const EXPIRES: Missing = 'expiresAt'
const LINK: Missing = 'postingUrl'

export const validPostingUrl = (value: string): boolean => {
  if (value.trim() === '') return true
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

// A date that is not a day is no reason to refuse a save: the picker makes only
// days, so such a date was written before it and is kept as written, KN-494. An
// expiry before its posting is, and only when both are days, since text compared
// with a day as a string says nothing about which comes first.
export const missingFields = (draft: JobDraft): Missing[] => {
  const invalid = REQUIRED.filter((field) => draft[field].trim() === '')
  if (isDay(draft.postedAt) && isDay(draft.expiresAt) && draft.expiresAt < draft.postedAt) invalid.push(EXPIRES)
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
