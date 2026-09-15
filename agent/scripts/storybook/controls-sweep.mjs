#!/usr/bin/env node
// Which stories offer a control that makes their play function untrue, KN-255.
//
// KN-247 swept the Input's stories this way; this sweeps every story. Each story
// of a production Storybook is opened once as it is, and each one with a play
// function is opened again once per control it offers, the controls filtered as
// the Controls panel filters them, with that arg changed through Storybook's URL
// args by the control's type: a boolean flipped, a text changed and emptied,
// every other option of a select or radio, a number moved by one. The verdict is
// Storybook's own, the render reaching the errored phase or
// playFunctionThrewException, heard from the moment the preview assigns its
// channel. Not storyFinished, whose status reads success for a play that threw.
//
// It also lists every JSON control offered for a prop typed as a React node or
// element, a value no one can type.
//
// What it cannot see: a control it cannot change, a JSON one or a value the URL
// args refuse, which admit letters, digits, space, underscore and dash; values
// other than the ones it tries; and a branch a play takes only in the Vitest
// runner, such as a real pointer's hover.
//
// A measurement, run by hand and wired into nothing:
//
//   node agent/scripts/storybook/controls-sweep.mjs [--only <regex>] [--static <dir>] [--workers <n>] [--out <file>]
//
// Without --static it builds Storybook into a temporary directory and removes it
// after. --only picks story ids by a regular expression. It prints the broken
// stories and writes everything it saw to --out, by default controls-sweep.json
// in the system's temporary directory. It exits 1 when a story is broken or
// offers a JSON control for an element, 2 when none is but a story failed with
// nothing changed, so its controls were never tried, and 0 otherwise.

import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const { chromium } = createRequire(join(WEB, 'package.json'))('playwright')

const { values } = parseArgs({
  options: {
    only: { type: 'string' },
    static: { type: 'string' },
    workers: { type: 'string', default: '6' },
    out: { type: 'string', default: join(tmpdir(), 'controls-sweep.json') },
    timeout: { type: 'string', default: '30000' },
  },
})
const ONLY = values.only === undefined ? null : new RegExp(values.only)
const WORKERS = Number(values.workers)
const TIMEOUT = Number(values.timeout)

const build = () => {
  const out = mkdtempSync(join(tmpdir(), 'controls-sweep-'))
  process.stdout.write(`building Storybook into ${out}\n`)
  const result = spawnSync(`npx storybook build -o "${out}" --quiet`, { cwd: WEB, encoding: 'utf8', shell: true })
  if (result.status !== 0) throw new Error(`the Storybook build failed:\n${`${result.stdout}${result.stderr}`.slice(-1500)}`)
  return out
}

const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
}
const serve = (dir) =>
  new Promise((resolve) => {
    const server = createServer(async (request, response) => {
      const path = normalize(join(dir, decodeURIComponent(new URL(request.url ?? '/', 'http://local').pathname)))
      if (!path.startsWith(dir) || !existsSync(path)) {
        response.writeHead(404).end()
        return
      }
      response.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' }).end(await readFile(path))
    })
    server.listen(0, '127.0.0.1', () => resolve(server))
  })

// In the page, before anything else runs: every render phase and every play
// exception from the moment the preview assigns its channel, and the args as the
// first play starts, before a story that writes its args back can change them.
const record = () => {
  const heard = { phases: [], args: undefined }
  Object.assign(window, { __controlsSweep: heard })
  let channel
  Object.defineProperty(window, '__STORYBOOK_ADDONS_CHANNEL__', {
    configurable: true,
    get: () => channel,
    set: (value) => {
      channel = value
      value.on('storyRenderPhaseChanged', ({ newPhase, storyId }) => {
        if (newPhase === 'playing' && heard.args === undefined) {
          try {
            heard.args = JSON.parse(JSON.stringify(window.__STORYBOOK_PREVIEW__.storyStoreValue.args.get(storyId)))
          } catch {
            heard.args = null
          }
        }
        heard.phases.push(newPhase)
      })
      value.on('playFunctionThrewException', (error) =>
        heard.phases.push(
          `threw: ${String(error?.message ?? error)
            .split('\n')[0]
            .slice(0, 200)}`,
        ),
      )
    },
  })
}

// In the page: the controls the story offers, filtered as the Controls panel
// filters them, each with its control, its options and its prop's type. An arg
// type given control false arrives prepared as a control with disable set, its
// inferred type kept, and the panel draws its row with no editor.
const describe = (id) => {
  const preview = window.__STORYBOOK_PREVIEW__
  const story = preview.currentRender?.story
  if (!story) return null
  const { disable = false, include, exclude } = story.parameters.controls ?? {}
  const matches = (rule, name) => (Array.isArray(rule) ? rule.includes(name) : rule instanceof RegExp ? rule.test(name) : rule === name)
  const offered = disable
    ? []
    : Object.entries(story.argTypes)
        .filter(([, type]) => type.control && type.control.disable !== true && type.table?.disable !== true)
        .filter(([name]) => (include === undefined || matches(include, name)) && (exclude === undefined || !matches(exclude, name)))
        .map(([name, type]) => ({
          name,
          control: typeof type.control === 'string' ? type.control : (type.control?.type ?? 'unknown'),
          options: Array.isArray(type.options)
            ? type.options.map((option) => (typeof option === 'object' ? JSON.stringify(option) : option))
            : undefined,
          propType: type.table?.type?.summary ?? type.type?.name,
        }))
  const args = window.__controlsSweep.args ?? JSON.parse(JSON.stringify(preview.storyStoreValue.args.get(id)))
  return { hasPlay: typeof story.playFunction === 'function', offered, args, phases: window.__controlsSweep.phases }
}

