#!/usr/bin/env node
// Verifies KN-267: the Input carries the leading and trailing icon slots node
// 95:38 draws, in both directions, and DESIGN.md says why its label stays.
//
// Exit condition: the Input takes an optional leading and an optional trailing
// icon, each 20 by 20 at spacing/2xs from the text in text/secondary, matching
// 95:38 with the icons on, in both directions; stories show each and both; and
// the label's boolean in the file is either honoured, with the accessible name
// then required another way, or the decision not to is recorded in DESIGN.md.
//
// The distances to the text are to the input's box, a proxy for where the text
// starts that KN-283 is replacing for every Input story; the slots' own
// geometry is exact. Read in a production Storybook served here, in
// Playwright's Chromium, in fa-IR and en-US.
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

const GAP = "            columnGap: `${spacing['2xs']}px`,\n"
const START = '        startAdornment={drawn(leadingIcon) ? <Slot>{leadingIcon}</Slot> : undefined}\n'
const END = '        endAdornment={drawn(trailingIcon) ? <Slot>{trailingIcon}</Slot> : undefined}\n'
const SIDES = { 'leading-icon': [true, false], 'trailing-icon': [false, true], 'both-icons': [true, true] }

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
  const result = spawnSync('npx vitest run --project storybook src/shared/input', { cwd: WEB, encoding: 'utf8', shell: true })
  return { code: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}

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
    return output.includes(`× ${story} `) ? null : `it failed, but not in ${story}:\n${output.slice(-500)}`
  } finally {
    writeFileSync(COMPONENT, original)
  }
}

const build = () => {
  const out = mkdtempSync(join(tmpdir(), 'kn267-'))
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

// In the page: each slot's size, colour and distance from its edge of the
// field, and the text box's distance from each edge, in the field's direction.
const measure = () => {
  const field = document.querySelector('#storybook-root .MuiInputBase-root')
  const box = field.querySelector('input')
  const rtl = getComputedStyle(field).direction === 'rtl'
  const outer = field.getBoundingClientRect()
  const fromStart = (rect) => (rtl ? outer.right - rect.right : rect.left - outer.left)
  const fromEnd = (rect) => (rtl ? rect.left - outer.left : outer.right - rect.right)
  const slot = (element, distance) => {
    if (!element) return null
    const rect = element.getBoundingClientRect()
    return { size: [rect.width, rect.height], edge: distance(rect), colour: getComputedStyle(element).color }
  }
  const text = box.getBoundingClientRect()
  return { rtl, leading: slot(box.previousElementSibling, fromStart), trailing: slot(box.nextElementSibling, fromEnd), text: [fromStart(text), fromEnd(text)] }
}

const main = async () => {
  await check('the Input stories pass, LeadingIcon, TrailingIcon and BothIcons included', () => {
    const source = readFileSync(STORIES, 'utf8')
    const missing = ['LeadingIcon', 'TrailingIcon', 'BothIcons'].filter((name) => !new RegExp(`export const ${name}: Story`).test(source))
    if (missing.length) return `there is no ${missing.join(', ')}`
    const { code, output } = stories()
    return code === 0 ? null : `they fail:\n${output.slice(-800)}`
  })

  await check('THE CASE: the gap between an icon and the text removed fails BothIcons', () => mutation([[GAP, '']], 'no gap', 'Both Icons'))
  await check('a slot of the wrong size fails LeadingIcon', () => mutation([['      width: iconSize.md,\n', '      width: iconSize.sm,\n']], 'a 16 wide slot', 'Leading Icon'))
  await check('the slots swapped, leading drawn at the end, fails LeadingIcon', () =>
    mutation(
      [
        [START, '        startAdornment={drawn(trailingIcon) ? <Slot>{trailingIcon}</Slot> : undefined}\n'],
        [END, '        endAdornment={drawn(leadingIcon) ? <Slot>{leadingIcon}</Slot> : undefined}\n'],
      ],
      'the slots swapped',
      'Leading Icon',
    ),
  )

  const out = build()
  const server = await serve(out)
  const browser = await chromium.launch()
  try {
    await check('in both directions each slot is 20 by 20, text/secondary, 16 from its edge, and the text box 40 from an icon\'s side', async () => {
      const problems = []
      for (const [story, [leading, trailing]] of Object.entries(SIDES)) {
        for (const locale of ['fa-IR', 'en-US']) {
          const page = await browser.newPage({ viewport: { width: 700, height: 240 } })
          try {
            await page.goto(`http://127.0.0.1:${server.address().port}/iframe.html?id=shared-input--${story}&viewMode=story&globals=locale:${locale}`)
            await page.waitForFunction(() => window.__STORYBOOK_PREVIEW__?.currentRender?.phase === 'finished', null, { timeout: 30000 })
            const read = await page.evaluate(measure)
            const wrong = []
            if (read.rtl !== (locale === 'fa-IR')) wrong.push('the field runs the wrong way')
            for (const [name, on, slot] of [['leading', leading, read.leading], ['trailing', trailing, read.trailing]]) {
              if (!on) {
                if (slot) wrong.push(`a ${name} slot that should not be there`)
                continue
              }
              if (!slot) { wrong.push(`no ${name} slot`); continue }
              if (slot.size.join() !== '20,20') wrong.push(`${name} ${slot.size.join(' by ')}`)
              if (slot.edge !== 16) wrong.push(`${name} ${slot.edge} from its edge`)
              if (slot.colour !== 'rgb(107, 114, 128)') wrong.push(`${name} in ${slot.colour}`)
            }
            const want = [leading ? 40 : 16, trailing ? 40 : 16]
            if (read.text.join() !== want.join()) wrong.push(`the text box at ${read.text.join(' and ')} where ${want.join(' and ')}`)
            if (wrong.length) problems.push(`${story} ${locale}: ${wrong.join('; ')}`)
          } finally {
            await page.close()
          }
        }
      }
      return problems.length ? problems.join('\n    ') : null
    })
  } finally {
    await browser.close()
    server.close()
    rmSync(out, { recursive: true, force: true })
  }

  await check('DESIGN.md records the slots and why the label stays required', () => {
    const design = readFileSync(join(ROOT, 'DESIGN.md'), 'utf8')
    const section = (/### The Input's icon slots, and its label\n([\s\S]*?)\n### /.exec(design)?.[1] ?? '').replace(/\s+/g, ' ')
    if (!section) return 'there is no section for the icon slots'
    const missing = [
      ['the slots', /20 by 20 placeholders of radius sm in `text\/secondary`, spacing\/2xs from the text/],
      ['decorative only', /for decorative icons only/],
      ['the label decision', /The Label boolean is not honoured\.\*\* All 91 Input instances on the screens keep the label on/],
    ].filter(([, pattern]) => !pattern.test(section))
    return missing.length ? `the section does not state ${missing.map(([what]) => what).join(', ')}` : null
  })
}

await main()
if (failures.length) {
  process.stderr.write(`\nKN-267 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-267 verify passed.\n')
