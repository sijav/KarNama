import { expect, test } from '@playwright/test'
import { signedIn } from './session'

for (const locale of ['en-US', 'fa-IR']) {
  for (const colorScheme of ['light', 'dark']) {
    test(`posting input sizing and error stages in ${locale} ${colorScheme}`, async ({ page }, info) => {
      const english = locale === 'en-US'
      await signedIn(page)
      await page.addInitScript(
        (preferences) => {
          window.localStorage.setItem('karnama.preferences', JSON.stringify(preferences))
        },
        { locale, colorScheme },
      )
      let code = 'AUTH_NOT_CONFIGURED'
      await page.route('**/graphql', (route) => route.fulfill({ json: { errors: [{ message: code, extensions: { code } }], data: null } }))
      await page.goto('/#/add')
      const dialog = page.getByRole('dialog')
      const input = dialog.getByRole('textbox').first()
      const dimensions = () =>
        input.evaluate((element) => ({
          inputHeight: element.getBoundingClientRect().height,
          frameHeight: element.parentElement?.getBoundingClientRect().height,
          overflow: element.scrollHeight > element.clientHeight,
        }))
      expect(await dimensions()).toMatchObject({ inputHeight: 108, frameHeight: 140 })
      const source = `https://example.test/jobs/software-engineer?source=${'tracking'.repeat(100)}`
      await input.fill(source)
      await expect.poll(async () => (await dimensions()).frameHeight).toBe(208)
      expect(await dimensions()).toMatchObject({ inputHeight: 176, overflow: true })
      await input.press('Control+Home')
      await page.screenshot({ path: info.outputPath('posting-input.png'), animations: 'disabled', scale: 'css' })
      const cases = [
        { code: 'AUTH_NOT_CONFIGURED', text: english ? 'Automatic extraction is unavailable.' : 'استخراج خودکار در دسترس نیست.' },
        { code: 'EXTRACTION_FAILED', text: english ? 'We could not extract the job details.' : 'نتوانستیم اطلاعات شغل را استخراج کنیم.' },
        { code: 'POSTING_UNAVAILABLE', text: english ? 'We could not read this link.' : 'نتوانستیم اطلاعات این لینک را بخوانیم.' },
      ]
      for (const failure of cases) {
        code = failure.code
        await dialog.getByRole('button', { name: english ? /Extract details|Try again/ : /استخراج اطلاعات|دوباره امتحان کن/ }).click()
        await expect(dialog.getByRole('alert')).toContainText(failure.text)
        await expect(input).toHaveValue(source)
      }
      await input.fill('Short posting text')
      await expect.poll(async () => (await dimensions()).frameHeight).toBe(140)
    })
  }
}
