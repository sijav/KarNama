import { describe, expect, it } from 'vitest'
import { jobsIn, withStatus } from '../../core/records'
import { locales, type Locale } from '../../i18n'
import { status, type StatusToken } from '../../theme/tokens'
import { fixtures, parseFixtures, statusName, type RawFixtures } from './index'

const LOCALES = Object.keys(locales).filter((locale): locale is Locale => locale in locales)

// The board's columns from the inline start, DESIGN.md section 6 and KN-070:
// the design's five in their order, the custom statuses where a reader's own
// stages go, and rejected last whatever else is on the board.
const ORDER: readonly StatusToken[] = ['new', 'applied', 'interview', 'offer', 'custom-1', 'custom-2', 'custom-3', 'custom-4', 'rejected']

// A status a fixture job opportunity is moved to.
const OFFER: StatusToken = 'offer'

// The column the board fixture leaves empty, since no fixture job opportunity sits in
// custom-2, and the column the board collapses.
const EMPTY: StatusToken = 'custom-2'
const REJECTED: StatusToken = 'rejected'

// Every source file under src, as text, so a test can read what imports what
// without the file system.
const sources = import.meta.glob<string>('/src/**/*.{ts,tsx}', { query: '?raw', import: 'default', eager: true })

// Files that never reach the app: stories, tests, the Storybook-only folders.
const storybookOnly = (path: string) => /\.stories\.tsx$|\.test\.tsx?$|\/story-fixtures\/|\/story-docs\/|\/gate-fixtures\//.test(path)

