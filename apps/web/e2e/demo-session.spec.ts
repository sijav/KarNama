import { expect, test } from '@playwright/test'
import { signedIn } from './session'

for (const locale of ['en-US', 'fa-IR']) {
  for (const colorScheme of ['light', 'dark']) {
    test(`demo session rejection in ${locale} ${colorScheme}`, async ({ page }, info) => {
      const english = locale === 'en-US'
      await signedIn(page)
      await page.addInitScript(
        (preferences) => {
          window.localStorage.setItem('karnama.preferences', JSON.stringify(preferences))
          window.sessionStorage.setItem('karnama.access-token', 'expired-server-session')
        },
        { locale, colorScheme },
      )
      await page.route('**/graphql', async (route) => {
        expect(route.request().headers().authorization).toBeUndefined()
        await route.fulfill({ json: { errors: [{ message: 'UNAUTHENTICATED', extensions: { code: 'UNAUTHENTICATED' } }], data: null } })
      })
      await page.goto('/#/add')
      const dialog = page.getByRole('dialog')
      await dialog.getByRole('textbox').first().fill('Example job description for a session check.')
      await dialog.getByRole('button', { name: english ? 'Extract details' : 'استخراج اطلاعات' }).click()
      await expect(dialog.getByRole('alert')).toContainText(
        english ? 'Automatic extraction is not enabled for demo sign-in.' : 'استخراج خودکار برای ورود آزمایشی فعال نیست.',
      )
      await expect(dialog.getByRole('textbox').first()).toHaveValue('Example job description for a session check.')
      await page.screenshot({ path: info.outputPath('demo-session.png'), animations: 'disabled', scale: 'css' })
    })
  }
}
