import { emptyDraft, type JobDraft } from '../../shared/add-job'
import type { ContactCardContact } from '../../shared/contact-card'
import type { JobContact, JobFile, JobRecord, JobSaved, StatusChange } from '../../shared/job-modal'
import type { SortOrder } from '../../shared/sort-control'
import type { StatusOption } from '../../shared/status-picker'
import { status as statusTokens, type StatusToken } from '../../theme/tokens'

/**
 * What the product holds: job opportunities and the statuses they move
 * between.
 *
 * The screens read and change it through `RecordsProvider`; everything that
 * DECIDES anything is here, as data in and data out, so it is tested without a
 * browser. Nothing here talks to the API yet: the screens came first, KN-042 to
 * KN-046, and the API cards wire them up, KN-037 to KN-039.
 */

/** A job opportunity as the board holds it: the modal's record, with an id. */
export interface JobEntry extends JobRecord {
  id: string
}

/**
 * A person the reader keeps, KN-056.
 *
 * Their own record rather than a field of a job opportunity: the network is a
 * destination of its own, and a contact outlives the posting they were met
 * over. `jobId` links one to a job opportunity when there is one, which is what
 * the job modal's related people tab reads.
 */
export interface ContactEntry {
  id: string
  jobId: string | null
  contact: ContactCardContact
}

export interface Records {
  statuses: readonly StatusOption[]
  jobs: readonly JobEntry[]
  contacts: readonly ContactEntry[]
}

/** The five the design draws, in the board's order: rejected last, KN-070. */
export const DEFAULT_TOKENS: readonly StatusToken[] = ['new', 'applied', 'interview', 'offer', 'rejected']

/** Where a new status's colour comes from: the four reserved slots, then round again. */
const CUSTOM_TOKENS: readonly StatusToken[] = ['custom-1', 'custom-2', 'custom-3', 'custom-4']

const isToken = (value: string): value is StatusToken => value in statusTokens

/** A status's colour token, or the first default for one the design does not name. */
export const tokenOf = (statuses: readonly StatusOption[], id: string): StatusToken =>
  statuses.find((entry) => entry.id === id)?.token ?? 'new'

/** An id nothing else holds, from the clock and a counter, so two in one millisecond differ. */
let made = 0
export const newId = (prefix: string): string => {
  made += 1
  return `${prefix}-${Date.now().toString(36)}-${made.toString(36)}`
}

/** The statuses the product starts with: the five defaults, named by the caller's catalog. */
export const defaultStatuses = (name: (token: StatusToken) => string): StatusOption[] =>
  DEFAULT_TOKENS.map((token) => ({ id: token, token, name: name(token) }))

/** A status added by the reader takes the next reserved colour that is free, else the first. */
export const nextCustomToken = (statuses: readonly StatusOption[]): StatusToken => {
  const taken = new Set(statuses.map((entry) => entry.token))
  return CUSTOM_TOKENS.find((token) => !taken.has(token)) ?? CUSTOM_TOKENS[0] ?? 'new'
}

/**
 * The board's columns: the statuses in the order the board draws them.
 *
 * The five defaults keep the design's order with rejected last, KN-070, and a
 * status the reader added sits before rejected, where the pipeline ends.
 */
export const columnOrder = (statuses: readonly StatusOption[]): StatusOption[] => {
  const rank = (entry: StatusOption) => {
    const at = DEFAULT_TOKENS.indexOf(entry.token)
    // A custom status has no place in the design's order, so it goes before
    // rejected, which is the last column whatever else is on the board.
    return at === -1 ? DEFAULT_TOKENS.length - 1.5 : at
  }
  return [...statuses].sort((one, other) => rank(one) - rank(other))
}

/** A new job opportunity, from what the add flow collected. */
export const jobFrom = (draft: JobDraft, at: string): JobEntry => ({
  id: newId('job'),
  draft,
  description: draft.description ?? '',
  skills: [],
  note: '',
  noteEditedAt: null,
  contacts: [],
  files: [],
  history: [{ id: newId('change'), status: draft.status, at, automatic: false }],
})

/** The same job with what the modal saved written into it, its status left alone, KN-364. */
export const withSaved = (job: JobEntry, saved: JobSaved): JobEntry => ({
  ...job,
  draft: { ...job.draft, ...saved, status: job.draft.status },
  description: saved.description,
  note: saved.note,
  noteEditedAt: saved.note === job.note ? job.noteEditedAt : new Date().toISOString(),
})

