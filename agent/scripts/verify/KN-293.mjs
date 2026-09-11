#!/usr/bin/env node
// Verifies KN-293: the Checkbox keeps the room for its focus ring, so a host
// that clips flush at the Checkbox's own box keeps the ring.
//
// Exit condition: a focused Checkbox inside a host that clips its overflow
// flush at the Checkbox's own box still changes at least a two-pixel perimeter
// at 3:1, drawn inside that box or with the room kept by the Checkbox itself;
// a story renders it in an overflow hidden host with no padding and asserts
// from the rendered geometry that every pixel of the focus change lies inside
// the host, a mutation back to the outline outside fails it by name, and
// DESIGN.md says which.
//
// The rendered proof is in pixels: a production Storybook served here, read in
// Playwright's Chromium at device pixel ratios of one and two, the story's
// clipping host shot before and after a real Tab, since Storybook's own
// userEvent.tab() is untrusted and the story adds the focus-visible class
// itself. Inside the host the ring's own colour must change its pixels at 3:1
// or more, and its area, each changed pixel counted by how much of the ring's
// colour it took, must cover the frame's two-pixel perimeter, 4W + 4H, in CSS
// pixels. That is WCAG 2.4.13's measure: its note on the change of contrast
// lets the pixels anti-aliasing modifies be ignored, and in the derived dark
// palette, where the ring clears 3:1 by 0.04, the blended corners would
// otherwise count for nothing, which a first version of this check did. The
// perimeter is the frame's, the component's visual presentation, since the
// room round it draws nothing. Outside the host nothing may change. A second
// build with the root's padding back to 0 is the positive control: the host
// is then the frame's 20 by 20, clips the ring, and the ring covers nothing
// inside it in every reading.
//
// NOT read-only: it edits Checkbox.tsx for its mutations and restores it in a
// finally, and runs KN-274's verifier, which edits Input.tsx the same way. The
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
const COMPONENT = join(WEB, 'src', 'shared', 'checkbox', 'Checkbox.tsx')
const STORIES = join(WEB, 'src', 'shared', 'checkbox', 'Checkbox.stories.tsx')
const { chromium } = createRequire(join(WEB, 'package.json'))('playwright')

// The root's room as KN-293 gives it, and the padding it replaced.
const ROOM = "      padding: `${spacing['2xs']}px`,\n"
const NO_ROOM = '      padding: 0,\n'
const STORY = 'Focused In A Clipping Host'
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
  const result = spawnSync('npx vitest run --project storybook src/shared/checkbox --reporter=verbose', { cwd: WEB, encoding: 'utf8', shell: true })
  return { code: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}

const ran = (output, mark, story) => output.split('\n').some((line) => mark.test(line) && line.includes(`> ${story}`))

// Checkbox.tsx with the root's padding back to 0, for as long as run takes.
const withoutRoom = (run) => {
  const original = readFileSync(COMPONENT, 'utf8')
  if (original.split(ROOM).length !== 2) throw new Error(`the room is not where the mutation expects it, once:\n${ROOM}`)
  try {
    writeFileSync(COMPONENT, original.replace(ROOM, () => NO_ROOM))
    return run()
  } finally {
    writeFileSync(COMPONENT, original)
  }
}

const build = (name) => {
  const out = mkdtempSync(join(tmpdir(), `kn293-${name}-`))
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

// In the page: two screenshots of one region compared pixel by pixel. Outside
// the box, the device pixels that changed at all. Inside it, the ring as WCAG
// 2.4.13 measures it, whose note on the change of contrast lets the pixels
// anti-aliasing modifies be ignored: the ring's own colour, the one the most
// changed pixels took, against the surface the most of them had, which must
// change at 3:1 or more; and its area, each changed pixel counted by how much
// of the ring's colour it took, so a blended pixel counts for what it covers
// and not for a contrast it was never drawn to have. The pixels that changed
// at 3:1 or more on their own are counted too, for the record: in the derived
// dark palette the ring clears 3:1 by 0.04, so its blended corners do not.
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
    const [ring, surface] = [mode(after.data), mode(before.data)]
    let area = 0
    let strong = 0
    for (const i of changed) {
      const was = at(before.data, i)
      const now = at(after.data, i)
      // The coverage, read on the channel where the ring differs most from
      // what this pixel showed before.
      const swing = [0, 1, 2].reduce((best, c) => (Math.abs(ring[c] - was[c]) > Math.abs(ring[best] - was[best]) ? c : best), 0)
      const full = ring[swing] - was[swing]
      area += full === 0 ? 0 : Math.min(1, Math.max(0, (now[swing] - was[swing]) / full))
      if (ratio(was, now) >= 3) strong += 1
    }
    return { ring, surface, contrast: ring && surface ? ratio(ring, surface) : 0, area: area / (scale * scale), strong: strong / (scale * scale), outside }
  })()

