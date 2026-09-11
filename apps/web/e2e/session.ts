import type { Page } from '@playwright/test'

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