/** The same job moved to another status, with the move written into its history. */
export const withStatus = (job: JobEntry, status: string, at: string): JobEntry =>
  job.draft.status === status
    ? job
    : {
        ...job,
        draft: { ...job.draft, status },
        history: [...job.history, { id: newId('change'), status, at, automatic: false }],
      }

/** Everything a search matches: what a reader would look for by eye. */
const searchable = (job: JobEntry) => [job.draft.title, job.draft.company, job.draft.location, job.description, job.note]

export const matches = (job: JobEntry, search: string): boolean => {
  const wanted = search.trim().toLocaleLowerCase()
  if (wanted === '') return true
  return searchable(job).some((field) => field.toLocaleLowerCase().includes(wanted))
}

/** Sorting is the design's four orders, from the Sort Control, DESIGN.md section 3. */
const dayOf = (job: JobEntry) => job.draft.postedAt

// A job with no deadline sorts after every job that has one, rather than first:
// an empty string would otherwise lead, and a posting without an expiry is the
// least urgent thing on the board, not the most.
const deadlineOf = (job: JobEntry) => (job.draft.expiresAt === '' ? '￿' : job.draft.expiresAt)

export const sortJobs = (jobs: readonly JobEntry[], order: SortOrder): JobEntry[] => {
  const sorted = [...jobs]
  if (order === 'newest') return sorted.sort((one, other) => dayOf(other).localeCompare(dayOf(one)))
  if (order === 'oldest') return sorted.sort((one, other) => dayOf(one).localeCompare(dayOf(other)))
  if (order === 'deadline') return sorted.sort((one, other) => deadlineOf(one).localeCompare(deadlineOf(other)))
  return sorted.sort((one, other) => one.draft.company.localeCompare(other.draft.company))
}

/** The jobs of one column, searched and sorted, as the board draws them. */
export const jobsIn = (jobs: readonly JobEntry[], statusId: string, search: string, order: SortOrder): JobEntry[] =>
  sortJobs(
    jobs.filter((job) => job.draft.status === statusId && matches(job, search)),
    order,
  )

/** An empty record set, for a reader who has added nothing yet. */
export const emptyRecords = (name: (token: StatusToken) => string): Records => ({
  statuses: defaultStatuses(name),
  jobs: [],
  contacts: [],
})

/** The people kept against one job opportunity, for its related people tab. */
export const contactsOf = (contacts: readonly ContactEntry[], jobId: string): JobContact[] =>
  contacts.filter((held) => held.jobId === jobId).map((held) => ({ id: held.id, contact: held.contact }))

/** Everything a search matches in a person: what a reader would look for by eye. */
export const contactMatches = (held: ContactEntry, search: string): boolean => {
  const wanted = search.trim().toLocaleLowerCase()
  if (wanted === '') return true
  return [held.contact.name, held.contact.role, held.contact.company, held.contact.email, held.contact.phone].some((field) =>
    (field ?? '').toLocaleLowerCase().includes(wanted),
  )
}

/** A draft for the add flow, opened on a column. */
export const draftForColumn = (statusId: string): JobDraft => emptyDraft(statusId)

/** What is kept between visits, and read back a field at a time so an older shape still opens. */
export const isRecords = (value: unknown): value is Records => {
  if (typeof value !== 'object' || value === null) return false
  const held: Record<string, unknown> = { ...value }
  return Array.isArray(held.statuses) && Array.isArray(held.jobs)
}

/** Whether a stored value is a person the network can draw. */
const isContact = (value: unknown): value is ContactEntry =>
  typeof value === 'object' && value !== null && 'id' in value && typeof value.id === 'string' && 'contact' in value && 'jobId' in value

/** A stored set, with anything it no longer understands dropped rather than thrown away whole. */
export const readRecords = (raw: unknown, fallback: Records): Records => {
  if (!isRecords(raw)) return fallback
  const statuses = raw.statuses.filter((entry): entry is StatusOption => typeof entry.id === 'string' && isToken(entry.token))
  if (statuses.length === 0) return fallback
  const ids = new Set(statuses.map((entry) => entry.id))
  const jobs = raw.jobs.filter((job) => typeof job.id === 'string' && ids.has(job.draft.status))
  // A board stored before the network had contacts of its own simply has none,
  // rather than failing to open, KN-056.
  const held: unknown[] = Array.isArray(raw.contacts) ? raw.contacts : []
  return { statuses, jobs, contacts: held.filter(isContact) }
}

export type { JobContact, JobFile, StatusChange }
