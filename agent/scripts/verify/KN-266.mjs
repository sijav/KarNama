#!/usr/bin/env node
// Verifies KN-266: the Input's stroke takes no layout space, so its text sits
// spacing/md from the field's edge in every state, as 95:5 and 95:19 draw it.
//
// Exit condition: in every state the Input's text sits spacing/md, 16px, from
// the field's outer edge, as 95:5 and 95:19 draw it, with the stroke painted
// inside that padding and taking no layout space; no padding in Input.tsx is
// computed from a border width; the Default and Focus stories measure the
// text's distance from the edge at 16; and the other bordered components are
// checked for the same offset, each matching or carrying a card.
//
// The states are read in a production Storybook served here, in Playwright's
// Chromium, in both directions; forced colours are checked on the rendered
// pixels, not the computed style, since the browser substitutes border colours
// at paint time. The text is measured where it starts, since KN-283: the
// input's box plus its own border, padding and text-indent on the side the
// text starts from, the placeholder's alignment and indent when it is empty,
// and no start at all when it is aligned elsewhere or scrolled.
//
// NOT read-only: it edits Input.tsx for its mutations and restores it in a
// finally, and runs five older verifiers that do the same. The build goes to
// the system temp directory and is removed.

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

const ROOT_PADDING = '            paddingInline: `${spacing.md}px`,\n'
const FOCUSED_OPEN = "            '&.Mui-focused': {\n"
// Every state the file draws, and the one it does not: the invalid field focused.
const STATES = ['default', 'filled', 'focus', 'with-error', 'focused-while-invalid', 'disabled', 'hover']

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

const mutation = (from, to, what, story) => {
  const original = readFileSync(COMPONENT, 'utf8')
  if (!original.includes(from)) return `the anchor for this mutation is gone:\n${from}`
  try {
    writeFileSync(COMPONENT, original.replace(from, () => to))
    const { code, output } = stories()
    if (code === 0) return `the stories passed with ${what}, so nothing measures it`
    return output.includes(`× ${story} `) ? null : `it failed, but not in ${story}:\n${output.slice(-500)}`
  } finally {
    writeFileSync(COMPONENT, original)
  }
}