// The story's host on one page: its box, the frame's, and what a real Tab
// changed inside the host and round it.
const focusChange = async (browser, port, { args, globals, ratio }) => {
  const page = await browser.newPage({ viewport: { width: 400, height: 200 }, deviceScaleFactor: ratio })
  try {
    await page.goto(`http://127.0.0.1:${port}/iframe.html?id=shared-checkbox--focused-in-a-clipping-host&viewMode=story&globals=${globals}${args ? `&args=${args}` : ''}`)
    await page.waitForFunction(() => window.__STORYBOOK_PREVIEW__?.currentRender?.phase === 'finished', null, { timeout: 30000 })
    // The story's play focused the checkbox and put the focus-visible class on
    // itself: both undone, so the first shot is the unfocused state, and a
    // click on the empty corner moves where Tab starts from back to the top.
    await page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
      document.querySelector('.MuiCheckbox-root')?.classList.remove('Mui-focusVisible')
    })
    await page.mouse.click(1, 1)
    const host = await page.getByTestId('clipping-host').boundingBox()
    const frame = await page.locator('.KarnamaCheckbox-frame').boundingBox()
    const radius = await page.evaluate(() => Number.parseFloat(getComputedStyle(document.querySelector('.KarnamaCheckbox-frame')).borderTopLeftRadius))
    const viewport = page.viewportSize()
    const x = Math.max(0, Math.floor(host.x - MARGIN))
    const y = Math.max(0, Math.floor(host.y - MARGIN))
    const clip = { x, y, width: Math.min(viewport.width, Math.ceil(host.x + host.width + MARGIN)) - x, height: Math.min(viewport.height, Math.ceil(host.y + host.height + MARGIN)) - y }
    const ringBefore = await page.evaluate(() => getComputedStyle(document.querySelector('.KarnamaCheckbox-frame')).outlineStyle)
    const before = await page.screenshot({ clip })
    await page.keyboard.press('Tab')
    const state = await page.evaluate(() => ({
      focused: document.activeElement instanceof HTMLInputElement && document.activeElement.type === 'checkbox',
      visible: document.querySelector('.MuiCheckbox-root')?.classList.contains('Mui-focusVisible') ?? false,
    }))
    await page.waitForTimeout(150)
    const after = await page.screenshot({ clip })
    const measured = await page.evaluate(compare, { a: before.toString('base64'), b: after.toString('base64'), clip, box: host })
    // The frame's two-pixel perimeter: the rectangle's 4W + 4H, the bar held
    // here, and WCAG's own figure for a rounded one, 4W + 4H - (16 - 4pi)r,
    // which is smaller.
    const perimeter = 4 * frame.width + 4 * frame.height
    return { ...state, ringBefore, host, frame, ...measured, perimeter, rounded: perimeter - (16 - 4 * Math.PI) * radius }
  } finally {
    await page.close()
  }
}

// Every mark, in both languages, light and dark, at the ratios asked for.
const READINGS = (ratios) =>
  ratios.flatMap((ratio) =>
    [
      ['unchecked', ''],
      ['checked', 'checked:!true'],
      ['indeterminate', 'indeterminate:!true'],
    ].flatMap(([mark, args]) =>
      ['fa-IR', 'en-US'].flatMap((locale) =>
        ['light', 'dark'].map((scheme) => ({ name: `${mark} ${locale} ${scheme} @${ratio}x`, args, ratio, globals: `locale:${locale};colorScheme:${scheme}` })),
      ),
    ),
  )

const readAll = async (dir, ratios) => {
  const server = await serve(dir)
  const browser = await chromium.launch()
  try {
    const read = []
    for (const reading of READINGS(ratios)) read.push({ name: reading.name, ...(await focusChange(browser, server.address().port, reading)) })
    return read
  } finally {
    await browser.close()
    server.close()
  }
}

