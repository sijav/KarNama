import type { Locale } from '../../i18n'
import { status, type StatusToken } from '../../theme/tokens'
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
  count: number
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

export interface NoteFixture {
  id: string
  jobId: string
  text: string
}

export interface Fixtures {
  statuses: readonly StatusFixture[]
  // Each status's name by its token, every one of the nine present.
  names: Readonly<Record<StatusToken, string>>
  renamedStatus: StatusFixture
  longStatusName: string
  jobs: readonly JobFixture[]
  contacts: readonly ContactFixture[]
  notes: readonly NoteFixture[]
}

// The shape of one locale's JSON, with its status tokens still plain strings.
export interface RawFixtures {
  statuses: readonly { token: string; name: string; count: number }[]
  renamedStatus: { token: string; name: string; count: number }
  longStatusName: string
  jobs: readonly (Omit<JobFixture, 'status'> & { status: string })[]
  contacts: readonly ContactFixture[]
  notes: readonly NoteFixture[]
}

const isToken = (value: string): value is StatusToken => value in status

const tokenOf = (value: string): StatusToken => {
  if (!isToken(value)) throw new Error(`a story fixture names a status that does not exist: ${value}`)
  return value
}

// Parsed into the typed shape, every status token checked against the nine
// and every one of the nine named, and frozen all the way down, so no story
// can change what another reads.
export const parseFixtures = (raw: RawFixtures): Fixtures => {
  const statusOf = (entry: RawFixtures['renamedStatus']): StatusFixture => Object.freeze({ ...entry, token: tokenOf(entry.token) })
  const statuses = raw.statuses.map(statusOf)
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
    names: Object.freeze(names),
    renamedStatus: statusOf(raw.renamedStatus),
    longStatusName: raw.longStatusName,
    jobs: Object.freeze(raw.jobs.map((job) => Object.freeze({ ...job, status: tokenOf(job.status) }))),
    contacts: Object.freeze(raw.contacts.map((contact) => Object.freeze({ ...contact }))),
    notes: Object.freeze(raw.notes.map((note) => Object.freeze({ ...note }))),
  })
}

const rawFa: RawFixtures = faIR
const rawEn: RawFixtures = enUS
const SETS: Record<Locale, Fixtures> = { 'fa-IR': parseFixtures(rawFa), 'en-US': parseFixtures(rawEn) }

// One locale's sample data.
export const fixtures = (locale: Locale): Fixtures => SETS[locale]

// A status's sample name in a locale, by its token.
export const statusName = (locale: Locale, token: StatusToken): string => SETS[locale].names[token]
