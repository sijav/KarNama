import { expect, test } from '@playwright/test'
import { signedIn } from './session'

test('settings apply immediately and survive reload; sample loading does not duplicate records', async ({ page }, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await signedIn(page)
  await page.goto('/')
  await page.getByRole('button', { name: 'تنظیمات', exact: true }).click()
  let dialog = page.getByRole('dialog')
  await dialog.getByRole('radio', { name: 'English', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-US')
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr')
  await dialog.getByRole('radio', { name: 'Dark', exact: true }).click()
  await expect(dialog.getByRole('radio', { name: 'Dark', exact: true })).toBeChecked()
  await dialog.getByRole('button', { name: 'Load sample data' }).click()
  await expect(dialog.getByRole('status')).toBeVisible()
  await dialog.getByRole('button', { name: 'Done', exact: true }).click()
  await expect(page.getByRole('article').first()).toBeVisible()
  await expect(
    page
      .getByText('Saved', { exact: true })
      .or(page.getByRole('button', { name: 'Saved (6)', exact: true }))
      .first(),
  ).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('board-en-dark.png'), fullPage: true })
  await page.reload()
  await page.getByRole('button', { name: 'Settings', exact: true }).click()
  dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('radio', { name: 'Dark', exact: true })).toBeChecked()
  await expect(dialog.getByRole('radio', { name: 'English', exact: true })).toBeChecked()
  await dialog.getByRole('button', { name: 'Load sample data' }).click()
  const counts = await page.evaluate(() => {
    const records: unknown = JSON.parse(window.localStorage.getItem('karnama.records:09120000000') ?? '{}')
    if (
      typeof records !== 'object' ||
      records === null ||
      !('jobs' in records) ||
      !Array.isArray(records.jobs) ||
      !('contacts' in records) ||
      !Array.isArray(records.contacts)
    )
      throw new Error('Missing saved records')
    return { jobs: records.jobs.length, contacts: records.contacts.length }
  })
  expect(counts).toEqual({ jobs: 30, contacts: 6 })
  await page.screenshot({ path: testInfo.outputPath('settings-en-dark.png') })
  await dialog.getByRole('radio', { name: 'Light', exact: true }).click()
  await page.screenshot({ path: testInfo.outputPath('settings-en-light.png') })
  await dialog.getByRole('radio', { name: 'فارسی', exact: true }).click()
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await page.screenshot({ path: testInfo.outputPath('settings-fa-light.png') })
  await dialog.getByRole('radio', { name: 'تیره', exact: true }).click()
  await page.screenshot({ path: testInfo.outputPath('settings-fa-dark.png') })
  await dialog.getByRole('button', { name: 'تمام', exact: true }).click()
  await page.goto('/#/network')
  await expect(page.getByRole('article')).toHaveCount(6)
  await page.screenshot({ path: testInfo.outputPath('network-fa-dark.png'), fullPage: true })
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang', 'fa-IR')
  expect(errors).toEqual([])
})
