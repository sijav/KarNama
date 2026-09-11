import { describe, expect, it } from 'vitest'
import { locales, type Locale } from '../../i18n'
import { status } from '../../theme/tokens'
import { fixtures, parseFixtures, statusName, type RawFixtures } from './index'

const LOCALES = Object.keys(locales).filter((locale): locale is Locale => locale in locales)

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
    const missing: RawFixtures = { statuses: [], renamedStatus: { token: 'new', name: 'x', count: 0 }, longStatusName: '', jobs: [], contacts: [], notes: [], extraction: fixtures('en-US').extraction, jobDetail: fixtures('en-US').jobDetail, mixedStatusNames: fixtures('en-US').mixedStatusNames }
    expect(() => parseFixtures(missing)).toThrow(/have no status new/)
  })

  it('refuse a status token that is not one of the nine', () => {
    const bad: RawFixtures = { statuses: [{ token: 'purple-ish', name: 'x', count: 0 }], renamedStatus: { token: 'new', name: 'x', count: 0 }, longStatusName: '', jobs: [], contacts: [], notes: [], extraction: fixtures('en-US').extraction, jobDetail: fixtures('en-US').jobDetail, mixedStatusNames: fixtures('en-US').mixedStatusNames }
    expect(() => parseFixtures(bad)).toThrow(/does not exist: purple-ish/)
  })
})
