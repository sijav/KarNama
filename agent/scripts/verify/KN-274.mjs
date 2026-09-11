#!/usr/bin/env node
// Verifies KN-274: an invalid Input's focus ring is drawn inside the field, so
// a host that clips its overflow at the field's edge cannot take it.
//
// Exit condition: an invalid Input focused inside a host that clips its
// overflow flush at the field's edges still changes at least a two-pixel
// perimeter at 3:1, KN-244's measure, either because the change is drawn
// inside the field's own box or because the Input keeps the room itself; a
// story renders the field in an overflow hidden host with no padding and
// asserts, from the rendered geometry, that every pixel of the focus change
// lies inside every clipping ancestor, and a mutation back to a ring the host
// clips fails it by name; DESIGN.md's section says which; and the Checkbox's
// and the Filter Chip's rings are checked for the same, each matching or
// carrying a card.
//
// The rendered proof is in pixels: a production Storybook served here, read in
// Playwright's Chromium at a device pixel ratio of one, each control
// screenshotted before and after keyboard focus, with the caret hidden and
// the selection Tab makes collapsed, since neither is the indicator. Inside
// the field's box the pixels that changed at 3:1 or more must cover WCAG's
// two-pixel perimeter, 4W + 4H; outside it nothing may change, since whatever
// changes there is what a flush host clips. A second build with the outline
// back is the positive control, and must fail both.
//
// NOT read-only: it edits Input.tsx for its mutations and restores it in a
// finally. The builds go to the system temp directory and are removed.

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

// The ring as KN-274 draws it, and the outline KN-244 drew in its place, the
// ring a flush host clips. An unknown pseudo-element drops the inside ring.
const RING = "                    '&::after': {\n"
const OUTLINE = "                    outlineWidth: 2, outlineStyle: 'solid', outlineColor: colour['border/focus'], outlineOffset: 2,\n                    '&::kn274-removed': {\n"
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
  const result = spawnSync('npx vitest run --project storybook src/shared/input --reporter=verbose', { cwd: WEB, encoding: 'utf8', shell: true })
  return { code: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}

const ran = (output, mark, story) => output.split('\n').some((line) => mark.test(line) && line.includes(`> ${story}`))

// Input.tsx with the outline back, for as long as run takes.
const withOutline = (run) => {
  const original = readFileSync(COMPONENT, 'utf8')
  if (!original.includes(RING)) throw new Error(`the ring is not where the mutation expects it:\n${RING}`)
  try {
    writeFileSync(COMPONENT, original.replace(RING, () => OUTLINE))
    return run()
  } finally {
    writeFileSync(COMPONENT, original)
  }
}

const build = (name) => {
  const out = mkdtempSync(join(tmpdir(), `kn274-${name}-`))
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

// In the page: two screenshots of one region compared pixel by pixel. Inside
// the box, the pixels whose colours before and after are 3:1 or more apart;
// outside it, the pixels that changed at all.
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
    const luminance = (data, i) => 0.2126 * channel(data[i]) + 0.7152 * channel(data[i + 1]) + 0.0722 * channel(data[i + 2])
    const scale = before.width / clip.width
    let inside = 0
    let outside = 0
    for (let y = 0; y < before.height; y += 1) {
      for (let x = 0; x < before.width; x += 1) {
        const i = (y * before.width + x) * 4
        const moved = Math.abs(before.data[i] - after.data[i]) + Math.abs(before.data[i + 1] - after.data[i + 1]) + Math.abs(before.data[i + 2] - after.data[i + 2])
        if (moved === 0) continue
        const cx = clip.x + (x + 0.5) / scale
        const cy = clip.y + (y + 0.5) / scale
        if (cx < box.x || cx > box.x + box.width || cy < box.y || cy > box.y + box.height) {
          outside += 1
          continue
        }
        const [l1, l2] = [luminance(before.data, i), luminance(after.data, i)]
        if ((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05) >= 3) inside += 1
      }
    }
    return { inside, outside }
  })()

