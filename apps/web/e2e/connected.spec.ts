import { expect, test } from '@playwright/test'

for (const locale of ['en-US', 'fa-IR']) {
  for (const colorScheme of ['light', 'dark']) {
    test(`connected sign-in in ${locale} ${colorScheme}`, async ({ page }, info) => {
      await page.addInitScript((preferences) => { window.localStorage.setItem('karnama.preferences', JSON.stringify(preferences)) }, { locale, colorScheme })
      await page.goto('/')
      await expect(page.locator('html')).toHaveAttribute('lang', locale)
      await expect(page.locator('html')).toHaveAttribute('dir', locale === 'fa-IR' ? 'rtl' : 'ltr')
      await expect(page.getByRole('button', { name: locale === 'fa-IR' ? 'ارسال کد' : 'Send the code', exact: true })).toBeVisible()
      await page.screenshot({ path: info.outputPath('sign-in.png') })
    })
  }
}

test('server login, wrong code, signup, extraction, reload and logout', async ({ page, request }) => {
  await page.goto('/')
  const phone = `091${String(Math.floor(Math.random() * 100_000_000)).padStart(8, '0')}`
  await page.getByLabel('شماره موبایل', { exact: true }).fill(phone)
  await page.getByRole('button', { name: 'ارسال کد', exact: true }).click()
  await expect(page.getByText('هیچ پیامی واقعاً ارسال نمی‌شود', { exact: false })).toHaveCount(0)
  await expect(page.getByLabel('کد پنج رقمی')).toBeVisible()
  const payload: unknown = await (await request.get(`http://127.0.0.1:4400/__test__/code?phone=${phone}`)).json()
  if (typeof payload !== 'object' || payload === null || !('code' in payload) || typeof payload.code !== 'string')
    throw new Error('No test SMS')
  const code = payload.code
  await page.getByLabel('کد پنج رقمی').fill(code === '11111' ? '22222' : '11111')
  await page.getByRole('button', { name: 'ورود', exact: true }).click()
  await expect(page.getByRole('alert')).toBeVisible()
  await page.getByLabel('کد پنج رقمی').fill(code)
  await page.getByRole('button', { name: 'ورود', exact: true }).click()
  await page.getByLabel('اسم و فامیل').fill('Connected Scenario')
  await page.getByRole('button', { name: 'ادامه', exact: true }).click()
  await page.reload()
  await expect(page.getByText('فرصت‌های شغلی من', { exact: true }).first()).toBeVisible()
  await page.goto('/#/add')
  const modal = page.getByRole('dialog')
  const source = 'Frontend developer at Example in Berlin. Full time and remote. 3 years experience. EUR 60,000. Posted 2026-09-12.'
  await modal.getByRole('textbox').first().fill(source)
  await modal.getByRole('button', { name: 'استخراج اطلاعات' }).click()
  await expect(modal.getByLabel('عنوان شغلی*')).toHaveValue('Frontend developer')
  await expect(modal.getByLabel('نام شرکت*')).toHaveValue('Example')
  await expect(modal.getByLabel('تاریخ انتشار')).toHaveValue('2026-09-12')
  await expect(modal.getByLabel('شرح شغل و مسئولیت‌ها')).toHaveValue(source)
  await modal.getByLabel('عنوان شغلی*').fill('Reviewed frontend job')
  await modal.getByRole('button', { name: 'ذخیره', exact: true }).click()
  await page.reload()
  await expect(page.getByRole('article').filter({ hasText: 'Reviewed frontend job' })).toBeVisible()
  await page.goto('/#/add')
  await modal.getByRole('textbox').first().fill('fail extraction: preserve this original ad text')
  await modal.getByRole('button', { name: 'استخراج اطلاعات' }).click()
  await expect(modal.getByRole('alert')).toBeVisible()
  await modal.getByRole('button', { name: 'خودت دستی وارد کن' }).click()
  await expect(modal.getByLabel('شرح شغل و مسئولیت‌ها')).toHaveValue('fail extraction: preserve this original ad text')
  await page.goto('/#/jobs')
  await page.reload()
  await page.getByRole('button', { name: 'خروج', exact: true }).click()
  await expect(page.getByLabel('شماره موبایل', { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByLabel('شماره موبایل', { exact: true })).toBeVisible()
})

test('an expired server session does not trust a stored browser account', async ({ page }) => {
  await page.addInitScript(() => {
    window.sessionStorage.setItem('karnama.access-token', 'fake-token')
    window.localStorage.setItem('karnama.session', JSON.stringify({ phone: '09123456789', name: 'Fabricated', since: '2026-09-12' }))
  })
  await page.goto('/')
  await expect(page.getByLabel('شماره موبایل', { exact: true })).toBeVisible()
  await expect(page.getByText('Fabricated')).toHaveCount(0)
})