const main = async () => {
  await check(`the Checkbox stories pass, ${STORY} by name`, () => {
    const { code, output } = stories()
    if (code !== 0) return `they fail:\n${output.slice(-800)}`
    return ran(output, /✓/, STORY) ? null : `${STORY} did not run and pass`
  })

  await check('the story renders the Checkbox in a host that clips, and measures the ring against every clipping ancestor, the host among them', () => {
    const source = readFileSync(STORIES, 'utf8')
    const story = /export const FocusedInAClippingHost: Story = \{\n([\s\S]*?)\n\}\n/.exec(source)?.[1] ?? ''
    const missing = [
      ['the clipping host', '<Box data-testid="clipping-host"'],
      ['overflow hidden on it', "overflow: 'hidden'"],
      ['the host among the clipping ancestors', 'await expect(clips).toContain(host)'],
      ['the ring inside every clipping ancestor', 'for (const clip of clips) await expect(overshoot(extent, clipEdge(clip))).toEqual([])'],
    ].filter(([, text]) => !story.includes(text))
    return missing.length ? `the story does not have ${missing.map(([what]) => what).join(', ')}` : null
  })

  await check(`THE CASE: the root's padding back to 0 fails ${STORY} by name, on the overshoot`, () =>
    withoutRoom(() => {
      const { code, output } = stories()
      if (code === 0) return 'the stories passed with no room, so nothing measures the clipping'
      if (!ran(output, /[×✗]/, STORY)) return `it failed, but not in ${STORY}:\n${output.slice(-500)}`
      return output.includes("[ [ 'left', 4 ]") ? null : `${STORY} failed, but not on the overshoot:\n${output.slice(-700)}`
    }),
  )

  const out = build('room')
  try {
    await check("in pixels, every mark, both languages, light and dark, ratios one and two: a real Tab draws a ring inside the host whose colour changes at 3:1 and whose area covers the frame's 4W + 4H, and nothing outside it", async () => {
      const problems = []
      for (const read of await readAll(out, [1, 2])) {
        process.stdout.write(`       ${read.name}: host ${read.host.width} by ${read.host.height}, ring ${read.ring?.join(',')} on ${read.surface?.join(',')} at ${read.contrast.toFixed(2)}:1, covering ${read.area.toFixed(1)} against ${read.perimeter} (rounded ${read.rounded.toFixed(1)}), ${read.strong} pixels at 3:1 on their own, ${read.outside} outside\n`)
        if (read.ringBefore !== 'none') problems.push(`${read.name}: the ring was drawn before the Tab`)
        if (!read.focused || !read.visible) problems.push(`${read.name}: the Tab did not give the checkbox keyboard focus`)
        if (read.host.width !== 28 || read.host.height !== 28) problems.push(`${read.name}: the host is ${read.host.width} by ${read.host.height}, not the Checkbox's 28`)
        if (read.contrast < 3) problems.push(`${read.name}: the ring changes its pixels at ${read.contrast.toFixed(2)}:1`)
        if (read.area < read.perimeter) problems.push(`${read.name}: the ring covers ${read.area.toFixed(1)} inside, short of ${read.perimeter}`)
        if (read.outside !== 0) problems.push(`${read.name}: ${read.outside} changed outside the host`)
      }
      return problems.length ? problems.join('; ') : null
    })
  } finally {
    rmSync(out, { recursive: true, force: true })
  }

  await check('the positive control: with no room, the host is the frame\'s 20 by 20 and the change inside it falls short in every reading', async () => {
    const control = withoutRoom(() => build('no-room'))
    try {
      const problems = []
      for (const read of await readAll(control, [1])) {
        process.stdout.write(`       ${read.name}: host ${read.host.width} by ${read.host.height}, covering ${read.area.toFixed(1)} inside against ${read.perimeter}\n`)
        if (read.host.width !== 20 || read.host.height !== 20) problems.push(`${read.name}: the host is ${read.host.width} by ${read.host.height}, so the mutation did not take the room away`)
        if (read.area >= read.perimeter) problems.push(`${read.name}: the ring covered the perimeter inside with no room`)
      }
      return problems.length ? problems.join('; ') : null
    } finally {
      rmSync(control, { recursive: true, force: true })
    }
  })

  await check('DESIGN.md says the Checkbox keeps the room, why not inside, the area on the frame, the target and the screens\' margin', () => {
    const design = readFileSync(join(ROOT, 'DESIGN.md'), 'utf8')
    const section = (/### The Checkbox keeps the room for its focus ring\n([\s\S]*?)\n### /.exec(design)?.[1] ?? '').replace(/\s+/g, ' ')
    if (!section) return 'there is no section for it'
    const missing = [
      ['the room', /root carries `spacing\/2xs` on every side, 28 by 28/],
      ['why not inside', /a checked frame is the ring's own blue/],
      ['the area on the frame', /square pixels, clearing the rectangle's 4W \+ 4H, 160, and the rounded frame's own two pixel perimeter, 4W \+ 4H - \(16 - 4π\)r, about 146/],
      ['the dark palette\'s anti-aliasing', /anti-aliasing/],
      ['the target', /KN-206/],
      ['the screens\' margin', /negative margin/],
    ].filter(([, pattern]) => !pattern.test(section))
    const input = (/### The Input focused while invalid\n([\s\S]*?)\n### /.exec(design)?.[1] ?? '').replace(/\s+/g, ' ')
    if (!/keeps the room for its ring[^.]*KN-293/.test(input)) missing.push(['the Input section pointing at it', null])
    return missing.length ? `it does not state ${missing.map(([what]) => what).join(', ')}` : null
  })

  await check("KN-274's verifier, its Checkbox row measuring the frame, passes", () => {
    if (!/visible: '#storybook-root \.KarnamaCheckbox-frame'/.test(readFileSync(join(ROOT, 'agent', 'scripts', 'verify', 'KN-274.mjs'), 'utf8'))) return "KN-274's Checkbox row does not measure the frame"
    const result = spawnSync('node', [join(ROOT, 'agent', 'scripts', 'verify', 'KN-274.mjs')], { cwd: ROOT, encoding: 'utf8' })
    return result.status === 0 ? null : `it fails:\n${`${result.stdout}${result.stderr}`.slice(-800)}`
  })
}

await main()
if (failures.length) {
  process.stderr.write(`\nKN-293 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-293 verify passed.\n')
