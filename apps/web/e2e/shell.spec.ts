import { expect, test } from '@playwright/test'

// The viewports come from the design: the Screens canvas draws desktop at
// 1440 by 900 and mobile at 390 by 844, so the e2e projects use exactly those
// rather than Playwright's defaults.

test('the shell renders in Persian, right to left', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.locator('html')).toHaveAttribute('lang', 'fa-IR')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('کارنما')
  await expect(page.getByText('فرصت‌های شغلی من')).toBeVisible()
})

test('the page does not scroll sideways, which is how an RTL layout bug shows', async ({ page }) => {
  await page.goto('/')

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(0)
})

test('the built bundle loads with no console error', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))

  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

  expect(errors).toEqual([])
})
