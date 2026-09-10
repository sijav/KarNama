#!/usr/bin/env node
// Verifies KN-245: the Input's Controls show what the canvas draws.
//
// Exit condition: with no control touched, every Controls value in the
// args-driven Input stories is what the canvas draws, label, placeholder and
// helper, in either language; changing one in Controls changes the canvas to
// exactly that value, and clearing the placeholder or helper removes it; a
// story asserts the rendered copy equals the args, and a mutation reintroducing
// a hidden fallback fails it.
//
// The Controls clauses are read from the manager's real Controls panel, in a
// production Storybook served here, in Playwright's Chromium: the panel's own
// inputs against the canvas in the preview frame. The specimen's copy is read
// from the two catalogs on disk, not from the stories under test. The story
// clause runs under Vitest, and its other half, the args following the
// language, in the production preview, since portable stories apply no args
// update, TECH-DEBT 16.
//
// NOT read-only: it edits Input.stories.tsx for its mutations and restores it
// in a finally. The builds go to the system temp directory and are removed.

import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const STORIES = join(WEB, 'src', 'shared', 'input', 'Input.stories.tsx')
const { chromium } = createRequire(join(WEB, 'package.json'))('playwright')

// Every Input story that draws from the meta's render and offers the copy
// controls. The two ControlsMatchTheCanvas stories draw from it too, with the
// panel disabled, and run in the story clause instead.
const ARGS_DRIVEN = ['default', 'from-args', 'filled', 'focus', 'focus-while-empty', 'disabled', 'hover', 'label-is-bound', 'typing']
const LOCALES = ['fa-IR', 'en-US']
const FIELDS = ['label', 'placeholder', 'helperText']
const IDS = { label: 'Job title', placeholder: 'e.g. Frontend developer', helperText: 'A short explanation' }

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

// The specimen's copy in each language, from the catalogs themselves.
const catalog = (locale) => {
  const source = readFileSync(join(WEB, 'src', 'i18n', 'locales', `${locale}.ts`), 'utf8')
  return Object.fromEntries(
    FIELDS.map((field) => {
      const entry = new RegExp(`'${IDS[field].replace(/\./g, '\\.')}': '([^']*)'`).exec(source)
      if (!entry) throw new Error(`${locale}.ts has no entry for ${IDS[field]}`)
      return [field, entry[1]]
    }),
  )
}
const SPECIMEN = Object.fromEntries(LOCALES.map((locale) => [locale, catalog(locale)]))

const build = () => {
  const out = mkdtempSync(join(tmpdir(), 'kn245-'))
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
        const body = readFileSync(path.endsWith('\\') || path.endsWith('/') ? join(path, 'index.html') : path)
        response.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'text/html' }).end(body)
      } catch {
        response.writeHead(404).end()
      }
    })
    server.listen(0, '127.0.0.1', () => resolve(server))
  })

// What the panel shows and what the canvas draws, for the three copy fields.
const read = async (page) => {
  const controls = await page.evaluate((fields) => Object.fromEntries(fields.map((field) => [field, document.querySelector(`#control-${field}`)?.value ?? null])), FIELDS)
  const canvas = await page.frameLocator('#storybook-preview-iframe').locator('body').evaluate(() => {
    const box = document.querySelector('#storybook-root input')
    const line = box ? document.getElementById(box.getAttribute('aria-describedby') ?? '') : null
    return { label: document.querySelector('#storybook-root label')?.textContent ?? null, placeholder: box?.getAttribute('placeholder') ?? '', helperText: line?.textContent ?? '' }
  })
  return { controls, canvas }
}

// Poll until the panel and the canvas agree with what is expected, or report
// the last reading.
const settle = async (page, expect, timeout = 8000) => {
  const deadline = Date.now() + timeout
  let last
  while (Date.now() < deadline) {
    last = await read(page)
    if (expect(last) === null) return null
    await page.waitForTimeout(200)
  }
  return expect(last) ?? 'it never settled'
}

const agree = ({ controls, canvas }) => {
  const off = FIELDS.filter((field) => controls[field] !== canvas[field])
  return off.length ? `the panel and the canvas disagree on ${off.map((field) => `${field}: panel ${JSON.stringify(controls[field])}, canvas ${JSON.stringify(canvas[field])}`).join('; ')}` : null
}

const open = async (browser, base, story, locale) => {
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } })
  await page.goto(`${base}/?path=/story/shared-input--${story}&globals=locale:${locale}`)
  await page.frameLocator('#storybook-preview-iframe').locator('#storybook-root input').waitFor({ timeout: 30000 })
  await page.locator('#control-label').waitFor({ timeout: 30000 })
  return page
}

// The fields a story sets itself, which are not the specimen's to follow.
const OWN = { 'from-args': ['label', 'helperText'] }

