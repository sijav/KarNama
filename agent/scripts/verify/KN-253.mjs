#!/usr/bin/env node
// Verifies KN-253: a bound Input keeps every key, however fast, and its arg
// follows without a stale echo overwriting a newer edit.
//
// Exit condition: the field shows every edit as it happens and the arg follows
// without a stale value overwriting newer input: 20 keys typed with no delay
// all arrive in both the field and the arg, and a composition driven through
// the browser's own IME input ends with the composed text in both; a mutation
// back to the plain round trip loses keys again.
//
// The arg is the story store's record of the args, which is what the Controls
// panel shows, read in a production Storybook served here, in Playwright's
// Chromium. The IME is driven through the DevTools protocol:
// Input.imeSetComposition step by step, then Input.insertText to commit, and
// the field must see the native composition events for it, compositionstart,
// an update per step with composing input events, and compositionend, so the
// check is of a composition and not only of its final text. The field is
// bound by Storybook's URL args. A value set in Controls is taken; this
// check sets one the field never sent, and KN-280's sets one equal to an edit
// still in flight, which a revision carried with each write now tells apart.
//
// NOT read-only: it edits Input.stories.tsx for its mutation and restores it
// in a finally. The builds go to the system temp directory and are removed.

import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const STORIES = join(WEB, 'src', 'shared', 'input', 'Input.stories.tsx')
const { chromium } = createRequire(join(WEB, 'package.json'))('playwright')

const HELD = '{...(bound && held.value !== undefined ? { value: held.value } : {})} '
const SET = 'x7'
const KEYS = 'abcdefghijklmnopqrst'
const COMPOSED = 'سلام'

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

const build = () => {
  const out = mkdtempSync(join(tmpdir(), 'kn253-'))
  const result = spawnSync(`npx storybook build -o "${out}" --quiet`, { cwd: WEB, encoding: 'utf8', shell: true })
  if (result.status !== 0) throw new Error(`the Storybook build failed:\n${`${result.stdout}${result.stderr}`.slice(-800)}`)
  return out
}

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png' }
const serve = (dir) =>
  new Promise((resolve) => {
    const server = createServer((request, response) => {
      const path = normalize(join(dir, decodeURIComponent(new URL(request.url ?? '/', 'http://local').pathname)))
      if (!path.startsWith(dir)) return void response.writeHead(403).end()
      try {
        response.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' }).end(readFileSync(path))
      } catch {
        response.writeHead(404).end()
      }
    })
    server.listen(0, '127.0.0.1', () => resolve(server))
  })

const stories = () => {
  const result = spawnSync('npx vitest run --project storybook src/shared/input', { cwd: WEB, encoding: 'utf8', shell: true })
  return { code: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}

const withEdit = async (from, to, run) => {
  const original = readFileSync(STORIES, 'utf8')
  if (!original.includes(from)) return `the anchor for this mutation is gone:\n${from}`
  try {
    writeFileSync(STORIES, original.replace(from, () => to))
    return await run()
  } finally {
    writeFileSync(STORIES, original)
  }
}

// A built Storybook, a page on Default with value bound, and what the field
// and the store's args hold once they have had time to agree on a value.
const session = async (dir, run) => {
  const server = await serve(dir)
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage()
    await page.goto(`http://127.0.0.1:${server.address().port}/iframe.html?id=shared-input--default&viewMode=story&args=value:${SET}`)
    await page.waitForFunction(() => window.__STORYBOOK_PREVIEW__?.currentRender?.phase === 'finished', null, { timeout: 30000 })
    return await run(page)
  } finally {
    await browser.close()
    server.close()
  }
}
const arg = (page) => page.evaluate(() => {
  const preview = window.__STORYBOOK_PREVIEW__
  return preview.storyStoreValue.args.get(preview.currentRender.story.id).value
})
const settle = async (page, want) => {
  let reading
  for (let attempt = 0; attempt < 40; attempt += 1) {
    reading = { field: await page.inputValue('#storybook-root input'), arg: await arg(page) }
    if (reading.field === want && reading.arg === want) return null
    await page.waitForTimeout(150)
  }
  return `wanted ${JSON.stringify(want)} in both, read field ${JSON.stringify(reading.field)} and arg ${JSON.stringify(reading.arg)}`
}
const typeFast = async (page) => {
  await page.locator('#storybook-root input').click()
  await page.keyboard.press('End')
  await page.keyboard.type(KEYS, { delay: 0 })
}

