#!/usr/bin/env node
// Verifies KN-284: under forced colours the Checkbox frame's edge takes none of
// its space, so the content box stays 20 by 20 in that mode too.
//
// Exit condition: under forced colours the Checkbox frame's edge is drawn over
// the frame without taking layout, a border on a pseudo-element for instance,
// so its content box stays 20 by 20 in that mode as in every other; KN-281's
// forced-colours check measures the content box and the glyph's position as
// well as the pixels, and a mutation back to a laid-out border fails it.
//
// Read in a production Storybook served here, in Playwright's Chromium with
// forced colours emulated. The glyph's position is recorded but cannot tell a
// symmetric border apart, since flex centring keeps the glyph where it was; the
// content box is what does.
//
// NOT read-only: it edits Checkbox.tsx for its mutation and restores it in a
// finally, and it runs KN-281's verifier, which does the same. The builds go to
// the system temp directory and are removed.

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
  const out = mkdtempSync(join(tmpdir(), 'kn284-'))
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

// Under forced colours, and without, for the unchecked and the checked frame:
// the content box, the glyph's offset from the frame, and whether an edge is
// drawn on the pixels.
const geometry = async (dir) => {
  const server = await serve(dir)
  const browser = await chromium.launch()
  try {
    const read = []
    for (const story of ['unchecked', 'checked']) {
      for (const forced of ['none', 'active']) {
        const page = await browser.newPage({ viewport: { width: 200, height: 100 }, forcedColors: forced })
        await page.goto(`http://127.0.0.1:${server.address().port}/iframe.html?id=shared-checkbox--${story}&viewMode=story&globals=colorScheme:light`)
        await page.waitForFunction(() => window.__STORYBOOK_PREVIEW__?.currentRender?.phase === 'finished', null, { timeout: 30000 })
        const shape = await page.evaluate(() => {
          const frame = document.querySelector('.KarnamaCheckbox-frame')
          const glyph = frame.querySelector('svg')
          const outer = frame.getBoundingClientRect()
          const inner = glyph?.getBoundingClientRect()
          return { content: [frame.clientWidth, frame.clientHeight], glyph: inner ? [inner.left - outer.left, inner.top - outer.top] : null }
        })
        const box = await page.locator('.KarnamaCheckbox-frame').boundingBox()
        const png = await page.screenshot({ clip: { x: box.x, y: box.y, width: box.width, height: box.height } })
        const [edge, inside] = await page.evaluate(async (b64) => {
          const img = new Image()
          img.src = `data:image/png;base64,${b64}`
          await img.decode()
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const context = canvas.getContext('2d')
          context.drawImage(img, 0, 0)
          const y = Math.floor(img.height / 2)
          return [0, 8].map((x) => Array.from(context.getImageData(x, y, 1, 1).data).slice(0, 3).join())
        }, png.toString('base64'))
        read.push({ story, forced, ...shape, drawn: edge !== inside })
        await page.close()
      }
    }
    return read
  } finally {
    await browser.close()
    server.close()
  }
}

// What the exit condition asks of a reading: the content box 20 by 20 in both
// modes, an edge drawn under forced colours, and the glyph where it was.
const problemsIn = (read) => {
  const problems = []
  for (const reading of read) {
    if (reading.content.join() !== '20,20') problems.push(`${reading.story}, forced colours ${reading.forced}: the content box is ${reading.content.join(' by ')}`)
    if (reading.forced === 'active' && !reading.drawn) problems.push(`${reading.story}: no edge drawn under forced colours`)
  }
  const checked = read.filter((reading) => reading.story === 'checked')
  if (checked.length === 2 && JSON.stringify(checked[0].glyph) !== JSON.stringify(checked[1].glyph)) problems.push(`the tick moves under forced colours: ${JSON.stringify(checked[0].glyph)} to ${JSON.stringify(checked[1].glyph)}`)
  return problems
}

const main = async () => {
  await check('the Checkbox stories pass', () => {
    const result = spawnSync('npx vitest run --project storybook src/shared/checkbox', { cwd: WEB, encoding: 'utf8', shell: true })
    return result.status === 0 ? null : `they fail:\n${`${result.stdout}${result.stderr}`.slice(-800)}`
  })

  await check('under forced colours the edge is drawn, the content box stays 20 by 20 and the tick does not move', async () => {
    const out = build()
    try {
      const read = await geometry(out)
      process.stdout.write(`       ${read.map((reading) => `${reading.story}/${reading.forced}: ${reading.content.join('x')}${reading.glyph ? ` tick at ${reading.glyph.join(',')}` : ''}${reading.forced === 'active' ? ` edge ${reading.drawn ? 'drawn' : 'missing'}` : ''}`).join('; ')}\n`)
      const problems = problemsIn(read)
      return problems.length ? problems.join('; ') : null
    } finally {
      rmSync(out, { recursive: true, force: true })
    }
  })

  await check('THE CASE: the laid-out border back in place of the pseudo-element fails the content box', async () => {
    const original = readFileSync(COMPONENT, 'utf8')
    const block = /^ {8}'@media \(forced-colors: active\)': \{\n {10}'&::before': \{\n[\s\S]*?\n {10}\},\n {8}\},\n/m.exec(original)?.[0]
    if (!block) return 'the forced-colours pseudo-element is not where this mutation expects it'
    try {
      writeFileSync(COMPONENT, original.replace(block, () => "        '@media (forced-colors: active)': { borderStyle: 'solid', borderWidth: 1, borderColor: 'ButtonBorder' },\n"))
      const out = build()
      try {
        const problems = problemsIn(await geometry(out))
        return problems.some((problem) => /content box is 18 by 18/.test(problem)) ? null : `the laid-out border was not caught: ${problems.join('; ') || 'nothing failed'}`
      } finally {
        rmSync(out, { recursive: true, force: true })
      }
    } finally {
      writeFileSync(COMPONENT, original)
    }
  })

  await check("KN-281's verifier still passes, its forced-colours check measuring the content box", () => {
    if (!/under forced colours the frame's content box is/.test(readFileSync(join(ROOT, 'agent', 'scripts', 'verify', 'KN-281.mjs'), 'utf8'))) return "KN-281's forced-colours check does not measure the content box"
    const result = spawnSync('node', [join(ROOT, 'agent', 'scripts', 'verify', 'KN-281.mjs')], { cwd: ROOT, encoding: 'utf8' })
    return result.status === 0 ? null : `it fails:\n${`${result.stdout}${result.stderr}`.slice(-600)}`
  })
}

await main()
if (failures.length) {
  process.stderr.write(`\nKN-284 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-284 verify passed.\n')