const urlSafe = (value) => typeof value === 'string' && /^[a-zA-Z0-9 _-]*$/.test(value)
const perturbations = (control, current) => {
  const { name } = control
  if (control.control === 'boolean') return [{ value: !current, arg: `${name}:!${String(!current)}` }]
  if (['select', 'radio', 'inline-radio', 'check', 'inline-check', 'multi-select'].includes(control.control) && control.options) {
    return control.options
      .filter((option) => option !== current && (typeof option === 'number' || urlSafe(option)))
      .map((option) => ({ value: option, arg: `${name}:${option}` }))
  }
  if (control.control === 'number' || control.control === 'range') {
    const next = typeof current === 'number' ? current + 1 : 1
    return [{ value: next, arg: `${name}:${next}` }]
  }
  if (control.control === 'text' || control.control === 'color') {
    const other = current === 'x7' ? 'y8' : 'x7'
    return [
      { value: other, arg: `${name}:${other}` },
      { value: '', arg: `${name}:` },
    ]
  }
  return []
}

const broke = (phases) => phases.filter((entry) => entry === 'errored' || entry.startsWith('threw: '))

// One render: open the story, wait until its play has ended and the render that
// followed has finished, or the story finished with no play at all.
const open = async (browser, origin, id, urlArgs) => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  try {
    await page.addInitScript(record)
    await page.goto(`${origin}/iframe.html?id=${id}&viewMode=story${urlArgs ? `&args=${urlArgs}` : ''}`)
    let timedOut = false
    try {
      await page.waitForFunction(
        () => {
          const phases = window.__controlsSweep?.phases ?? []
          if (!phases.includes('playing')) return phases.includes('finished')
          const ended = Math.max(phases.lastIndexOf('played'), phases.lastIndexOf('errored'))
          return (ended >= 0 || phases.some((entry) => entry.startsWith('threw: '))) && phases.lastIndexOf('finished') > ended
        },
        null,
        { timeout: TIMEOUT },
      )
    } catch {
      timedOut = true
    }
    return { seen: await page.evaluate(describe, id), timedOut }
  } finally {
    await page.close()
  }
}

const sweep = async (dir) => {
  const server = await serve(dir)
  const origin = `http://127.0.0.1:${server.address().port}`
  const browser = await chromium.launch()
  const index = JSON.parse(readFileSync(join(dir, 'index.json'), 'utf8'))
  const ids = Object.values(index.entries)
    .filter((entry) => entry.type === 'story' && (ONLY === null || ONLY.test(entry.id)))
    .map((entry) => entry.id)
  process.stdout.write(`${ids.length} stories\n`)
  const results = []
  let next = 0
  const worker = async () => {
    for (let at = next++; at < ids.length; at = next++) {
      const id = ids[at]
      const baseline = await open(browser, origin, id, '')
      const story = {
        id,
        hasPlay: baseline.seen?.hasPlay ?? null,
        offered: baseline.seen?.offered ?? [],
        failsUnchanged: baseline.timedOut || !baseline.seen || broke(baseline.seen.phases).length > 0,
        broken: [],
        unapplied: [],
        untried: [],
      }
      results.push(story)
      if (!story.hasPlay || story.failsUnchanged) continue
      for (const control of story.offered) {
        const tries = perturbations(control, baseline.seen.args?.[control.name])
        if (tries.length === 0) story.untried.push(`${control.name} (${control.control})`)
        for (const { value, arg } of tries) {
          const changed = await open(browser, origin, id, arg)
          const read = changed.seen?.args?.[control.name]
          if (JSON.stringify(read) !== JSON.stringify(value))
            story.unapplied.push(`${control.name}=${JSON.stringify(value)} read back as ${JSON.stringify(read)}`)
          const signs = changed.seen ? broke(changed.seen.phases) : ['no render']
          if (changed.timedOut) signs.push('timed out')
          if (signs.length > 0) story.broken.push(`${control.name}=${JSON.stringify(value)}: ${signs.join(' | ')}`)
        }
      }
    }
  }
  try {
    await Promise.all(Array.from({ length: WORKERS }, worker))
  } finally {
    await browser.close()
    server.close()
  }
  return results.sort((a, b) => a.id.localeCompare(b.id))
}

const started = Date.now()
const built = values.static === undefined ? build() : null
let results
try {
  results = await sweep(normalize(values.static ?? built))
} finally {
  if (built !== null) rmSync(built, { recursive: true, force: true })
}
writeFileSync(values.out, JSON.stringify(results, null, 2))

const broken = results.filter((story) => story.broken.length > 0)
const elements = results.flatMap((story) =>
  story.offered
    .filter((control) => control.control === 'object' && /React(Node|Element)/.test(control.propType ?? ''))
    .map((control) => `${story.id}: ${control.name}`),
)
const unchanged = results.filter((story) => story.failsUnchanged)
process.stdout.write(
  `${results.length} stories in ${Math.round((Date.now() - started) / 1000)} s, ${results.filter((story) => story.hasPlay).length} with a play function; written to ${values.out}\n`,
)
process.stdout.write(`broken by a control they offer: ${broken.length}\n`)
for (const story of broken) process.stdout.write(`  ${story.id}: ${story.broken.join('; ')}\n`)
process.stdout.write(`JSON controls offered for an element: ${elements.length}\n`)
for (const entry of elements) process.stdout.write(`  ${entry}\n`)
process.stdout.write(`failing with nothing changed, controls not tried: ${unchanged.map((story) => story.id).join(', ') || 'none'}\n`)
process.exit(broken.length > 0 || elements.length > 0 ? 1 : unchanged.length > 0 ? 2 : 0)
