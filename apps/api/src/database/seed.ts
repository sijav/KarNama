import type { SqlRunner } from './migrations.js'

/**
 * A realistic archive to develop against.
 *
 * Realistic means the shape a real user's board has after a few weeks, not one
 * row per table: several job opportunities spread across the columns, a status
 * history that actually moves, notes and contacts on some records and not
 * others, and one rejected opportunity, because the empty state of a board with
 * nothing rejected hides half the design.
 *
 * The Persian is the ONLY Persian in the API. It is data rather than copy: a
 * status name is renameable by the user, so it is a row, and seeding English
 * names would misrepresent what a Persian user's board looks like on day one.
 * «فرصت شغلی» is the record and «آگهی» is only the external posting, so nothing
 * here calls a record an آگهی.
 */
const quote = (value: string) => `'${value.replace(/'/g, "''")}'`
const nullable = (value: string | null) => (value === null ? 'NULL' : quote(value))

/**
 * The five keys the design ships with, as a TYPE.
 *
 * Every record below names its column through this union, so a key that does
 * not exist is a compile error rather than a runtime guard. The guard was
 * written first and no test could reach it: the only way to a bad key was to
 * edit this file, which is exactly what a type catches and a check at runtime
 * cannot. Unreachable defensive code is worse than none, because it reads as
 * protection.
 */
export type StatusKey = 'new' | 'applied' | 'interview' | 'rejected' | 'offer'

export interface SeedResult {
  userId: string
  statusIds: Record<StatusKey, string>
  jobRecordIds: string[]
}

/** The five the design ships with, in board order, with their token colours. */
const DEFAULT_STATUSES: readonly { key: StatusKey; name: string; color: string }[] = [
  { key: 'new', name: 'ذخیره‌شده', color: 'new' },
  { key: 'applied', name: 'درخواست‌شده', color: 'applied' },
  { key: 'interview', name: 'مصاحبه', color: 'interview' },
  { key: 'rejected', name: 'رد شده', color: 'rejected' },
  { key: 'offer', name: 'پیشنهاد کار', color: 'offer' },
]

const JOB_RECORDS: readonly {
  id: string
  title: string
  company: string
  statusKey: StatusKey
  /** The columns it passed through, oldest first, ending at statusKey. */
  trail: readonly StatusKey[]
  location: string | null
  employmentType: string | null
  source: string | null
  skills: readonly string[]
}[] = [
  {
    id: 'job-0001',
    title: 'توسعه‌دهنده‌ی فرانت‌اند',
    company: 'دیجی‌کالا',
    statusKey: 'interview',
    trail: ['new', 'applied', 'interview'],
    location: 'تهران',
    employmentType: 'تمام‌وقت',
    source: 'jobinja.ir',
    skills: ['React', 'TypeScript'],
  },
  {
    id: 'job-0002',
    title: 'مهندس نرم‌افزار ارشد',
    company: 'اسنپ',
    statusKey: 'applied',
    trail: ['new', 'applied'],
    location: 'تهران',
    employmentType: 'تمام‌وقت',
    source: 'jobvision.ir',
    skills: ['Node.js', 'PostgreSQL'],
  },
  {
    id: 'job-0003',
    title: 'طراح رابط کاربری',
    company: 'کافه‌بازار',
    statusKey: 'new',
    trail: ['new'],
    location: null,
    employmentType: 'پاره‌وقت',
    source: null,
    skills: ['Figma'],
  },
  {
    id: 'job-0004',
    title: 'توسعه‌دهنده‌ی بک‌اند',
    company: 'علی‌بابا',
    statusKey: 'rejected',
    trail: ['new', 'applied', 'interview', 'rejected'],
    location: 'مشهد',
    employmentType: 'دورکاری',
    source: 'jobinja.ir',
    skills: ['Go'],
  },
  {
    id: 'job-0005',
    title: 'مهندس داده',
    company: 'تپسی',
    statusKey: 'offer',
    trail: ['new', 'applied', 'interview', 'offer'],
    location: 'تهران',
    employmentType: 'تمام‌وقت',
    source: null,
    skills: ['Python', 'SQL'],
  },
]

/**
 * Writes the archive. Idempotent by construction: every id is fixed and every
 * insert is `ON CONFLICT DO NOTHING`, so running it twice against the same
 * database is a no-op rather than a duplicate-key crash. A seed that can only
 * be run against a pristine database is a seed nobody runs.
 */
