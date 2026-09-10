#!/usr/bin/env node
// Verifies KN-281: the Checkbox frame's edge is 1.5 in every state, as the five
// variants of 204:11 draw it, inside the frame and out of layout.
//
// Exit condition: the Checkbox frame's edge is 1.5 in every state as the five
// variants of 204:11 draw it, painted inside the frame and taking no layout
// space; what a 1.5 edge renders as at device pixel ratios 1 and 2 is measured
// and recorded; the stories assert the width; and the comment that says the
// file draws every border at one is corrected.
//
// The states and the rendering are read in a production Storybook served here,
// in Playwright's Chromium, the edge's thickness from the rendered pixels at
// ratios 1 and 2, and forced colours on the pixels too, since the browser
// substitutes colours at paint time.
//
// NOT read-only: it edits Checkbox.tsx for its mutation and restores it in a
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
const COMPONENT = join(WEB, 'src', 'shared', 'checkbox', 'Checkbox.tsx')
const STORIES = join(WEB, 'src', 'shared', 'checkbox', 'Checkbox.stories.tsx')
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

// A token as the browser writes a computed colour, read from the tokens file.
const TOKENS = readFileSync(join(WEB, 'src', 'theme', 'tokens.ts'), 'utf8')
const rgb = (token) => {
  const hex = new RegExp(`'${token}': '#([0-9a-fA-F]{6})'`).exec(TOKENS)?.[1]
  if (!hex) throw new Error(`no token ${token} in tokens.ts`)
  return `rgb(${[0, 2, 4].map((at) => Number.parseInt(hex.slice(at, at + 2), 16)).join(', ')})`
}
const STATES = [
  ['unchecked', 'border/default'],
  ['checked', 'bg/brand/default'],
  ['indeterminate', 'bg/brand/default'],
  ['disabled', 'bg/surface-secondary'],
  ['hover', 'border/focus'],
]

