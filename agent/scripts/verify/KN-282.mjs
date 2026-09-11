#!/usr/bin/env node
// Verifies KN-282: the Filter Chip's text sits 12 from its edge in every
// state, the edge drawn inside and out of layout, and its pressed edge is 1.5.
//
// Exit condition: in every state the Filter Chip's text sits spacing/sm, 12px,
// from the chip's outer edge as 159:63 to 159:69 draw it, with the edge painted
// inside and taking no layout space; the pressed edge is 1.5 as 159:67 draws
// it; nothing in FilterChip.tsx computes a padding from a border width; the
// stories measure the text's distance from the edge; and the selected edge is
// left to KN-279.
//
// The states are read in a production Storybook served here, in Playwright's
// Chromium at a device pixel ratio of one, in both languages, light and dark:
// at rest, hovered and pressed with a real pointer, selected, and selected and
// pressed. The text is the chip's one element, the label's span, a flex item,
// so its box is where the text is laid out.
//
// NOT read-only: it edits FilterChip.tsx for its mutations and restores it in
// a finally. The builds go to the system temp directory and are removed.

import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const COMPONENT = join(WEB, 'src', 'shared', 'filter-chip', 'FilterChip.tsx')
const STORIES = join(WEB, 'src', 'shared', 'filter-chip', 'FilterChip.stories.tsx')
const { chromium } = createRequire(join(WEB, 'package.json'))('playwright')

const NO_BORDER = '          borderWidth: 0,\n'
const LAID_OUT = "          borderWidth: 1,\n          borderStyle: 'solid',\n"
const PRESSED = 'const PRESSED_EDGE = 1.5\n'

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
  const result = spawnSync('npx vitest run --project storybook src/shared/filter-chip --reporter=verbose', { cwd: WEB, encoding: 'utf8', shell: true })
  return { code: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}
const ran = (output, mark, story) => output.split('\n').some((line) => mark.test(line) && line.includes(`> ${story}`))

const withEdit = (from, to, run) => {
  const original = readFileSync(COMPONENT, 'utf8')
  if (!original.includes(from)) throw new Error(`the anchor for this mutation is gone:\n${from}`)
  try {
    writeFileSync(COMPONENT, original.replace(from, () => to))
    return run()
  } finally {
    writeFileSync(COMPONENT, original)
  }
}

const build = (name) => {
  const out = mkdtempSync(join(tmpdir(), `kn282-${name}-`))
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

const session = async (dir, run) => {
  const server = await serve(dir)
  const browser = await chromium.launch()
  try {
    return await run(browser, `http://127.0.0.1:${server.address().port}`)
  } finally {
    await browser.close()
    server.close()
  }
}

// In the page: the chip's geometry and edges.
const measure = () => {
  const chip = document.querySelector('#storybook-root button')
  const text = chip.firstElementChild
  const outer = chip.getBoundingClientRect()
  const inner = text.getBoundingClientRect()
  const own = getComputedStyle(chip)
  const edge = getComputedStyle(chip, '::before')
  return {
    insets: [inner.left - outer.left, outer.right - inner.right].map((gap) => Math.round(gap * 100) / 100),
    height: outer.height,
    own: [own.borderTopWidth, own.borderRightWidth, own.borderBottomWidth, own.borderLeftWidth].map(Number.parseFloat),
    padding: [own.paddingTop, own.paddingBottom].map(Number.parseFloat),
    shadow: own.boxShadow,
    edge: { style: edge.borderTopStyle, width: Number.parseFloat(edge.borderTopWidth), colour: edge.borderTopColor },
  }
}

// A chip in a state, in a language and a scheme.
const chipIn = async (browser, base, { locale, scheme, selected, state }) => {
  const story = locale === 'en-US' ? 'in-english' : selected ? 'selected' : 'default'
  const args = selected && locale === 'en-US' ? '&args=selected:!true' : ''
  const page = await browser.newPage({ viewport: { width: 420, height: 160 }, deviceScaleFactor: 1 })
  try {
    await page.goto(`${base}/iframe.html?id=shared-filterchip--${story}&viewMode=story&globals=colorScheme:${scheme}${args}`)
    await page.waitForFunction(() => window.__STORYBOOK_PREVIEW__?.currentRender?.phase === 'finished', null, { timeout: 30000 })
    const chip = page.locator('#storybook-root button').first()
    const box = await chip.boundingBox()
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    if (state === 'pressed') await page.mouse.down()
    try {
      return { ...(await page.evaluate(measure)), pressedAttribute: await chip.getAttribute('aria-pressed') }
    } finally {
      if (state === 'pressed') await page.mouse.up()
    }
  } finally {
    await page.close()
  }
}

const inset = (shadow) => /inset/.test(shadow) ? Number.parseFloat((shadow.replace(/rgba?\([^)]*\)/, '').match(/-?[\d.]+px/g) ?? []).at(-1) ?? 'NaN') : 0
const colourOf = (shadow) => shadow.match(/rgba?\([^)]*\)/)?.[0] ?? ''

