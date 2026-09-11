import { describe, expect, it } from 'vitest'
import { emptyDraft } from '../../shared/add-job'
import type { StatusOption } from '../../shared/status-picker'
import {
  columnOrder,
  defaultStatuses,
  draftForColumn,
  emptyRecords,
  jobFrom,
  jobsIn,
  matches,
  newId,
  nextCustomToken,
  readRecords,
  sortJobs,
  tokenOf,
  withSaved,
  withStatus,
  type JobEntry,
  type Records,
} from './records'

const named = (token: string) => `name of ${token}`
const statuses = defaultStatuses(named)

const jobWith = (fields: Partial<JobEntry['draft']> & { id?: string }): JobEntry => ({
  ...jobFrom({ ...emptyDraft('new'), ...fields }, '2026-09-12T00:00:00.000Z'),
  ...(fields.id === undefined ? {} : { id: fields.id }),
})

describe('the statuses the product starts with', () => {
  it('are the five the design draws, in the board order with rejected last', () => {
    expect(statuses.map((entry) => entry.token)).toEqual(['new', 'applied', 'interview', 'offer', 'rejected'])
  })

  it('names each of them through the catalog the caller gives', () => {
    expect(statuses[0]?.name).toBe('name of new')
  })

  it('keeps rejected last however the statuses arrive, with a new one before it', () => {
    const mine: StatusOption = { id: 'own', token: 'custom-2', name: 'mine' }
    const shuffled = [...statuses].reverse()
    expect(columnOrder([...shuffled, mine]).map((entry) => entry.id)).toEqual(['new', 'applied', 'interview', 'offer', 'own', 'rejected'])
  })

  it('gives a new status the first reserved colour that is free', () => {
    expect(nextCustomToken(statuses)).toBe('custom-1')
    expect(nextCustomToken([...statuses, { id: 'a', token: 'custom-1', name: 'a' }])).toBe('custom-2')
  })

  it('falls back to the first reserved colour when all four are taken', () => {
    const taken = (['custom-1', 'custom-2', 'custom-3', 'custom-4'] as const).map((token, at) => ({ id: `s${at}`, token, name: token }))
    expect(nextCustomToken(taken)).toBe('custom-1')
  })

  it('reads a status colour by id, and the first default for one the board lost', () => {
    expect(tokenOf(statuses, 'offer')).toBe('offer')
    expect(tokenOf(statuses, 'gone')).toBe('new')
  })
})

describe('a job opportunity', () => {
  it('starts with the status it was added to, and that move in its history', () => {
    const job = jobFrom(draftForColumn('applied'), '2026-09-12T10:00:00.000Z')
    expect(job.draft.status).toBe('applied')
    expect(job.history).toEqual([expect.objectContaining({ status: 'applied', automatic: false })])
    expect(job.id).not.toBe('')
  })

  it('takes what the modal saved and keeps its own status, KN-364', () => {
    const job = jobWith({ title: 'first', status: 'new' })
    const saved = withSaved(job, { ...job.draft, title: 'second', description: 'about it', note: 'a note' })
    expect([saved.draft.title, saved.draft.status, saved.description, saved.note]).toEqual(['second', 'new', 'about it', 'a note'])
  })

  it('stamps the note only when the note changed', () => {
    const job = jobWith({ title: 'first' })
    const same = withSaved(job, { ...job.draft, description: '', note: '' })
    expect(same.noteEditedAt).toBeNull()
    expect(withSaved(job, { ...job.draft, description: '', note: 'new' }).noteEditedAt).not.toBeNull()
  })

  it('writes a move into its history, and does nothing when the status is the one it has', () => {
    const job = jobWith({ status: 'new' })
    const moved = withStatus(job, 'offer', '2026-09-12T11:00:00.000Z')
    expect(moved.draft.status).toBe('offer')
    expect(moved.history).toHaveLength(2)
    expect(withStatus(moved, 'offer', '2026-09-12T12:00:00.000Z')).toBe(moved)
  })

  it('has an id nothing else has, even twice in the same millisecond', () => {
    expect(newId('job')).not.toBe(newId('job'))
  })
})

describe('searching and sorting', () => {
  const first = jobWith({ id: 'a', title: 'Frontend developer', company: 'Digikala', postedAt: '2026-09-01', expiresAt: '2026-10-01' })
  const second = jobWith({ id: 'b', title: 'Backend engineer', company: 'Alpha', postedAt: '2026-09-05', expiresAt: '' })
  const jobs = [first, second]

  it('matches a job by anything a reader would look for, and everything on an empty search', () => {
    expect(matches(first, 'front')).toBe(true)
    expect(matches(first, 'DIGIKALA')).toBe(true)
    expect(matches(first, '  ')).toBe(true)
    expect(matches(first, 'nothing here')).toBe(false)
  })

  it('sorts by the four orders the design permits', () => {
    expect(sortJobs(jobs, 'newest').map((job) => job.id)).toEqual(['b', 'a'])
    expect(sortJobs(jobs, 'oldest').map((job) => job.id)).toEqual(['a', 'b'])
    // A job with no deadline is the least urgent, so it sorts last rather than
    // first, which an empty string would do.
    expect(sortJobs(jobs, 'deadline').map((job) => job.id)).toEqual(['a', 'b'])
    expect(sortJobs(jobs, 'company').map((job) => job.id)).toEqual(['b', 'a'])
  })

  it('gives a column its own jobs, searched and sorted', () => {
    const moved = withStatus(second, 'applied', '2026-09-12T00:00:00.000Z')
    expect(jobsIn([first, moved], 'new', '', 'newest').map((job) => job.id)).toEqual(['a'])
    expect(jobsIn([first, moved], 'new', 'backend', 'newest')).toEqual([])
  })
})

describe('what is kept between visits', () => {
  const set: Records = { statuses, jobs: [jobWith({ id: 'a' })], contacts: [] }
  const fallback = emptyRecords(named)

  it('reads back a set it wrote', () => {
    expect(readRecords(JSON.parse(JSON.stringify(set)), fallback)).toEqual(set)
  })

  it.each([
    ['nothing at all', null],
    ['a primitive', 7],
    ['an object of the wrong shape', { statuses: 'five', jobs: [] }],
    ['a set whose statuses are all unknown', { statuses: [{ id: 'x', token: 'purple', name: 'x' }], jobs: [] }],
  ])('falls back on %s rather than throwing the board away', (_case, raw) => {
    expect(readRecords(raw, fallback)).toEqual(fallback)
  })

  it('drops a job whose status the board no longer holds, and keeps the rest', () => {
    const orphan = { ...jobWith({ id: 'b' }), draft: { ...jobWith({ id: 'b' }).draft, status: 'gone' } }
    const read = readRecords({ statuses, jobs: [...set.jobs, orphan] }, fallback)
    expect(read.jobs.map((job) => job.id)).toEqual(['a'])
  })
})
