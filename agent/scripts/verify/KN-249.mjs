#!/usr/bin/env node
// Verifies KN-249: setting value in the Input's Controls no longer freezes the
// field.
//
// Exit condition: after value is set in Controls, typing into the field
// changes it and the value control follows what was typed, the story binding
// value through Storybook's args; or no story offers value. A check sets value
// through Storybook's own arg update on a built Storybook, types into the
// field, and asserts both the field and the story's args show the typed text,
// and it fails with the binding taken out.
//
// It builds the production Storybook into a temporary directory, serves it
// itself and drives it with Playwright's Chromium: a keyboard, and the story
// store's own record of the args, which is what the Controls panel shows.
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

const BINDING = '      if (args.value !== undefined) updateArgs({ value })\n'
const SET = 'x7'
const TYPED = '42'

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
  const out = mkdtempSync(join(tmpdir(), 'kn249-'))
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

// In the page: whether the story offers the value control, the way the
// Controls panel filters them, and whether its field can take typing at all.
const describeStory = () => {
  const { story } = window.__STORYBOOK_PREVIEW__.currentRender
  const { disable = false, include, exclude } = story.parameters.controls ?? {}
  const matches = (rule, name) => (Array.isArray(rule) ? rule.includes(name) : rule instanceof RegExp ? rule.test(name) : false)
  const offersValue =
    !disable && story.argTypes.value?.control !== undefined && (include === undefined || matches(include, 'value')) && (exclude === undefined || !matches(exclude, 'value'))
  return { offersValue, enabled: document.querySelector('#storybook-root input')?.disabled === false }
}

const fieldAndArg = (id) => ({
  field: document.querySelector('#storybook-root input')?.value ?? null,
  arg: window.__STORYBOOK_PREVIEW__.storyStoreValue.args.get(id).value,
})

// Every Input story that offers value and has a field that takes typing: set
// value as the Controls panel does, then type over it at a person's pace.
const typeOverValue = async (dir) => {
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
        await page.waitForFunction(() => window.__STORYBOOK_PREVIEW__?.currentRender?.phase === 'finished', null, { timeout: 20000 })
        const { offersValue, enabled } = await page.evaluate(describeStory)
        if (!offersValue || !enabled) {
          seen.push({ id, offersValue, enabled })
          continue
        }
        await page.evaluate(
          ([storyId, value]) => window.__STORYBOOK_ADDONS_CHANNEL__.emit('updateStoryArgs', { storyId, updatedArgs: { value } }),
          [id, SET],
        )
        // The positive control: the field shows the value set in Controls.
        const arrived = await page
          .waitForFunction((value) => document.querySelector('#storybook-root input')?.value === value, SET, { timeout: 5000 })
          .then(() => true)
          .catch(() => false)
        const input = page.locator('#storybook-root input')
        await input.click()
        await page.keyboard.press('Control+A')
        await page.keyboard.type(TYPED, { delay: 60 })
        await page.waitForTimeout(300)
        seen.push({ id, offersValue, enabled, arrived, ...(await page.evaluate(fieldAndArg, id)) })
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

const typedInto = (seen) => seen.filter((story) => story.offersValue && story.enabled)

await check('with value set in Controls, typing changes the field and the arg follows it', () =>
  withBuild(async (out) => {
    const seen = await typeOverValue(out)
    const tried = typedInto(seen)
    if (tried.length < 5) return `only ${tried.length} stories offer value with a field that takes typing, so this read almost nothing`
    const lost = tried.filter((story) => !story.arrived)
    if (lost.length) return `the value set in Controls never reached the field: ${lost.map((story) => story.id).join(', ')}`
    const frozen = tried.filter((story) => story.field !== TYPED || story.arg !== TYPED)
    process.stdout.write(`       ${tried.length} stories: ${tried.map((story) => story.id.replace('shared-input--', '')).join(', ')}\n`)
    return frozen.length ? `typing did not take: ${frozen.map((story) => `${story.id} field ${JSON.stringify(story.field)}, arg ${JSON.stringify(story.arg)}`).join('; ')}` : null
  }),
)

await check('THE CASE: with the binding taken out, the field refuses the typing again', async () => {
  const original = readFileSync(STORIES, 'utf8')
  if (!original.includes(BINDING)) return 'the value binding is not where this mutation expects it, so it no longer applies'
  try {
    writeFileSync(STORIES, original.replace(BINDING, () => ''))
    return await withBuild(async (out) => {
      const tried = typedInto(await typeOverValue(out))
      const frozen = tried.filter((story) => story.arrived && story.field === SET)
      return frozen.length ? null : `every field took the typing without the binding: ${JSON.stringify(tried)}`
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
  process.stderr.write(`\nKN-249 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-249 verify passed.\n')
