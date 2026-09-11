import { expect, test } from '@playwright/test'
import { emptyBoard, signedIn } from './session'

/**
 * The network page, end to end, KN-056.
 *
 * Page-map row 5: the people the reader keeps, added, edited, selected and
 * deleted through the same controls a job seeker uses.
 */
// Not the signed-in reader's own name: the sidebar shows that, and a page
// query would find both.
const MINA = 'مینا رضایی'
const RENAMED = 'مینا رضاییِ راد'
const REZA = 'رضا کریمی'

test.beforeEach(async ({ page }) => {
  await signedIn(page)
  await page.goto('/#/network')
  await emptyBoard(page)
  await page.reload()
})

test('a fresh account sees the empty state and can add the first person', async ({ page }) => {
  await expect(page.getByText('هنوز کسی رو به شبکه‌ت اضافه نکردی')).toBeVisible()

  await page.getByRole('button', { name: 'افزودن مخاطب' }).first().click()
  const modal = page.getByRole('dialog')
  await modal.getByLabel('اسم و فامیل').fill(MINA)
  await modal.getByLabel('سمت').fill('کارشناس منابع انسانی')
  await modal.getByRole('button', { name: 'ذخیره' }).click()

  await expect(page.getByText(MINA)).toBeVisible()
  await expect(page.getByText('هنوز کسی رو به شبکه‌ت اضافه نکردی')).toHaveCount(0)

  // It was really written down: a reload still shows them.
  await page.reload()
  await expect(page.getByText(MINA)).toBeVisible()
})

test('a contact can be edited, and the change is what the page shows', async ({ page }) => {
  await page.getByRole('button', { name: 'افزودن مخاطب' }).first().click()
  await page.getByRole('dialog').getByLabel('اسم و فامیل').fill(MINA)
  await page.getByRole('dialog').getByRole('button', { name: 'ذخیره' }).click()
  await expect(page.getByText(MINA)).toBeVisible()

  await page.getByRole('button', { name: MINA }).click()
  const modal = page.getByRole('dialog')
  await modal.getByLabel('اسم و فامیل').fill(RENAMED)
  await modal.getByRole('button', { name: 'ذخیره' }).click()

  await expect(page.getByText(RENAMED)).toBeVisible()
  await expect(page.getByText(MINA, { exact: true })).toHaveCount(0)
})

test('two people are selected and deleted through the bar at the foot', async ({ page }) => {
  for (const name of [MINA, REZA]) {
    await page.getByRole('button', { name: 'افزودن مخاطب' }).first().click()
    await page.getByRole('dialog').getByLabel('اسم و فامیل').fill(name)
    await page.getByRole('dialog').getByRole('button', { name: 'ذخیره' }).click()
    await expect(page.getByText(name)).toBeVisible()
  }

  for (const name of [MINA, REZA]) {
    const card = page.getByRole('article').filter({ hasText: name })
    await card.hover()
    await card.getByRole('checkbox').check()
  }

  const bar = page.getByRole('region', { name: 'کارهای گروهی' })
  await expect(bar).toBeVisible()
  await bar.getByRole('button', { name: 'حذف' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'حذف' }).click()

  await expect(page.getByText('هنوز کسی رو به شبکه‌ت اضافه نکردی')).toBeVisible()
})
