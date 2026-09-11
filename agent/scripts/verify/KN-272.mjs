#!/usr/bin/env node
// Verifies KN-272: in the derived dark palette the brand container is a dark
// fill, and a selected Filter Chip's text and pressed edge read on it.
//
// Exit condition: in the derived dark palette bg/brand/container is a dark
// tint of its own hue, derived as a fill the way the status containers are,
// text/brand clears 4.5:1 on it and border/focus clears 3:1 on it, and every
// pair the tests already hold still holds; darkMode.test.ts asserts both pairs
// as the Filter Chip draws them, and a mutation back to the surface derivation
// fails them; and the selected Filter Chip, resting and pressed, is seen in
// dark in both languages.
//
// The chip is read in a production Storybook served here, in Playwright's
// Chromium, in dark, with a real pointer held down for the pressed state.
//
// NOT read-only: it edits darkMode.ts for its mutation and restores it in a
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
const DERIVATION = join(WEB, 'src', 'theme', 'darkMode.ts')
const { chromium } = createRequire(join(WEB, 'package.json'))('playwright')
const ROW = "  'bg/brand/container': deriveDarkFill(semantic['bg/brand/container']),\n"
const CASES = [
  'bg/brand/container is derived as a fill, a dark tint of its own hue',
  'text/brand clears 4.5:1 on the dark brand container, as a selected Filter Chip draws it',
  'border/focus clears 3:1 on the dark brand container, as a pressed selected Filter Chip draws it',
  'and the light design holds both pairs too',
]

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

const tests = () => {
  const result = spawnSync('npx vitest run --project unit src/theme --reporter=verbose', { cwd: WEB, encoding: 'utf8', shell: true })
  return { code: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}

// The WCAG ratio of two computed rgb() colours.
const ratio = (a, b) => {
  const luminance = (rgb) => {
    const [r, g, bl] = (rgb.match(/\d+/g) ?? []).slice(0, 3).map((value) => {
      const channel = Number(value) / 255
      return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl
  }
  const [x, y] = [luminance(a), luminance(b)]
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

const build = () => {
  const out = mkdtempSync(join(tmpdir(), 'kn272-'))
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

const main = async () => {
  await check('the theme tests pass, with the fill and both of the chip\'s pairs by name', () => {
    const { code, output } = tests()
    if (code !== 0) return `they fail:\n${output.slice(-800)}`
    const missing = CASES.filter((name) => !output.split('\n').some((line) => line.includes('✓') && line.includes(name)))
    return missing.length ? `these did not run and pass: ${missing.join('; ')}` : null
  })

  await check('the fills are one list the palette and the floor test both read', () => {
    const source = readFileSync(DERIVATION, 'utf8')
    if (!/export const DARK_FILLS = \['bg\/brand\/container'\]/.test(source)) return 'there is no DARK_FILLS naming the brand container'
    const test = readFileSync(join(WEB, 'src', 'theme', 'darkMode.test.ts'), 'utf8')
    return test.includes('const fills = new Set<string>(DARK_FILLS)') ? null : 'the floor test does not read DARK_FILLS'
  })

  await check('THE CASE: the brand container back to the surface derivation fails the chip\'s pairs', () => {
    const original = readFileSync(DERIVATION, 'utf8')
    if (!original.includes(ROW)) return 'the brand container row is not where this mutation expects it'
    try {
      writeFileSync(DERIVATION, original.replace(ROW, () => "  'bg/brand/container': deriveDarkSurface(semantic['bg/brand/container']),\n"))
      const { code, output } = tests()
      if (code === 0) return 'the tests passed with the bright container back'
      const failed = (name) => output.split('\n').some((line) => /[×✗]/.test(line) && line.includes(name))
      const missed = [CASES[1], CASES[2]].filter((name) => !failed(name))
      return missed.length ? `these did not fail: ${missed.join('; ')}` : null
    } finally {
      writeFileSync(DERIVATION, original)
    }
  })

  const out = build()
  const server = await serve(out)
  const browser = await chromium.launch()
  try {
    await check('in dark, in both languages, the selected chip reads 4.5:1 or more and its pressed edge 3:1 or more', async () => {
      const problems = []
      for (const [story, locale] of [['selected', 'fa-IR'], ['in-english', 'en-US']]) {
        const page = await browser.newPage({ viewport: { width: 400, height: 120 } })
        try {
          await page.goto(`http://127.0.0.1:${server.address().port}/iframe.html?id=shared-filterchip--${story}&viewMode=story&globals=locale:${locale};colorScheme:dark&args=selected:!true`)
          await page.waitForFunction(() => window.__STORYBOOK_PREVIEW__?.currentRender?.phase === 'finished', null, { timeout: 30000 })
          const chip = page.locator('#storybook-root button').first()
          // The edge is on the chip's ::before since KN-282, under the pressed
          // shadow in the same colour; the chip itself has no border.
          const read = () => chip.evaluate((element) => { const style = getComputedStyle(element); return { pressed: element.getAttribute('aria-pressed'), fill: style.backgroundColor, text: style.color, edge: getComputedStyle(element, '::before').borderTopColor } })
          const resting = await read()
          const box = await chip.boundingBox()
          await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
          await page.mouse.down()
          const pressed = await read()
          await page.mouse.up()
          process.stdout.write(`       ${locale}: fill ${resting.fill}, text ${resting.text} at ${ratio(resting.text, resting.fill).toFixed(2)}, pressed edge ${pressed.edge} at ${ratio(pressed.edge, pressed.fill).toFixed(2)}\n`)
          if (resting.pressed !== 'true') problems.push(`${locale}: the chip is not selected`)
          if (ratio(resting.text, resting.fill) < 4.5) problems.push(`${locale}: text at ${ratio(resting.text, resting.fill).toFixed(2)}`)
          if (ratio(pressed.edge, pressed.fill) < 3) problems.push(`${locale}: pressed edge at ${ratio(pressed.edge, pressed.fill).toFixed(2)}`)
        } finally {
          await page.close()
        }
      }
      return problems.length ? problems.join('; ') : null
    })
  } finally {
    await browser.close()
    server.close()
    rmSync(out, { recursive: true, force: true })
  }
}

await main()
if (failures.length) {
  process.stderr.write(`\nKN-272 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-272 verify passed.\n')
