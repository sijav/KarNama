#!/usr/bin/env node
// Verifies KN-294: the Filter Chip draws its focus ring inside itself, so a
// host that clips flush at the chip, a row of chips that scrolls, keeps it.
//
// Exit condition: a focused Filter Chip inside a host that clips its overflow
// flush at the chip's box still changes at least a two-pixel perimeter at 3:1,
// drawn inside the chip or with the room kept by the chip itself, selected and
// not; a story renders it in an overflow hidden host with no padding and
// asserts from the rendered geometry that every pixel of the focus change lies
// inside the host, a mutation back to the outline outside fails it by name, and
// DESIGN.md says which.
//
// The rendered proof is in pixels: a production Storybook served here, read in
// Playwright's Chromium at device pixel ratios of one and two, each of the
// story's two hosts, the chip not selected and selected, shot before and after
// a real Tab reaches its chip. Inside the host the ring's own colour must
// change the chip's fill at 3:1 or more, and its area, each changed pixel
// counted by how much of the ring's colour it took, KN-293's reading of WCAG
// 2.4.13's note on anti-aliasing, must cover the chip's two-pixel perimeter as
// WCAG gives it for a rounded rectangle, 4W + 4H - (16 - 4pi)r, in CSS pixels.
// Outside the host nothing may change. A second build with the outline back,
// the ring gone, is the positive control: the host clips that outline, and the
// focus covers nothing inside it.
//
// NOT read-only: it edits FilterChip.tsx for its mutations and restores it in
// a finally, and runs KN-274's verifier, which edits Input.tsx the same way.
// The builds go to the system temp directory and are removed.

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

// The ring as KN-294 draws it, and the outline KN-244 drew in its place.
const RING = [
  "          '&:focus-visible': { outline: 'none' },\n",
  "          '&:focus-visible::after': {\n",
  "            content: '\"\"',\n",
  "            position: 'absolute',\n",
  '            inset: EDGE,\n',
  "            borderRadius: 'inherit',\n",
  "            borderStyle: 'solid',\n",
  '            borderWidth: FOCUS_RING,\n',
  "            borderColor: colour['border/focus'],\n",
  "            pointerEvents: 'none',\n",
  '          },\n',
].join('')
const OUTLINE = [
  "          '&:focus-visible': {\n",
  '            outlineWidth: 2,\n',
  "            outlineStyle: 'solid',\n",
  "            outlineColor: colour['border/focus'],\n",
  '            outlineOffset: 2,\n',
  '          },\n',
].join('')
const STORY = 'Focused In A Clipping Host'
const HOSTS = ['unselected-host', 'selected-host']
const MARGIN = 8

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

// FilterChip.tsx with the outline back and the ring gone, for as long as run
// takes.
const withOutline = (run) => {
  const original = readFileSync(COMPONENT, 'utf8')
  if (original.split(RING).length !== 2) throw new Error(`the ring is not where the mutation expects it, once:\n${RING}`)
  try {
    writeFileSync(COMPONENT, original.replace(RING, () => OUTLINE))
    return run()
  } finally {
    writeFileSync(COMPONENT, original)
  }
}