describe('story fixtures', () => {
  it('are imported by nothing that ships, so they never reach the production bundle', () => {
    const shipped = Object.entries(sources).filter(([path]) => !storybookOnly(path))
    expect(shipped.length).toBeGreaterThan(10)
    const importing = shipped.filter(([, text]) => /from\s+['"][^'"]*story-fixtures[^'"]*['"]|import\(\s*['"][^'"]*story-fixtures/.test(text)).map(([path]) => path)
    expect(importing).toEqual([])
  })

  it('finds an import when one is there, so the check above can fail', () => {
    const planted = "import { fixtures } from '../story-fixtures'"
    expect(/from\s+['"][^'"]*story-fixtures[^'"]*['"]/.test(planted)).toBe(true)
  })

  it('give both languages the same records: every status, the same jobs, contacts and notes', () => {
    const [first, second] = LOCALES.map((locale) => fixtures(locale))
    if (!first || !second) throw new Error('fewer than two locales')
    expect(first.statuses.map((entry) => entry.token)).toEqual(Object.keys(status))
    expect(second.statuses.map((entry) => entry.token)).toEqual(Object.keys(status))
    for (const key of ['jobs', 'contacts', 'notes'] as const) {
      expect(second[key].map((entry) => entry.id)).toEqual(first[key].map((entry) => entry.id))
    }
    expect(second.jobs.map((job) => job.status)).toEqual(first.jobs.map((job) => job.status))
    expect(Object.keys(second.extraction)).toEqual(Object.keys(first.extraction))
    expect(second.jobDetail.files.map((file) => file.id)).toEqual(first.jobDetail.files.map((file) => file.id))
    expect(second.jobDetail.history).toEqual(first.jobDetail.history)
    expect(second.mixedStatusNames).toEqual(first.mixedStatusNames)
  })

  it('hold a board worth drawing: custom-2 empty, a column holding several, and rejected the fullest, KN-438', () => {
    // KN-305 put one job opportunity in every status so that no story built a
    // board of its own, which left the board no reader has: nothing worth
    // collapsing, nothing a sort reorders, and no empty column, which the design
    // draws, 241:46.
    for (const locale of LOCALES) {
      const counts = new Map(fixtures(locale).board.map((column) => [column.token, column.jobs.length]))
      const rejected = counts.get(REJECTED) ?? 0
      const others = [...counts].filter(([token]) => token !== REJECTED).map(([, count]) => count)
      expect(counts.get(EMPTY), `${locale}'s ${EMPTY} column is not empty`).toBe(0)
      expect(Math.max(...others), `${locale} has no column holding several`).toBeGreaterThanOrEqual(3)
      expect(rejected, `${locale}'s rejected column is not worth collapsing`).toBeGreaterThanOrEqual(5)
      expect(rejected, `${locale}'s rejected column is not the fullest`).toBeGreaterThan(Math.max(...others))
    }
  })

  it('hold the board itself: a column per status, in the order the board draws them', () => {
    for (const locale of LOCALES) {
      const set = fixtures(locale)
      // The design's order, written out rather than asked of the same function
      // that built the board: the defaults as the design draws them, the custom
      // statuses after them, and rejected last whatever else is there, KN-070.
      expect(set.board.map((column) => column.token)).toEqual(ORDER)

      // Each column is named as its own status is named, in this language.
      for (const column of set.board) {
        expect(column.name).toBe(statusName(locale, column.token))
      }

      // Every job opportunity stands in exactly one column, the one its own
      // status names.
      const placed = set.board.flatMap((column) => column.jobs.map((job) => job.id))
      expect([...placed].sort()).toEqual([...set.jobs.map((job) => job.id)].sort())
      for (const column of set.board) {
        expect(column.jobs.every((job) => job.status === column.token)).toBe(true)
      }
    }
  })

  it('give every status in the product’s own shape, the token as its id, KN-437', () => {
    for (const locale of LOCALES) {
      const set = fixtures(locale)
      expect(set.statusOptions.map((option) => option.token)).toEqual(set.statuses.map((entry) => entry.token))
      for (const option of set.statusOptions) {
        expect(option).toEqual({ id: option.token, token: option.token, name: statusName(locale, option.token) })
        expect(Object.isFrozen(option)).toBe(true)
      }
      expect(Object.isFrozen(set.statusOptions)).toBe(true)
    }
  })

  it('hold no count on a status, since the board gives each column its own job opportunities, KN-439', () => {
    // A count written beside the job opportunities disagreed with them in six of
    // the nine statuses, and nothing read it. tsc refuses a typed read of one, not
    // a count left in the JSON, which parseFixtures would carry into the status.
    for (const locale of LOCALES) {
      const set = fixtures(locale)
      const counted = set.statuses.filter((entry) => Object.hasOwn(entry, 'count')).map((entry) => entry.token)
      expect(counted, `${locale}'s statuses holding a count`).toEqual([])
      expect(Object.hasOwn(set.renamedStatus, 'count'), `${locale}'s renamed status holds a count`).toBe(false)
    }
  })

  it('give each board column its status’s id, which everything that reads a column keys on, KN-437', () => {
    for (const locale of LOCALES) {
      const set = fixtures(locale)
      for (const column of set.board) {
        expect(set.statusOptions.find((option) => option.id === column.id)).toEqual({
          id: column.id,
          token: column.token,
          name: column.name,
        })
      }
    }
  })

  it('hold the records the product keeps, built from the same fixtures, KN-437', () => {
    for (const locale of LOCALES) {
      const set = fixtures(locale)
      const { records } = set
      expect(records.statuses).toBe(set.statusOptions)
      // Every job opportunity as the product keeps one, under the fixture's own
      // id, in its own status, with what the fixture says of it.
      expect(records.jobs.map((entry) => entry.id)).toEqual(set.jobs.map((job) => job.id))
      for (const job of set.jobs) {
        const entry = records.jobs.find((held) => held.id === job.id)
        expect(entry?.draft).toMatchObject({
          status: job.status,
          title: job.title,
          company: job.company,
          location: job.location,
          postedAt: job.postedAt,
          postingUrl: job.link ?? '',
        })
        expect(entry?.history.map((change) => change.status)).toEqual([job.status])
      }
      // Every contact on the job opportunity the fixture puts them on.
      expect(records.contacts.map((held) => [held.id, held.jobId, held.contact.name])).toEqual(
        set.contacts.map((contact) => [contact.id, contact.jobId, contact.fullName]),
      )
    }
  })

  it('can be handed to the product: its own jobsIn finds each board column’s job opportunities in the records, KN-437', () => {
    for (const locale of LOCALES) {
      const set = fixtures(locale)
      for (const column of set.board) {
        // As sorted arrays: the product orders a column by posting date and then
        // by when a job opportunity was added, and a column holds several; an
        // array, unlike a set, still counts a job opportunity found twice.
        expect(
          jobsIn(set.records.jobs, column.id, '', 'newest')
            .map((entry) => entry.id)
            .sort(),
        ).toEqual(column.jobs.map((job) => job.id).sort())
      }
    }
  })

  it('freeze the records all the way down, and a change the product makes to them builds new objects, KN-437', () => {
    // Where anything below the records is not frozen, by its path.
    const unfrozen = (value: unknown, path: string): string[] =>
      typeof value !== 'object' || value === null
        ? []
        : [...(Object.isFrozen(value) ? [] : [path]), ...Object.entries(value).flatMap(([key, inner]) => unfrozen(inner, `${path}.${key}`))]
    for (const locale of LOCALES) {
      const { records } = fixtures(locale)
      expect(unfrozen(records, locale)).toEqual([])
      const [first] = records.jobs
      if (!first) throw new Error('the records hold no job opportunity')
      const moved = withStatus(first, OFFER, new Date(Date.UTC(2026, 8, 20)).toISOString())
      expect(moved.draft.status).toBe(OFFER)
      expect(first.draft.status).not.toBe(OFFER)
    }
  })

  it('hold a long value in every set, in both languages, for truncation', () => {
    for (const locale of LOCALES) {
      const set = fixtures(locale)
      expect(set.longStatusName.length).toBeGreaterThanOrEqual(60)
      expect(Math.max(...set.jobs.map((job) => job.title.length))).toBeGreaterThanOrEqual(60)
      expect(Math.max(...set.jobs.map((job) => job.company.length))).toBeGreaterThanOrEqual(40)
      expect(Math.max(...set.contacts.map((contact) => contact.fullName.length))).toBeGreaterThanOrEqual(30)
      expect(Math.max(...set.contacts.map((contact) => contact.role.length))).toBeGreaterThanOrEqual(40)
      expect(Math.max(...set.notes.map((note) => note.text.length))).toBeGreaterThanOrEqual(200)
    }
  })

  it('keep a contact with neither email nor phone, which the owner allowed, KN-071', () => {
    for (const locale of LOCALES) expect(fixtures(locale).contacts.some((contact) => contact.email === null && contact.phone === null)).toBe(true)
  })

  it('are frozen and the same objects on every read, so stories reading them at once cannot interleave', () => {
    for (const locale of LOCALES) {
      const set = fixtures(locale)
      expect(fixtures(locale)).toBe(set)
      expect(Object.isFrozen(set)).toBe(true)
      for (const list of [set.statuses, set.jobs, set.contacts, set.notes]) {
        expect(Object.isFrozen(list)).toBe(true)
        for (const entry of list) expect(Object.isFrozen(entry)).toBe(true)
      }
      expect(Object.isFrozen(set.renamedStatus)).toBe(true)
    }
  })

  it('name a status by its token, and refuse a set that leaves one of the nine unnamed', () => {
    expect(statusName('en-US', 'interview')).toBe(fixtures('en-US').statuses.find((entry) => entry.token === 'interview')?.name)
    const missing: RawFixtures = { statuses: [], renamedStatus: { token: 'new', name: 'x' }, longStatusName: '', jobs: [], contacts: [], notes: [], extraction: fixtures('en-US').extraction, jobDetail: fixtures('en-US').jobDetail, mixedStatusNames: fixtures('en-US').mixedStatusNames }
    expect(() => parseFixtures(missing)).toThrow(/have no status new/)
  })

  it('refuse a status token that is not one of the nine', () => {
    const bad: RawFixtures = { statuses: [{ token: 'purple-ish', name: 'x' }], renamedStatus: { token: 'new', name: 'x' }, longStatusName: '', jobs: [], contacts: [], notes: [], extraction: fixtures('en-US').extraction, jobDetail: fixtures('en-US').jobDetail, mixedStatusNames: fixtures('en-US').mixedStatusNames }
    expect(() => parseFixtures(bad)).toThrow(/does not exist: purple-ish/)
  })
})
