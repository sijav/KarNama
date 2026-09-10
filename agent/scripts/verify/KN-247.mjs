#!/usr/bin/env node
// Verifies KN-247: no Input story offers a control that makes its play
// function untrue.
//
// Exit condition: every Input story with a play function either reads its
// expectations from the active args or offers, through controls.include or by
// disabling controls, only the args its assertions follow; a check enumerates
// the stories and fails on one that offers any other control.
//
// The check runs every story with a play function once as it is, then once for
// each control it offers with that arg changed, through Storybook's own URL
// args, which is the same play function a reviewer reruns after changing the
// control. Strings are tried as a different value and as empty, booleans
// flipped. The verdict is Storybook's own: the render passing through the
// errored phase, or playFunctionThrewException, recorded from the moment its
// channel exists. NOT storyFinished, whose status read success for a play
// function that threw. It runs on a production build served here, in
// Playwright's Chromium.
//
// What it cannot see: a play function branch that only runs under the test
// runner. Hover returns before its hover assertion in Storybook's UI, since
// only the test runner can drive a real pointer, so a Hover control that
// breaks the hover itself is caught by reading the story, not by this.
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
  const out = mkdtempSync(join(tmpdir(), 'kn247-'))
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

// In the page, before anything else runs: every render phase and every play
// function exception, from the moment Storybook assigns its channel.
const record = () => {
  window.__KN247__ = []
  let channel
  Object.defineProperty(window, '__STORYBOOK_ADDONS_CHANNEL__', {
    configurable: true,
    get: () => channel,
    set: (value) => {
      channel = value
      value.on('storyRenderPhaseChanged', ({ newPhase, storyId }) => {
        // The args as the play function starts, before it can change them: a
        // story whose value is bound writes what it types back into its args.
        if (window.__KN247_ARGS__ === undefined && window.__KN247__.includes('rendering') && newPhase !== 'rendering') {
          window.__KN247_ARGS__ = JSON.parse(JSON.stringify(window.__STORYBOOK_PREVIEW__.storyStoreValue.args.get(storyId)))
        }
        window.__KN247__.push(newPhase)
      })
      value.on('playFunctionThrewException', (error) => window.__KN247__.push(`threw: ${String(error?.message ?? error).split('\n')[0]}`))
    },
  })
}

// In the page: the controls a story offers, filtered the way the Controls
// panel filters them, whether it has a play function, and its args as applied.
const describeStory = (id) => {
  const preview = window.__STORYBOOK_PREVIEW__
  const { story } = preview.currentRender
  const { disable = false, include, exclude } = story.parameters.controls ?? {}
  const matches = (rule, name) => (Array.isArray(rule) ? rule.includes(name) : rule instanceof RegExp ? rule.test(name) : false)
  const offered = disable
    ? []
    : Object.entries(story.argTypes)
        .filter(([, type]) => type.control && type.table?.disable !== true)
        .map(([name]) => name)
        .filter((name) => (include === undefined || matches(include, name)) && (exclude === undefined || !matches(exclude, name)))
  return { hasPlay: typeof story.playFunction === 'function', offered, args: window.__KN247_ARGS__ ?? preview.storyStoreValue.args.get(id), log: window.__KN247__ }
}

// One render of a story, with URL args: Storybook's log of it, and its args.
const run = async (browser, origin, id, urlArgs) => {
  const page = await browser.newPage()
  try {
    await page.addInitScript(record)
    await page.goto(`${origin}/iframe.html?id=${id}&viewMode=story${urlArgs ? `&args=${urlArgs}` : ''}`)
    await page.waitForFunction(() => window.__KN247__?.at(-1) === 'finished', null, { timeout: 20000 })
    return await page.evaluate(describeStory, id)
  } finally {
    await page.close()
  }
}

const broke = (log) => log.filter((entry) => entry === 'errored' || entry.startsWith('threw: '))

// Strings as a different value and as empty, booleans flipped: in the letters
// Storybook's URL args accept.
const perturbations = (name, current) =>
  typeof current === 'boolean' || name === 'disabled'
    ? [[!current, `${name}:!${!current}`]]
    : [
        [current === 'x7' ? 'y8' : 'x7', `${name}:${current === 'x7' ? 'y8' : 'x7'}`],
        ['', `${name}:`],
      ]

