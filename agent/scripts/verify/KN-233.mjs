#!/usr/bin/env node
// Verifies KN-233: a trigger that takes the tooltip's ref but drops its props is
// reported in every build, a late trigger is not falsely reported, and a swap
// to a broken trigger is.
//
// Exit condition: a trigger that forwards its ref but drops its other props is
// reported in a PRODUCTION build as well as in development, proved by a story
// with such a wrapper checked on the production Storybook; a trigger that mounts
// after the first render is not falsely reported; a working trigger swapped for
// a broken one is reported; and the ReportsATriggerThatCannotAttach and
// KeepsTheTriggersName stories still pass.
//
// NOT read-only: it edits Tooltip.tsx and restores it in a finally, and builds
// Storybook into a temporary directory it removes.

import { spawn, spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const COMPONENT = join(WEB, 'src', 'shared', 'tooltip', 'Tooltip.tsx')

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
  const result = spawnSync('npx vitest run --project storybook src/shared/tooltip', { cwd: WEB, encoding: 'utf8', shell: true })
  return { code: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}

/** Breaks the component, requires exactly the named story to fail, restores. */
const mutation = (from, to, story) => {
  const original = readFileSync(COMPONENT, 'utf8')
  if (!original.includes(from)) return `the anchor for this mutation is gone:\n${from}`
  try {
    writeFileSync(COMPONENT, original.replace(from, () => to))
    const { code, output } = stories()
    if (code === 0) return `the stories passed with the break, so nothing tests it`
    return output.includes(`× ${story} `) ? null : `it failed, but not in ${story}:\n${output.slice(-600)}`
  } finally {
    writeFileSync(COMPONENT, original)
  }
}

await check('the tooltip stories pass, the three KN-233 stories and the earlier two included', () => {
  const { code, output } = stories()
  if (code !== 0) return `they fail before anything is broken:\n${output.slice(-800)}`
  const passed = ['Reports A Trigger That Drops Its Props', 'Accepts A Trigger That Mounts Late', 'Reports A Trigger Swapped For One That Cannot Attach', 'Reports A Trigger That Cannot Attach', 'Keeps The Triggers Name']
  const missing = passed.filter((name) => output.includes(`× ${name} `))
  return missing.length ? `failed: ${missing.join(', ')}` : null
})

await check('THE CASE: without the props-link check, the ref-only trigger goes unreported', () =>
  mutation(
    "      if (element.getAttribute('aria-describedby')?.split(' ').includes(descriptionId)) return\n",
    '      return\n',
    'Reports A Trigger That Drops Its Props',
  ),
)

await check('without the grace, a trigger that mounts late is falsely reported', () => {
  // The grace timer becomes an immediate, synchronous check: at the first effect
  // the late trigger has not rendered, so it is reported, and the story must
  // catch it. Both ends of the timer are replaced, so the check really runs;
  // the first version of this mutation left it uncalled and broke other stories.
  const original = readFileSync(COMPONENT, 'utf8')
  const immediate = original
    .replace('    grace.current = setTimeout(() => {\n', () => '    grace.current = undefined\n    ;(() => {\n')
    .replace('      )\n    }, 100)\n', () => '      )\n    })()\n')
  if (immediate === original || immediate.includes('}, 100)')) return 'the grace timer changed shape, so this mutation no longer applies'
  try {
    writeFileSync(COMPONENT, immediate)
    const { code, output } = stories()
    if (code === 0) return 'the stories passed with no grace, so nothing tests a late trigger'
    return output.includes('× Accepts A Trigger That Mounts Late ') ? null : `it failed, but not in the late-trigger story:\n${output.slice(-600)}`
  } finally {
    writeFileSync(COMPONENT, original)
  }
})

await check('checked only at mount, a swap to a broken trigger goes unreported', () =>
  mutation('      if (!element) {\n        expectNode()\n        return\n      }\n', '      if (!element) {\n        return\n      }\n', 'Reports A Trigger Swapped For One That Cannot Attach'),
)

await check('the ref-only trigger is reported in a PRODUCTION build too', async () => {
  // The story asserts the report; in the production Storybook its play function
  // runs with no test runner, and a report that were development-only would make
  // that assertion fail there and log it. So zero errors on the built page is
  // the proof the report fires in production.
  const out = mkdtempSync(join(tmpdir(), 'kn233-sb-'))
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
      await page.goto(`http://localhost:${port}/iframe.html?id=shared-tooltip--reports-a-trigger-that-drops-its-props&viewMode=story`)
      await page.waitForFunction(() => ['finished', 'completed', 'errored'].includes(window.__STORYBOOK_PREVIEW__?.currentRender?.phase ?? ''), null, {
        timeout: 20000,
      })
      await page.waitForTimeout(1500)
      return errors.length ? `the production story logged: ${errors.join(' | ').slice(0, 500)}` : null
    } finally {
      await browser.close()
    }
  } finally {
    server?.kill()
    rmSync(out, { recursive: true, force: true })
  }
})

if (failures.length) {
  process.stderr.write(`\nKN-233 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-233 verify passed.\n')
