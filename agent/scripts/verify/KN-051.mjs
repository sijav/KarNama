#!/usr/bin/env node
// Verifies KN-051: the app and Storybook are published to Pages as two sites.
//
// Exit condition: the app loads at its Pages URL, a deep link works on a hard
// refresh, Storybook is reachable at /storybook/, and the deploy runs from a
// push to main with no manual step.
//
// Three of those four are facts about a LIVE site, so this fetches it. A
// verifier that only read the workflow file would pass on a deploy that never
// ran, which is the whole failure mode: the YAML always looks right.
//
// Read-only, but it needs the network.

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const SITE = 'https://sijav.github.io/KarNama'
const WORKFLOW = join(ROOT, '.github', 'workflows', 'pages.yml')

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

const get = async (path) => {
  const response = await fetch(`${SITE}${path}`, { redirect: 'follow' })
  return { status: response.status, body: await response.text() }
}

await check('the app loads at its Pages URL', async () => {
  const { status, body } = await get('/')
  if (status !== 200) return `GET ${SITE}/ returned ${status}`
  return /<div id="root">|karnama|کارنما/i.test(body) ? null : 'the page loaded but is not the app shell'
})

await check('its assets resolve under the repository base path', async () => {
  // The failure this base path exists to prevent, and the one that is invisible
  // locally: a dev server serves from `/`, Pages serves from `/KarNama/`, so a
  // wrong base 404s every asset while looking perfect on a laptop.
  const { body } = await get('/')
  const asset = /\/KarNama\/assets\/[^"']+\.js/.exec(body)?.[0]
  if (!asset) return 'no asset is referenced under /KarNama/, so the base path is wrong'
  const { status } = await get(asset.replace('/KarNama', ''))
  return status === 200 ? null : `the app references ${asset}, which returns ${status}`
})

await check('a deep link works on a hard refresh', async () => {
  // Pages has no server-side routing: the request is for a file that does not
  // exist, and the 404 has to be the app shell so the client router can take it.
  const { status, body } = await get('/board/some-deep-route')
  if (!/<div id="root">|karnama|کارنما/i.test(body)) {
    return `a deep link returned ${status} and did not serve the app shell`
  }
  return null
})

await check('Storybook is reachable at /storybook/, as its OWN site', async () => {
  const { status, body } = await get('/storybook/')
  if (status !== 200) return `GET ${SITE}/storybook/ returned ${status}`
  return /storybook/i.test(body) ? null : 'something is served at /storybook/ but it is not Storybook'
})

await check("Storybook's preview iframe resolves under its own base", async () => {
  // The trap. Storybook's MANAGER uses relative paths and would look fine, but
  // the preview iframe is built by Vite and emits absolute asset URLs, so
  // without a base of its own every story 404s while the shell still renders.
  const { body } = await get('/storybook/iframe.html')
  const asset = /\/KarNama\/storybook\/assets\/[^"']+\.js/.exec(body)?.[0]
  if (!asset) return 'the preview iframe references no asset under /KarNama/storybook/, so its base is wrong'
  const { status } = await get(asset.replace('/KarNama', ''))
  return status === 200 ? null : `the preview references ${asset}, which returns ${status}`
})

await check('the deploy runs from a push to main, with no manual step', () => {
  const workflow = readFileSync(WORKFLOW, 'utf8')
  if (!/on:\s*\n\s*push:\s*\n\s*branches:\s*\[main\]/.test(workflow)) {
    return 'the workflow does not trigger on a push to main'
  }
  if (!/actions\/deploy-pages/.test(workflow)) return 'the workflow never deploys to Pages'
  // Both sites are built from the same run, so one cannot silently go stale.
  if (!/build-storybook/.test(workflow)) return 'the workflow does not build Storybook'
  return /cancel-in-progress:\s*false/.test(workflow)
    ? null
    : 'the deploy is cancellable in flight, which can leave the site on a half-uploaded artifact'
})

if (failures.length) {
  process.stderr.write(`\nKN-051 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-051 verify passed.\n')
