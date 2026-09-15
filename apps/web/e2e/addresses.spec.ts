import { expect, test, type Page } from '@playwright/test'
import { readFile, stat } from 'node:fs/promises'
import { createServer, type Server } from 'node:http'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { signedIn } from './session'

/**
 * The addresses are paths, KN-505: a page has its own, it survives a reload, Back
 * and Forward move between the pages, and an address from when the page was in
 * the hash lands on its path. Then the build itself, served the way GitHub Pages
 * serves it, since the e2e server answers every path with the app and so cannot
 * show a page's 200 against a missing path's 404.
 */
const JOBS = 'فرصت‌های شغلی من'
const ADD = 'افزودن فرصت شغلی'
const NETWORK = 'شبکه من'

const heading = (page: Page) => page.getByRole('heading', { level: 1 })
const navigation = (page: Page) => page.getByRole('navigation', { name: 'فضای کار' })

test.beforeEach(async ({ page }) => {
  await signedIn(page)
})

test('each page opens at its path, and again after a reload', async ({ page }) => {
  await page.goto('/network')
  await expect(heading(page)).toContainText(NETWORK)
  await page.reload()
  await expect(heading(page)).toContainText(NETWORK)

  await page.goto('/add')
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.reload()
  await expect(page.getByRole('dialog')).toBeVisible()

  await page.goto('/jobs')
  await expect(heading(page)).toContainText(JOBS)
  await page.reload()
  await expect(heading(page)).toContainText(JOBS)
})

test('Back and Forward move between the pages the navigation opened', async ({ page }) => {
  await page.goto('/jobs')
  await navigation(page).getByRole('button', { name: NETWORK, exact: true }).click()
  await expect(page).toHaveURL(/\/network$/)
  await expect(heading(page)).toContainText(NETWORK)

  await page.goBack()
  await expect(page).toHaveURL(/\/jobs$/)
  await expect(heading(page)).toContainText(JOBS)

  await page.goForward()
  await expect(page).toHaveURL(/\/network$/)
  await expect(heading(page)).toContainText(NETWORK)

  // The add flow opens over the board, and Back closes it where it was opened.
  await navigation(page).getByRole('button', { name: ADD, exact: true }).click()
  await expect(page).toHaveURL(/\/add$/)
  await expect(page.getByRole('dialog')).toBeVisible()

  await page.goBack()
  await expect(page).toHaveURL(/\/network$/)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(heading(page)).toContainText(NETWORK)

  await page.goForward()
  await expect(page).toHaveURL(/\/add$/)
  await expect(page.getByRole('dialog')).toBeVisible()
})

test('an address from when the page was in the hash lands on its path, its query kept', async ({ page }) => {
  await page.goto('/#/network?from=shared')
  await expect(page).toHaveURL(/\/network\?from=shared$/)
  await expect(heading(page)).toContainText(NETWORK)
})

test('each destination the navigation opens writes its path and no hash', async ({ page }) => {
  await page.goto('/jobs')
  const address = () => {
    const { pathname, hash } = new URL(page.url())
    return [pathname, hash]
  }
  // The add flow last, since its dialog takes the navigation out of reach.
  const opened = [
    [NETWORK, '/network'],
    [JOBS, '/jobs'],
    [ADD, '/add'],
  ] as const
  for (const [name, path] of opened) {
    await navigation(page).getByRole('button', { name, exact: true }).click()
    await expect.poll(address).toEqual([path, ''])
  }
  await expect(page.getByRole('dialog')).toBeVisible()
})

// The build the e2e server serves, which its command made before the suite ran.
const DIST = fileURLToPath(new URL('../dist/', import.meta.url))

const TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.map': 'application/json',
}

const kindOf = async (path: string) =>
  stat(path).then(
    (found) => (found.isDirectory() ? 'directory' : 'file'),
    () => undefined,
  )

// GitHub Pages as measured on the live site for KN-505: a file as it is; a path
// with no file but an .html of its name, from that .html; a directory, a 301 to
// its trailing slash, where its index.html is served; anything else, 404.html
// with 404.
const pagesLike = (root: string): Server =>
  createServer((request, response) => {
    void (async () => {
      const path = decodeURIComponent(new URL(request.url ?? '/', 'http://pages.local').pathname)
      const target = normalize(join(root, path))
      if (!target.startsWith(normalize(root))) {
        response.writeHead(403).end()
        return
      }
      const send = async (file: string, status: number) => {
        response.writeHead(status, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' })
        response.end(await readFile(file))
      }
      const missing = join(root, '404.html')
      if (path.endsWith('/')) {
        const index = join(target, 'index.html')
        await ((await kindOf(index)) === 'file' ? send(index, 200) : send(missing, 404))
        return
      }
      const found = await kindOf(target)
      if (found === 'file') await send(target, 200)
      else if ((await kindOf(`${target}.html`)) === 'file') await send(`${target}.html`, 200)
      else if (found === 'directory') response.writeHead(301, { location: `${path}/` }).end()
      else await send(missing, 404)
    })()
  })

test.describe('the build, served the way GitHub Pages serves it', () => {
  let server: Server
  let origin = ''

  test.beforeAll(async () => {
    server = pagesLike(DIST)
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    const address = server.address()
    origin = `http://127.0.0.1:${typeof address === 'object' && address !== null ? address.port : 0}`
  })

  test.afterAll(async () => {
    await new Promise((resolve) => server.close(resolve))
  })

  test('each page answers 200 at its path and any other path 404, both with the app', async ({ request }) => {
    const app = await readFile(join(DIST, 'index.html'), 'utf8')
    for (const path of ['/jobs', '/add', '/network']) {
      const answer = await request.get(`${origin}${path}`, { maxRedirects: 0 })
      expect(answer.status(), path).toBe(200)
      expect(await answer.text(), path).toBe(app)
    }
    const nowhere = await request.get(`${origin}/nowhere`, { maxRedirects: 0 })
    expect(nowhere.status()).toBe(404)
    expect(await nowhere.text()).toBe(app)
  })

  test('a hard refresh at a page opens that page', async ({ page }) => {
    await page.goto(`${origin}/network`)
    await expect(heading(page)).toContainText(NETWORK)
    await page.reload()
    await expect(heading(page)).toContainText(NETWORK)
  })
})