// Every Input story with a play function, and every control it offers.
const sweep = async (dir) => {
  const server = await serve(dir)
  const origin = `http://127.0.0.1:${server.address().port}`
  const browser = await chromium.launch()
  try {
    const index = JSON.parse(readFileSync(join(dir, 'index.json'), 'utf8'))
    const ids = Object.values(index.entries)
      .filter((entry) => entry.type === 'story' && entry.id.startsWith('shared-input--'))
      .map((entry) => entry.id)
    const stories = []
    for (const id of ids) {
      const baseline = await run(browser, origin, id, '')
      const story = { id, hasPlay: baseline.hasPlay, offered: baseline.offered, played: baseline.log.includes('playing'), baseline: broke(baseline.log), broken: [], unapplied: [] }
      stories.push(story)
      if (!baseline.hasPlay) continue
      for (const name of baseline.offered) {
        for (const [value, urlArgs] of perturbations(name, baseline.args[name])) {
          const changed = await run(browser, origin, id, urlArgs)
          if (changed.args[name] !== value) story.unapplied.push(`${name}=${JSON.stringify(value)} read back as ${JSON.stringify(changed.args[name])}`)
          const signs = broke(changed.log)
          if (signs.length) story.broken.push(`${name}=${JSON.stringify(value)}: ${signs.join(' ')}`)
        }
      }
    }
    return stories
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

const offeredBy = (stories) =>
  stories
    .filter((story) => story.hasPlay)
    .map((story) => `${story.id.replace('shared-input--', '')} [${story.offered.join(', ') || 'no controls'}]`)
    .join('; ')

await check('every story with a play function stays true with each control it offers changed', () =>
  withBuild(async (out) => {
    const stories = await sweep(out)
    const played = stories.filter((story) => story.hasPlay)
    if (played.length < 10) return `only ${played.length} stories with a play function were found, so this read almost nothing`
    const idle = played.filter((story) => !story.played)
    if (idle.length) return `a play function never started: ${idle.map((story) => story.id).join(', ')}`
    const baseline = played.filter((story) => story.baseline.length)
    if (baseline.length) return `a story fails with nothing changed: ${baseline.map((story) => `${story.id} ${story.baseline.join(' ')}`).join('; ')}`
    process.stdout.write(`       ${offeredBy(stories)}\n`)
    const unapplied = played.filter((story) => story.unapplied.length)
    const broken = played.filter((story) => story.broken.length)
    const problems = [
      ...unapplied.map((story) => `a changed arg never reached ${story.id}: ${story.unapplied.join('; ')}`),
      ...broken.map((story) => `${story.id} offers controls that break its play function: ${story.broken.join('; ')}`),
    ]
    return problems.length ? `\n         ${problems.join('\n         ')}` : null
  }),
)

await check('THE CASE: a story offering every control again is caught', async () => {
  // Typing back on Storybook's default, every control, as it was before this card.
  const original = readFileSync(STORIES, 'utf8')
  const typing = /(export const Typing: Story = \{\n(?: {2}\/\/.*\n)*)( {2}parameters: offers\([^)]*\),\n)/
  if (!typing.test(original)) return 'Typing does not declare its controls through offers(), so this mutation no longer applies'
  try {
    writeFileSync(STORIES, original.replace(typing, (_, head) => head))
    return await withBuild(async (out) => {
      const story = (await sweep(out)).find((entry) => entry.id === 'shared-input--typing')
      if (!story?.hasPlay) return 'Typing was not found with a play function'
      return story.broken.some((entry) => entry.startsWith('disabled=')) ? null : `Typing offered every control and nothing broke: ${JSON.stringify(story.broken)}`
    })
  } finally {
    writeFileSync(STORIES, original)
  }
})

await check('every story with a play function declares its controls', () => {
  // Storybook offers every control by default, so a story that says nothing
  // offers all of them, including any prop added later. Each one names what it
  // offers through offers(), or disables them.
  const source = readFileSync(STORIES, 'utf8')
  if (!/^const offers = \(names: \(keyof InputProps\)\[\]\) => \(\{ controls: \{ include: names \} \}\)$/m.test(source)) {
    return 'the offers() helper is gone or changed shape'
  }
  const bodies = [...source.matchAll(/export const (\w+): Story = \{\n([\s\S]*?)\n\}\n/g)]
  if (bodies.length < 10) return `only ${bodies.length} stories were read, so this read almost nothing`
  const silent = bodies
    .filter(([, , body]) => /(^|\n) {2}play:/.test(body) && !/(^|\n) {2}parameters: (offers\(|\{ controls: \{ disable: true \} \})/.test(body))
    .map(([, name]) => name)
  return silent.length ? `stories with a play function that leave every control on: ${silent.join(', ')}` : null
})

await check('the Input stories pass', () => {
  const result = spawnSync('npx vitest run --project storybook src/shared/input', { cwd: WEB, encoding: 'utf8', shell: true })
  return result.status === 0 ? null : `they fail:\n${`${result.stdout}${result.stderr}`.slice(-800)}`
})

if (failures.length) {
  process.stderr.write(`\nKN-247 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-247 verify passed.\n')
