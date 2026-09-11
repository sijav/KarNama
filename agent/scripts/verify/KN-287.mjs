#!/usr/bin/env node
// Verifies KN-287: the Input's message line is drawn only when there is a
// helper or an error, as the screens draw it: 64 tall without, 90 with.
//
// Exit condition: an Input with neither a helper nor an error draws no message
// line and is 64 tall, as the 91 screen instances draw it; with a helper or an
// error it is 90, the file's variants; an error appearing on a field without a
// helper adds the line with its message; an error on a field that has a helper
// replaces the helper with the error's message and the field's
// aria-describedby then names the error, and clearing the error brings the
// helper back; a blank error still draws no line; stories assert the 64 and the
// 90, the line appearing with the error, and the error replacing a helper,
// with a mutation that keeps the helper over the error failing by name,
// replacing ErrorDoesNotMoveTheField and WithoutAHelper's reserved line; every
// other place that asserts the reserved line is changed with it, KN-011's
// verifier and both languages' story docs included; DESIGN.md records the
// owner's reversal of KN-011's decision; and the Input's comment about the line
// always keeping its height is corrected.
//
// The heights are read in a production Storybook served here, in Playwright's
// Chromium, in fa-IR and en-US, and the bare field's alert in Chromium's
// accessibility tree over the DevTools protocol.
//
// NOT read-only: it edits Input.tsx for its mutations and restores it in a
// finally, and it runs KN-011's and KN-286's verifiers, which do the same.

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

const HELPER = '        {error === undefined ? helper : null}\n'
const MARGIN = "          marginTop: message === undefined ? 0 : `${spacing['2xs']}px`,\n"
const COLUMN = "    <Box sx={{ display: 'flex', flexDirection: 'column' }}>\n"
const STORIES_NEEDED = ['WithoutAHelper', 'ErrorAddsTheLine', 'ErrorReplacesTheHelper', 'ErrorAnnouncedWhileTyping']

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
// A story's export as Storybook names it: WithoutAHelper is Without A Helper.
const spaced = (name) => name.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
const ran = (output, mark, name) => output.split('\n').some((line) => mark.test(line) && line.includes(`> ${spaced(name)}`))

const mutation = (from, to, what, story) => {
  const original = readFileSync(COMPONENT, 'utf8')
  if (!original.includes(from)) return `the anchor for this mutation is gone:\n${from}`
  try {
    writeFileSync(COMPONENT, original.replace(from, () => to))
    const { code, output } = stories()
    if (code === 0) return `the stories passed with ${what}`
    return ran(output, /[×✗]/, story) ? null : `it failed, but not in ${story}:\n${output.slice(-500)}`
  } finally {
    writeFileSync(COMPONENT, original)
  }
}

const verifier = (id) => {
  const result = spawnSync('node', [join(ROOT, 'agent', 'scripts', 'verify', `${id}.mjs`)], { cwd: ROOT, encoding: 'utf8' })
  return result.status === 0 ? null : `${id} fails:\n${`${result.stdout}${result.stderr}`.slice(-600)}`
}

