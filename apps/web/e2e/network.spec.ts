import { expect, test, type Locator, type Page } from '@playwright/test'
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

// A finger held on a card until what it starts is in view, as board.spec.ts holds
// one for KN-428: a real touch through the browser's own protocol, since
// Playwright's touchscreen only taps and its mouse is not a touch. It waits on
// what the hold produces rather than sleeping past HOLD_MS, so a slow machine
// cannot end the touch before the hold has fired. Both events go to the one
// point, so the press never approaches the hold's 10 pixels of slop. Kept local
// to each spec while there are two of them; a third caller is when it moves into
// `./session`, which both already import.
const hold = async (page: Page, target: Locator, until: Locator) => {
  const box = await target.boundingBox()
  if (!box) throw new Error('nothing to hold')
  const session = await page.context().newCDPSession(page)
  const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 }
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] })
  await expect(until).toBeVisible()
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await session.detach()
}

test.beforeEach(async ({ page }) => {
  await signedIn(page)
  await page.goto('/network')
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

test('two people are selected and deleted through the bar at the foot', async ({ page }, testInfo) => {
  for (const name of [MINA, REZA]) {
    await page.getByRole('button', { name: 'افزودن مخاطب' }).first().click()
    await page.getByRole('dialog').getByLabel('اسم و فامیل').fill(name)
    await page.getByRole('dialog').getByRole('button', { name: 'ذخیره' }).click()
    await expect(page.getByText(name)).toBeVisible()
  }

  const phone = testInfo.project.name === 'mobile'
  const cardFor = (name: string) => page.getByRole('article').filter({ hasText: name })
  const bar = page.getByRole('region', { name: 'کارهای گروهی' })

  // A phone has no hover, so the checkbox stays folded away with no pointer
  // events until a held press starts the selection, KN-533 and DESIGN.md's
  // Contact Card. The first person is held and the second tapped, which is how a
  // phone does it; the desktop keeps the hover it always had.
  if (phone) {
    await hold(page, cardFor(MINA).getByRole('button', { name: MINA }), bar)
  } else {
    await cardFor(MINA).hover()
    await cardFor(MINA).getByRole('checkbox').check()
  }
  // Both are asserted chosen rather than inferred from the empty state, which
  // would follow from deleting one person as readily as two.
  await expect(cardFor(MINA).getByRole('checkbox')).toBeChecked()

  // tap() rather than check() on a phone: check() goes through Playwright's mouse
  // click path even where the context has touch, so it would prove the desktop's
  // gesture at a phone's viewport. tap() waits for actionability and sends the
  // touch the project's hasTouch allows.
  if (phone) {
    await cardFor(REZA).getByRole('checkbox').tap()
  } else {
    await cardFor(REZA).hover()
    await cardFor(REZA).getByRole('checkbox').check()
  }
  await expect(cardFor(REZA).getByRole('checkbox')).toBeChecked()

  await expect(bar).toBeVisible()
  await bar.getByRole('button', { name: 'حذف' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'حذف' }).click()

  await expect(page.getByText('هنوز کسی رو به شبکه‌ت اضافه نکردی')).toBeVisible()
})