// One control on one page: its box, and what keyboard focus changed inside it
// and around it, the caret hidden since it blinks inside a focused field. The
// perimeter is taken on what is seen, `visible` where the control's box holds
// more than it draws: the Checkbox's root is 28 by 28 of room round its 20 by
// 20 frame, KN-293.
const focusChange = async (browser, port, { story, globals, args, control, visible }) => {
  const page = await browser.newPage({ viewport: { width: 600, height: 300 }, deviceScaleFactor: 1 })
  try {
    await page.goto(`http://127.0.0.1:${port}/iframe.html?id=${story}&viewMode=story&globals=${globals}${args ? `&args=${args}` : ''}`)
    await page.waitForFunction(() => window.__STORYBOOK_PREVIEW__?.currentRender?.phase === 'finished', null, { timeout: 30000 })
    await page.addStyleTag({ content: '* { caret-color: transparent !important; }' })
    // A story's play may have focused the control already, FocusedWhileInvalid's
    // does: blurred first, so the first shot is the unfocused state, and a click
    // on the empty corner moves where Tab starts from back to the top, since
    // after a blur Chromium's Tab would start past the control.
    await page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
    })
    await page.mouse.click(1, 1)
    const box = await page.locator(control).first().boundingBox()
    const seen = visible ? await page.locator(visible).first().boundingBox() : box
    const viewport = page.viewportSize()
    const x = Math.max(0, Math.floor(box.x - MARGIN))
    const y = Math.max(0, Math.floor(box.y - MARGIN))
    const clip = { x, y, width: Math.min(viewport.width, Math.ceil(box.x + box.width + MARGIN)) - x, height: Math.min(viewport.height, Math.ceil(box.y + box.height + MARGIN)) - y }
    const before = await page.screenshot({ clip })
    await page.keyboard.press('Tab')
    // Tabbing into a text field selects its text, and the highlight is not the
    // focus indicator: the selection collapses to its end, the caret hidden.
    const focused = await page.evaluate((selector) => {
      const active = document.activeElement
      if (active instanceof HTMLInputElement && active.type === 'text') active.setSelectionRange(active.value.length, active.value.length)
      return document.querySelector(selector)?.contains(active) ?? false
    }, control)
    await page.waitForTimeout(150)
    const after = await page.screenshot({ clip })
    const { inside, outside } = await page.evaluate(compare, { a: before.toString('base64'), b: after.toString('base64'), clip, box })
    return { focused, box, inside, outside, perimeter: 4 * seen.width + 4 * seen.height }
  } finally {
    await page.close()
  }
}

// The invalid Input, in every place it is read: the story's own clipping host
// in light, which the story pins, and the Filled story given an error, which
// is not pinned, in dark.
const INPUTS = [
  ['fa-IR', 'light', { story: 'shared-input--focused-while-invalid', globals: 'locale:fa-IR' }],
  ['en-US', 'light', { story: 'shared-input--focused-while-invalid', globals: 'locale:en-US' }],
  ['fa-IR', 'dark', { story: 'shared-input--filled', globals: 'locale:fa-IR;colorScheme:dark', args: 'error:Required' }],
  ['en-US', 'dark', { story: 'shared-input--filled', globals: 'locale:en-US;colorScheme:dark', args: 'error:Required' }],
].map(([locale, scheme, where]) => ({ name: `${locale} ${scheme}`, ...where, control: '#storybook-root .MuiInputBase-root' }))

const readInputs = async (dir) => {
  const server = await serve(dir)
  const browser = await chromium.launch()
  try {
    const read = []
    for (const input of INPUTS) read.push({ name: input.name, ...(await focusChange(browser, server.address().port, input)) })
    return read
  } finally {
    await browser.close()
    server.close()
  }
}

