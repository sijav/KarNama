import type { Locale } from '../../i18n'
// The board's own order and the product's own records, taken from the product
// rather than restated here.
import { columnOrder, jobFrom, type Records } from '../../core/records'
import { status, type StatusToken } from '../../theme/tokens'
import { emptyDraft } from '../add-job/draft'
import type { StatusOption } from '../status-picker'
import enUS from './en-US.json'
import faIR from './fa-IR.json'

// Sample record data for stories, in both languages: statuses, job
// opportunities, contacts and notes, each set holding a long value so a story
// shows the truncation the design relies on. Storybook only: nothing that
// ships imports this folder, which story-fixtures.test.ts asserts. The data
// lives in JSON because it is Persian and English record data, and AGENTS.md
// keeps Persian literals out of .ts files.
//
// There is no seed step and no store: each set is parsed once, frozen, and
// read. So a Docs page rendering every story at once reads the same objects
// from each, and nothing can interleave or be written twice, KN-062.

export interface StatusFixture {
  token: StatusToken
  name: string
}

export interface JobFixture {
  id: string
  title: string
  company: string
  status: StatusToken
  location: string
  postedAt: string
  link: string | null
}

export interface ContactFixture {
  id: string
  fullName: string
  role: string
  company: string | null
  email: string | null
  phone: string | null
  linkedin: string | null
  jobId: string | null
}

// What reading a posting finds beyond its title and company, the add modal's
// Review step, node 150:94, in each language.
export interface ExtractionFixture {
  location: string
  experience: string
  salary: string
  postedAt: string
  expiresAt: string
  source: string
  postingUrl: string
}

// The rest of a job opportunity's record the Job Modal, 210:276, shows: its
// description and skills, when its note was last edited, its files, and its
// status history, oldest first, as it is recorded.
export interface JobFileFixture {
  id: string
  name: string
  size: number
  addedAt: string
}
export interface StatusChangeFixture {
  id: string
  status: StatusToken
  at: string
  automatic: boolean
}
export interface JobDetailFixture {
  description: string
  skills: readonly string[]
  noteEditedAt: string
  files: readonly JobFileFixture[]
  history: readonly StatusChangeFixture[]
}

// Status names whose script does not match the interface, for the Status
// Chip's direction, KN-264: one led by a Latin word, one led by digits, and one
// with no letter at all. Record data, the same in both languages.
export interface MixedStatusNamesFixture {
  latinLed: string
  digitLed: string
  noLetters: string
  markLed: string
}

export interface NoteFixture {
  id: string
  jobId: string
  text: string
}

/**
 * One column of the seeded board: a status, in the product's own shape with its
 * id, KN-437, and the job opportunities in it.
 *
 * Built rather than written, KN-305: a board authored beside the jobs would
 * drift from them the first time a job's status changed, and every Board story
 * would go on drawing a board nobody had looked at. The columns come out of the
 * statuses and the jobs through the product's OWN `columnOrder`, so what the
 * fixtures hold is the order the board really draws, rejected last, KN-070.
 */
export interface BoardColumnFixture extends StatusOption {
  jobs: readonly JobFixture[]
}

export interface Fixtures {
  statuses: readonly StatusFixture[]
  /**
   * The same statuses in the product's own shape, the token as the id as the
   * product's defaults have it, for anything that takes a `StatusOption`, KN-437.
   */
  statusOptions: readonly StatusOption[]
  // Each status's name by its token, every one of the nine present.
  names: Readonly<Record<StatusToken, string>>
  renamedStatus: StatusFixture
  longStatusName: string
  jobs: readonly JobFixture[]
  contacts: readonly ContactFixture[]
  notes: readonly NoteFixture[]
  extraction: ExtractionFixture
  jobDetail: JobDetailFixture
  mixedStatusNames: MixedStatusNamesFixture
  /** The statuses in the board's order, each with its own job opportunities. */
  board: readonly BoardColumnFixture[]
  /**
   * The fixtures as the product keeps them, for a story to seed a
   * `RecordsProvider` with, KN-437: every status, every job opportunity made by
   * the product's own `jobFrom` under the fixture's id, and every contact on the
   * job opportunity the fixture names.
   */
  records: Records
}

// The shape of one locale's JSON, with its status tokens still plain strings.
export interface RawFixtures {
  statuses: readonly { token: string; name: string }[]
  renamedStatus: { token: string; name: string }
  longStatusName: string
  jobs: readonly (Omit<JobFixture, 'status'> & { status: string })[]
  contacts: readonly ContactFixture[]
  notes: readonly NoteFixture[]
  extraction: ExtractionFixture
  jobDetail: Omit<JobDetailFixture, 'history'> & { history: readonly (Omit<StatusChangeFixture, 'status'> & { status: string })[] }
  mixedStatusNames: MixedStatusNamesFixture
}

