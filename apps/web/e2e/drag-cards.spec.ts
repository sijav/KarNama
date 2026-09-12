import { expect, test } from '@playwright/test'
import { signedIn } from './session'

for (const locale of ['fa-IR', 'en-US']) {
  for (const mode of ['light', 'dark']) {
    test(`cards drag between statuses and persist in ${locale} ${mode}`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name === 'mobile', 'Phone cards use the existing status menu')
      await page.setViewportSize({ width: 1920, height: 1080 })
      const errors: string[] = []
      page.on('pageerror', (error) => errors.push(error.message))
      await signedIn(page)
      await page.goto('/')
      await page.getByRole('button', { name: 'تنظیمات', exact: true }).click()
      const settings = page.getByRole('dialog')
      const english = locale === 'en-US'
      if (english) await settings.getByRole('radio', { name: 'English', exact: true }).click()
      await settings
        .getByRole('radio', { name: english ? (mode === 'dark' ? 'Dark' : 'Light') : mode === 'dark' ? 'تیره' : 'روشن', exact: true })
        .click()
      await settings.getByRole('button', { name: english ? 'Done' : 'تمام', exact: true }).click()
      await page
        .getByRole('button', { name: english ? 'Add job opportunity' : 'افزودن فرصت شغلی', exact: true })
        .first()
        .click()
      const form = page.getByRole('dialog')
      await form.getByRole('button', { name: english ? 'Enter it yourself' : 'خودت دستی وارد کن' }).click()
      await form.getByLabel(english ? 'Job title*' : 'عنوان شغلی*').fill('Drag scenario')
      await form.getByLabel(english ? 'Company name*' : 'نام شرکت*').fill('Test company')
      await form.getByRole('button', { name: english ? 'Save' : 'ذخیره', exact: true }).click()
      const saved = page.getByRole('region', { name: english ? 'Saved' : 'ذخیره‌شده', exact: true })
      const applied = page.getByRole('region', { name: english ? 'Applied' : 'درخواست‌شده', exact: true })
      const rejected = page.getByRole('region', { name: english ? 'Rejected' : 'رد شده', exact: true })
      const card = () => page.getByRole('article').filter({ hasText: 'Drag scenario' }).locator('..')
      await card().dragTo(applied.locator('..'))
      await expect(applied.getByRole('button', { name: 'Drag scenario', exact: true })).toBeVisible()
      await expect(saved.getByRole('article')).toHaveCount(0)
      await expect(page.getByRole('dialog')).toHaveCount(0)
      await page.reload()
      await expect(applied.getByRole('button', { name: 'Drag scenario', exact: true })).toBeVisible()

      const source = await card().boundingBox()
      const target = await rejected.boundingBox()
      if (!source || !target) throw new Error('Missing drag bounds')
      await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2)
      await page.mouse.down()
      await page.mouse.move(source.x + source.width / 2 + 15, source.y + source.height / 2, { steps: 5 })
      await page.mouse.move(target.x + target.width / 2, target.y + 25, { steps: 20 })
      await page.mouse.move(target.x + target.width / 2 + 2, target.y + 26)
      await expect(rejected.locator('button[aria-expanded="false"]')).toHaveCount(0)
      await page.screenshot({ path: testInfo.outputPath('drag-hover.png') })
      await page.mouse.up()
      await expect(rejected.locator('button[aria-expanded="false"]')).toHaveCount(1)
      await rejected.locator('button[aria-expanded="false"]').click()
      await expect(rejected.getByRole('button', { name: 'Drag scenario', exact: true })).toBeVisible()
      await page.screenshot({ path: testInfo.outputPath('drag-saved.png') })
      await card().dragTo(saved.locator('..'))
      await expect(saved.getByRole('button', { name: 'Drag scenario', exact: true })).toBeVisible()
      await expect(rejected.locator('button[aria-expanded="false"]')).toHaveCount(0)
      await page.reload()
      await expect(saved.getByRole('button', { name: 'Drag scenario', exact: true })).toBeVisible()
      if (english && mode === 'dark') {
        const origin = await card().boundingBox()
        if (!origin) throw new Error('Missing card bounds')
        await page.mouse.move(origin.x + 100, origin.y + 60)
        await page.mouse.down()
        await page.mouse.move(origin.x + 150, origin.y + 90, { steps: 10 })
        await page.keyboard.press('Escape')
        await page.mouse.up()
        await expect(saved.getByRole('button', { name: 'Drag scenario', exact: true })).toBeVisible()
        await card().dragTo(rejected.locator('..'))
        await expect(rejected.locator('button[aria-expanded="false"]')).toHaveCount(1)
        await rejected.locator('button[aria-expanded="false"]').click()
        await expect(rejected.getByRole('button', { name: 'Drag scenario', exact: true })).toBeVisible()
      }
      expect(errors).toEqual([])
    })
  }
}
