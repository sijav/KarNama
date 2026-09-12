import { expect, test } from '@playwright/test'
import { signedIn } from './session'

for (const locale of ['fa-IR', 'en-US']) {
  for (const mode of ['light', 'dark']) {
    test(`viewport contains board and dialogs in ${locale} ${mode}`, async ({ page }, testInfo) => {
      const english = locale === 'en-US'
      await signedIn(page)
      await page.goto('/')
      await page.getByRole('button', { name: 'تنظیمات', exact: true }).click()
      const settings = page.getByRole('dialog')
      if (english) await settings.getByRole('radio', { name: 'English', exact: true }).click()
      await settings
        .getByRole('radio', { name: english ? (mode === 'dark' ? 'Dark' : 'Light') : mode === 'dark' ? 'تیره' : 'روشن', exact: true })
        .click()
      await settings.getByRole('button', { name: english ? 'Load sample data' : 'بارگذاری داده‌های نمونه' }).click()
      await settings.getByRole('button', { name: english ? 'Done' : 'تمام', exact: true }).click()
      await expect(settings).toHaveCount(0)
      await expect(page.getByRole('article').first()).toBeVisible()
      const bounds = async () =>
        page.evaluate(() => ({
          viewport: window.document.documentElement.clientWidth,
          screen: window.visualViewport?.width,
          width: window.document.documentElement.scrollWidth,
          height: window.document.documentElement.scrollHeight,
          availableHeight: window.innerHeight,
        }))
      await page.screenshot({ path: testInfo.outputPath('board.png'), animations: 'disabled', scale: 'css' })
      expect((await bounds()).width).toBeLessThanOrEqual((await bounds()).viewport + 1)
      expect((await bounds()).height).toBeLessThanOrEqual((await bounds()).availableHeight + 1)
      expect((await bounds()).screen).toBeCloseTo((await bounds()).viewport, 0)
      expect((await bounds()).viewport).toBe(page.viewportSize()?.width)
      const cards =
        testInfo.project.name === 'mobile'
          ? page.getByRole('article')
          : page.getByRole('region', { name: english ? 'Saved' : 'ذخیره‌شده', exact: true }).getByRole('article')
      await cards.last().scrollIntoViewIfNeeded()
      await expect(cards.last()).toBeInViewport({ ratio: 1 })
      expect(await page.evaluate(() => ({ x: window.scrollX, y: window.scrollY }))).toEqual({ x: 0, y: 0 })
      await cards.first().scrollIntoViewIfNeeded()
      await page.getByRole('article').first().getByRole('button').first().click()
      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible()
      const box = await dialog.boundingBox()
      if (!box) throw new Error('Dialog missing')
      expect(box.x).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width).toBeLessThanOrEqual((await bounds()).viewport)
      expect(box.y).toBeGreaterThanOrEqual(0)
      expect(box.y + box.height).toBeLessThanOrEqual((await bounds()).availableHeight)
      await expect(dialog.getByRole('button', { name: english ? 'Save' : 'ذخیره', exact: true })).toBeInViewport()
      await expect(dialog.getByRole('button', { name: english ? 'Delete job opportunity' : 'حذف فرصت شغلی', exact: true })).toBeInViewport()
      await page.screenshot({ path: testInfo.outputPath('dialog.png'), animations: 'disabled', scale: 'css' })
      expect((await bounds()).width).toBeLessThanOrEqual((await bounds()).viewport + 1)
    })
  }
}