export const seed = async (runner: SqlRunner): Promise<SeedResult> => {
  const userId = 'user-0001'
  // Built as a total record rather than accumulated into a partial one, so
  // every lookup below is typed and none of them needs a guard.
  const statusIds: Record<StatusKey, string> = {
    new: 'status-new',
    applied: 'status-applied',
    interview: 'status-interview',
    rejected: 'status-rejected',
    offer: 'status-offer',
  }

  await runner.exec(
    `INSERT INTO "users" ("id", "phone", "name", "isAdmin", "updatedAt")
     VALUES (${quote(userId)}, '+989120000000', 'سینا', true, now())
     ON CONFLICT ("id") DO NOTHING;`,
  )

  for (const [index, status] of DEFAULT_STATUSES.entries()) {
    const id = statusIds[status.key]
    await runner.exec(
      `INSERT INTO "statuses" ("id", "userId", "key", "name", "color", "position", "updatedAt")
       VALUES (${quote(id)}, ${quote(userId)}, ${quote(status.key)}, ${quote(status.name)}, ${quote(status.color)}, ${index}, now())
       ON CONFLICT ("id") DO NOTHING;`,
    )
  }

  for (const record of JOB_RECORDS) {
    const statusId = statusIds[record.statusKey]
    const skills = record.skills.map((skill) => quote(skill)).join(', ')
    await runner.exec(
      `INSERT INTO "job_records"
        ("id", "userId", "title", "company", "statusId", "location", "employmentType", "source", "skills", "updatedAt")
       VALUES (${quote(record.id)}, ${quote(userId)}, ${quote(record.title)}, ${quote(record.company)}, ${quote(statusId)},
               ${nullable(record.location)}, ${nullable(record.employmentType)}, ${nullable(record.source)},
               ARRAY[${skills}]::text[], now())
       ON CONFLICT ("id") DO NOTHING;`,
    )

    // The trail, oldest first. The first entry has no `from`, because that is
    // the record being created rather than moved, and each entry is a day
    // apart so the Info tab has something to render in order.
    for (const [step, key] of record.trail.entries()) {
      const previous = record.trail[step - 1]
      const from = step === 0 || previous === undefined ? null : statusIds[previous]
      const to = statusIds[key]
      const daysAgo = record.trail.length - step
      await runner.exec(
        `INSERT INTO "status_history" ("id", "jobRecordId", "fromStatusId", "toStatusId", "changedAt")
         VALUES (${quote(`${record.id}-history-${String(step)}`)}, ${quote(record.id)}, ${from === null ? 'NULL' : quote(from)},
                 ${quote(to)}, now() - interval '${String(daysAgo)} days')
         ON CONFLICT ("id") DO NOTHING;`,
      )
    }
  }

  await runner.exec(
    `INSERT INTO "notes" ("id", "jobRecordId", "body", "updatedAt")
     VALUES ('note-0001', 'job-0001', 'مصاحبه‌ی فنی سه‌شنبه ساعت ۱۰. درباره‌ی تیم فرانت‌اند بپرس.', now())
     ON CONFLICT ("id") DO NOTHING;`,
  )

  await runner.exec(
    `INSERT INTO "contacts" ("id", "userId", "fullName", "role", "company", "email", "jobRecordId", "updatedAt")
     VALUES ('contact-0001', ${quote(userId)}, 'مریم رضایی', 'مدیر فنی', 'دیجی‌کالا', 'maryam@example.com', 'job-0001', now()),
            ('contact-0002', ${quote(userId)}, 'علی محمدی', NULL, NULL, NULL, NULL, now())
     ON CONFLICT ("id") DO NOTHING;`,
  )

  await runner.exec(
    `INSERT INTO "feedback_submissions" ("id", "jobRecordId", "submitterName", "body", "state", "updatedAt")
     VALUES ('feedback-0001', 'job-0002', 'ناشناس', 'حقوق این موقعیت در آگهی اصلی متفاوت بود.', 'PENDING', now())
     ON CONFLICT ("id") DO NOTHING;`,
  )

  return { userId, statusIds, jobRecordIds: JOB_RECORDS.map((record) => record.id) }
}
