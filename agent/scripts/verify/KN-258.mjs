#!/usr/bin/env node
// Verifies KN-258: a new defaultValue does not remount a controlled Input.
//
// Exit condition: with value set, changing defaultValue in Controls leaves the
// same input element in place, still focused if it was, showing the same
// value; with value unset a new default still starts the field over; a check
// on a built Storybook does both, and a mutation back to keying on defaultValue
// in both modes fails the first.
//
// It builds the production Storybook into a temporary directory, serves it
// itself and drives it with Playwright's Chromium, changing args through
// Storybook's own updateStoryArgs.
//
// NOT read-only: it edits Input.stories.tsx and restores it in a finally. The
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
const STORIES = join(WEB, 'src', 'shared', 'input', 'Input.stories.tsx')
const { chromium } = createRequire(join(WEB, 'package.json'))('playwright')

const FIXED = "        <Bound key={args.value === undefined ? `0${args.defaultValue ?? ''}` : '1'} args={args} updateArgs={updateArgs} />\n"
const BOTH = "        <Bound key={`${args.value === undefined ? 0 : 1}${args.defaultValue ?? ''}`} args={args} updateArgs={updateArgs} />\n"

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
  const out = mkdtempSync(join(tmpdir(), 'kn258-'))
  const result = spawnSync(`npx storybook build -o "${out}" --quiet`, { cwd: WEB, encoding: 'utf8', shell: true })
  if (result.status !== 0) throw new Error(`the Storybook build failed:\n${`${result.stdout}${result.stderr}`.slice(-800)}`)
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
      const path = normalize(join(dir, decodeURIComponent(new URL(request.url ?? '/', 'http://local').pathname)))
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

// In the page: change args and resolve once the story has rendered them.
const update = ([storyId, updatedArgs]) =>
  new Promise((resolve) => {
    const channel = window.__STORYBOOK_ADDONS_CHANNEL__
    channel.once('storyRendered', () => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    channel.emit('updateStoryArgs', { storyId, updatedArgs })
  })

// In the page: the field now, against the element that was marked before.
const field = () => {
  const input = document.querySelector('#storybook-root input')
  return { same: input !== null && input === window.__KN258__, focused: document.activeElement === input, value: input?.value ?? null }
}

// Every Input story that offers value with an enabled field: controlled, then
// a new default; and, value unset, a new default.
const sweep = async (dir) => {
  const server = await serve(dir)
  const origin = `http://127.0.0.1:${server.address().port}`
  const browser = await chromium.launch()
  try {
    const index = JSON.parse(readFileSync(join(dir, 'index.json'), 'utf8'))
    const ids = Object.values(index.entries)
      .filter((entry) => entry.type === 'story' && entry.id.startsWith('shared-input--'))
      .map((entry) => entry.id)
    const seen = []
    for (const id of ids) {
      const page = await browser.newPage()
      try {
        const open = async () => {
          await page.goto(`${origin}/iframe.html?id=${id}&viewMode=story`)
          await page.waitForFunction(() => window.__STORYBOOK_PREVIEW__?.currentRender?.phase === 'finished', null, { timeout: 20000 })
        }
        await open()
        const offers = await page.evaluate(() => {
          const { story } = window.__STORYBOOK_PREVIEW__.currentRender
          const { disable = false, include } = story.parameters.controls ?? {}
          return !disable && (include === undefined || include.includes('value')) && document.querySelector('#storybook-root input')?.disabled === false
        })
        if (!offers) continue
        // Controlled: value set, the field focused and marked, then a new default.
        await page.evaluate(update, [id, { value: 'x7' }])
        await page.locator('#storybook-root input').click()
        await page.evaluate(() => {
          window.__KN258__ = document.querySelector('#storybook-root input')
        })
        await page.evaluate(update, [id, { defaultValue: 'zz' }])
        const controlled = await page.evaluate(field)
        // Uncontrolled: a fresh story, the field marked, then a new default.
        await open()
        await page.evaluate(() => {
          window.__KN258__ = document.querySelector('#storybook-root input')
        })
        await page.evaluate(update, [id, { defaultValue: 'zz' }])
        const uncontrolled = await page.evaluate(field)
        seen.push({ id, controlled, uncontrolled })
      } finally {
        await page.close()
      }
    }
    return seen
  } finally {
    await browser.close()
    server.close()
  }
}

const withBuild = async (work) => {
  const out = build()
  try {
    return await work(out)
  } finally {
    rmSync(out, { recursive: true, force: true })
  }
}

const kept = (story) => story.controlled.same && story.controlled.focused && story.controlled.value === 'x7'

await check('with value set, a new default leaves the same focused field; with value unset, it starts the field over', () =>
  withBuild(async (out) => {
    const seen = await sweep(out)
    if (seen.length < 5) return `only ${seen.length} stories offer value with an enabled field, so this read almost nothing`
    process.stdout.write(`       ${seen.length} stories: ${seen.map((story) => story.id.replace('shared-input--', '')).join(', ')}\n`)
    const problems = seen.flatMap((story) => [
      ...(kept(story) ? [] : [`${story.id} controlled: ${JSON.stringify(story.controlled)}`]),
      ...(story.uncontrolled.value === 'zz' ? [] : [`${story.id} uncontrolled shows ${JSON.stringify(story.uncontrolled.value)}, not the new default`]),
    ])
    return problems.length ? `\n         ${problems.join('\n         ')}` : null
  }),
)

await check('THE CASE: keyed on defaultValue in both modes again, the controlled field is remounted', async () => {
  const original = readFileSync(STORIES, 'utf8')
  if (!original.includes(FIXED)) return 'the render is not keyed this way, so this mutation no longer applies'
  try {
    writeFileSync(STORIES, original.replace(FIXED, () => BOTH))
    return await withBuild(async (out) => {
      const seen = await sweep(out)
      return seen.some((story) => !kept(story)) ? null : `every controlled field survived a new default without the fix: ${JSON.stringify(seen)}`
    })
  } finally {
    writeFileSync(STORIES, original)
  }
})

await check('the Input stories pass', () => {
  const result = spawnSync('npx vitest run --project storybook src/shared/input', { cwd: WEB, encoding: 'utf8', shell: true })
  return result.status === 0 ? null : `they fail:\n${`${result.stdout}${result.stderr}`.slice(-800)}`
})

if (failures.length) {
  process.stderr.write(`\nKN-258 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-258 verify passed.\n')
