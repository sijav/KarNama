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

test('the language choice survives a reload', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')

  await page.getByRole('button', { name: 'فارسی' }).click()
  await page.getByRole('menuitem', { name: 'English' }).click()
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('KarNama')

  // The reload is the whole test. Choosing a language and having it stick until
  // the next mount is not persistence, and that is exactly what shipped: the
  // root passed a forced locale that the provider merged over the stored one,
  // so the sequence choose, reload, back to Persian was the real behaviour.
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-US')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('KarNama')
})