const build = (name) => {
  const out = mkdtempSync(join(tmpdir(), `kn294-${name}-`))
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

// In the page: two screenshots of one region compared pixel by pixel, as
// KN-293 measures its ring. Outside the box, the device pixels that changed
// at all. Inside it, the ring's own colour, the one the most changed pixels
// took, against the fill the most of them had; its area, each changed pixel
// counted by how much of the ring's colour it took; and, for the record, the
// pixels that changed at 3:1 or more on their own.
const compare = ({ a, b, clip, box }) =>
  (async () => {
    const decode = async (b64) => {
      const img = new Image()
      img.src = `data:image/png;base64,${b64}`
      await img.decode()
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const context = canvas.getContext('2d')
      context.drawImage(img, 0, 0)
      return context.getImageData(0, 0, img.width, img.height)
    }
    const [before, after] = [await decode(a), await decode(b)]
    const channel = (value) => {
      const c = value / 255
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    }
    const luminance = (rgb) => 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2])
    const ratio = (one, two) => (Math.max(luminance(one), luminance(two)) + 0.05) / (Math.min(luminance(one), luminance(two)) + 0.05)
    const at = (data, i) => [data[i], data[i + 1], data[i + 2]]
    const scale = before.width / clip.width
    const changed = []
    let outside = 0
    for (let y = 0; y < before.height; y += 1) {
      for (let x = 0; x < before.width; x += 1) {
        const i = (y * before.width + x) * 4
        const moved = Math.abs(before.data[i] - after.data[i]) + Math.abs(before.data[i + 1] - after.data[i + 1]) + Math.abs(before.data[i + 2] - after.data[i + 2])
        if (moved === 0) continue
        const cx = clip.x + (x + 0.5) / scale
        const cy = clip.y + (y + 0.5) / scale
        if (cx < box.x || cx > box.x + box.width || cy < box.y || cy > box.y + box.height) outside += 1
        else changed.push(i)
      }
    }
    const mode = (data) => {
      const tally = new Map()
      for (const i of changed) {
        const key = at(data, i).join()
        tally.set(key, (tally.get(key) ?? 0) + 1)
      }
      const [top] = [...tally.entries()].sort((one, two) => two[1] - one[1])
      return top ? top[0].split(',').map(Number) : null
    }
    const [ring, fill] = [mode(after.data), mode(before.data)]
    let area = 0
    let strong = 0
    for (const i of changed) {
      const was = at(before.data, i)
      const now = at(after.data, i)
      const swing = [0, 1, 2].reduce((best, c) => (Math.abs(ring[c] - was[c]) > Math.abs(ring[best] - was[best]) ? c : best), 0)
      const full = ring[swing] - was[swing]
      area += full === 0 ? 0 : Math.min(1, Math.max(0, (now[swing] - was[swing]) / full))
      if (ratio(was, now) >= 3) strong += 1
    }
    return { ring, fill, contrast: ring && fill ? ratio(ring, fill) : 0, area: area / (scale * scale), strong: strong / (scale * scale), outside }
  })()

// One host on one page: its box, its chip's, and what a real Tab to its chip
// changed inside the host and round it. The story's play focused each chip in
// turn: undone, so the first shot is unfocused, and a click on the empty
// corner moves where Tab starts from back to the top.
const focusChange = async (browser, port, { globals, ratio, which }) => {
  const page = await browser.newPage({ viewport: { width: 500, height: 200 }, deviceScaleFactor: ratio })
  try {
    await page.goto(`http://127.0.0.1:${port}/iframe.html?id=shared-filterchip--focused-in-a-clipping-host&viewMode=story&globals=${globals}`)
    await page.waitForFunction(() => window.__STORYBOOK_PREVIEW__?.currentRender?.phase === 'finished', null, { timeout: 30000 })
    await page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
    })
    await page.mouse.click(1, 1)
    const host = await page.getByTestId(HOSTS[which]).boundingBox()
    const chip = await page.getByTestId(HOSTS[which]).locator('button').boundingBox()
    const radius = await page.evaluate((id) => Number.parseFloat(getComputedStyle(document.querySelector(`[data-testid="${id}"] button`)).borderTopLeftRadius), HOSTS[which])
    const viewport = page.viewportSize()
    const x = Math.max(0, Math.floor(host.x - MARGIN))
    const y = Math.max(0, Math.floor(host.y - MARGIN))
    const clip = { x, y, width: Math.min(viewport.width, Math.ceil(host.x + host.width + MARGIN)) - x, height: Math.min(viewport.height, Math.ceil(host.y + host.height + MARGIN)) - y }
    const before = await page.screenshot({ clip })
    for (let press = 0; press <= which; press += 1) await page.keyboard.press('Tab')
    const state = await page.evaluate((id) => {
      const button = document.querySelector(`[data-testid="${id}"] button`)
      return { focused: document.activeElement === button, visible: button?.matches(':focus-visible') ?? false, pressed: button?.getAttribute('aria-pressed') }
    }, HOSTS[which])
    await page.waitForTimeout(150)
    const after = await page.screenshot({ clip })
    const measured = await page.evaluate(compare, { a: before.toString('base64'), b: after.toString('base64'), clip, box: host })
    const r = Math.min(radius, chip.height / 2)
    return { ...state, host, chip, ...measured, perimeter: 4 * chip.width + 4 * chip.height - (16 - 4 * Math.PI) * r, rectangle: 4 * chip.width + 4 * chip.height }
  } finally {
    await page.close()
  }
}

