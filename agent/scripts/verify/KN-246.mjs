#!/usr/bin/env node
// Verifies KN-246: changing defaultValue in the Input's Controls changes the
// field.
//
// Exit condition: changing defaultValue in Controls after the story has
// rendered changes the text in the field: a check renders an Input story,
// changes the arg through Storybook's own arg update, and asserts the field
// shows the new value, and it fails with the fix taken out.
//
// A live arg change is the manager talking to the preview, which no story test
// reaches, so this builds the production Storybook into a temporary directory,
// serves it itself and drives it with Playwright's Chromium.
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

const KEYED = "        <Input key={args.value === undefined ? `0${args.defaultValue ?? ''}` : '1'} {...args} onChange={onChange} />\n"
const UNKEYED = '        <Input {...args} onChange={onChange} />\n'
const NEXT = 'second'
const MARKER = 'marker'

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
  const out = mkdtempSync(join(tmpdir(), 'kn246-'))
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

// Every Input story that offers its controls: render it, change defaultValue
// as the Controls panel does, with a helper text marker in the same update as
// the positive control that the update arrived, and read the field.
const argUpdates = async (dir) => {
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
        await page.goto(`${origin}/iframe.html?id=${id}&viewMode=story`)
        await page.waitForFunction(() => ['completed', 'finished'].includes(window.__STORYBOOK_PREVIEW__?.currentRender?.phase), null, {
          timeout: 20000,
        })
        const offered = await page.evaluate(() => window.__STORYBOOK_PREVIEW__.currentRender.story.parameters.controls?.disable !== true)
        if (!offered) {
          seen.push({ id, offered })
          continue
        }
        await page.evaluate(
          ([storyId, next, marker]) =>
            new Promise((resolve) => {
              const channel = window.__STORYBOOK_ADDONS_CHANNEL__
              channel.once('storyRendered', () => requestAnimationFrame(() => requestAnimationFrame(resolve)))
              channel.emit('updateStoryArgs', { storyId, updatedArgs: { defaultValue: next, helperText: marker } })
            }),
          [id, NEXT, MARKER],
        )
        const field = await page.evaluate(() => {
          const input = document.querySelector('#storybook-root input')
          const helper = document.getElementById(input?.getAttribute('aria-describedby') ?? '')
          return { value: input?.value ?? null, helper: helper?.textContent ?? null }
        })
        seen.push({ id, offered, ...field })
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

// The stories that took the update, and the ones whose field ignored it.
const judge = (seen) => {
  const offered = seen.filter((story) => story.offered)
  const unreached = offered.filter((story) => story.helper !== MARKER)
  const ignored = offered.filter((story) => story.helper === MARKER && story.value !== NEXT)
  return { offered, unreached, ignored }
}

const withBuild = async (run) => {
  const out = build()
  try {
    return await run(out)
  } finally {
    rmSync(out, { recursive: true, force: true })
  }
}

await check('every Input story offering controls shows a new defaultValue in its field', () =>
  withBuild(async (out) => {
    const { offered, unreached, ignored } = judge(await argUpdates(out))
    if (offered.length < 5) return `only ${offered.length} stories offer controls, so this read almost nothing`
    if (unreached.length) return `the update never reached: ${unreached.map((story) => story.id).join(', ')}`
    if (ignored.length) return `the field kept its text: ${ignored.map((story) => `${story.id} shows ${JSON.stringify(story.value)}`).join('; ')}`
    process.stdout.write(`       ${offered.length} stories: ${offered.map((story) => story.id.replace('shared-input--', '')).join(', ')}\n`)
    return null
  }),
)

await check('THE CASE: with the key taken out of the meta render, the field ignores the change', async () => {
  const original = readFileSync(STORIES, 'utf8')
  if (!original.includes(KEYED)) return 'the meta render is not keyed on defaultValue, so this mutation no longer applies'
  try {
    writeFileSync(STORIES, original.replace(KEYED, () => UNKEYED))
    return await withBuild(async (out) => {
      const { unreached, ignored } = judge(await argUpdates(out))
      if (unreached.length) return `the update never reached: ${unreached.map((story) => story.id).join(', ')}`
      return ignored.length ? null : 'every field followed the change without the key, so the check cannot see the bug'
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
  process.stderr.write(`\nKN-246 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-246 verify passed.\n')