const main = async () => {
  await check('the Input stories pass, FocusedWhileInvalid by name', () => {
    const { code, output } = stories()
    if (code !== 0) return `they fail:\n${output.slice(-800)}`
    return ran(output, /✓/, 'Focused While Invalid') ? null : 'FocusedWhileInvalid did not run and pass'
  })

  await check('the story renders the field in a host that clips, with no padding, and measures the extent against every clipping ancestor', () => {
    const source = readFileSync(STORIES, 'utf8')
    const story = /export const FocusedWhileInvalid: Story = \{\n([\s\S]*?)\n\}\n/.exec(source)?.[1] ?? ''
    const missing = [
      ['the clipping host', "<Box data-testid=\"clipping-host\" sx={{ overflow: 'hidden' }}>"],
      ['the extent inside the field', 'await expect(overshoot(extent, field.getBoundingClientRect())).toEqual([])'],
      ['the host among the clipping ancestors', 'await expect(clips).toContain(host)'],
      ['the extent inside every clipping ancestor', 'for (const clip of clips) await expect(overshoot(extent, clipEdge(clip))).toEqual([])'],
    ].filter(([, text]) => !story.includes(text))
    return missing.length ? `the story does not have ${missing.map(([what]) => what).join(', ')}` : null
  })

  await check('THE CASE: the outline back in place of the inside ring fails FocusedWhileInvalid by name, on the extent', () =>
    withOutline(() => {
      const { code, output } = stories()
      if (code === 0) return 'the stories passed with the outline back, so nothing measures the clipping'
      if (!ran(output, /[×✗]/, 'Focused While Invalid')) return `it failed, but not in FocusedWhileInvalid:\n${output.slice(-500)}`
      return output.includes("[ [ 'left', 4 ]") ? null : `FocusedWhileInvalid failed, but not on the extent:\n${output.slice(-700)}`
    }),
  )

  const out = build('ring')
  try {
    await check('in pixels, in both languages, light and dark: focus changes at least 4W + 4H at 3:1 inside the field, and nothing outside it', async () => {
      const problems = []
      for (const read of await readInputs(out)) {
        process.stdout.write(`       ${read.name}: ${read.box.width} by ${read.box.height}, ${read.inside} changed at 3:1 inside against ${read.perimeter}, ${read.outside} changed outside\n`)
        if (!read.focused) problems.push(`${read.name}: the field did not take focus`)
        if (read.inside < read.perimeter) problems.push(`${read.name}: ${read.inside} inside, short of ${read.perimeter}`)
        if (read.outside !== 0) problems.push(`${read.name}: ${read.outside} changed outside the field`)
      }
      return problems.length ? problems.join('; ') : null
    })

    await check("the Checkbox's and the Filter Chip's rings: each inside its own box, or carrying its card", async () => {
      const board = JSON.parse(readFileSync(join(ROOT, 'agent', 'board.json'), 'utf8'))
      const server = await serve(out)
      const browser = await chromium.launch()
      try {
        const problems = []
        for (const [name, where, card, named] of [
          ['Checkbox', { story: 'shared-checkbox--unchecked', globals: 'locale:fa-IR', control: '#storybook-root .MuiCheckbox-root', visible: '#storybook-root .KarnamaCheckbox-frame' }, 'KN-293', /Checkbox/],
          ['Filter Chip', { story: 'shared-filterchip--default', globals: 'locale:fa-IR', control: '#storybook-root button' }, 'KN-294', /Filter Chip/],
        ]) {
          const read = await focusChange(browser, server.address().port, where)
          const task = board.tasks.find((entry) => entry.id === card)
          const inside = read.outside === 0 && read.inside >= read.perimeter
          process.stdout.write(`       ${name}: ${read.box.width} by ${read.box.height}, ${read.inside} changed at 3:1 inside against ${read.perimeter}, ${read.outside} changed outside; ${inside ? 'inside its box' : `a flush host clips it, ${card} ${task?.status ?? 'missing'}`}\n`)
          if (!read.focused) problems.push(`${name} did not take focus`)
          else if (!inside && (!task || task.status === 'dropped' || !named.test(task.title))) problems.push(`${name}'s ring lies outside its box and ${card} is not its card on the board`)
        }
        return problems.length ? problems.join('; ') : null
      } finally {
        await browser.close()
        server.close()
      }
    })
  } finally {
    rmSync(out, { recursive: true, force: true })
  }

  await check('the positive control: with the outline back, the change inside the field falls short and pixels outside it change', async () => {
    const control = withOutline(() => build('outline'))
    try {
      const problems = []
      for (const read of await readInputs(control)) {
        process.stdout.write(`       ${read.name}: ${read.inside} changed at 3:1 inside against ${read.perimeter}, ${read.outside} changed outside\n`)
        if (read.inside >= read.perimeter) problems.push(`${read.name}: the count inside met the perimeter with the ring outside`)
        if (read.outside === 0) problems.push(`${read.name}: nothing changed outside with the ring outside`)
      }
      return problems.length ? problems.join('; ') : null
    } finally {
      rmSync(control, { recursive: true, force: true })
    }
  })

  await check('DESIGN.md says the ring is drawn inside, why not the room, the area, and the two cards', () => {
    const design = readFileSync(join(ROOT, 'DESIGN.md'), 'utf8')
    const section = (/### The Input focused while invalid\n([\s\S]*?)\n### /.exec(design)?.[1] ?? '').replace(/\s+/g, ' ')
    if (!section) return 'there is no section for the state'
    const missing = [
      ['the ring inside the field', /inside the field's own box, KN-274/],
      ['why not the room', /Keeping four pixels of room instead would inset the field from its own label/],
      ['the area', /6W \+ 172 square pixels .* 4W \+ 4H, which is 4W \+ 176/],
      ['the Checkbox and the Filter Chip', /keeps the room for its ring instead, KN-293, below; the Filter Chip's ring is still an outline round it, which a flush host clips too: KN-294/],
    ].filter(([, pattern]) => !pattern.test(section))
    return missing.length ? `the section does not state ${missing.map(([what]) => what).join(', ')}` : null
  })

  await check("KN-244's verifier, retargeted at the inside ring, passes, and runs KN-241's", () => {
    const result = spawnSync('node', [join(ROOT, 'agent', 'scripts', 'verify', 'KN-244.mjs')], { cwd: ROOT, encoding: 'utf8' })
    return result.status === 0 ? null : `it fails:\n${`${result.stdout}${result.stderr}`.slice(-800)}`
  })
}

await main()
if (failures.length) {
  process.stderr.write(`\nKN-274 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-274 verify passed.\n')