// Both chips, in both languages, light and dark, at the ratios asked for.
const READINGS = (ratios) =>
  ratios.flatMap((ratio) =>
    [0, 1].flatMap((which) =>
      ['fa-IR', 'en-US'].flatMap((locale) =>
        ['light', 'dark'].map((scheme) => ({ name: `${which ? 'selected' : 'not selected'} ${locale} ${scheme} @${ratio}x`, which, ratio, globals: `locale:${locale};colorScheme:${scheme}` })),
      ),
    ),
  )

const readAll = async (dir, ratios) => {
  const server = await serve(dir)
  const browser = await chromium.launch()
  try {
    const read = []
    for (const reading of READINGS(ratios)) read.push({ name: reading.name, which: reading.which, ...(await focusChange(browser, server.address().port, reading)) })
    return read
  } finally {
    await browser.close()
    server.close()
  }
}

const main = async () => {
  await check(`the Filter Chip stories pass, ${STORY} by name`, () => {
    const { code, output } = stories()
    if (code !== 0) return `they fail:\n${output.slice(-800)}`
    return ran(output, /✓/, STORY) ? null : `${STORY} did not run and pass`
  })

  await check('the story renders both chips in hosts that clip, and measures the focus against every clipping ancestor, the host among them', () => {
    const source = readFileSync(STORIES, 'utf8')
    const story = /export const FocusedInAClippingHost: Story = \{\n([\s\S]*?)\n\}\n/.exec(source)?.[1] ?? ''
    const missing = [
      ['the host of the chip not selected', '<Box data-testid="unselected-host" sx={{ display: \'inline-flex\', overflow: \'hidden\' }}>'],
      ['the host of the selected chip', '<Box data-testid="selected-host" sx={{ display: \'inline-flex\', overflow: \'hidden\' }}>'],
      ['the chips in them, one of each', '<FilterChip {...args} selected={false} />'],
      ['the hosts among the clipping ancestors', 'await expect(clips).toContain(host)'],
      ['the focus inside every clipping ancestor', 'for (const clip of clips) await expect(overshoot(extent, clipEdge(clip))).toEqual([])'],
    ].filter(([, text]) => !story.includes(text))
    return missing.length ? `the story does not have ${missing.map(([what]) => what).join(', ')}` : null
  })

  await check(`THE CASE: the outline back in place of the ring fails ${STORY} by name, on the overshoot`, () =>
    withOutline(() => {
      const { code, output } = stories()
      if (code === 0) return 'the stories passed with the outline back, so nothing measures the clipping'
      if (!ran(output, /[×✗]/, STORY)) return `it failed, but not in ${STORY}:\n${output.slice(-500)}`
      return output.includes("[ [ 'left', 4 ]") ? null : `${STORY} failed, but not on the overshoot:\n${output.slice(-700)}`
    }),
  )

  const out = build('ring')
  try {
    await check("in pixels, both chips, both languages, light and dark, ratios one and two: a real Tab draws a ring inside the host whose colour changes the chip's fill at 3:1 and whose area covers the chip's rounded perimeter, and nothing outside it", async () => {
      const problems = []
      for (const read of await readAll(out, [1, 2])) {
        process.stdout.write(`       ${read.name}: chip ${read.chip.width.toFixed(1)} by ${read.chip.height}, ring ${read.ring?.join(',')} on ${read.fill?.join(',')} at ${read.contrast.toFixed(2)}:1, covering ${read.area.toFixed(1)} against ${read.perimeter.toFixed(1)} (rectangle ${read.rectangle.toFixed(1)}), ${read.strong} pixels at 3:1 on their own, ${read.outside} outside\n`)
        if (!read.focused || !read.visible) problems.push(`${read.name}: the Tab did not give the chip keyboard focus`)
        if (read.pressed !== String(read.which === 1)) problems.push(`${read.name}: the chip is aria-pressed ${read.pressed}`)
        if (read.host.width !== read.chip.width || read.host.height !== read.chip.height) problems.push(`${read.name}: the host is not flush with the chip`)
        if (read.contrast < 3) problems.push(`${read.name}: the ring changes the fill at ${read.contrast.toFixed(2)}:1`)
        if (read.area < read.perimeter) problems.push(`${read.name}: the ring covers ${read.area.toFixed(1)} inside, short of ${read.perimeter.toFixed(1)}`)
        if (read.outside !== 0) problems.push(`${read.name}: ${read.outside} changed outside the host`)
      }
      return problems.length ? problems.join('; ') : null
    })
  } finally {
    rmSync(out, { recursive: true, force: true })
  }

  await check('the positive control: with the outline back, the host clips it and the focus covers nothing like the perimeter inside it', async () => {
    const control = withOutline(() => build('outline'))
    try {
      const problems = []
      for (const read of await readAll(control, [1])) {
        process.stdout.write(`       ${read.name}: covering ${read.area.toFixed(1)} inside against ${read.perimeter.toFixed(1)}, ${read.outside} outside\n`)
        if (!read.focused) problems.push(`${read.name}: the chip did not take focus`)
        if (read.area >= read.perimeter) problems.push(`${read.name}: the focus covered the perimeter inside with the outline outside`)
      }
      return problems.length ? problems.join('; ') : null
    } finally {
      rmSync(control, { recursive: true, force: true })
    }
  })

  await check('DESIGN.md says the ring is inside the chip, why not the room, why three, the colours and the other blue edges', () => {
    const design = readFileSync(join(ROOT, 'DESIGN.md'), 'utf8')
    const section = (/### The Filter Chip draws its focus ring inside\n([\s\S]*?)\n### /.exec(design)?.[1] ?? '').replace(/\s+/g, ' ')
    if (!section) return 'there is no section for it'
    const missing = [
      ['the ring inside', /So the ring is drawn inside the chip\*\*, KN-294/],
      ['where', /three pixels of `border\/focus` just inside its one pixel edge, from 1 to 4/],
      ['why not the room', /taller than the file's 32/],
      ['why three', /a two pixel band covers 4W \+ 48 at best, just inside the edge, and three covers 6W \+ 62/],
      ['the colours', /4\.24 and 3\.33 on the selected one/],
      ['pressed', /changes 2\.5 wide, about 5W \+ 48/],
    ].filter(([, pattern]) => !pattern.test(section))
    const input = (/### The Input focused while invalid\n([\s\S]*?)\n### /.exec(design)?.[1] ?? '').replace(/\s+/g, ' ')
    if (!/the Filter Chip draws its ring inside itself, KN-294/.test(input)) missing.push(['the Input section pointing at it', null])
    return missing.length ? `it does not state ${missing.map(([what]) => what).join(', ')}` : null
  })

  await check("KN-274's verifier passes, the Filter Chip's ring now inside its box", () => {
    const result = spawnSync('node', [join(ROOT, 'agent', 'scripts', 'verify', 'KN-274.mjs')], { cwd: ROOT, encoding: 'utf8' })
    if (result.status !== 0) return `it fails:\n${`${result.stdout}${result.stderr}`.slice(-800)}`
    return /Filter Chip: [^\n]*inside its box/.test(result.stdout) ? null : `it passed, but not with the Filter Chip inside its box:\n${result.stdout.slice(-600)}`
  })
}

await main()
if (failures.length) {
  process.stderr.write(`\nKN-294 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-294 verify passed.\n')
