import { expect, test, type Page } from '@playwright/test'

/**
 * Signing in, end to end, KN-046.
 *
 * The provider is mocked for the MVP, the owner's decision: no SMS is sent and
 * the code is written to the console, so the test reads it there, which is
 * exactly what whoever is testing the product does.
 */
const PHONE = '09120000000'
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
  await expect(page.getByText(`ارسال شده به ${PHONE}`)).toBeVisible()
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
  await page.getByRole('button', { name: 'ورود' }).click()

  // The first login asks who this is before anything else.
  await expect(page.getByText('تو را چه صدا کنیم؟')).toBeVisible()
  await page.getByLabel('اسم و فامیل').fill(NAME)
  await page.getByRole('button', { name: 'ادامه' }).click()

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('فرصت‌های شغلی من')

  // And the session is real: a reload keeps it, it does not ask again.
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('فرصت‌های شغلی من')
})

test('a wrong code says so and another can be sent', async ({ page }) => {
  const codes = codesFrom(page)
  await signIn(page, codes)

  await page.getByLabel('کد پنج رقمی').fill('00000')
  await page.getByRole('button', { name: 'ورود' }).click()
  await expect(page.getByText('این کد درست نیست. دوباره امتحان کن.')).toBeVisible()

  // Resending really sends another: the mock says so, and the new one works.
  await page.getByRole('button', { name: 'ارسال کد دیگر' }).click()
  await expect.poll(() => codes.length).toBeGreaterThan(1)
  await page.getByLabel('کد پنج رقمی').fill(codes.at(-1) ?? '')
  await page.getByRole('button', { name: 'ورود' }).click()
  await expect(page.getByText('تو را چه صدا کنیم؟')).toBeVisible()
})

test('signing out clears the session and asks for a number again', async ({ page, browserName }, testInfo) => {
  const codes = codesFrom(page)
  await signIn(page, codes)
  await page.getByLabel('کد پنج رقمی').fill(codes[0] ?? '')
  await page.getByRole('button', { name: 'ورود' }).click()
  await page.getByLabel('اسم و فامیل').fill(NAME)
  await page.getByRole('button', { name: 'ادامه' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('فرصت‌های شغلی من')

  // The control is in the sidebar, which a phone does not draw: the tab bar has
  // room for the three destinations and nothing else, DESIGN.md section 5.
  test.skip(testInfo.project.name === 'mobile', `${browserName} at a phone's width has no sidebar to sign out from`)
  await page.getByRole('button', { name: 'خروج' }).click()

  await expect(page.getByRole('button', { name: 'ارسال کد' })).toBeVisible()
  const kept = await page.evaluate(() => window.localStorage.getItem('karnama.session'))
  expect(kept).toBeNull()
})

test("one reader never sees another reader's archive", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'signing out is in the sidebar, which a phone does not draw')
  const codes = codesFrom(page)

  // The first reader signs in and keeps a job opportunity.
  await signIn(page, codes)
  await page.getByLabel('کد پنج رقمی').fill(codes[0] ?? '')
  await page.getByRole('button', { name: 'ورود' }).click()
  await page.getByLabel('اسم و فامیل').fill(NAME)
  await page.getByRole('button', { name: 'ادامه' }).click()
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
  await page.getByRole('button', { name: 'ورود' }).click()
  await page.getByLabel('اسم و فامیل').fill('کسی دیگر')
  await page.getByRole('button', { name: 'ادامه' }).click()

  // The board they get is their own, which is empty, KN-421.
  await expect(page.getByText('هنوز آگهی‌ای اضافه نکردی')).toBeVisible()
  await expect(page.getByRole('article').filter({ hasText: SECRET })).toHaveCount(0)
})
