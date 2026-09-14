import { expect, test, type Page } from '@playwright/test'
import { signedIn } from './session'

/**
 * Two tabs of one browser, KN-419.
 *
 * Two pages of one context share its localStorage, and the browser hands each
 * the storage event of the other's writes, as it does two real tabs. Measured
 * before the fix, in these steps: the tab opened second wrote its empty board
 * over the thirty sample job opportunities the first had loaded with its next
 * change, and signing out in one tab left the other on the board.
 */
const OWN_BOARD = 'karnama.records:09120000000'
const NEW_STATUS = 'وضعیت تازه'

/** How many job opportunities the reader's stored board holds, and whether it has the added status. */
const stored = (page: Page) =>
  page.evaluate(
    ({ key, added }) => {
      const records: unknown = JSON.parse(window.localStorage.getItem(key) ?? '{}')
      if (typeof records !== 'object' || records === null || !('jobs' in records) || !Array.isArray(records.jobs)) return null
      const statuses: unknown[] = 'statuses' in records && Array.isArray(records.statuses) ? records.statuses : []
      return {
        jobs: records.jobs.length,
        added: statuses.some((status) => typeof status === 'object' && status !== null && 'name' in status && status.name === added),
      }
    },
    { key: OWN_BOARD, added: NEW_STATUS },
  )

test('two tabs keep one board and one session', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'the storage two tabs share is the same at every width')
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await signedIn(page)
  await page.goto('/')
  const other = await context.newPage()
  other.on('pageerror', (error) => errors.push(error.message))
  await other.goto('/')
  await expect(other.getByRole('heading', { level: 1 })).toHaveText('فرصت‌های شغلی من')

  // The first tab loads the sample data, and the second shows it without a
  // reload.
  await page.getByRole('button', { name: 'تنظیمات', exact: true }).click()
  const settings = page.getByRole('dialog')
  await settings.getByRole('button', { name: 'بارگذاری داده‌های نمونه' }).click()
  await settings.getByRole('button', { name: 'تمام', exact: true }).click()
  await expect(other.getByRole('article').first()).toBeVisible()

  // The second tab's own change is made to that board: all thirty are still
  // stored after it, and the first tab shows the status it added.
  await other.getByRole('button', { name: 'افزودن وضعیت' }).click()
  await expect.poll(() => stored(page)).toEqual({ jobs: 30, added: true })
  await expect(page.getByText(NEW_STATUS).first()).toBeVisible()

  // Signing out in the first tab signs the second out.
  await page.getByRole('button', { name: 'خروج' }).click()
  await expect(other.getByLabel('شماره موبایل')).toBeVisible()

  // The first tab's reload writes the session again, its init script standing
  // in for a sign-in there, and the second tab is signed in with it; the first
  // clearing the whole store signs the second out again.
  await page.reload()
  await expect(other.getByRole('heading', { level: 1 })).toHaveText('فرصت‌های شغلی من')
  await page.evaluate(() => {
    window.localStorage.clear()
  })
  await expect(other.getByLabel('شماره موبایل')).toBeVisible()
  expect(errors).toEqual([])
})

test('a tab part way through signing in is signed in by another tab', async ({ context }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'the storage two tabs share is the same at every width')
  const errors: string[] = []

  // This tab is opened first, with nobody signed in, and asks for a code.
  const here = await context.newPage()
  here.on('pageerror', (error) => errors.push(error.message))
  await here.goto('/')
  await here.getByLabel('شماره موبایل').fill('09120000000')
  await here.getByRole('button', { name: 'ارسال کد' }).click()
  await expect(here.getByLabel('کد پنج رقمی')).toBeVisible()

  // Another tab finishes a first login, whose session has no name yet, its init
  // script standing in for the sign-in. This tab comes to the name step, and the
  // name saved here is saved on the session the adoption keeps, so the other tab
  // is signed in with it.
  const there = await context.newPage()
  there.on('pageerror', (error) => errors.push(error.message))
  await signedIn(there, '')
  await there.goto('/')
  await here.getByLabel('اسم و فامیل').fill('سارا محمدی')
  await here.getByRole('button', { name: 'ادامه' }).click()
  await expect(here.getByRole('heading', { level: 1 })).toHaveText('فرصت‌های شغلی من')
  await expect(there.getByRole('heading', { level: 1 })).toHaveText('فرصت‌های شغلی من')

  // Signing out there brings this tab back to its number, not to the code it
  // was sent before the other tab signed in.
  await there.getByRole('button', { name: 'خروج' }).click()
  await expect(here.getByLabel('شماره موبایل')).toBeVisible()
  expect(errors).toEqual([])
})
