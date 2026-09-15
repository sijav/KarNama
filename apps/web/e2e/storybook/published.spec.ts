import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

/**
 * Every story of the published Storybook opened in headless Chromium, KN-226,
 * failing on a page error or a console error, and on the channel's word that a
 * story threw. A production build is not what the storybook Vitest project runs:
 * React's production bundle, Vite's output and the base all differ.
 *
 * The end of a story is read from Storybook's channel, its own global, which the
 * preview assigns plainly and a setter defined before any of its scripts hears.
 * storyFinished alone is not the end: a play that writes its args renders the
 * story again, and each of those renders says storyFinished while the play still
 * runs, KN-584. So the render phases are heard too. When a play began, the story
 * ends at a storyFinished after the phase played or errored; with no play, at the
 * first storyFinished; and at once on an event saying it failed. storyFinished's
 * status is not read, since it can say success after a play threw. A build that
 * no longer assigns the channel fails every story, and says so.
 *
 * What it hears is bounded: a story is heard until that end and for 400
 * milliseconds after, and an error a story schedules for later is not. These are
 * the runtime's own events rather than a documented API, which is why Storybook's
 * version is pinned and a mutation shows the check still failing.
 */
declare global {
  interface Window {
    __KN226__?: string[]
  }
}

// The build, named from apps/web wherever the run starts: STORYBOOK_DIR, or the
// directory storybook build writes.
const BUILD = resolve(import.meta.dirname, '../..', process.env.STORYBOOK_DIR ?? 'storybook-static')

// The ids of the stories in the build's index. Docs pages are left out: the page
// says it rendered before the stories inside it have, and the card names stories.
const index: unknown = JSON.parse(readFileSync(join(BUILD, 'index.json'), 'utf8'))
const entries =
  typeof index === 'object' && index !== null && 'entries' in index && typeof index.entries === 'object' && index.entries !== null
    ? Object.values(index.entries)
    : []
const stories = entries.flatMap((entry: unknown) =>
  typeof entry === 'object' && entry !== null && 'type' in entry && entry.type === 'story' && 'id' in entry && typeof entry.id === 'string'
    ? [entry.id]
    : [],
)

// What ends a story badly, whatever storyFinished says after it.
const FAILURES = ['playFunctionThrewException', 'unhandledErrorsWhilePlaying', 'storyThrewException', 'storyErrored', 'storyMissing']
// How long errors that land after the end are waited for.
const SETTLE = 400
// What the wait leaves of the test's own timeout, to read what was heard and say
// the story never ended rather than time out saying nothing.
const MARGIN = 10_000

for (const id of stories) {
  test(id, async ({ page }) => {
    const started = Date.now()
    const heard: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error') heard.push(`console error: ${message.text()}`)
    })
    page.on('pageerror', (error) => {
      heard.push(`page error: ${error.message}`)
    })
    await page.addInitScript(
      (names) => {
        const events: string[] = []
        window.__KN226__ = events
        let channel: unknown
        Object.defineProperty(window, '__STORYBOOK_ADDONS_CHANNEL__', {
          configurable: true,
          get: () => channel,
          set: (value: { on: (name: string, listener: (payload?: { newPhase?: unknown }) => void) => void }) => {
            channel = value
            for (const name of names)
              value.on(name, (payload) => {
                // A phase is kept as the phase it names, every other event by its name.
                const phase = payload?.newPhase
                events.push(name === 'storyRenderPhaseChanged' ? `phase:${typeof phase === 'string' ? phase : 'unnamed'}` : name)
              })
          },
        })
      },
      ['storyFinished', 'storyRenderPhaseChanged', ...FAILURES],
    )

    await page.goto(`iframe.html?id=${id}&viewMode=story`)
    const ended = await page
      .waitForFunction(
        (failures) => {
          const events = window.__KN226__ ?? []
          if (events.some((name) => failures.includes(name))) return true
          const playing = events.indexOf('phase:playing')
          if (playing < 0) return events.includes('storyFinished')
          const played = events.findIndex((name, at) => at > playing && (name === 'phase:played' || name === 'phase:errored'))
          return played >= 0 && events.includes('storyFinished', played)
        },
        FAILURES,
        // What is left of the test's budget: the page's load was spent from it.
        { timeout: Math.max(1_000, test.info().timeout - (Date.now() - started) - MARGIN) },
      )
      .then(
        () => true,
        () => false,
      )
    if (ended) await page.waitForTimeout(SETTLE)
    const events = await page.evaluate(() => window.__KN226__ ?? [])
    const assigned = await page.evaluate(
      () => '__STORYBOOK_ADDONS_CHANNEL__' in window && Reflect.get(window, '__STORYBOOK_ADDONS_CHANNEL__') !== undefined,
    )

    const problems = [
      ...(assigned ? [] : ["Storybook's channel was never assigned, so nothing about this story could be heard"]),
      ...(ended || !assigned ? [] : [`the story never ended, having said: ${events.join(', ')}`]),
      ...events.filter((name) => FAILURES.includes(name)),
      ...heard,
    ]
    expect(problems, id).toEqual([])
  })
}
