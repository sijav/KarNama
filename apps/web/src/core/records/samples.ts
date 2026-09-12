import type { I18n } from '@lingui/core'
import { emptyDraft } from '../../shared/add-job'
import type { JobLevel } from '../../shared/job-selects'
import type { StatusToken } from '../../theme/tokens'
import { emptyRecords, jobFrom, withStatus, type ContactEntry, type JobEntry, type Records } from './records'

const INITIAL_STATUS: StatusToken = 'new'
const SPECIALIST: JobLevel = 'specialist'

export const withSamples = (from: Records, i18n: I18n, now = new Date()): Records => {
  const defaults = emptyRecords((token) =>
    token === 'new'
      ? i18n._('Saved')
      : token === 'applied'
        ? i18n._('Applied')
        : token === 'interview'
          ? i18n._('Interview')
          : token === 'offer'
            ? i18n._('Job offer')
            : i18n._('Rejected'),
  ).statuses
  const statuses = [...from.statuses]
  const sampleStatuses = defaults.map((entry) => {
    const existing = statuses.find((held) => held.id === entry.id) ?? statuses.find((held) => held.token === entry.token)
    if (existing) return existing
    statuses.push(entry)
    return entry
  })
  const titles = [
    i18n._('Frontend developer'),
    i18n._('Product designer'),
    i18n._('Backend developer'),
    i18n._('QA engineer'),
    i18n._('Data analyst'),
    i18n._('Product manager'),
    i18n._('Mobile developer'),
    i18n._('DevOps engineer'),
    i18n._('UX researcher'),
    i18n._('Customer support specialist'),
  ]
  const companies = [i18n._('Cedar Studio (sample)'), i18n._('Blue Kite (sample)'), i18n._('Maple Labs (sample)')]
  const locations = [i18n._('Tehran'), i18n._('Remote'), i18n._('Isfahan')]
  const day = (offset: number) => {
    const date = new Date(now)
    date.setUTCDate(date.getUTCDate() + offset)
    return date.toISOString()
  }
  const jobs: JobEntry[] = Array.from({ length: 30 }, (_, index) => {
    const target = sampleStatuses[index % sampleStatuses.length]?.id ?? INITIAL_STATUS
    const first = sampleStatuses[0]?.id ?? INITIAL_STATUS
    const description = i18n._(
      'Fictional job for testing. Work with a small team, review requirements, deliver improvements, and share progress each week. This is not a real vacancy.',
    )
    let job = jobFrom(
      {
        ...emptyDraft(first),
        title: titles[index % titles.length] ?? '',
        company: companies[Math.floor(index / titles.length)] ?? '',
        employmentTypes: index % 3 === 0 ? ['full-time', 'remote'] : index % 3 === 1 ? ['part-time'] : ['contract'],
        location: locations[index % locations.length] ?? '',
        experience: index % 4 === 0 ? '' : i18n._('2 to 4 years'),
        jobLevel: index % 4 === 0 ? null : SPECIALIST,
        postedAt: day(-40 + index).slice(0, 10),
        expiresAt: index % 4 === 0 ? '' : day(index - 10).slice(0, 10),
        salary: index % 3 === 0 ? '' : i18n._('Negotiable'),
        source: i18n._('Sample data'),
        postingUrl: '',
        description,
      },
      day(-40 + index),
    )
    if (target !== first) {
      const applied = sampleStatuses[1]?.id ?? first
      job = withStatus(job, applied, day(-38 + index))
      job = withStatus(job, target, day(-35 + index))
    }
    return {
      ...job,
      id: `sample-job-${index + 1}`,
      note: index % 2 === 0 ? i18n._('Sample note: review the role and prepare questions before following up.') : '',
      noteEditedAt: index % 2 === 0 ? day(-34 + index) : null,
    }
  })
  const names = [
    i18n._('Alex (sample)'),
    i18n._('Sam (sample)'),
    i18n._('Robin (sample)'),
    i18n._('Taylor (sample)'),
    i18n._('Jamie (sample)'),
    i18n._('Casey (sample)'),
  ]
  const contacts: ContactEntry[] = names.map((name, index) => {
    const job = jobs[index * 5]
    return {
      id: `sample-contact-${index + 1}`,
      jobId: job?.id ?? null,
      contact: {
        name,
        role: i18n._('Recruiter'),
        company: job?.draft.company ?? null,
        email: null,
        phone: null,
        job: job?.draft.title ?? null,
        linkedin: null,
      },
    }
  })
  const existingJobs = new Set(from.jobs.map((job) => job.id))
  const existingContacts = new Set(from.contacts.map((contact) => contact.id))
  return {
    statuses,
    jobs: [...from.jobs, ...jobs.filter((job) => !existingJobs.has(job.id))],
    contacts: [...from.contacts, ...contacts.filter((contact) => !existingContacts.has(contact.id))],
  }
}
