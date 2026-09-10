#!/usr/bin/env node
// Verifies KN-250: the document's direction and language are set before the
// first paint.
//
// Exit condition: the document element's dir and lang are set in the commit
// that renders the tree, before paint, not in a passive effect: on a production
// Storybook build every story's play function starts with html dir and lang
// already matching its locale, recorded at the playing phase in both
// languages, and the Input's Focus story passes there; the built app, loaded
// with a stored English preference, has dir ltr by the time its first render's
// DOM exists; and a mutation back to useEffect fails the check.
//
// Why a production build and not the story tests: Vitest wraps a story's
// render in act(), which flushes passive effects before the play function
// starts, so it could never see this. Storybook's own UI and the app do not.
//
// Storybook: every story, in both languages, with its render phases recorded
// from the moment the channel exists; html dir and lang are read at the first
// phase after rendering, which is playing for a story with a play function.
// The app: a MutationObserver reads html dir and lang in the microtask after
// React first puts content into #root, which is after a layout effect ran and
// before a passive one.
//
// NOT read-only: it edits AppProviders.tsx and restores it in a finally. The
// builds go to the system temp directory and are removed.

import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const PROVIDERS = join(WEB, 'src', 'app', 'AppProviders.tsx')
const { chromium } = createRequire(join(WEB, 'package.json'))('playwright')

const DIRECTION = { 'fa-IR': 'rtl', 'en-US': 'ltr' }

const failures = []
const check = async (label, run) => {
  try {
    const problem = await run()
    if (problem) failures.push(`${label}: ${problem}`)
    else process.stdout.write(`  ok   ${label}\n`)
  } catch (error) {
    failures.push(`${label}: threw ${error instanceof Error ? error.message : String(error)}`)
  }
}

const shell = (command) => {
  const result = spawnSync(command, { cwd: WEB, encoding: 'utf8', shell: true })
  if (result.status !== 0) throw new Error(`${command} failed:\n${`${result.stdout}${result.stderr}`.slice(-800)}`)
}
const buildStorybook = () => {
  const out = mkdtempSync(join(tmpdir(), 'kn250-sb-'))
  shell(`npx storybook build -o "${out}" --quiet`)
  return out
}
const buildApp = () => {
  const out = mkdtempSync(join(tmpdir(), 'kn250-app-'))
  shell(`npx vite build --outDir "${out}" --emptyOutDir --logLevel error`)
  return out
}

const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.png': 'image/png',
}
const serve = (dir) =>
  new Promise((resolve) => {
    const server = createServer((request, response) => {
      const pathname = new URL(request.url ?? '/', 'http://local').pathname
      const path = normalize(join(dir, decodeURIComponent(pathname === '/' ? '/index.html' : pathname)))
      if (!path.startsWith(dir)) return void response.writeHead(403).end()
      try {
        const body = readFileSync(path)
        response.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' }).end(body)
      } catch {
        response.writeHead(404).end()
      }
    })
    server.listen(0, '127.0.0.1', () => resolve(server))
  })

const withBuilds = async (work) => {
  const storybook = buildStorybook()
  const app = buildApp()
  try {
    return await work(storybook, app)
  } finally {
    rmSync(storybook, { recursive: true, force: true })
    rmSync(app, { recursive: true, force: true })
  }
}

// In the page, before anything else runs: every render phase, with html dir
// and lang at the first phase after rendering, and anything a play function
// throws.
const recordStory = () => {
  window.__KN250__ = { phases: [], first: null, thrown: [] }
  let channel
  Object.defineProperty(window, '__STORYBOOK_ADDONS_CHANNEL__', {
    configurable: true,
    get: () => channel,
    set: (value) => {
      channel = value
      value.on('storyRenderPhaseChanged', ({ newPhase }) => {
        const log = window.__KN250__
        if (log.first === null && log.phases.includes('rendering') && newPhase !== 'rendering') {
          log.first = { phase: newPhase, dir: document.documentElement.dir, lang: document.documentElement.lang }
        }
        log.phases.push(newPhase)
      })
      value.on('playFunctionThrewException', (error) => window.__KN250__.thrown.push(String(error?.message ?? error).split('\n')[0]))
    },
  })
}

// Every story in both languages: what the document said as it started.
const sweepStorybook = async (dir) => {
  const server = await serve(dir)
  const origin = `http://127.0.0.1:${server.address().port}`
  const browser = await chromium.launch()
  try {
    const index = JSON.parse(readFileSync(join(dir, 'index.json'), 'utf8'))
    const ids = Object.values(index.entries)
      .filter((entry) => entry.type === 'story')
      .map((entry) => entry.id)
    const seen = []
    for (const id of ids) {
      for (const locale of Object.keys(DIRECTION)) {
        const page = await browser.newPage()
        try {
          await page.addInitScript(recordStory)
          await page.goto(`${origin}/iframe.html?id=${id}&viewMode=story&globals=locale:${locale}`)
          await page.waitForFunction(() => window.__KN250__?.phases.at(-1) === 'finished', null, { timeout: 20000 })
          const { first, phases, thrown } = await page.evaluate(() => window.__KN250__)
          // A story may pin its own locale, in storyGlobals; the document must
          // follow that one.
          const pinned = await page.evaluate(() => window.__STORYBOOK_PREVIEW__.currentRender.story.storyGlobals?.locale)
          const expected = typeof pinned === 'string' ? pinned : locale
          seen.push({ id, locale: expected, first, played: phases.includes('playing'), errored: phases.includes('errored') || thrown.length > 0, thrown })
        } finally {
          await page.close()
        }
      }
    }
    return seen
  } finally {
    await browser.close()
    server.close()
  }
}

