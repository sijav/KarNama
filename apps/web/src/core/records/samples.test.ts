import { describe, expect, it } from 'vitest'
import { i18nFor } from '../../i18n'
import { emptyDraft, missingFields } from '../../shared/add-job'
import { emptyRecords, jobFrom, readRecords } from './records'
import { withSamples } from './samples'

describe('sample records', () => {
  it('creates valid varied jobs, histories, and linked contacts in both languages', () => {
    for (const locale of ['en-US', 'fa-IR'] as const) {
      const samples = withSamples(
        emptyRecords((token) => token),
        i18nFor(locale),
        new Date('2026-09-12T12:00:00Z'),
      )
      expect(samples.jobs).toHaveLength(30)
      expect(samples.contacts).toHaveLength(6)
      expect(new Set(samples.jobs.map((job) => job.draft.status)).size).toBe(5)
      for (const job of samples.jobs) {
        expect(missingFields(job.draft)).toEqual([])
        expect(job.history.at(-1)?.status).toBe(job.draft.status)
      }
      expect(samples.jobs.some((job) => job.draft.expiresAt === '')).toBe(true)
      expect(samples.jobs.some((job) => job.draft.expiresAt > '2026-09-12')).toBe(true)
      expect(samples.jobs.some((job) => job.draft.expiresAt !== '' && job.draft.expiresAt < '2026-09-12')).toBe(true)
      expect(samples.contacts.every((contact) => samples.jobs.some((job) => job.id === contact.jobId))).toBe(true)
      expect(
        readRecords(
          JSON.parse(JSON.stringify(samples)),
          emptyRecords((token) => token),
        ),
      ).toEqual(samples)
    }
  })

  it('preserves existing records and edits when loaded again', () => {
    const mine = jobFrom({ ...emptyDraft('new'), title: 'My own job', company: 'My own company' }, new Date().toISOString())
    const initial = { ...emptyRecords((token) => token), jobs: [mine] }
    const samples = withSamples(initial, i18nFor('en-US'))
    const edited = { ...samples, jobs: samples.jobs.map((job) => ({ ...job, note: 'My edited note' })) }
    expect(withSamples(edited, i18nFor('fa-IR'))).toEqual(edited)
    expect(samples.jobs[0]).toBe(mine)
  })

  it('restores missing default statuses and respects renamed ones', () => {
    const initial = { statuses: [{ id: 'new', token: 'custom-1', name: 'My inbox' }], jobs: [], contacts: [] } satisfies Parameters<
      typeof withSamples
    >[0]
    const samples = withSamples(initial, i18nFor('en-US'))
    expect(samples.statuses).toHaveLength(5)
    expect(samples.statuses[0]).toEqual(initial.statuses[0])
    expect(samples.jobs.every((job) => samples.statuses.some((status) => status.id === job.draft.status))).toBe(true)
  })
})
