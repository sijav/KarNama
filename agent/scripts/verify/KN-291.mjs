#!/usr/bin/env node
// Verifies KN-291: an Input icon turned off, with false, null, true or an empty
// string, draws no slot, and the text sits where it does with no icon at all.
//
// Exit condition: an Input given null, false, true or an empty string for
// either icon draws no slot and its text sits 16 from that edge, as with no
// icon at all; a story passes false for one icon and null for the other and
// asserts no slot and the 16, and a mutation back to the undefined check fails
// it by name.
//
// The 16 is to the input's box, the proxy for where the text starts that
// KN-283 is replacing for every Input story. The story is also read in a
// production Storybook served here, in Playwright's Chromium, in fa-IR and
// en-US.
//
// NOT read-only: it edits Input.tsx for its mutations and restores it in a
// finally. The build goes to the system temp directory and is removed.

import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const COMPONENT = join(WEB, 'src', 'shared', 'input', 'Input.tsx')
const STORIES = join(WEB, 'src', 'shared', 'input', 'Input.stories.tsx')
const { chromium } = createRequire(join(WEB, 'package.json'))('playwright')

const START = '        startAdornment={drawn(leadingIcon) ? <Slot>{leadingIcon}</Slot> : undefined}\n'
const END = '        endAdornment={drawn(trailingIcon) ? <Slot>{trailingIcon}</Slot> : undefined}\n'
const EMPTY = "      '&:empty': { display: 'none' },\n"

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

const stories = () => {
  const result = spawnSync('npx vitest run --project storybook src/shared/input --reporter=verbose', { cwd: WEB, encoding: 'utf8', shell: true })
  return { code: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}

const ran = (output, mark, story) => output.split('\n').some((line) => mark.test(line) && line.includes(`> ${story}`))

const mutation = (edits, what, story) => {
  const original = readFileSync(COMPONENT, 'utf8')
  let changed = original
  for (const [from, to] of edits) {
    if (!changed.includes(from)) return `the anchor for this mutation is gone:\n${from}`
    changed = changed.replace(from, () => to)
  }
  try {
    writeFileSync(COMPONENT, changed)
    const { code, output } = stories()
    if (code === 0) return `the stories passed with ${what}, so nothing measures it`
    return ran(output, /[×✗]/, story) ? null : `it failed, but not in ${story}:\n${output.slice(-500)}`
  } finally {
    writeFileSync(COMPONENT, original)
  }
}

const build = () => {
  const out = mkdtempSync(join(tmpdir(), 'kn291-'))
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

// In the page: for each field of the story, which kind it is, the width of
// whatever sits on either side of the input, and the input box's distance
// from the field's start and end edges, in the field's direction.
const measure = () =>
  [...document.querySelectorAll('#storybook-root [data-testid]')].map((wrapper) => {
    const field = wrapper.querySelector('.MuiInputBase-root')
    const box = field.querySelector('input')
    const rtl = getComputedStyle(field).direction === 'rtl'
    const outer = field.getBoundingClientRect()
    const text = box.getBoundingClientRect()
    const sides = [box.previousElementSibling, box.nextElementSibling].map((element) => (element ? element.getBoundingClientRect().width : null))
    const insets = rtl ? [outer.right - text.right, text.left - outer.left] : [text.left - outer.left, outer.right - text.right]
    return { kind: wrapper.dataset.testid, rtl, sides, insets }
  })

const main = async () => {
  await check('the Input stories pass, IconsTurnedOff by name', () => {
    if (!/export const IconsTurnedOff: Story/.test(readFileSync(STORIES, 'utf8'))) return 'there is no IconsTurnedOff'
    const { code, output } = stories()
    if (code !== 0) return `they fail:\n${output.slice(-800)}`
    return ran(output, /✓/, 'Icons Turned Off') ? null : 'IconsTurnedOff did not run and pass'
  })

  await check('THE CASE: back to the undefined check, false and null each draw a slot, and IconsTurnedOff fails', () =>
    mutation(
      [
        [START, '        startAdornment={leadingIcon === undefined ? undefined : <Slot>{leadingIcon}</Slot>}\n'],
        [END, '        endAdornment={trailingIcon === undefined ? undefined : <Slot>{trailingIcon}</Slot>}\n'],
      ],
      'the undefined check back',
      'Icons Turned Off',
    ),
  )
  await check('an empty slot left standing, for a fragment or an icon that renders nothing, fails IconsTurnedOff', () =>
    mutation([[EMPTY, '']], 'the empty slot drawn', 'Icons Turned Off'),
  )

  const out = build()
  const server = await serve(out)
  const browser = await chromium.launch()
  try {
    await check('in both directions no field turned off has a slot that takes room, and the text box is 16 from both edges', async () => {
      const problems = []
      for (const locale of ['fa-IR', 'en-US']) {
        const page = await browser.newPage({ viewport: { width: 700, height: 720 } })
        try {
          await page.goto(`http://127.0.0.1:${server.address().port}/iframe.html?id=shared-input--icons-turned-off&viewMode=story&globals=locale:${locale}`)
          await page.waitForFunction(() => window.__STORYBOOK_PREVIEW__?.currentRender?.phase === 'finished', null, { timeout: 30000 })
          const fields = await page.evaluate(measure)
          process.stdout.write(`       ${locale}: ${fields.map((field) => `${field.kind} sides ${field.sides.join('/')} text ${field.insets.join('/')}`).join('; ')}\n`)
          // Five since KN-292 added a space and a zero-width space, a line break and a joiner.
          if (fields.length !== 5) problems.push(`${locale}: ${fields.length} fields, not 5`)
          for (const [index, field] of fields.entries()) {
            const wrong = []
            if (field.rtl !== (locale === 'fa-IR')) wrong.push('the field runs the wrong way')
            const want = field.kind === 'no-slot' ? [null, null] : [0, 0]
            if (field.sides.join() !== want.join()) wrong.push(`sides ${field.sides.join(' and ')} where ${want.map(String).join(' and ')}`)
            if (field.insets.join() !== '16,16') wrong.push(`the text box at ${field.insets.join(' and ')}`)
            if (wrong.length) problems.push(`${locale} field ${index + 1}, ${field.kind}: ${wrong.join('; ')}`)
          }
        } finally {
          await page.close()
        }
      }
      return problems.length ? problems.join('\n    ') : null
    })
  } finally {
    await browser.close()
    server.close()
    rmSync(out, { recursive: true, force: true })
  }
}

await main()
if (failures.length) {
  process.stderr.write(`\nKN-291 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-291 verify passed.\n')