const stories = () => {
  const result = spawnSync('npx vitest run --project storybook src/shared/input', { cwd: WEB, encoding: 'utf8', shell: true })
  return { code: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}

const withEdit = async (from, to, run) => {
  const original = readFileSync(STORIES, 'utf8')
  if (!original.includes(from)) return `the anchor for this mutation is gone:\n${from}`
  try {
    writeFileSync(STORIES, original.replace(from, () => to))
    return await run()
  } finally {
    writeFileSync(STORIES, original)
  }
}

const main = async () => {
  await check('the Input stories pass under Vitest, both ControlsMatchTheCanvas stories included', () => {
    const source = readFileSync(STORIES, 'utf8')
    if (!/export const ControlsMatchTheCanvas: Story/.test(source) || !/export const ControlsMatchTheCanvasInEnglish: Story/.test(source)) return 'the two stories are not there'
    const { code, output } = stories()
    return code === 0 ? null : `they fail:\n${output.slice(-800)}`
  })

  await check('THE CASE: the hidden fallback back, an empty label drawn as the copy, fails ControlsMatchTheCanvas', () =>
    withEdit('  args: { ...AT_LOAD, onChange: fn() },\n', "  args: { ...AT_LOAD, label: '', onChange: fn() },\n", () =>
      withEdit(
        '  return <Input {...args} {...(bound && held.value !== undefined ? { value: held.value } : {})} onChange={onChange} />\n',
        "  return <Input {...args} label={args.label === '' ? specimenCopy().label : args.label} {...(bound && held.value !== undefined ? { value: held.value } : {})} onChange={onChange} />\n",
        () => {
          const { code, output } = stories()
          if (code === 0) return 'the stories passed with the fallback back, so nothing asserts the canvas draws the args'
          return output.includes('× Controls Match The Canvas ') ? null : `it failed, but not in ControlsMatchTheCanvas:\n${output.slice(-500)}`
        },
      ),
    ),
  )

  const out = build()
  const server = await serve(out)
  const base = `http://127.0.0.1:${server.address().port}`
  const browser = await chromium.launch()
  try {
    await check('untouched, in both languages, every args-driven story shows in its panel what its canvas draws, the specimen in that language', async () => {
      const problems = []
      for (const story of ARGS_DRIVEN) {
        for (const locale of LOCALES) {
          const page = await open(browser, base, story, locale)
          try {
            const problem = await settle(page, (reading) => {
              const disagreement = agree(reading)
              if (disagreement) return disagreement
              const inherited = FIELDS.filter((field) => !(OWN[story] ?? []).includes(field))
              const wrong = inherited.filter((field) => reading.controls[field] !== SPECIMEN[locale][field])
              return wrong.length ? `not the specimen in ${locale}: ${wrong.map((field) => `${field} ${JSON.stringify(reading.controls[field])}`).join(', ')}` : null
            })
            if (problem) problems.push(`${story} in ${locale}: ${problem}`)
          } finally {
            await page.close()
          }
        }
      }
      return problems.length ? problems.join('\n    ') : null
    })

    const page = await open(browser, base, 'default', 'fa-IR')
    try {
      await check('changing one: a label typed into the panel is drawn exactly', async () => {
        await page.fill('#control-label', 'x5')
        return settle(page, (reading) => agree(reading) ?? (reading.canvas.label === 'x5' ? null : `the canvas draws ${JSON.stringify(reading.canvas.label)}`))
      })

      await check('the language switched after a typed value: the typed label stays, the untouched fields move to English', async () => {
        await page.evaluate(() => window.__STORYBOOK_ADDONS_CHANNEL__.emit('updateGlobals', { globals: { locale: 'en-US' } }))
        return settle(page, (reading) => {
          const disagreement = agree(reading)
          if (disagreement) return disagreement
          if (reading.controls.label !== 'x5') return `the typed label became ${JSON.stringify(reading.controls.label)}`
          const stale = ['placeholder', 'helperText'].filter((field) => reading.controls[field] !== SPECIMEN['en-US'][field])
          return stale.length ? `still not in English: ${stale.join(', ')}` : null
        })
      })

      await check('clearing: an emptied placeholder and helper are gone from the canvas', async () => {
        await page.fill('#control-placeholder', '')
        await page.fill('#control-helperText', '')
        return settle(page, (reading) => agree(reading) ?? (reading.canvas.placeholder === '' && reading.canvas.helperText === '' ? null : `the canvas still draws ${JSON.stringify(reading.canvas)}`))
      })
    } finally {
      await page.close()
    }
  } finally {
    await browser.close()
    server.close()
    rmSync(out, { recursive: true, force: true })
  }

  await check('the write taken out fails the English twin in a production preview', () =>
    withEdit('      updateArgs(update)\n', '', async () => {
      const broken = build()
      const brokenServer = await serve(broken)
      const brokenBrowser = await chromium.launch()
      try {
        const page = await brokenBrowser.newPage()
        await page.addInitScript(() => {
          window.__KN245__ = []
          let channel
          Object.defineProperty(window, '__STORYBOOK_ADDONS_CHANNEL__', {
            configurable: true,
            get: () => channel,
            set: (value) => {
              channel = value
              value.on('storyRenderPhaseChanged', ({ newPhase }) => window.__KN245__.push(newPhase))
              value.on('playFunctionThrewException', () => window.__KN245__.push('threw'))
            },
          })
        })
        await page.goto(`http://127.0.0.1:${brokenServer.address().port}/iframe.html?id=shared-input--controls-match-the-canvas-in-english&viewMode=story`)
        await page.waitForFunction(() => window.__KN245__.some((phase) => ['errored', 'threw', 'finished'].includes(phase)), null, { timeout: 30000 })
        const phases = await page.evaluate(() => window.__KN245__)
        return phases.includes('errored') || phases.includes('threw') ? null : `the English twin passed with no write: ${phases.join(', ')}`
      } finally {
        await brokenBrowser.close()
        brokenServer.close()
        rmSync(broken, { recursive: true, force: true })
      }
    }),
  )
}

await main()
if (failures.length) {
  process.stderr.write(`\nKN-245 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-245 verify passed.\n')