const build = () => {
  const out = mkdtempSync(join(tmpdir(), 'kn287-'))
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

// In the page: each Input's height, its line's height and text, and whether
// it describes the field.
const measure = () =>
  [...document.querySelectorAll('#storybook-root input')].map((box) => {
    const whole = box.parentElement.parentElement
    const line = whole.lastElementChild
    return { whole: whole.getBoundingClientRect().height, line: line.getBoundingClientRect().height, text: line.textContent, described: box.hasAttribute('aria-describedby'), alerts: line.querySelectorAll('[role="alert"]').length }
  })

const main = async () => {
  await check('the Input stories pass, WithoutAHelper, ErrorAddsTheLine, ErrorReplacesTheHelper and ErrorAnnouncedWhileTyping by name, and ErrorDoesNotMoveTheField is gone', () => {
    const source = readFileSync(STORIES, 'utf8')
    if (/export const ErrorDoesNotMoveTheField/.test(source)) return 'ErrorDoesNotMoveTheField is still there'
    const { code, output } = stories()
    if (code !== 0) return `they fail:\n${output.slice(-800)}`
    const missed = STORIES_NEEDED.filter((name) => !ran(output, /✓/, name))
    return missed.length ? `these did not run and pass: ${missed.join(', ')}` : null
  })

  await check('THE CASE: the helper kept over the error fails ErrorReplacesTheHelper by name', () => mutation(HELPER, '        {helper}\n', 'the helper kept over the error', 'ErrorReplacesTheHelper'))
  await check('the line keeping a height when empty, the reserved line back, fails WithoutAHelper by name', () =>
    mutation(MARGIN, `${MARGIN}          minHeight: \`\${body.lineHeight}px\`,\n`, 'a reserved line', 'WithoutAHelper'),
  )
  await check('the gap back on the column fails WithoutAHelper by name', () =>
    mutation(COLUMN, "    <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${spacing['2xs']}px` }}>\n", 'the gap back', 'WithoutAHelper'),
  )

  const out = build()
  const server = await serve(out)
  const browser = await chromium.launch()
  try {
    await check('in a production build, in both languages: bare 64 with a zero line and its alert in the tree, a helper 90, an error 90 with its line', async () => {
      const problems = []
      for (const locale of ['fa-IR', 'en-US']) {
        const read = async (story) => {
          const page = await browser.newPage()
          try {
            await page.goto(`http://127.0.0.1:${server.address().port}/iframe.html?id=shared-input--${story}&viewMode=story&globals=locale:${locale}`)
            await page.waitForFunction(() => window.__STORYBOOK_PREVIEW__?.currentRender?.phase === 'finished', null, { timeout: 30000 })
            const client = await page.context().newCDPSession(page)
            await client.send('Accessibility.enable')
            const { nodes } = await client.send('Accessibility.getFullAXTree')
            return { fields: await page.evaluate(measure), alerts: nodes.filter((node) => node.role?.value === 'alert' && !node.ignored).length }
          } finally {
            await page.close()
          }
        }
        const bare = await read('without-a-helper')
        const adds = await read('error-adds-the-line')
        const replaces = await read('error-replaces-the-helper')
        process.stdout.write(`       ${locale}: bare ${JSON.stringify(bare.fields.map((field) => [field.whole, field.line]))}, alerts in the tree ${bare.alerts}; adds ${JSON.stringify(adds.fields.map((field) => [field.whole, field.line]))}; replaces ${JSON.stringify(replaces.fields.map((field) => [field.whole, field.line, field.text]))}\n`)
        const wrong = []
        for (const field of bare.fields) {
          if (field.whole !== 64 || field.line !== 0 || field.described || field.alerts !== 1) wrong.push(`bare ${JSON.stringify(field)}`)
        }
        if (bare.alerts !== bare.fields.length) wrong.push(`${bare.alerts} alerts in the tree for ${bare.fields.length} bare fields`)
        const [plain, failing] = adds.fields
        if (plain?.whole !== 64) wrong.push(`the field without an error is ${plain?.whole}`)
        if (failing?.whole !== 90 || failing?.line !== 22 || !failing?.described) wrong.push(`the field with an error ${JSON.stringify(failing)}`)
        const [both] = replaces.fields
        if (both?.whole !== 90 || both?.line !== 22) wrong.push(`the field with a helper and an error ${JSON.stringify(both)}`)
        if (wrong.length) problems.push(`${locale}: ${wrong.join('; ')}`)
      }
      return problems.length ? problems.join('\n    ') : null
    })
  } finally {
    await browser.close()
    server.close()
    rmSync(out, { recursive: true, force: true })
  }

  await check("KN-011's verifier passes, its reserved-line clause turned to the owner's rule", () => verifier('KN-011'))
  await check("KN-286's verifier passes, the alert still there when the line collapses", () => verifier('KN-286'))

  await check('DESIGN.md says KN-287 built the reversal and names the blank helper; the docs and the comment no longer say the line is reserved', () => {
    const design = readFileSync(join(ROOT, 'DESIGN.md'), 'utf8').replace(/\s+/g, ' ')
    const problems = []
    if (!/This reverses KN-011's decision, and KN-287 built it/.test(design)) problems.push('DESIGN.md does not say KN-287 built it')
    if (!/A blank helper is no helper by the same rule/.test(design)) problems.push("DESIGN.md's blank rule does not name the helper")
    for (const locale of ['en', 'fa']) {
      const doc = readFileSync(join(WEB, 'src', 'shared', 'story-docs', locale, 'Shared-Input.md'), 'utf8')
      if (/ErrorDoesNotMoveTheField|holds its place|جایش را نگه می‌دارد/.test(doc)) problems.push(`the ${locale} docs still describe the reserved line`)
      if (!/### ErrorAddsTheLine/.test(doc) || !/### ErrorReplacesTheHelper/.test(doc)) problems.push(`the ${locale} docs lack the new stories`)
    }
    const component = readFileSync(COMPONENT, 'utf8')
    if (/always keeps its height/.test(component)) problems.push('the comment still says the line always keeps its height')
    return problems.length ? problems.join('; ') : null
  })
}

await main()
if (failures.length) {
  process.stderr.write(`\nKN-287 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-287 verify passed.\n')
