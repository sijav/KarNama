#!/usr/bin/env node
// Verifies KN-252: resetting the Input's value control starts the field over
// instead of turning one input from controlled to uncontrolled.
//
// Exit condition: switching the value control between set and unset starts the
// field over rather than changing its mode in place, so React never sees one
// input go from controlled to uncontrolled or back; a check in a development
// build, where React reports it, sets value, types, resets it, and finds no
// such report and a field showing its default again; a mutation removing the
// fix brings the report back.
//
// React reports a changed mode only in development, so this starts Storybook's
// dev server on a port of its own and drives it with Playwright's Chromium:
// Storybook's own updateStoryArgs and resetStoryArgs, a keyboard, and every
// console message the page prints.
//
// NOT read-only: it edits Input.stories.tsx and restores it in a finally. It
// stops the dev server it started, and only that one.

import { spawn, spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const STORIES = join(WEB, 'src', 'shared', 'input', 'Input.stories.tsx')
const { chromium } = createRequire(join(WEB, 'package.json'))('playwright')

const PORT = 6252
const ORIGIN = `http://127.0.0.1:${PORT}`
const FIXED = "        <Input key={args.value === undefined ? `0${args.defaultValue ?? ''}` : '1'} {...args} onChange={onChange} />\n"
const BEFORE = '        <Input key={args.defaultValue} {...args} onChange={onChange} />\n'
const MODE = /changing (a controlled input to be uncontrolled|an uncontrolled input to be controlled)/

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

// The dev server, on its own port, stopped with its whole process tree.
const startServer = async () => {
  const server = spawn(`npx storybook dev -p ${PORT} --ci --host 127.0.0.1`, { cwd: WEB, shell: true, stdio: 'ignore' })
  const deadline = Date.now() + 180000
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${ORIGIN}/index.json`)
      if (response.ok) return server
    } catch {
      // Not listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  stopServer(server)
  throw new Error(`the Storybook dev server did not answer on ${ORIGIN} within three minutes`)
}
const stopServer = (server) => {
  if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(server.pid), '/T', '/F'], { stdio: 'ignore' })
  else server.kill('SIGTERM')
}

// Every Input story that offers value and has a field that takes typing: set
// value, type over it, reset it, and read the field and the console.
const setTypeReset = async () => {
  const index = await (await fetch(`${ORIGIN}/index.json`)).json()
  const ids = Object.values(index.entries)
    .filter((entry) => entry.type === 'story' && entry.id.startsWith('shared-input--'))
    .map((entry) => entry.id)
  const browser = await chromium.launch()
  try {
    const seen = []
    for (const id of ids) {
      const page = await browser.newPage()
      const reports = []
      page.on('console', (message) => {
        if (MODE.test(message.text())) reports.push(message.text().split('\n')[0].slice(0, 160))
      })
      try {
        await page.goto(`${ORIGIN}/iframe.html?id=${id}&viewMode=story`)
        await page.waitForFunction(() => window.__STORYBOOK_PREVIEW__?.currentRender?.phase === 'finished', null, { timeout: 60000 })
        const story = await page.evaluate(() => {
          const { story: current } = window.__STORYBOOK_PREVIEW__.currentRender
          const { disable = false, include } = current.parameters.controls ?? {}
          const input = document.querySelector('#storybook-root input')
          return {
            offersValue: !disable && (include === undefined || include.includes('value')),
            enabled: input?.disabled === false,
            initial: input?.value ?? null,
          }
        })
        if (!story.offersValue || !story.enabled) {
          seen.push({ id, ...story })
          continue
        }
        const field = () => page.evaluate(() => document.querySelector('#storybook-root input')?.value ?? null)
        await page.evaluate((storyId) => window.__STORYBOOK_ADDONS_CHANNEL__.emit('updateStoryArgs', { storyId, updatedArgs: { value: 'x7' } }), id)
        await page.waitForFunction(() => document.querySelector('#storybook-root input')?.value === 'x7', null, { timeout: 10000 })
        await page.locator('#storybook-root input').click()
        await page.keyboard.press('Control+A')
        await page.keyboard.type('42', { delay: 60 })
        await page.waitForTimeout(300)
        const typed = await field()
        await page.evaluate((storyId) => window.__STORYBOOK_ADDONS_CHANNEL__.emit('resetStoryArgs', { storyId, argNames: ['value'] }), id)
        await page.waitForTimeout(800)
        seen.push({ id, ...story, typed, afterReset: await field(), reports })
      } finally {
        await page.close()
      }
    }
    return seen
  } finally {
    await browser.close()
  }
}

const tried = (seen) => seen.filter((story) => story.offersValue && story.enabled)

let server
try {
  server = await startServer()

  await check('set value, type, reset: React reports no change of mode and the field shows its default again', async () => {
    const stories = tried(await setTypeReset())
    if (stories.length < 5) return `only ${stories.length} stories offer value with a field that takes typing, so this read almost nothing`
    process.stdout.write(`       ${stories.length} stories: ${stories.map((story) => story.id.replace('shared-input--', '')).join(', ')}\n`)
    const problems = stories.flatMap((story) => [
      ...(story.typed === '42' ? [] : [`${story.id} did not take the typing: ${JSON.stringify(story.typed)}`]),
      ...story.reports.map((report) => `${story.id}: React reported "${report}"`),
      ...(story.afterReset === story.initial ? [] : [`${story.id} shows ${JSON.stringify(story.afterReset)} after the reset, not its default ${JSON.stringify(story.initial)}`]),
    ])
    return problems.length ? `\n         ${problems.join('\n         ')}` : null
  })

  await check('THE CASE: keyed on defaultValue alone, React reports the change of mode again', async () => {
    const original = readFileSync(STORIES, 'utf8')
    if (!original.includes(FIXED)) return 'the render is not keyed on the value mode, so this mutation no longer applies'
    try {
      writeFileSync(STORIES, original.replace(FIXED, () => BEFORE))
      await new Promise((resolve) => setTimeout(resolve, 3000))
      const stories = tried(await setTypeReset())
      return stories.some((story) => story.reports.length > 0) ? null : `no story reported a change of mode without the fix: ${JSON.stringify(stories)}`
    } finally {
      writeFileSync(STORIES, original)
    }
  })
} finally {
  if (server) stopServer(server)
}

await check('the Input stories pass', () => {
  const result = spawnSync('npx vitest run --project storybook src/shared/input', { cwd: WEB, encoding: 'utf8', shell: true })
  return result.status === 0 ? null : `they fail:\n${`${result.stdout}${result.stderr}`.slice(-800)}`
})

if (failures.length) {
  process.stderr.write(`\nKN-252 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-252 verify passed.\n')
