#!/usr/bin/env node
// Verifies KN-288: under forced colours a disabled Checkbox's edge is GrayText
// and every enabled state's is ButtonBorder.
//
// Exit condition: under forced colours a disabled Checkbox's edge is GrayText
// and every enabled state's is ButtonBorder, checked and indeterminate
// included; a check in a production build reads the rendered edge of all five
// states under forced colours, and a mutation giving disabled ButtonBorder
// again fails it; and DESIGN.md's stroke section says which colour each state
// takes there.
//
// A forced-colours palette is the user's, and may make GrayText and
// ButtonBorder the same colour, so the check does not require them to differ.
// It reads the keyword each state chose, kept in --karnama-forced-edge, and
// compares the rendered edge pixel with a probe of that system colour painted
// in the same page, whatever it resolves to. Hover is driven by a real pointer.
//
// NOT read-only: it edits Checkbox.tsx for its mutation and restores it in a
// finally, and runs KN-284's verifier, which does the same. The builds go to
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
const KEYWORD = "            '--karnama-forced-edge': disabled ? 'GrayText' : 'ButtonBorder',\n"
const STATES = [
  ['unchecked', 'ButtonBorder'],
  ['checked', 'ButtonBorder'],
  ['indeterminate', 'ButtonBorder'],
  ['hover', 'ButtonBorder'],
  ['disabled', 'GrayText'],
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
  const out = mkdtempSync(join(tmpdir(), 'kn288-'))
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

// A pixel of a rendered region, as r,g,b.
const pixel = async (page, clip, x, y) => {
  const png = await page.screenshot({ clip })
  return page.evaluate(async ({ b64, x, y }) => {
    const img = new Image()
    img.src = `data:image/png;base64,${b64}`
    await img.decode()
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const context = canvas.getContext('2d')
    context.drawImage(img, 0, 0)
    return Array.from(context.getImageData(x, y, 1, 1).data).slice(0, 3).join()
  }, { b64: png.toString('base64'), x, y })
}

// Every state under forced colours: the keyword it chose, its rendered edge,
// and a probe of that system colour painted in the same page.
const readStates = async (dir) => {
  const server = await serve(dir)
  const browser = await chromium.launch()
  try {
    const read = []
    for (const [story, want] of STATES) {
      const page = await browser.newPage({ viewport: { width: 240, height: 120 }, forcedColors: 'active' })
      await page.goto(`http://127.0.0.1:${server.address().port}/iframe.html?id=shared-checkbox--${story === 'hover' ? 'hover' : story}&viewMode=story&globals=colorScheme:light`)
      await page.waitForFunction(() => window.__STORYBOOK_PREVIEW__?.currentRender?.phase === 'finished', null, { timeout: 30000 })
      if (story === 'hover') await page.getByRole('checkbox').hover()
      const keyword = await page.evaluate(() => getComputedStyle(document.querySelector('.KarnamaCheckbox-frame'), '::before').getPropertyValue('--karnama-forced-edge').trim())
      const box = await page.locator('.KarnamaCheckbox-frame').boundingBox()
      const edge = await pixel(page, { x: box.x, y: box.y, width: box.width, height: box.height }, 0, Math.floor(box.height / 2))
      await page.evaluate((colour) => {
        const probe = document.createElement('div')
        probe.id = 'kn288-probe'
        probe.style.cssText = `position:fixed;left:200px;top:80px;width:20px;height:20px;background:${colour};forced-color-adjust:none`
        document.body.appendChild(probe)
      }, want)
      const probed = await pixel(page, { x: 200, y: 80, width: 20, height: 20 }, 10, 10)
      read.push({ story, want, keyword, edge, probed })
      await page.close()
    }
    return read
  } finally {
    await browser.close()
    server.close()
  }
}

const problemsIn = (read) =>
  read.flatMap(({ story, want, keyword, edge, probed }) => [
    ...(keyword === want ? [] : [`${story} chose ${keyword || 'nothing'} where ${want} belongs`]),
    ...(edge === probed ? [] : [`${story}'s edge renders ${edge}, not ${want}'s ${probed}`]),
  ])

const main = async () => {
  await check('the Checkbox stories pass', () => {
    const result = spawnSync('npx vitest run --project storybook src/shared/checkbox', { cwd: WEB, encoding: 'utf8', shell: true })
    return result.status === 0 ? null : `they fail:\n${`${result.stdout}${result.stderr}`.slice(-800)}`
  })

  await check('under forced colours, disabled takes GrayText and the four enabled states ButtonBorder, on the pixels', async () => {
    const out = build()
    try {
      const read = await readStates(out)
      process.stdout.write(`       ${read.map(({ story, keyword, edge }) => `${story} ${keyword} ${edge}`).join('; ')}\n`)
      const problems = problemsIn(read)
      return problems.length ? problems.join('; ') : null
    } finally {
      rmSync(out, { recursive: true, force: true })
    }
  })

  await check('THE CASE: disabled given ButtonBorder again fails it', async () => {
    const original = readFileSync(COMPONENT, 'utf8')
    if (!original.includes(KEYWORD)) return 'the forced-colours keyword is not where this mutation expects it'
    try {
      writeFileSync(COMPONENT, original.replace(KEYWORD, () => "            '--karnama-forced-edge': 'ButtonBorder',\n"))
      const out = build()
      try {
        const problems = problemsIn(await readStates(out))
        return problems.some((problem) => problem.startsWith('disabled chose ButtonBorder')) ? null : `the mutation was not caught: ${problems.join('; ') || 'nothing failed'}`
      } finally {
        rmSync(out, { recursive: true, force: true })
      }
    } finally {
      writeFileSync(COMPONENT, original)
    }
  })

  await check('DESIGN.md says which colour each state takes under forced colours', () => {
    const design = readFileSync(join(ROOT, 'DESIGN.md'), 'utf8')
    const section = (/### A stroke is drawn inside, and takes no space\n([\s\S]*?)\n### /.exec(design)?.[1] ?? '').replace(/\s+/g, ' ')
    return /A disabled Checkbox takes `GrayText` there instead, so it does not read as enabled; every other state takes `ButtonBorder`\. KN-288\./.test(section) ? null : 'the stroke section does not say it'
  })

  await check("KN-284's verifier still passes", () => {
    const result = spawnSync('node', [join(ROOT, 'agent', 'scripts', 'verify', 'KN-284.mjs')], { cwd: ROOT, encoding: 'utf8' })
    return result.status === 0 ? null : `it fails:\n${`${result.stdout}${result.stderr}`.slice(-600)}`
  })
}

await main()
if (failures.length) {
  process.stderr.write(`\nKN-288 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-288 verify passed.\n')
