import { expect, test } from '@playwright/test'
import { signedIn } from './session'

/**
 * A board kept before the date picker, KN-494: its job was posted «۱۰ شهریور ۱۴۰۵»,
 * as its reader wrote it. The date opens as its day, a note edit saves, and both
 * are there after a reload, with the Persian date read under the English page as
 * well as the Persian one. The board is written into the signed-in reader's own
 * store before the page loads, the way a returning reader's browser holds it.
 */
const BOARD = 'karnama.records:09120000000'
const TITLE = 'توسعه‌دهنده فرانت‌اند'

const statuses = [
  { id: 'new', token: 'new', name: 'ذخیره‌شده' },
  { id: 'applied', token: 'applied', name: 'درخواست‌شده' },
  { id: 'interview', token: 'interview', name: 'مصاحبه' },
  { id: 'offer', token: 'offer', name: 'پیشنهاد' },
  { id: 'rejected', token: 'rejected', name: 'رد شده' },
]

const board = {
  statuses,
  contacts: [],
  jobs: [
    {
      id: 'job-written',
      draft: {
        title: TITLE,
        company: 'فناوران نوین پارس',
        employmentTypes: [],
        location: '',
        experience: '',
        jobLevel: null,
        postedAt: '۱۰ شهریور ۱۴۰۵',
        salary: '',
        source: '',
        expiresAt: '۱۳ شهریور ۱۴۰۵',
        postingUrl: '',
        status: 'new',
      },
      description: '',
      skills: [],
      note: '',
      noteEditedAt: null,
      contacts: [],
      files: [],
      history: [{ id: 'change-written', status: 'new', at: '2026-09-01T09:00:00.000Z', automatic: false }],
    },
  ],
}

// Each language's names for what the test reaches for.
const WORDS = {
  'fa-IR': { posted: 'تاریخ انتشار', expires: 'تاریخ انقضا', note: 'یادداشت', save: 'ذخیره' },
  'en-US': { posted: 'Posted on', expires: 'Expires on', note: 'Note', save: 'Save' },
} as const

for (const locale of ['fa-IR', 'en-US'] as const) {
  test(`a job posted «۱۰ شهریور ۱۴۰۵» opens on its day and saves a note, in ${locale}`, async ({ page }) => {
    const words = WORDS[locale]
    await signedIn(page)
    await page.addInitScript(
      ({ key, value, preferences }) => {
        // Written once, before the first load, so the reload reads what was saved.
        if (window.sessionStorage.getItem('kn494-seeded') !== null) return
        window.sessionStorage.setItem('kn494-seeded', 'yes')
        window.localStorage.setItem(key, JSON.stringify(value))
        window.localStorage.setItem('karnama.preferences', JSON.stringify(preferences))
      },
      { key: BOARD, value: board, preferences: { locale } },
    )
    await page.goto('/jobs')

    await page.getByRole('button', { name: TITLE, exact: true }).click()
    const modal = page.getByRole('dialog')
    await expect(modal.getByLabel(words.posted, { exact: true })).toHaveValue('2026-09-01')
    await expect(modal.getByLabel(words.expires, { exact: true })).toHaveValue('2026-09-04')

    await modal.getByRole('tab', { name: words.note }).click()
    await modal.getByRole('textbox', { name: words.note }).fill('They called back.')
    await modal.getByRole('button', { name: words.save, exact: true }).click()
    await expect(page.getByRole('dialog')).toHaveCount(0)

    await page.reload()
    const kept = await page.evaluate((key) => window.localStorage.getItem(key), BOARD)
    const stored: unknown = JSON.parse(kept ?? '{}')
    expect(stored).toMatchObject({
      jobs: [{ id: 'job-written', note: 'They called back.', draft: { postedAt: '2026-09-01', expiresAt: '2026-09-04' } }],
    })
    await page.getByRole('button', { name: TITLE, exact: true }).click()
    await expect(page.getByRole('dialog').getByLabel(words.posted, { exact: true })).toHaveValue('2026-09-01')
  })
}
