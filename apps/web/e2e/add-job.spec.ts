import { expect, test } from '@playwright/test'
import { emptyBoard, signedIn } from './session'

/**
 * The add flow, end to end: the only way data enters the product, KN-044.
 *
 * Against the real build, as the shell's spec is, and through the same controls
 * a job seeker uses: the header's button, the modal's steps, and the board
 * afterwards. The board is held in the browser until the API lands, KN-416, so
 * each test starts from a page whose storage is empty.
 */
const A_POSTING = 'https://example.com/jobs/tehran-frontend'
const TITLE = 'توسعه‌دهنده فرانت‌اند'
const COMPANY = 'دیجی‌کالا'

test.beforeEach(async ({ page }) => {
  await page.route('**/graphql', async (route) => {
    const body: unknown = route.request().postDataJSON()
    const variables = typeof body === 'object' && body !== null && 'variables' in body ? body.variables : null
    const source =
      typeof variables === 'object' && variables !== null && 'source' in variables && typeof variables.source === 'string'
        ? variables.source
        : ''
    await route.fulfill({
      json: {
        data: {
          extractJob: {
            title: '',
            company: '',
            employmentTypes: [],
            location: '',
            experience: '',
            jobLevel: null,
            postedAt: '',
            salary: '',
            source: '',
            expiresAt: '',
            postingUrl: '',
            description: source.startsWith('https://') ? '' : source,
          },
        },
      },
    })
  })
  // The add flow is behind signing in, KN-046, and this spec is about the flow.
  await signedIn(page)
  await page.goto('/')
  // An empty board to start from, cleared once rather than on every load: a
  // reload is part of the first test and what it saved has to survive it.
  await emptyBoard(page)
  await page.reload()
})

test('a pasted link goes through Review and lands on the board as Saved', async ({ page }) => {
  await page.getByRole('button', { name: 'افزودن فرصت شغلی' }).first().click()

  const modal = page.getByRole('dialog')
  await modal.getByRole('textbox').first().fill(A_POSTING)
  await modal.getByRole('button', { name: 'استخراج اطلاعات' }).click()

  // Review, where what could be read is shown and the rest is the reader's to
  // correct. The link is carried through; the title and the company are theirs.
  await modal.getByLabel('عنوان شغلی*').fill(TITLE)
  await modal.getByLabel('نام شرکت*').fill(COMPANY)
  await modal.getByRole('button', { name: 'ذخیره' }).click()

  // On the board, in the first column, which is Saved.
  await expect(page.getByRole('dialog')).toHaveCount(0)
  const card = page.getByRole('article').filter({ hasText: TITLE })
  await expect(card).toBeVisible()
  await expect(card).toContainText(COMPANY)

  // And it is still there after a reload, because it was really written down.
  await page.reload()
  await expect(page.getByRole('article').filter({ hasText: TITLE })).toBeVisible()
})

test('the manual path saves a record with no link at all', async ({ page }) => {
  await page.getByRole('button', { name: 'افزودن فرصت شغلی' }).first().click()

  const modal = page.getByRole('dialog')
  await modal.getByRole('button', { name: 'خودت دستی وارد کن' }).click()
  await modal.getByLabel('عنوان شغلی*').fill(TITLE)
  await modal.getByLabel('نام شرکت*').fill(COMPANY)
  await modal.getByRole('button', { name: 'ذخیره' }).click()

  await expect(page.getByRole('article').filter({ hasText: TITLE })).toBeVisible()
})

test('dates and posting links are validated before a job can be saved', async ({ page }) => {
  await page.getByRole('button', { name: 'افزودن فرصت شغلی' }).first().click()
  const modal = page.getByRole('dialog')
  await modal.getByRole('button', { name: 'خودت دستی وارد کن' }).click()
  await modal.getByLabel('عنوان شغلی*').fill(TITLE)
  await modal.getByLabel('نام شرکت*').fill(COMPANY)
  const posted = modal.getByLabel('تاریخ انتشار')
  const expires = modal.getByLabel('تاریخ انقضا')
  await expect(posted).toHaveAttribute('type', 'date')
  await expect(expires).toHaveAttribute('type', 'date')
  await posted.fill('2026-09-12')
  await expires.fill('2026-09-01')
  await modal.getByRole('button', { name: 'ذخیره' }).click()
  await expect(expires).toHaveAttribute('aria-invalid', 'true')
  await expires.fill('2026-10-12')
  await modal.getByLabel('لینک آگهی', { exact: true }).fill('not-a-link')
  await modal.getByRole('button', { name: 'ذخیره' }).click()
  await expect(modal.getByLabel('لینک آگهی', { exact: true })).toHaveAttribute('aria-invalid', 'true')
  await modal.getByLabel('لینک آگهی', { exact: true }).fill(A_POSTING)
  await modal.getByRole('button', { name: 'ذخیره' }).click()
  await page.reload()
  await expect(page.getByRole('article').filter({ hasText: TITLE })).toBeVisible()
})

test('pasted ad text survives saving, editing with Enter, and reloading', async ({ page }) => {
  const source = 'Frontend developer\nBuild React applications for Example company.'
  await page.getByRole('button', { name: 'افزودن فرصت شغلی' }).first().click()
  const modal = page.getByRole('dialog')
  await modal.getByRole('textbox').first().fill(source)
  await modal.getByRole('button', { name: 'استخراج اطلاعات' }).click()
  await expect(modal.getByLabel('لینک آگهی', { exact: true })).toHaveValue('')
  await expect(modal.getByLabel('شرح شغل و مسئولیت‌ها')).toHaveValue(source)
  await modal.getByLabel('عنوان شغلی*').fill(TITLE)
  await modal.getByLabel('نام شرکت*').fill(COMPANY)
  await modal.getByRole('button', { name: 'ذخیره' }).click()
  await page.getByRole('button', { name: TITLE, exact: true }).click()
  await expect(modal.getByLabel('شرح شغل و مسئولیت‌ها')).toHaveValue(source)
  await modal.getByLabel('عنوان شغلی*').fill('Updated frontend role')
  await modal.getByLabel('عنوان شغلی*').press('Enter')
  await expect(modal).toHaveCount(0)
  await page.reload()
  await page.getByRole('button', { name: 'Updated frontend role', exact: true }).click()
  await expect(modal.getByLabel('شرح شغل و مسئولیت‌ها')).toHaveValue(source)
})

test('the add destination opens the flow and goes back to the board when it is closed', async ({ page }) => {
  await page.goto('/#/add')

  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('dialog').getByRole('button', { name: 'انصراف' }).click()

  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page).toHaveURL(/#\/jobs$/)
})
