#!/usr/bin/env node
// Verifies KN-290: under forced colours the Checkbox's tick and dash are drawn
// in system colours, ButtonText when enabled and GrayText when disabled.
//
// Exit condition: under forced colours the tick and the dash are drawn in
// system colours, ButtonText when enabled and GrayText when disabled, the
// keyword kept so a check can read it whatever the palette, and each stays
// visible against the frame; a check in a production build reads checked and
// indeterminate, enabled and disabled, under forced colours, comparing the
// rendered mark with a same-page probe of its system colour, and a mutation
// back to the author colour fails it; and DESIGN.md's stroke section says what
// the mark takes there.
//
// Read in a production Storybook served here, in Playwright's Chromium with
// forced colours emulated, at a device pixel ratio of two. A mark is matched
// by its fully covered pixels, those exactly the probe's colour, not by one
// pixel that anti-aliasing can blend; the palette is shown to give ButtonText
// and GrayText different colours, so the disabled mark tells the author white
// apart whatever white resolves to.
//
// NOT read-only: it edits Checkbox.tsx for its mutation and restores it in a
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
const COMPONENT = join(WEB, 'src', 'shared', 'checkbox', 'Checkbox.tsx')
const { chromium } = createRequire(join(WEB, 'package.json'))('playwright')

const FORCED = ', ...forcedMark(disabled) })}'
const STATES = [
  ['checked', false, 'ButtonText'],
  ['checked', true, 'GrayText'],
  ['indeterminate', false, 'ButtonText'],
  ['indeterminate', true, 'GrayText'],
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

const build = () => {
  const out = mkdtempSync(join(tmpdir(), 'kn290-'))
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

// In the page: every pixel of a screenshot, as r,g,b strings.
const pixelsOf = (page, png) =>
  page.evaluate(async (b64) => {
    const img = new Image()
    img.src = `data:image/png;base64,${b64}`
    await img.decode()
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const context = canvas.getContext('2d')
    context.drawImage(img, 0, 0)
    const data = context.getImageData(0, 0, img.width, img.height).data
    const out = []
    for (let i = 0; i < data.length; i += 4) out.push(`${data[i]},${data[i + 1]},${data[i + 2]}`)
    return { width: img.width, pixels: out }
  }, png.toString('base64'))

// A system colour as this palette renders it, from a probe painted in the page.
const probe = async (page, colour) => {
  await page.evaluate((colour) => {
    const element = document.createElement('div')
    element.id = 'kn290-probe'
    element.style.cssText = `position:fixed;left:200px;top:80px;width:20px;height:20px;background:${colour};forced-color-adjust:none`
    document.body.appendChild(element)
  }, colour)
  const { pixels } = await pixelsOf(page, await page.screenshot({ clip: { x: 205, y: 85, width: 4, height: 4 } }))
  await page.evaluate(() => document.getElementById('kn290-probe')?.remove())
  return pixels[0]
}

// Every state: the keyword the mark chose, how many of the mark's pixels are
// exactly its probe's colour, and the frame's inside beside it.
const readStates = async (dir) => {
  const server = await serve(dir)
  const browser = await chromium.launch()
  try {
    const read = []
    for (const [story, disabled, want] of STATES) {
      const page = await browser.newPage({ viewport: { width: 240, height: 120 }, deviceScaleFactor: 2, forcedColors: 'active' })
      try {
        await page.goto(`http://127.0.0.1:${server.address().port}/iframe.html?id=shared-checkbox--${story}&viewMode=story&globals=colorScheme:light${disabled ? '&args=disabled:!true' : ''}`)
        await page.waitForFunction(() => window.__STORYBOOK_PREVIEW__?.currentRender?.phase === 'finished', null, { timeout: 30000 })
        await page.mouse.move(1, 1)
        const keyword = await page.evaluate(() => {
          const mark = document.querySelector('.KarnamaCheckbox-frame svg')
          return mark ? getComputedStyle(mark).getPropertyValue('--karnama-forced-mark').trim() : null
        })
        const isDisabled = await page.evaluate(() => document.querySelector('input[type="checkbox"]')?.disabled ?? null)
        const mark = await page.locator('.KarnamaCheckbox-frame svg').boundingBox()
        const frame = await page.locator('.KarnamaCheckbox-frame').boundingBox()
        const { pixels } = await pixelsOf(page, await page.screenshot({ clip: mark }))
        const inside = (await pixelsOf(page, await page.screenshot({ clip: { x: frame.x + 3, y: frame.y + 3, width: 1, height: 1 } }))).pixels[0]
        const colour = await probe(page, want)
        read.push({ story, disabled, want, isDisabled, keyword, colour, inside, covered: pixels.filter((pixel) => pixel === colour).length })
      } finally {
        await page.close()
      }
    }
    return read
  } finally {
    await browser.close()
    server.close()
  }
}

const name = ({ story, disabled }) => `${disabled ? 'disabled ' : ''}${story}`
const problemsIn = (read) =>
  read.flatMap((state) => [
    ...(state.isDisabled === state.disabled ? [] : [`${name(state)} did not render ${state.disabled ? 'disabled' : 'enabled'}`]),
    ...(state.keyword === state.want ? [] : [`${name(state)} chose ${state.keyword || 'nothing'} where ${state.want} belongs`]),
    ...(state.covered >= 4 ? [] : [`${name(state)} has ${state.covered} pixels of ${state.want}'s ${state.colour}`]),
    ...(state.inside !== state.colour ? [] : [`${name(state)}'s mark is the frame's colour, ${state.inside}`]),
  ])

const main = async () => {
  await check('the Checkbox stories pass', () => {
    const result = spawnSync('npx vitest run --project storybook src/shared/checkbox', { cwd: WEB, encoding: 'utf8', shell: true })
    return result.status === 0 ? null : `they fail:\n${`${result.stdout}${result.stderr}`.slice(-800)}`
  })

  const out = build()
  try {
    await check('under forced colours: checked and indeterminate, enabled and disabled, draw their mark in ButtonText or GrayText, matched on the pixels, apart from the frame', async () => {
      const read = await readStates(out)
      process.stdout.write(`       ${read.map((state) => `${name(state)} ${state.keyword} ${state.covered}px of ${state.colour} on ${state.inside}`).join('; ')}\n`)
      const [text, gray] = [read.find((state) => state.want === 'ButtonText')?.colour, read.find((state) => state.want === 'GrayText')?.colour]
      if (!text || text === gray) return `the palette does not tell ButtonText from GrayText, ${text} and ${gray}, so this reads nothing`
      const problems = problemsIn(read)
      return problems.length ? problems.join('; ') : null
    })
  } finally {
    rmSync(out, { recursive: true, force: true })
  }

  await check('THE CASE: the marks back in their author colour fail it, the disabled ones first', async () => {
    const original = readFileSync(COMPONENT, 'utf8')
    if (original.split(FORCED).length !== 3) return `the forced rule is not on both marks where the mutation expects it: ${FORCED}`
    try {
      writeFileSync(COMPONENT, original.split(FORCED).join(' })}'))
      const out = build()
      try {
        const problems = problemsIn(await readStates(out))
        process.stdout.write(`       with the author colour back: ${problems.join('; ') || 'nothing failed'}\n`)
        const caught = problems.some((problem) => problem.startsWith('disabled checked')) && problems.some((problem) => problem.startsWith('disabled indeterminate'))
        return caught ? null : 'the disabled marks were not caught in their author colour'
      } finally {
        rmSync(out, { recursive: true, force: true })
      }
    } finally {
      writeFileSync(COMPONENT, original)
    }
  })

  await check("DESIGN.md's stroke section says what the mark takes under forced colours", () => {
    const design = readFileSync(join(ROOT, 'DESIGN.md'), 'utf8')
    const section = (/### A stroke is drawn inside, and takes no space\n([\s\S]*?)\n### /.exec(design)?.[1] ?? '').replace(/\s+/g, ' ')
    return /tick and the dash take `ButtonText`, or `GrayText` when disabled, on a `ButtonFace` frame, KN-290/.test(section) ? null : 'the section does not say what the mark takes'
  })
}

await main()
if (failures.length) {
  process.stderr.write(`\nKN-290 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-290 verify passed.\n')
