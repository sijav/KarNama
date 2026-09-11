import type { EmploymentType, JobLevel } from '../job-selects'

// A job opportunity as the add modal holds it before it is saved, DESIGN.md
// section 4: the three required fields, title, company and status, and the
// optional ones the form draws, 150:94. The dates, the experience and the
// salary are kept as the reader wrote them; reading them is the saving side's.
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
  const draft = { ...emptyDraft(status), ...found }
  return draft.postingUrl === '' && isLink(source) ? { ...draft, postingUrl: source.trim() } : draft
}

// The required fields a draft still lacks. Status always has a value, so only
// the title and the company can be missing.
export type Missing = 'title' | 'company'
const REQUIRED: readonly Missing[] = ['title', 'company']
export const missingFields = (draft: JobDraft): Missing[] => REQUIRED.filter((field) => draft[field].trim() === '')

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
  ].some((value) => value.trim() !== '')