const isToken = (value: string): value is StatusToken => value in status

const tokenOf = (value: string): StatusToken => {
  if (!isToken(value)) throw new Error(`a story fixture names a status that does not exist: ${value}`)
  return value
}

// Frozen all the way down, so a story seeding a provider with the records cannot
// change what another story reads.
const freeze = (value: unknown): void => {
  if (typeof value !== 'object' || value === null) return
  for (const inner of Object.values(value)) freeze(inner)
  Object.freeze(value)
}

// The fixtures as the product keeps them, KN-437. Each job opportunity is made by
// the product's own jobFrom, in its own status and under the fixture's id, added
// a day apart, built rather than written; each contact is on the job opportunity
// the fixture names.
const recordsOf = (statuses: readonly StatusOption[], jobs: readonly JobFixture[], contacts: readonly ContactFixture[]): Records => {
  const records: Records = {
    statuses,
    jobs: jobs.map((job, at) => ({
      ...jobFrom(
        {
          ...emptyDraft(job.status),
          title: job.title,
          company: job.company,
          location: job.location,
          postedAt: job.postedAt,
          postingUrl: job.link ?? '',
        },
        new Date(Date.UTC(2026, 8, at + 1, 9)).toISOString(),
      ),
      id: job.id,
    })),
    contacts: contacts.map((contact) => ({
      id: contact.id,
      jobId: contact.jobId,
      contact: {
        name: contact.fullName,
        role: contact.role,
        company: contact.company,
        email: contact.email,
        phone: contact.phone,
        linkedin: contact.linkedin,
        job: null,
      },
    })),
  }
  freeze(records)
  return records
}

// Parsed into the typed shape, every status token checked against the nine
// and every one of the nine named, and frozen all the way down, so no story
// can change what another reads.
export const parseFixtures = (raw: RawFixtures): Fixtures => {
  const statusOf = (entry: RawFixtures['renamedStatus']): StatusFixture => Object.freeze({ ...entry, token: tokenOf(entry.token) })
  const statuses = raw.statuses.map(statusOf)
  const statusOptions = Object.freeze(statuses.map((entry) => Object.freeze({ id: entry.token, token: entry.token, name: entry.name })))
  const jobs = Object.freeze(raw.jobs.map((job) => Object.freeze({ ...job, status: tokenOf(job.status) })))
  const contacts = Object.freeze(raw.contacts.map((contact) => Object.freeze({ ...contact })))
  const nameOf = (token: StatusToken) => {
    const found = statuses.find((entry) => entry.token === token)
    if (!found) throw new Error(`the story fixtures have no status ${token}`)
    return found.name
  }
  const names: Record<StatusToken, string> = {
    new: nameOf('new'),
    applied: nameOf('applied'),
    interview: nameOf('interview'),
    rejected: nameOf('rejected'),
    offer: nameOf('offer'),
    'custom-1': nameOf('custom-1'),
    'custom-2': nameOf('custom-2'),
    'custom-3': nameOf('custom-3'),
    'custom-4': nameOf('custom-4'),
  }
  return Object.freeze({
    statuses: Object.freeze(statuses),
    statusOptions,
    names: Object.freeze(names),
    renamedStatus: statusOf(raw.renamedStatus),
    longStatusName: raw.longStatusName,
    jobs,
    contacts,
    notes: Object.freeze(raw.notes.map((note) => Object.freeze({ ...note }))),
    extraction: Object.freeze({ ...raw.extraction }),
    jobDetail: Object.freeze({
      ...raw.jobDetail,
      skills: Object.freeze([...raw.jobDetail.skills]),
      files: Object.freeze(raw.jobDetail.files.map((file) => Object.freeze({ ...file }))),
      history: Object.freeze(raw.jobDetail.history.map((change) => Object.freeze({ ...change, status: tokenOf(change.status) }))),
    }),
    mixedStatusNames: Object.freeze({ ...raw.mixedStatusNames }),
    board: Object.freeze(
      columnOrder(statusOptions).map((column) =>
        Object.freeze({ ...column, jobs: Object.freeze(jobs.filter((job) => job.status === column.token)) }),
      ),
    ),
    records: recordsOf(statusOptions, jobs, contacts),
  })
}

const rawFa: RawFixtures = faIR
const rawEn: RawFixtures = enUS
const SETS: Record<Locale, Fixtures> = { 'fa-IR': parseFixtures(rawFa), 'en-US': parseFixtures(rawEn) }

// One locale's sample data.
export const fixtures = (locale: Locale): Fixtures => SETS[locale]

// A status's sample name in a locale, by its token.
export const statusName = (locale: Locale, token: StatusToken): string => SETS[locale].names[token]
