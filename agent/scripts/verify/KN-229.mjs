#!/usr/bin/env node
// Verifies KN-229: Storybook's Controls table knows the Tooltip's children again.
//
// Exit condition: Storybook's docgen is configured with the same children rule
// as the guard, the other defaults it depends on kept; a production Storybook
// build reports children among the Tooltip's argTypes, checked from the built
// page rather than the config; and a mutation dropping the option makes that
// check fail.
//
// "Reports children" means with its docgen TYPE, not merely a row: Storybook
// also infers an argType from a story's args, so a children row existed even
// while docgen was hiding the prop. What was lost was its type and the
// required flag, so that is what is checked.
//
// NOT read-only: it edits .storybook/main.ts and restores it in a finally, and
// builds Storybook twice into temporary directories it removes.

import { spawn, spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const MAIN = join(WEB, '.storybook', 'main.ts')
const OPTION = '      skipChildrenPropWithoutDoc: false,\n'

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

/** Builds Storybook for production and returns the argTypes of each story id. */
const builtArgTypes = async (ids) => {
  const out = mkdtempSync(join(tmpdir(), 'kn229-sb-'))
  let server
  try {
    const build = spawnSync(`npx storybook build --output-dir "${out}" --quiet`, { cwd: WEB, encoding: 'utf8', shell: true })
    if (build.status !== 0) throw new Error(`Storybook did not build:\n${`${build.stdout}${build.stderr}`.slice(-600)}`)
    const port = 6100 + Math.floor(Math.random() * 800)
    server = spawn('python', ['-m', 'http.server', String(port), '--bind', 'localhost', '--directory', out], { stdio: 'ignore' })
    await new Promise((resolve) => setTimeout(resolve, 1500))
    const { chromium } = createRequire(join(WEB, 'package.json'))('playwright')
    const browser = await chromium.launch()
    try {
      const result = {}
      for (const id of ids) {
        const page = await browser.newPage()
        await page.goto(`http://localhost:${port}/iframe.html?id=${id}&viewMode=story`)
        await page.waitForFunction(() => window.__STORYBOOK_PREVIEW__?.currentRender?.story?.argTypes, null, { timeout: 20000 })
        result[id] = await page.evaluate(() =>
          Object.fromEntries(
            Object.entries(window.__STORYBOOK_PREVIEW__.currentRender.story.argTypes).map(([name, argType]) => [
              name,
              { type: argType.table?.type?.summary ?? null, required: argType.type?.required ?? null },
            ]),
          ),
        )
        await page.close()
      }
      return result
    } finally {
      await browser.close()
    }
  } finally {
    server?.kill()
    rmSync(out, { recursive: true, force: true })
  }
}

await check("main.ts restates Storybook's docgen defaults and adds the children rule", () => {
  const main = readFileSync(MAIN, 'utf8')
  const missing = ['shouldExtractLiteralValuesFromEnum: true', 'shouldRemoveUndefinedFromOptional: true', "includes('node_modules')", 'skipChildrenPropWithoutDoc: false'].filter(
    (part) => !main.includes(part),
  )
  return missing.length ? `main.ts does not set ${missing.join(', ')}` : null
})

await check("THE CASE: the built Tooltip reports children with its type and required flag, and no DOM props leak in", async () => {
  const built = await builtArgTypes(['shared-tooltip--on-hover', 'shared-checkbox--unchecked'])
  const children = built['shared-tooltip--on-hover'].children
  if (!children?.type?.startsWith('ReactElement')) return `children has no docgen type in the built page: ${JSON.stringify(children)}`
  if (children.required !== true) return 'children is not marked required'
  // The restated propFilter: without it every table fills with the DOM's props.
  const checkbox = Object.keys(built['shared-checkbox--unchecked'])
  return checkbox.includes('onClick') || checkbox.length > 12 ? `DOM props leaked into the Checkbox table: ${checkbox.join(', ')}` : null
})

await check('MUTATION: dropping the option loses children\'s type in the built page', async () => {
  const original = readFileSync(MAIN, 'utf8')
  if (!original.includes(OPTION)) return 'the option line is gone, so this mutation no longer applies'
  try {
    writeFileSync(MAIN, original.replace(OPTION, () => ''))
    const built = await builtArgTypes(['shared-tooltip--on-hover'])
    const children = built['shared-tooltip--on-hover'].children
    return children?.type ? `children kept its type without the option (${children.type}), so the check above cannot fail` : null
  } finally {
    writeFileSync(MAIN, original)
  }
})

if (failures.length) {
  process.stderr.write(`\nKN-229 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-229 verify passed.\n')
