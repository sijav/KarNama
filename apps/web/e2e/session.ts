import { expect, type Page } from '@playwright/test'

/**
 * A page that is already signed in, for the specs that are not about signing
 * in, KN-046.
 *
 * The session is seeded before anything runs, the way a returning reader's
 * browser already holds one, so a spec about the board is about the board. The
 * flow itself is `sign-in.spec.ts`.
 */
/**
 * Seeds the session only. It runs on every navigation, a reload included, so it
 * must not touch anything a test is checking survived one: clearing the board
 * here wiped the job opportunity the add flow had just saved.
 */
export const signedIn = async (page: Page, name = 'سارا محمدی', phone = '09120000000') => {
  await page.addInitScript(
    (who) => {
      window.localStorage.setItem('karnama.session', JSON.stringify(who))
    },
    { phone, name, since: new Date(Date.UTC(2026, 8, 1)).toISOString() },
  )
}

/** Every board this browser holds, whoever it belongs to, KN-421. */
export const emptyBoard = async (page: Page) => {
  await page.evaluate(() => {
    for (const key of Object.keys(window.localStorage)) {
      if (key.startsWith('karnama.records')) window.localStorage.removeItem(key)
    }
  })
}

/**
 * A job opportunity added the way a reader adds one, through the add flow rather
 * than through storage, so what a test drives is what a job seeker drives.
 *
 * Moved here from `board.spec.ts` for KN-695, which gave it a third caller: the
 * spec proving the board WAITS before it filters needs the same seed, and it
 * cannot reuse that spec's `beforeEach` because Playwright's clock has to be
 * installed before the first navigation. `network.spec.ts` already records the
 * rule this follows, that a third caller is when a helper moves into `./session`.
 */
export const addJob = async (page: Page, title: string) => {
  await page.getByRole('button', { name: 'افزودن فرصت شغلی' }).first().click()
  const modal = page.getByRole('dialog')
  await modal.getByRole('button', { name: 'خودت دستی وارد کن' }).click()
  await modal.getByLabel('عنوان شغلی*').fill(title)
  await modal.getByLabel('نام شرکت*').fill('یک شرکت')
  await modal.getByRole('button', { name: 'ذخیره' }).click()
  await expect(page.getByRole('article').filter({ hasText: title })).toBeVisible()
}

/**
 * A signed-in reader on an empty board holding the titles given, in order.
 *
 * It navigates, so anything that must precede the first navigation, the clock
 * among it, is installed by the caller BEFORE this runs.
 */
export const prepareBoard = async (page: Page, titles: readonly string[]) => {
  await signedIn(page)
  await page.goto('/')
  await emptyBoard(page)
  await page.reload()
  for (const title of titles) await addJob(page, title)
}

/** A person added through the network page's own add flow. */
export const addContact = async (page: Page, name: string) => {
  await page.getByRole('button', { name: 'افزودن مخاطب' }).first().click()
  const modal = page.getByRole('dialog')
  await modal.getByLabel('اسم و فامیل').fill(name)
  await modal.getByRole('button', { name: 'ذخیره' }).click()
  await expect(page.getByText(name)).toBeVisible()
}

/** A signed-in reader on an empty network page holding the people given. */
export const prepareNetwork = async (page: Page, names: readonly string[]) => {
  await signedIn(page)
  await page.goto('/network')
  await emptyBoard(page)
  await page.reload()
  for (const name of names) await addContact(page, name)
}
