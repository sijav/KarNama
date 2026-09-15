import { expect, test, type Request } from '@playwright/test'
import { signedIn } from './session'

/**
 * The page wakes the API as it loads, whichever way it signs in, KN-490.
 *
 * Render's free service sleeps and takes about a minute to wake, so a reader
 * who pastes a posting right after opening the app would wait out the cold
 * start. This build signs in with the demo's mock provider, as Pages does, and
 * sends its calls to the address playwright.config.ts gives it, where nothing
 * listens, so the route answers as a healthy API would.
 */
const API = '**/graphql'

// The GraphQL operation a request to the API names.
const operationOf = (request: Request) => {
  const body: unknown = request.postDataJSON()
  return typeof body === 'object' && body !== null && 'operationName' in body && typeof body.operationName === 'string'
    ? body.operationName
    : ''
}

test('the page sends the API one health request as it loads, with demo sign-in', async ({ page }) => {
  const sent: string[] = []
  await page.route(API, async (route) => {
    if (route.request().method() === 'POST') sent.push(operationOf(route.request()))
    await route.fulfill({ json: { data: { health: { status: 'ok', environment: 'test', uptimeSeconds: 1 } } } })
  })
  await signedIn(page)

  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('فرصت‌های شغلی من')
  // A moment past the board's first paint, so a second request sent as the page
  // mounts is counted too.
  await page.waitForTimeout(1000)

  expect(sent).toEqual(['Health'])
})
