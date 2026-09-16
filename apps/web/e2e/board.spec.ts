import { expect, test, type Locator, type Page } from '@playwright/test'
import { prepareBoard } from './session'

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
// What the column's menu control is called, node 259:2.
const ACTIONS = 'کارهای وضعیت'

// A finger held on a card until what it starts is in view, KN-428: a real
// touch, sent through the browser's own protocol, since Playwright's
// touchscreen only taps and its mouse is not a touch.
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

// The seeding moved into `./session` for KN-695, which gave it a third caller:
// `search-waits.spec.ts` needs the same board but must install Playwright's clock
// before the first navigation, so it cannot run after this hook.
test.beforeEach(async ({ page }) => {
  await prepareBoard(page, [FIRST, SECOND])
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

  // Several are selected and moved through the bar at the foot. A phone's card
  // offers no checkbox until a press held on one starts the selection, KN-428,
  // and after that every card offers its own.
  const bar = page.getByRole('region', { name: 'کارهای گروهی' })
  for (const title of [FIRST, SECOND]) {
    const card = page.getByRole('article').filter({ hasText: title })
    if (testInfo.project.name === 'mobile' && title === FIRST) {
      await hold(page, card.getByRole('button', { name: title }), bar)
      await expect(page.getByRole('dialog')).toHaveCount(0)
      await expect(card.getByRole('checkbox')).toBeChecked()
      continue
    }
    await card.hover()
    await card.getByRole('checkbox').check()
  }
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

test('the job modal keeps a note, a person and the history of its moves, KN-045', async ({ page }, testInfo) => {
  await page.getByRole('button', { name: FIRST }).click()
  const modal = page.getByRole('dialog')

  // Its status changes from the modal's own header, and the history tab grows.
  await modal.getByRole('button', { name: new RegExp(SAVED) }).click()
  await page.getByRole('dialog').getByRole('radio', { name: OFFER }).check()
  await page.getByRole('dialog').getByRole('button', { name: 'تأیید' }).click()
  await modal.getByRole('tab', { name: 'سابقه' }).click()
  await expect(modal.getByText(OFFER).first()).toBeVisible()

  // A note is written and a person is kept against this job opportunity.
  await modal.getByRole('tab', { name: 'یادداشت' }).click()
  await modal.getByRole('textbox').fill('با مدیر فنی صحبت شد')
  await modal.getByRole('tab', { name: 'افراد مرتبط' }).click()
  await modal.getByRole('button', { name: 'افزودن مخاطب' }).click()
  const person = page.getByRole('dialog').last()
  await person.getByLabel('اسم و فامیل').fill('مینا رضایی')
  await person.getByRole('button', { name: 'ذخیره' }).click()
  await expect(modal.getByText('مینا رضایی')).toBeVisible()

  // Saved, closed, and opened again: all of it is still there.
  await modal.getByRole('button', { name: 'ذخیره' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.reload()
  // It was moved, and a phone opens on the first column, so it is asked for the
  // column it now sits in.
  if (testInfo.project.name === 'mobile') await page.getByRole('button', { name: new RegExp(OFFER) }).click()
  await page.getByRole('button', { name: FIRST }).click()
  const reopened = page.getByRole('dialog')
  await reopened.getByRole('tab', { name: 'افراد مرتبط' }).click()
  await expect(reopened.getByText('مینا رضایی')).toBeVisible()
  await reopened.getByRole('tab', { name: 'سابقه' }).click()
  await expect(reopened.getByText(OFFER).first()).toBeVisible()
})

test('a search cannot make a column deletable, and Rename really renames, KN-422', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'the column menu is the desktop board')

  // A search that matches nothing in this column must not offer to delete it:
  // the job opportunities it holds are hidden, not gone.
  await page.getByRole('searchbox').fill(SECOND)
  // Wait for the search to have been APPLIED before opening the menu, KN-695. The
  // board now filters once typing pauses, so opening the menu straight away would
  // find the cards still shown and delete disabled for the wrong reason: this
  // test's claim is that HIDDEN records keep a column undeletable, which needs
  // them actually hidden first.
  await expect(page.getByRole('article').filter({ hasText: FIRST })).toHaveCount(0)
  await page.getByRole('button', { name: new RegExp(`${ACTIONS}: ${SAVED}`) }).click()
  await expect(page.getByRole('menuitem', { name: 'حذف وضعیت' })).toBeDisabled()

  // Rename opens a field, and the name it is given is the column's afterwards.
  await page.getByRole('menuitem', { name: 'تغییر نام' }).click()
  const rename = page.getByRole('dialog')
  await rename.getByRole('textbox').fill('در انتظار پاسخ')
  await rename.getByRole('button', { name: 'ذخیره' }).click()
  await expect(page.getByText('در انتظار پاسخ')).toBeVisible()

  // And it is kept: a reload still shows the new name.
  await page.reload()
  await expect(page.getByText('در انتظار پاسخ')).toBeVisible()
})