const stories = () => {
  const result = spawnSync('npx vitest run --project storybook src/shared/checkbox', { cwd: WEB, encoding: 'utf8', shell: true })
  return { code: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}

const build = () => {
  const out = mkdtempSync(join(tmpdir(), 'kn281-'))
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

// A story, loaded and finished, the frame found, and hovered when asked.
const open = async (browser, base, story, options = {}) => {
  const page = await browser.newPage({ viewport: { width: 300, height: 120 }, ...options })
  await page.goto(`${base}/iframe.html?id=shared-checkbox--${story}&viewMode=story&globals=colorScheme:light`)
  await page.waitForFunction(() => window.__STORYBOOK_PREVIEW__?.currentRender?.phase === 'finished', null, { timeout: 30000 })
  if (story === 'hover') await page.getByRole('checkbox').hover()
  return page
}

// The red channel of the rendered frame, device pixel by device pixel from its
// left edge, along the middle row, where the edge is straight.
const leftEdge = async (page, count) => {
  const box = await page.locator('.KarnamaCheckbox-frame').boundingBox()
  const png = await page.screenshot({ clip: { x: box.x, y: box.y, width: box.width, height: box.height } })
  return page.evaluate(async ({ b64, count }) => {
    const img = new Image()
    img.src = `data:image/png;base64,${b64}`
    await img.decode()
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const context = canvas.getContext('2d')
    context.drawImage(img, 0, 0)
    const y = Math.floor(img.height / 2)
    return Array.from({ length: count }, (_, x) => context.getImageData(x, y, 1, 1).data[0])
  }, { b64: png.toString('base64'), count })
}

const main = async () => {
  await check('the Checkbox stories pass, four of them asserting an inset edge of 1.5', () => {
    const source = readFileSync(STORIES, 'utf8')
    const body = (name) => new RegExp(`export const ${name}: Story = \\{\\n([\\s\\S]*?)\\n\\}\\n`).exec(source)?.[1] ?? ''
    const missing = ['Unchecked', 'Checked', 'Indeterminate', 'Disabled'].filter((name) => !body(name).includes('await edgeIsTheFiles(canvasElement)'))
    if (missing.length) return `these do not assert the edge: ${missing.join(', ')}`
    const { code, output } = stories()
    return code === 0 ? null : `they fail:\n${output.slice(-800)}`
  })

  await check('the comment no longer says the file draws every border at one, and the 1.5 is one named constant', () => {
    const source = readFileSync(COMPONENT, 'utf8')
    if (/every border at one/.test(source)) return 'the comment still says the file draws every border at one'
    return /^const EDGE = 1\.5$/m.test(source) ? null : 'there is no single EDGE constant of 1.5'
  })

  await check('THE CASE: the old one pixel border put back fails the stories on the width', () => {
    const original = readFileSync(COMPONENT, 'utf8')
    const line = /^ {8}boxShadow: `inset 0 0 0 \$\{EDGE\}px .*\n/m.exec(original)?.[0]
    if (!line) return "the frame's edge is no longer where this mutation expects it"
    try {
      writeFileSync(COMPONENT, original.replace(line, () => "        borderWidth: 1,\n        borderStyle: 'solid',\n"))
      const { code, output } = stories()
      if (code === 0) return 'the stories passed with a one pixel border, so nothing measures the width'
      return output.includes('× Unchecked ') ? null : `it failed, but not in Unchecked:\n${output.slice(-500)}`
    } finally {
      writeFileSync(COMPONENT, original)
    }
  })

  const out = build()
  const server = await serve(out)
  const base = `http://127.0.0.1:${server.address().port}`
  const browser = await chromium.launch()
  try {
    await check('every state: 20 by 20, no border, an inset edge of 1.5 in the state\'s colour', async () => {
      const problems = []
      for (const [story, token] of STATES) {
        const page = await open(browser, base, story)
        try {
          const read = await page.evaluate(() => {
            const frame = document.querySelector('.KarnamaCheckbox-frame')
            const style = getComputedStyle(frame)
            return { size: [frame.offsetWidth, frame.offsetHeight], border: Number.parseFloat(style.borderTopWidth), shadow: style.boxShadow }
          })
          const want = `${rgb(token)} 0px 0px 0px 1.5px inset`
          const wrong = []
          if (read.size.join() !== '20,20') wrong.push(`${read.size.join(' by ')}`)
          if (read.border !== 0) wrong.push(`a border of ${read.border}`)
          if (read.shadow !== want) wrong.push(`an edge of ${read.shadow} where ${want} is drawn`)
          if (wrong.length) problems.push(`${story}: ${wrong.join('; ')}`)
        } finally {
          await page.close()
        }
      }
      return problems.length ? problems.join('\n    ') : null
    })

    await check('rendered, the edge is one and a half CSS pixels: a full and a half device pixel at ratio 1, three full at 2', async () => {
      const one = await open(browser, base, 'hover', { deviceScaleFactor: 1 })
      const two = await open(browser, base, 'hover', { deviceScaleFactor: 2 })
      try {
        const [a, b] = [await leftEdge(one, 3), await leftEdge(two, 4)]
        process.stdout.write(`       Chromium ${browser.version()}: ratio 1 ${a.join(' ')}, ratio 2 ${b.join(' ')} (red channel, the edge blue over white)\n`)
        const atOne = a[0] < 100 && a[1] > 100 && a[1] < 220 && a[2] > 240
        const atTwo = b.slice(0, 3).every((value) => value < 100) && b[3] > 240
        return atOne && atTwo ? null : `the rendered edge is not one and a half pixels: ratio 1 ${a.join(' ')}, ratio 2 ${b.join(' ')}`
      } finally {
        await one.close()
        await two.close()
      }
    })

    await check('under forced colours the edge is still drawn, on the pixels, where the shadow alone would draw none', async () => {
      const drawn = async (withoutFallback) => {
        const page = await open(browser, base, 'unchecked', { forcedColors: 'active' })
        try {
          if (withoutFallback) await page.addStyleTag({ content: '.KarnamaCheckbox-frame { border-width: 0 !important; }' })
          const [edge, , , , , , , , inside] = await leftEdge(page, 9)
          return edge !== inside
        } finally {
          await page.close()
        }
      }
      if (!(await drawn(false))) return 'under forced colours the frame has no edge'
      return (await drawn(true)) ? 'with the forced-colours border taken away the edge was still drawn, so this tells nothing apart' : null
    })
  } finally {
    await browser.close()
    server.close()
    rmSync(out, { recursive: true, force: true })
  }

  await check('DESIGN.md records the 1.5 as a shadow, why, and the forced-colours border', () => {
    const design = readFileSync(join(ROOT, 'DESIGN.md'), 'utf8')
    const section = (/### A stroke is drawn inside, and takes no space\n([\s\S]*?)\n### /.exec(design)?.[1] ?? '').replace(/\s+/g, ' ')
    const missing = [
      ['the floor', /Chromium floors a border's width to whole CSS pixels/],
      ['the shadow', /inset box-shadow, which draws it/],
      ['the fallback', /one pixel `ButtonBorder` border under forced colours/],
    ].filter(([, pattern]) => !pattern.test(section))
    return missing.length ? `the section does not state ${missing.map(([what]) => what).join(', ')}` : null
  })

  for (const id of ['KN-013', 'KN-205', 'KN-207', 'KN-266']) {
    await check(`${id}'s verifier still passes`, () => {
      const result = spawnSync('node', [join(ROOT, 'agent', 'scripts', 'verify', `${id}.mjs`)], { cwd: ROOT, encoding: 'utf8' })
      return result.status === 0 ? null : `it fails:\n${`${result.stdout}${result.stderr}`.slice(-600)}`
    })
  }
}

await main()
if (failures.length) {
  process.stderr.write(`\nKN-281 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-281 verify passed.\n')
