import { expect, test } from '@playwright/test'
import { signedIn } from './session'

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
  // The add flow is behind signing in, KN-046, and this spec is about the flow.
  await signedIn(page)
  await page.goto('/')
  // An empty board to start from, cleared once rather than on every load: a
  // reload is part of the first test and what it saved has to survive it.
  await page.evaluate(() => {
    window.localStorage.removeItem('karnama.records')
  })
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

test('the add destination opens the flow and goes back to the board when it is closed', async ({ page }) => {
  await page.goto('/#/add')

  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('dialog').getByRole('button', { name: 'انصراف' }).click()

  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page).toHaveURL(/#\/jobs$/)
})