const STATES = [
  { selected: false, state: 'rest' },
  { selected: false, state: 'hover' },
  { selected: false, state: 'pressed' },
  { selected: true, state: 'rest' },
  { selected: true, state: 'pressed' },
]

const main = async () => {
  await check('the Filter Chip stories pass, Default, Selected and In English measuring the text 12 from each side', () => {
    const source = readFileSync(STORIES, 'utf8')
    if (!source.includes('.toEqual([12, 12])')) return 'the stories do not measure the text at 12'
    const { code, output } = stories()
    if (code !== 0) return `they fail:\n${output.slice(-800)}`
    const missed = ['Default', 'Selected', 'In English'].filter((name) => !ran(output, /✓/, name))
    return missed.length ? `these did not run and pass: ${missed.join(', ')}` : null
  })

  await check('THE CASE: the border put back on the chip itself, laid out, fails Default by name on the text at 13', () =>
    withEdit(NO_BORDER, LAID_OUT, () => {
      const { code, output } = stories()
      if (code === 0) return 'the stories passed with a laid-out border, so nothing measures the text'
      if (!ran(output, /[×✗]/, 'Default')) return `it failed, but not in Default:\n${output.slice(-500)}`
      return /13/.test(output) ? null : `Default failed, but not on the text at 13:\n${output.slice(-600)}`
    }),
  )

  await check('no padding in FilterChip.tsx is computed from a border width, and none runs above or below the text', () => {
    const source = readFileSync(COMPONENT, 'utf8')
    const paddings = [...source.matchAll(/(padding\w*): ([^,\n]+),/g)].map(([, key, value]) => [key, value.trim()])
    if (!paddings.length) return 'no padding was found, so this read nothing'
    const off = paddings.filter(([, value]) => !/^`\$\{spacing(\.\w+|\['[\w-]+'\])\}px`$/.test(value) && value !== '0')
    if (off.length) return `these are not a spacing token or 0: ${off.map(([key, value]) => `${key}: ${value}`).join('; ')}`
    return paddings.some(([key, value]) => key === 'paddingBlock' && value === '0') ? null : 'the block padding is not 0'
  })

  const out = build('fixed')
  try {
    await session(out, async (browser, base) => {
      await check('in both languages, light and dark, every state: the text 12 from each side, 32 tall, no border of its own, the edge as drawn', async () => {
        const problems = []
        for (const locale of ['fa-IR', 'en-US']) {
          for (const scheme of ['light', 'dark']) {
            for (const { selected, state } of STATES) {
              const read = await chipIn(browser, base, { locale, scheme, selected, state })
              const name = `${locale} ${scheme} ${selected ? 'selected' : 'unselected'} ${state}`
              const wrong = []
              if (read.pressedAttribute !== String(selected)) wrong.push(`aria-pressed ${read.pressedAttribute}`)
              if (read.insets.join() !== '12,12') wrong.push(`text at ${read.insets.join(' and ')}`)
              if (read.height !== 32) wrong.push(`${read.height} tall`)
              if (read.own.some((width) => width !== 0)) wrong.push(`a border of its own, ${read.own.join(' ')}`)
              if (read.padding.some((padding) => padding !== 0)) wrong.push(`padding above or below, ${read.padding.join(' ')}`)
              const pressed = state === 'pressed'
              if (pressed) {
                if (inset(read.shadow) !== 1.5) wrong.push(`a pressed edge of ${inset(read.shadow)}, shadow ${read.shadow}`)
                if (read.edge.style !== 'solid' || read.edge.width !== 1 || read.edge.colour !== colourOf(read.shadow)) wrong.push(`the edge under the shadow ${JSON.stringify(read.edge)}`)
              } else {
                if (read.shadow !== 'none') wrong.push(`a shadow at ${state}, ${read.shadow}`)
                if (selected ? read.edge.style !== 'none' : read.edge.style !== 'solid' || read.edge.width !== 1) wrong.push(`the edge ${JSON.stringify(read.edge)}`)
              }
              if (wrong.length) problems.push(`${name}: ${wrong.join('; ')}`)
            }
          }
        }
        return problems.length ? problems.join('\n    ') : null
      })

      await check('under forced colours, a resting and a pressed chip still show an edge in the rendered pixels, where a shadow-only edge would not', async () => {
        const edgeShows = async ({ pressed, shadowOnly }) => {
          const page = await browser.newPage({ viewport: { width: 420, height: 160 }, deviceScaleFactor: 1, forcedColors: 'active' })
          try {
            await page.goto(`${base}/iframe.html?id=shared-filterchip--default&viewMode=story`)
            await page.waitForFunction(() => window.__STORYBOOK_PREVIEW__?.currentRender?.phase === 'finished', null, { timeout: 30000 })
            if (shadowOnly) await page.addStyleTag({ content: '#storybook-root button::before { border-width: 0 !important; } #storybook-root button { box-shadow: inset 0 0 0 1px #e5e7eb !important; }' })
            const chip = page.locator('#storybook-root button').first()
            const box = await chip.boundingBox()
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
            if (pressed) await page.mouse.down()
            try {
              // The chip's left edge need not fall on a whole pixel: in Persian it
              // is placed from the right, at 313.92 or so. The column read as its
              // edge is the one the edge mostly covers, and the inside six on.
              const png = await page.screenshot({ clip: { x: Math.floor(box.x), y: Math.floor(box.y), width: Math.ceil(box.width) + 1, height: Math.ceil(box.height) } })
              const at = Math.round(box.x - Math.floor(box.x))
              const [edge, inside] = await page.evaluate(async ({ b64, mid, at }) => {
                const img = new Image()
                img.src = `data:image/png;base64,${b64}`
                await img.decode()
                const canvas = document.createElement('canvas')
                canvas.width = img.width
                canvas.height = img.height
                const context = canvas.getContext('2d')
                context.drawImage(img, 0, 0)
                return [[at, mid], [at + 6, mid]].map(([x, y]) => Array.from(context.getImageData(x, y, 1, 1).data).slice(0, 3).join())
              }, { b64: png.toString('base64'), mid: Math.floor(box.height / 2), at })
              return edge !== inside
            } finally {
              if (pressed) await page.mouse.up()
            }
          } finally {
            await page.close()
          }
        }
        if (!(await edgeShows({ pressed: false }))) return 'at rest under forced colours the chip has no edge'
        if (!(await edgeShows({ pressed: true }))) return 'pressed under forced colours the chip has no edge'
        return (await edgeShows({ pressed: false, shadowOnly: true })) ? 'a shadow-only edge showed too, so this check tells nothing apart' : null
      })
    })
  } finally {
    rmSync(out, { recursive: true, force: true })
  }

  await check('the pressed edge back at 1 fails the production reading of the pressed chip', async () => {
    const control = withEdit(PRESSED, 'const PRESSED_EDGE = 1\n', () => build('one'))
    try {
      return await session(control, async (browser, base) => {
        const read = await chipIn(browser, base, { locale: 'fa-IR', scheme: 'light', selected: false, state: 'pressed' })
        return inset(read.shadow) === 1 ? null : `the pressed edge read ${inset(read.shadow)} with the constant at 1, so the reading does not follow it`
      })
    } finally {
      rmSync(control, { recursive: true, force: true })
    }
  })
}

await main()
if (failures.length) {
  process.stderr.write(`\nKN-282 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-282 verify passed.\n')
