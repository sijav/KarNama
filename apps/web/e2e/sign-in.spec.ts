import { expect, test, type Page } from '@playwright/test'

/**
 * Signing in, end to end, KN-046.
 *
 * The provider is mocked for the MVP, the owner's decision: no SMS is sent and
 * the code is written to the console, so the test reads it there, which is
 * exactly what whoever is testing the product does.
 */
const PHONE = '09120000000'
// The number as the code step shows it, in the reader's digits grouped as the
// file writes a phone, KN-518.
const SHOWN = '۰۹۱۲ ۰۰۰ ۰۰۰۰'
const NAME = 'سارا محمدی'
const OTHER_PHONE = '09121111111'
const SECRET = 'کار محرمانه'

/** The codes the mock says it sent, in the order it sent them. */
const codesFrom = (page: Page): string[] => {
  const codes: string[] = []
  page.on('console', (message) => {
    const said = /mock SMS to \S+: (\d+)/.exec(message.text())
    if (said?.[1]) codes.push(said[1])
  })
  return codes
}

const signIn = async (page: Page, codes: string[]) => {
  await page.getByLabel('شماره موبایل').fill(PHONE)
  await page.getByRole('button', { name: 'ارسال کد' }).click()
  await expect(page.getByText(`ارسال شده به ${SHOWN}`)).toBeVisible()
  await expect.poll(() => codes.length).toBeGreaterThan(0)
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    window.localStorage.clear()
  })
  await page.reload()
})

test('a number and the code it was sent reach the board, and the first login gives a name', async ({ page }) => {
  const codes = codesFrom(page)
  await signIn(page, codes)

  await page.getByLabel('کد پنج رقمی').fill(codes[0] ?? '')
  await page.getByRole('button', { name: 'تأیید و ورود' }).click()

  // The first login asks who this is before anything else.
  await expect(page.getByText('خوش آمدی')).toBeVisible()
  await page.getByLabel('نام و نام خانوادگی').fill(NAME)
  await page.getByRole('button', { name: 'شروع کن' }).click()

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('فرصت‌های شغلی من')

  // And the session is real: a reload keeps it, it does not ask again.
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('فرصت‌های شغلی من')
})

test('a wrong code says so and another can be sent', async ({ page }) => {
  const codes = codesFrom(page)
  await signIn(page, codes)

  await page.getByLabel('کد پنج رقمی').fill('00000')
  await page.getByRole('button', { name: 'تأیید و ورود' }).click()
  await expect(page.getByText('این کد درست نیست. دوباره امتحان کن.')).toBeVisible()

  // Resending really sends another: the mock says so, and the new one works.
  await page.getByRole('button', { name: 'ارسال کد دیگر' }).click()
  await expect.poll(() => codes.length).toBeGreaterThan(1)
  await page.getByLabel('کد پنج رقمی').fill(codes.at(-1) ?? '')
  await page.getByRole('button', { name: 'تأیید و ورود' }).click()
  await expect(page.getByText('خوش آمدی')).toBeVisible()
})

test('signing out clears the session and asks for a number again', async ({ page }) => {
  const codes = codesFrom(page)
  await signIn(page, codes)
  await page.getByLabel('کد پنج رقمی').fill(codes[0] ?? '')
  await page.getByRole('button', { name: 'تأیید و ورود' }).click()
  await page.getByLabel('نام و نام خانوادگی').fill(NAME)
  await page.getByRole('button', { name: 'شروع کن' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('فرصت‌های شغلی من')

  // At the sidebar's foot on a desktop, and in the page header's controls on a
  // phone, KN-478 and KN-418.
  await page.getByRole('button', { name: 'خروج' }).click()

  await expect(page.getByRole('button', { name: 'ارسال کد' })).toBeVisible()
  const kept = await page.evaluate(() => window.localStorage.getItem('karnama.session'))
  expect(kept).toBeNull()
})

test("one reader never sees another reader's archive", async ({ page }) => {
  const codes = codesFrom(page)

  // The first reader signs in and keeps a job opportunity.
  await signIn(page, codes)
  await page.getByLabel('کد پنج رقمی').fill(codes[0] ?? '')
  await page.getByRole('button', { name: 'تأیید و ورود' }).click()
  await page.getByLabel('نام و نام خانوادگی').fill(NAME)
  await page.getByRole('button', { name: 'شروع کن' }).click()
  await page.getByRole('button', { name: 'افزودن فرصت شغلی' }).first().click()
  await page.getByRole('dialog').getByRole('button', { name: 'خودت دستی وارد کن' }).click()
  await page.getByRole('dialog').getByLabel('عنوان شغلی*').fill(SECRET)
  await page.getByRole('dialog').getByLabel('نام شرکت*').fill('جایی')
  await page.getByRole('dialog').getByRole('button', { name: 'ذخیره' }).click()
  await expect(page.getByRole('article').filter({ hasText: SECRET })).toBeVisible()

  // They sign out, and somebody else signs in on the same browser.
  await page.getByRole('button', { name: 'خروج' }).click()
  await page.getByLabel('شماره موبایل').fill(OTHER_PHONE)
  await page.getByRole('button', { name: 'ارسال کد' }).click()
  await expect.poll(() => codes.length).toBeGreaterThan(1)
  await page.getByLabel('کد پنج رقمی').fill(codes.at(-1) ?? '')
  await page.getByRole('button', { name: 'تأیید و ورود' }).click()
  await page.getByLabel('نام و نام خانوادگی').fill('کسی دیگر')
  await page.getByRole('button', { name: 'شروع کن' }).click()

  // The board they get is their own, which is empty, KN-421.
  await expect(page.getByText('هنوز آگهی‌ای اضافه نکردی')).toBeVisible()
  await expect(page.getByRole('article').filter({ hasText: SECRET })).toHaveCount(0)
})