const main = async () => {
  await check('the Input stories pass under Vitest, TypingIntoABoundValue included', () => {
    if (!/export const TypingIntoABoundValue: Story/.test(readFileSync(STORIES, 'utf8'))) return 'there is no TypingIntoABoundValue story'
    const { code, output } = stories()
    return code === 0 ? null : `they fail:\n${output.slice(-800)}`
  })

  await check('THE CASE under Vitest: the plain round trip back fails TypingIntoABoundValue', () =>
    withEdit(HELD, '', () => {
      const { code, output } = stories()
      if (code === 0) return 'the stories passed with the field drawing args.value again'
      return output.includes('× Typing Into A Bound Value ') ? null : `it failed, but not in TypingIntoABoundValue:\n${output.slice(-500)}`
    }),
  )

  const out = build()
  try {
    await check('twenty keys with no delay all arrive, in the field and in the arg', () =>
      session(out, async (page) => {
        await typeFast(page)
        return settle(page, `${SET}${KEYS}`)
      }),
    )

    await check('a composition through the browser\'s own IME ends with the composed text in both', () =>
      session(out, async (page) => {
        await page.evaluate(() => {
          window.__KN253__ = []
          const box = document.querySelector('#storybook-root input')
          for (const type of ['compositionstart', 'compositionupdate', 'compositionend', 'input']) box.addEventListener(type, (event) => window.__KN253__.push({ type, composing: event.isComposing, data: event.data ?? '' }))
        })
        await page.locator('#storybook-root input').click()
        await page.keyboard.press('End')
        const client = await page.context().newCDPSession(page)
        for (let length = 1; length <= COMPOSED.length; length += 1) {
          const text = COMPOSED.slice(0, length)
          await client.send('Input.imeSetComposition', { text, selectionStart: length, selectionEnd: length })
        }
        await client.send('Input.insertText', { text: COMPOSED })
        const settled = await settle(page, `${SET}${COMPOSED}`)
        if (settled) return settled
        const events = await page.evaluate(() => window.__KN253__)
        const types = events.map((event) => event.type)
        if (types[0] !== 'compositionstart') return `the composition did not start with compositionstart: ${types.join(', ')}`
        if (types.filter((type) => type === 'compositionupdate').length < COMPOSED.length) return `fewer composition updates than steps: ${types.join(', ')}`
        if (!events.some((event) => event.type === 'input' && event.composing)) return 'no input event arrived while composing'
        const end = events.at(-1)
        return end?.type === 'compositionend' && end.data === COMPOSED ? null : `it did not end with compositionend carrying the composed text: ${JSON.stringify(end)}`
      }),
    )

    await check('a value set in Controls that the field never sent is taken, after fast typing', () =>
      session(out, async (page) => {
        await typeFast(page)
        const typed = await settle(page, `${SET}${KEYS}`)
        if (typed) return `before Controls: ${typed}`
        await page.evaluate(() => {
          const preview = window.__STORYBOOK_PREVIEW__
          window.__STORYBOOK_ADDONS_CHANNEL__.emit('updateStoryArgs', { storyId: preview.currentRender.story.id, updatedArgs: { value: 'z9' } })
        })
        return settle(page, 'z9')
      }),
    )
  } finally {
    rmSync(out, { recursive: true, force: true })
  }

  await check('THE CASE in a production build: the plain round trip back loses keys again', () =>
    withEdit(HELD, '', async () => {
      const plain = build()
      try {
        return await session(plain, async (page) => {
          await typeFast(page)
          await page.waitForTimeout(1500)
          const [field, stored] = [await page.inputValue('#storybook-root input'), await arg(page)]
          return field === `${SET}${KEYS}` && stored === `${SET}${KEYS}` ? 'every key arrived with the plain round trip, so this does not show the fix doing anything' : null
        })
      } finally {
        rmSync(plain, { recursive: true, force: true })
      }
    }),
  )

  await check("KN-249's verifier still passes: value set in Controls, typed into, followed by the arg", () => {
    const result = spawnSync('node', [join(ROOT, 'agent', 'scripts', 'verify', 'KN-249.mjs')], { cwd: ROOT, encoding: 'utf8' })
    return result.status === 0 ? null : `it fails:\n${`${result.stdout}${result.stderr}`.slice(-600)}`
  })
}

await main()
if (failures.length) {
  process.stderr.write(`\nKN-253 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-253 verify passed.\n')