const build = () => {
  const out = mkdtempSync(join(tmpdir(), 'kn266-'))
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

// In the page: the field that has focus, or the first one, its own border, its
// edge on ::before, and where its text starts and ends from its outer edge,
// start first, as the stories' textInsets measures it, KN-283.
const measure = () => {
  const focused = document.activeElement?.closest('.MuiInputBase-root')
  const field = focused ?? document.querySelector('#storybook-root .MuiInputBase-root')
  const box = field?.querySelector('input')
  if (!field || !box) return null
  const own = getComputedStyle(field)
  const edge = getComputedStyle(field, '::before')
  const outer = field.getBoundingClientRect()
  const inner = box.getBoundingClientRect()
  const style = getComputedStyle(box)
  const shown = box.value === '' ? getComputedStyle(box, '::placeholder') : style
  const rtl = style.direction === 'rtl'
  const px = (value) => Number.parseFloat(value) || 0
  const aligned = shown.textAlign === 'start' || shown.textAlign === (rtl ? 'right' : 'left')
  const [start, end] = rtl
    ? [outer.right - inner.right + px(style.borderRightWidth) + px(style.paddingRight), inner.left - outer.left + px(style.borderLeftWidth) + px(style.paddingLeft)]
    : [inner.left - outer.left + px(style.borderLeftWidth) + px(style.paddingLeft), outer.right - inner.right + px(style.borderRightWidth) + px(style.paddingRight)]
  // One fixed direction, from the field's start, only while nothing lets the
  // content choose it, the text runs across, and the input runs the field's
  // way; Chromium ignores direction on a placeholder, so the input's is the
  // placeholder's too, KN-297.
  const along = own.direction
  const refused =
    style.unicodeBidi === 'plaintext' ? 'unicode-bidi plaintext' : style.writingMode !== 'horizontal-tb' ? `writing ${style.writingMode}` : style.direction !== along ? `running ${style.direction} in a field running ${along}` : null
  return {
    focused: Boolean(focused),
    own: [own.borderTopWidth, own.borderRightWidth, own.borderBottomWidth, own.borderLeftWidth].map(Number.parseFloat),
    edge: Number.parseFloat(edge.borderTopWidth),
    edgeStyle: edge.borderTopStyle,
    // No start to measure when the text is aligned elsewhere, scrolled, or
    // indented by something other than a length, or refused above.
    insets: !refused && aligned && box.scrollLeft === 0 && /px$/.test(shown.textIndent) ? [start + px(shown.textIndent), end] : [Number.NaN, Number.NaN],
    align: refused ? `${shown.textAlign}, ${refused}` : shown.textAlign,
  }
}

const main = async () => {
  await check('the Input stories pass, Default and Focus measuring the text at 16', () => {
    const source = readFileSync(STORIES, 'utf8')
    const body = (name) => new RegExp(`export const ${name}: Story = \\{\\n([\\s\\S]*?)\\n\\}\\n`).exec(source)?.[1] ?? ''
    const unmeasured = ['Default', 'Focus'].filter((name) => !body(name).includes('await expect(textInsets(field, box)).toEqual([16, 16])'))
    if (unmeasured.length) return `these do not measure the text's distance from the edge: ${unmeasured.join(', ')}`
    const { code, output } = stories()
    return code === 0 ? null : `they fail:\n${output.slice(-800)}`
  })

  await check('no padding in Input.tsx is computed from a border width', () => {
    const source = readFileSync(COMPONENT, 'utf8')
    const paddings = [...source.matchAll(/(padding\w*): ([^,\n]+),/g)].map(([, key, value]) => [key, value.trim()])
    if (!paddings.length) return 'no padding was found, so this read nothing'
    const off = paddings.filter(([, value]) => !/^`\$\{spacing(\.\w+|\['[\w-]+'\])\}px`$/.test(value) && value !== '0')
    return off.length ? `a padding that is not a token: ${off.map(([key, value]) => `${key}: ${value}`).join(', ')}` : null
  })

  await check('THE CASE: a laid-out border put back on the field fails Default on the text\'s distance', () =>
    mutation(ROOT_PADDING, `${ROOT_PADDING}            borderStyle: 'solid',\n            borderWidth: 1,\n`, 'a border that takes layout space', 'Default'),
  )

  await check('a padding change on focus fails Focus', () =>
    mutation(FOCUSED_OPEN, `${FOCUSED_OPEN}              paddingInline: \`\${spacing.sm}px\`,\n`, 'the focused padding changed', 'Focus'),
  )

  const out = build()
  const server = await serve(out)
  const base = `http://127.0.0.1:${server.address().port}`
  const browser = await chromium.launch()
  try {
    await check('in every state and both directions the text sits 16 from the edge, and the stroke takes no space', async () => {
      const problems = []
      for (const story of STATES) {
        for (const locale of ['fa-IR', 'en-US']) {
          const page = await browser.newPage({ viewport: { width: 900, height: 700 } })
          try {
            await page.goto(`${base}/iframe.html?id=shared-input--${story}&viewMode=story&globals=locale:${locale}`)
            await page.waitForFunction(() => window.__STORYBOOK_PREVIEW__?.currentRender?.phase === 'finished', null, { timeout: 30000 })
            if (story === 'hover') await page.locator('#storybook-root .MuiInputBase-root').first().hover()
            const read = await page.evaluate(measure)
            if (!read) { problems.push(`${story} ${locale}: no field`); continue }
            const width = read.focused ? 2 : 1
            const wrong = []
            if (read.insets.some((inset) => inset !== 16)) wrong.push(`text at ${read.insets.join(' and ')}, aligned ${read.align}`)
            if (read.own.some((border) => border !== 0)) wrong.push(`a border on the field itself, ${read.own.join(' ')}`)
            if (read.edge !== width || read.edgeStyle !== 'solid') wrong.push(`an edge of ${read.edge} ${read.edgeStyle} where ${width} is drawn`)
            if (story.startsWith('focus') && !read.focused) wrong.push('nothing is focused')
            if (wrong.length) problems.push(`${story} ${locale}: ${wrong.join('; ')}`)
          } finally {
            await page.close()
          }
        }
      }
      return problems.length ? problems.join('\n    ') : null
    })

    await check('the edge survives forced colours, on the rendered pixels, where an inset shadow would not', async () => {
      const edgeDrawn = async (asShadow) => {
        const page = await browser.newPage({ viewport: { width: 600, height: 200 }, forcedColors: 'active' })
        try {
          await page.goto(`${base}/iframe.html?id=shared-input--default&viewMode=story`)
          await page.waitForFunction(() => window.__STORYBOOK_PREVIEW__?.currentRender?.phase === 'finished', null, { timeout: 30000 })
          if (asShadow) await page.addStyleTag({ content: '#storybook-root .MuiInputBase-root::before { border-width: 0 !important; } #storybook-root .MuiInputBase-root { box-shadow: inset 0 0 0 1px #e5e7eb !important; }' })
          const box = await page.locator('#storybook-root .MuiInputBase-root').boundingBox()
          const png = await page.screenshot({ clip: { x: box.x, y: box.y, width: box.width, height: box.height } })
          const mid = Math.floor(box.height / 2)
          const [edge, inside] = await page.evaluate(async ({ b64, mid }) => {
            const img = new Image()
            img.src = `data:image/png;base64,${b64}`
            await img.decode()
            const canvas = document.createElement('canvas')
            canvas.width = img.width
            canvas.height = img.height
            const context = canvas.getContext('2d')
            context.drawImage(img, 0, 0)
            return [[0, mid], [8, mid]].map(([x, y]) => Array.from(context.getImageData(x, y, 1, 1).data).slice(0, 3).join())
          }, { b64: png.toString('base64'), mid })
          return edge !== inside
        } finally {
          await page.close()
        }
      }
      if (!(await edgeDrawn(false))) return 'under forced colours the field has no edge'
      return (await edgeDrawn(true)) ? 'an inset shadow kept its edge too, so this check tells nothing apart' : null
    })
  } finally {
    await browser.close()
    server.close()
    rmSync(out, { recursive: true, force: true })
  }

  await check('the other bordered components are checked: the Checkbox and the Filter Chip carry cards, the Tooltip and Status Chip draw none', () => {
    const board = JSON.parse(readFileSync(join(ROOT, 'agent', 'board.json'), 'utf8'))
    const tasks = board.tasks ?? board
    const card = (id, pattern) => {
      const task = tasks.find((candidate) => candidate.id === id)
      return task && task.status !== 'dropped' && pattern.test(`${task.title} ${task.desc}`) ? null : id
    }
    const missing = [card('KN-281', /Checkbox[\s\S]*1\.5/), card('KN-282', /Filter Chip[\s\S]*13[\s\S]*12/)].filter(Boolean)
    if (missing.length) return `no card for ${missing.join(', ')}`
    const stroked = ['tooltip/Tooltip.tsx', 'status-chip/StatusChip.tsx'].filter((file) =>
      /borderWidth|borderStyle|border:/.test(readFileSync(join(WEB, 'src', 'shared', file), 'utf8')),
    )
    return stroked.length ? `these draw a border the check assumed they did not: ${stroked.join(', ')}` : null
  })

  await check('DESIGN.md records the inside stroke, the widths, and why a pseudo-element', () => {
    const design = readFileSync(join(ROOT, 'DESIGN.md'), 'utf8')
    const section = (/### A stroke is drawn inside, and takes no space\n([\s\S]*?)\n### /.exec(design)?.[1] ?? '').replace(/\s+/g, ' ')
    if (!section) return 'there is no DESIGN.md section for it'
    const missing = [
      ['the Input', /95:5/],
      ['the Checkbox at one and a half', /one and a half in every state, KN-281/],
      ['the Filter Chip', /KN-282/],
      ['the text at 16', /sits 16 from its edge in every state/],
      ['the pseudo-element', /pseudo-element/],
      ['forced colours', /forced colours/],
    ].filter(([, pattern]) => !pattern.test(section))
    return missing.length ? `the section does not name ${missing.map(([what]) => what).join(', ')}` : null
  })

  for (const id of ['KN-011', 'KN-241', 'KN-243', 'KN-244', 'KN-248']) {
    await check(`${id}'s verifier still passes, its anchors moved`, () => {
      const result = spawnSync('node', [join(ROOT, 'agent', 'scripts', 'verify', `${id}.mjs`)], { cwd: ROOT, encoding: 'utf8' })
      return result.status === 0 ? null : `it fails:\n${`${result.stdout}${result.stderr}`.slice(-600)}`
    })
  }
}

await main()
if (failures.length) {
  process.stderr.write(`\nKN-266 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-266 verify passed.\n')
