#!/usr/bin/env node
// Verifies KN-286: an Input's error is announced when it appears on a focused
// field, through a live region that was in the page before it.
//
// Exit condition: an error that appears on a focused Input is announced
// through a live region present before the error arrives, and the field keeps
// aria-invalid and its aria-describedby association; clearing the error
// restores the helper as the description or removes aria-describedby when
// there is none; a story asserts the live region's role and that it carries
// the error text after the error is set on a focused field, and a mutation
// removing the live region fails it by name.
//
// The accessibility tree is Chromium's own, read over the DevTools protocol
// in a production Storybook served here. It shows the live region's role and
// politeness and what it holds; it does not show what a given screen reader
// speaks, which no check here can.
//
// NOT read-only: it edits Input.tsx for its mutation and restores it in a
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
const STORY = 'Error Announced While Typing'
const { chromium } = createRequire(join(WEB, 'package.json'))('playwright')

const REGION = '        <span role="alert">{error}</span>\n        {error === undefined ? helperText : null}\n'
const PLAIN = '        {message}\n'
const ERRORS = { 'fa-IR': 'این فیلد نمی‌تواند خالی باشد', 'en-US': 'This field cannot be empty' }

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
const ran = (output, mark) => output.split('\n').some((line) => mark.test(line) && line.includes(`> ${STORY}`))

const build = () => {
  const out = mkdtempSync(join(tmpdir(), 'kn286-'))
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

// From Chromium's accessibility tree: the alert inside the first field's
// wrapper, its politeness and atomicity and the text beneath it, and the
// textbox's invalid state and description.
const readTree = async (client) => {
  const { nodes } = await client.send('Accessibility.getFullAXTree')
  const byId = new Map(nodes.map((node) => [node.nodeId, node]))
  const prop = (node, name) => node?.properties?.find((property) => property.name === name)?.value?.value
  const textUnder = (node) => (node?.childIds ?? []).map((id) => byId.get(id)).map((child) => (child?.role?.value === 'StaticText' ? child.name?.value ?? '' : textUnder(child))).join('')
  const alert = nodes.find((node) => node.role?.value === 'alert' && !node.ignored)
  const box = nodes.find((node) => node.role?.value === 'textbox' && !node.ignored)
  return {
    alert: alert ? { live: prop(alert, 'live'), atomic: prop(alert, 'atomic'), text: textUnder(alert) } : null,
    invalid: prop(box, 'invalid'),
    description: box?.description?.value ?? '',
  }
}

const main = async () => {
  await check('the Input stories pass, ErrorAnnouncedWhileTyping by name', () => {
    const { code, output } = stories()
    if (code !== 0) return `they fail:\n${output.slice(-800)}`
    return ran(output, /✓/) ? null : 'ErrorAnnouncedWhileTyping did not run and pass'
  })

  await check('THE CASE: the live region removed, the error written into the line as before, fails ErrorAnnouncedWhileTyping by name', () => {
    const original = readFileSync(COMPONENT, 'utf8')
    if (!original.includes(REGION)) return `the region is not where the mutation expects it:\n${REGION}`
    try {
      writeFileSync(COMPONENT, original.replace(REGION, () => PLAIN))
      const { code, output } = stories()
      if (code === 0) return 'the stories passed with no live region'
      return ran(output, /[×✗]/) ? null : `it failed, but not in ErrorAnnouncedWhileTyping:\n${output.slice(-500)}`
    } finally {
      writeFileSync(COMPONENT, original)
    }
  })

  const out = build()
  const server = await serve(out)
  const browser = await chromium.launch()
  try {
    await check('in the accessibility tree, in both languages: an empty assertive alert before the error, then the error in it on a focused field that is invalid and described by it', async () => {
      const problems = []
      for (const locale of ['fa-IR', 'en-US']) {
        const page = await browser.newPage()
        try {
          await page.goto(`http://127.0.0.1:${server.address().port}/iframe.html?id=shared-input--error-announced-while-typing&viewMode=story&globals=locale:${locale}`)
          await page.waitForFunction(() => window.__STORYBOOK_PREVIEW__?.currentRender?.phase === 'finished', null, { timeout: 30000 })
          const client = await page.context().newCDPSession(page)
          await client.send('Accessibility.enable')
          const field = page.locator('#storybook-root [data-testid="described"] input')
          const before = await readTree(client)
          await field.click()
          await page.keyboard.press('Control+A')
          await page.keyboard.press('Backspace')
          await page.waitForTimeout(300)
          const focused = await field.evaluate((element) => element === document.activeElement)
          const after = await readTree(client)
          process.stdout.write(`       ${locale}: before ${JSON.stringify(before.alert)}; after ${JSON.stringify(after.alert)}, invalid ${after.invalid}, described by ${JSON.stringify(after.description)}\n`)
          const wrong = []
          if (!before.alert) wrong.push('no alert in the tree before the error')
          else {
            if (before.alert.live !== 'assertive') wrong.push(`the alert is live ${before.alert.live}`)
            if (before.alert.atomic !== true) wrong.push(`the alert is atomic ${before.alert.atomic}`)
            if (before.alert.text !== '') wrong.push(`the alert already holds ${JSON.stringify(before.alert.text)}`)
          }
          if (!focused) wrong.push('the field lost focus')
          if (after.alert?.text !== ERRORS[locale]) wrong.push(`the alert holds ${JSON.stringify(after.alert?.text)}`)
          if (after.invalid !== 'true' && after.invalid !== true) wrong.push(`the field is invalid ${after.invalid}`)
          if (after.description !== ERRORS[locale]) wrong.push(`the field is described by ${JSON.stringify(after.description)}`)
          if (wrong.length) problems.push(`${locale}: ${wrong.join('; ')}`)
        } finally {
          await page.close()
        }
      }
      return problems.length ? problems.join('\n    ') : null
    })
  } finally {
    await browser.close()
    server.close()
    rmSync(out, { recursive: true, force: true })
  }

  await check("DESIGN.md's error section says the error is announced as it appears, and that KN-287 keeps the region", () => {
    const design = readFileSync(join(ROOT, 'DESIGN.md'), 'utf8')
    const section = (/### An Input's error needs a message\n([\s\S]*?)\n### /.exec(design)?.[1] ?? '').replace(/\s+/g, ' ')
    const missing = [
      ['the announcement', /an error is announced as it appears/],
      ['the region', /`role="alert"` inside the message line, in the page from the first render/],
      ['KN-287 keeping it', /KN-287, keeps the empty region mounted and exposed/],
    ].filter(([, pattern]) => !pattern.test(section))
    return missing.length ? `the section does not say ${missing.map(([what]) => what).join(', ')}` : null
  })
}

await main()
if (failures.length) {
  process.stderr.write(`\nKN-286 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-286 verify passed.\n')
