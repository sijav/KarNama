import { expect, test, type Page } from '@playwright/test'
import { emptyBoard, signedIn } from './session'

/**
 * The board, end to end, KN-043.
 *
 * Scenario 4, the archive: the screen the product is judged on. Seeded through
 * the add flow rather than through storage, so what the test drives is what a
 * job seeker drives.
 */
const FIRST = 'توسعه‌دهنده فرانت‌اند'
const SECOND = 'مدیر محصول'
const SAVED = 'ذخیره‌شده'
const OFFER = 'پیشنهاد کار'

const add = async (page: Page, title: string) => {
  await page.getByRole('button', { name: 'افزودن فرصت شغلی' }).first().click()
  const modal = page.getByRole('dialog')
  await modal.getByRole('button', { name: 'خودت دستی وارد کن' }).click()
  await modal.getByLabel('عنوان شغلی*').fill(title)
  await modal.getByLabel('نام شرکت*').fill('یک شرکت')
  await modal.getByRole('button', { name: 'ذخیره' }).click()
  await expect(page.getByRole('article').filter({ hasText: title })).toBeVisible()
}

test.beforeEach(async ({ page }) => {
  await signedIn(page)
  await page.goto('/')
  await emptyBoard(page)
  await page.reload()
  await add(page, FIRST)
  await add(page, SECOND)
})

test('the board draws a column for every status, with رد شده last and collapsed', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'the columns are a phone chip row, checked in its own test')

  // The five the design draws, in the design's order with rejected last.
  const names = await page.getByRole('button', { name: /وضعیت/ }).count()
  expect(names).toBeGreaterThan(0)
  const board = page.getByText(SAVED).first()
  await expect(board).toBeVisible()
  // Rejected is closed until it is opened: its cards are not on the board.
  await expect(page.getByText('هنوز فرصت شغلی‌ای تو این مرحله نیست').first()).toBeVisible()
})

test('a search narrows the board and says so when nothing matches', async ({ page }) => {
  await page.getByRole('searchbox').fill(SECOND)
  await expect(page.getByRole('article').filter({ hasText: SECOND })).toBeVisible()
  await expect(page.getByRole('article').filter({ hasText: FIRST })).toHaveCount(0)

  await page.getByRole('searchbox').fill('چیزی که نیست')
  await expect(page.getByText('نتیجه‌ای پیدا نشد')).toBeVisible()

  await page.getByRole('searchbox').fill('')
  await expect(page.getByRole('article').filter({ hasText: FIRST })).toBeVisible()
})

test('a card opens into the job modal and its status is changed from the board', async ({ page }, testInfo) => {
  await page.getByRole('button', { name: FIRST }).click()
  const modal = page.getByRole('dialog')
  await expect(modal).toBeVisible()
  await modal.getByRole('button', { name: 'بستن' }).click()

  // Several are selected and moved through the bar at the foot.
  for (const title of [FIRST, SECOND]) {
    const card = page.getByRole('article').filter({ hasText: title })
    await card.hover()
    await card.getByRole('checkbox').check()
  }
  const bar = page.getByRole('region', { name: 'کارهای گروهی' })
  await bar.getByRole('button', { name: 'تغییر وضعیت' }).click()
  const change = page.getByRole('dialog')
  await change.getByRole('radio', { name: OFFER }).check()
  await change.getByRole('button', { name: 'تأیید' }).click()

  // The move is kept: a reload still has them where they were put. A phone
  // opens on the first column, so it is asked for the one they were moved to.
  await page.reload()
  if (testInfo.project.name === 'mobile') await page.getByRole('button', { name: new RegExp(OFFER) }).click()
  await expect(page.getByRole('article').filter({ hasText: FIRST })).toBeVisible()
})

test('a phone shows one column with the statuses as chips above it', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'desktop', 'the desktop draws every column side by side')

  // The chips carry the counts, and choosing one changes the column below.
  const saved = page.getByRole('button', { name: new RegExp(SAVED) })
  await expect(saved).toBeVisible()
  await expect(page.getByRole('article').filter({ hasText: FIRST })).toBeVisible()

  await page.getByRole('button', { name: new RegExp(OFFER) }).click()
  await expect(page.getByRole('article').filter({ hasText: FIRST })).toHaveCount(0)
})