// The app, with English stored: html dir and lang in the microtask after React
// first puts content into #root.
const appFirstRender = async (dir) => {
  const server = await serve(dir)
  const origin = `http://127.0.0.1:${server.address().port}`
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage()
    await page.addInitScript(() => {
      window.localStorage.setItem('karnama.preferences', JSON.stringify({ locale: 'en-US' }))
      window.__KN250__ = null
      const observer = new MutationObserver(() => {
        const root = document.getElementById('root')
        if (window.__KN250__ === null && root !== null && root.childElementCount > 0) {
          window.__KN250__ = { dir: document.documentElement.dir, lang: document.documentElement.lang }
          observer.disconnect()
        }
      })
      observer.observe(document, { childList: true, subtree: true })
    })
    await page.goto(`${origin}/`)
    await page.waitForFunction(() => window.__KN250__ !== null, null, { timeout: 20000 })
    return {
      first: await page.evaluate(() => window.__KN250__),
      settled: await page.evaluate(() => ({ dir: document.documentElement.dir, lang: document.documentElement.lang })),
    }
  } finally {
    await browser.close()
    server.close()
  }
}

const late = (seen) => seen.filter((story) => story.first === null || story.first.dir !== DIRECTION[story.locale] || story.first.lang !== story.locale)

const describe = (story) => `${story.id} in ${story.locale} at ${story.first?.phase ?? 'no phase'}: dir ${JSON.stringify(story.first?.dir)} lang ${JSON.stringify(story.first?.lang)}`

let baseline = null
await check('every story starts with html dir and lang matching its locale, in both languages', () =>
  withBuilds(async (storybook, app) => {
    const seen = await sweepStorybook(storybook)
    baseline = { seen, app: await appFirstRender(app) }
    if (seen.length < 100) return `only ${seen.length} story renders were read, so this read almost nothing`
    const wrong = late(seen)
    process.stdout.write(`       ${seen.length} renders, ${seen.filter((story) => story.played).length} with a play function\n`)
    return wrong.length ? `${wrong.length} started before the document had them:\n         ${wrong.slice(0, 12).map(describe).join('\n         ')}` : null
  }),
)

await check("the Input's Focus story passes on the production build, in both languages", () => {
  if (baseline === null) return 'the sweep did not run'
  const focus = baseline.seen.filter((story) => story.id === 'shared-input--focus')
  if (focus.length !== 2) return `expected Focus in two languages, found ${focus.length}`
  const failed = focus.filter((story) => story.errored || !story.played)
  return failed.length ? `Focus fails: ${failed.map((story) => `${story.locale} ${story.thrown.join(' | ') || 'errored'}`).join('; ')}` : null
})

await check('no story fails on the production build', () => {
  if (baseline === null) return 'the sweep did not run'
  const failed = baseline.seen.filter((story) => story.errored)
  return failed.length ? failed.map((story) => `${story.id} in ${story.locale}: ${story.thrown.join(' | ') || 'errored'}`).join('; ') : null
})

await check('the app with English stored has dir ltr and lang en-US when its first render reaches the DOM', () => {
  if (baseline === null) return 'the sweep did not run'
  const { first, settled } = baseline.app
  if (settled.dir !== 'ltr' || settled.lang !== 'en-US') return `the stored preference was not applied at all: settled on ${JSON.stringify(settled)}`
  return first.dir === 'ltr' && first.lang === 'en-US' ? null : `the first render reached the DOM with ${JSON.stringify(first)}, and only later ${JSON.stringify(settled)}`
})

await check('THE CASE: back in a passive effect, both the stories and the app start in the old direction', async () => {
  const original = readFileSync(PROVIDERS, 'utf8')
  const layout = '  useLayoutEffect(() => {\n'
  if (!original.includes(layout)) return 'the direction is not set in a useLayoutEffect, so this mutation no longer applies'
  try {
    writeFileSync(PROVIDERS, original.replace(layout, () => '  useEffect(() => {\n').replace('import { useLayoutEffect, useMemo', () => 'import { useEffect, useLayoutEffect, useMemo'))
    return await withBuilds(async (storybook, app) => {
      const wrong = late(await sweepStorybook(storybook))
      const { first } = await appFirstRender(app)
      if (!wrong.length) return 'every story still started with the right direction, so the sweep cannot see the bug'
      if (first.dir === 'ltr') return 'the app still reached the DOM with dir ltr, so the app check cannot see the bug'
      process.stdout.write(`       with useEffect: ${wrong.length} story renders started late; the app first rendered with ${JSON.stringify(first)}\n`)
      return null
    })
  } finally {
    writeFileSync(PROVIDERS, original)
  }
})

if (failures.length) {
  process.stderr.write(`\nKN-250 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-250 verify passed.\n')
