#!/usr/bin/env node
// Verifies KN-225: the Hover story knows a test runner by a flag this
// repository owns, and a missing flag fails rather than passes.
//
// Exit condition: the story checks a flag this repository sets in the storybook
// project's Vitest setup, not a Vitest internal; the published Storybook still
// takes the canvas branch with no error; and a mutation removing the flag from
// the setup file fails the Hover story under npm test rather than passing it.
//
// The published half is checked on the production build in headless Chromium,
// because that is the build users open, and the dev server's Storybook differs
// from it in exactly the ways that hid KN-222's first version.
//
// NOT read-only: it edits .storybook/vitest.setup.ts and restores it in a
// finally, and builds Storybook into a temporary directory it removes.

import { spawn, spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const SETUP = join(WEB, '.storybook', 'vitest.setup.ts')
const STORIES = join(WEB, 'src', 'shared', 'checkbox', 'Checkbox.stories.tsx')
const FLAG = 'Object.assign(globalThis, { __KARNAMA_STORY_TEST__: true })\n'

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
  const result = spawnSync('npx vitest run --project storybook src/shared/checkbox', { cwd: WEB, encoding: 'utf8', shell: true })
  return { code: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}

await check('the Checkbox stories pass with the flag set', () => {
  const { code, output } = stories()
  return code === 0 ? null : `they fail before anything is broken:\n${output.slice(-800)}`
})

await check('the story reads the repository flag and no Vitest internal', () => {
  const code = readFileSync(STORIES, 'utf8').replace(/^\s*\/\/.*$/gm, '')
  if (/__vitest_browser__/.test(code)) return 'the story still reads the Vitest internal'
  if (!code.includes("'__KARNAMA_STORY_TEST__' in globalThis")) return 'the story does not read the repository flag'
  return readFileSync(SETUP, 'utf8').includes(FLAG) ? null : 'the Vitest setup does not set the flag'
})

await check('THE CASE: removing the flag from the setup fails Hover under npm test', () => {
  const original = readFileSync(SETUP, 'utf8')
  if (!original.includes(FLAG)) return 'the flag line is gone, so this mutation no longer applies'
  try {
    writeFileSync(SETUP, original.replace(FLAG, () => ''))
    const { code, output } = stories()
    if (code === 0) return 'Hover passed with no flag, which is the silent pass this card closes'
    return /without the story-test flag/.test(output) ? null : `it failed, but not on the missing flag:\n${output.slice(-600)}`
  } finally {
    writeFileSync(SETUP, original)
  }
})

await check('the published Storybook takes the canvas branch with no error', async () => {
  const out = mkdtempSync(join(tmpdir(), 'kn225-sb-'))
  let server
  try {
    const build = spawnSync(`npx storybook build --output-dir "${out}" --quiet`, { cwd: WEB, encoding: 'utf8', shell: true })
    if (build.status !== 0) return `Storybook did not build:\n${`${build.stdout}${build.stderr}`.slice(-600)}`
    const port = 6100 + Math.floor(Math.random() * 800)
    server = spawn('python', ['-m', 'http.server', String(port), '--bind', 'localhost', '--directory', out], { stdio: 'ignore' })
    await new Promise((resolve) => setTimeout(resolve, 1500))
    const { chromium } = createRequire(join(WEB, 'package.json'))('playwright')
    const browser = await chromium.launch()
    try {
      const page = await browser.newPage()
      const errors = []
      page.on('pageerror', (error) => errors.push(error.message))
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text())
      })
      await page.goto(`http://localhost:${port}/iframe.html?id=shared-checkbox--hover&viewMode=story`)
      // Storybook's own verdict that the render and its play function ended.
      await page.waitForFunction(() => ['finished', 'completed', 'errored'].includes(window.__STORYBOOK_PREVIEW__?.currentRender?.phase ?? ''), null, {
        timeout: 20000,
      })
      if (!(await page.locator('input[type=checkbox]').count())) return 'the Hover story rendered no checkbox'
      return errors.length ? `the published Hover story logged errors: ${errors.join(' | ').slice(0, 400)}` : null
    } finally {
      await browser.close()
    }
  } finally {
    server?.kill()
    rmSync(out, { recursive: true, force: true })
  }
})

if (failures.length) {
  process.stderr.write(`\nKN-225 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-225 verify passed.\n')
