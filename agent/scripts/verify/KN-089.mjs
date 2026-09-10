#!/usr/bin/env node
// Verifies KN-089: a clean clone can run the gate without a manual browser hunt.
//
// Exit condition: on a machine with no Playwright browsers, a documented single
// command brings the gate to green, KN-003.mjs reports the missing browser BY
// NAME rather than failing opaquely, and the README says what to run.
//
// The missing-browser case is proved by INJECTING the absence rather than by
// uninstalling a browser: `chromiumStatus` takes its existence check as an
// argument for exactly that reason. The deliverable here is a MESSAGE, and a
// message nothing ever renders is a message nobody has read.
//
// Read-only.

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromiumStatus } from './lib/playwright-browser.mjs'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')

const failures = []
const check = (label, run) => {
  try {
    const problem = run()
    if (problem) failures.push(`${label}: ${problem}`)
    else process.stdout.write(`  ok   ${label}\n`)
  } catch (error) {
    failures.push(`${label}: threw ${error instanceof Error ? error.message : String(error)}`)
  }
}

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
const readme = readFileSync(join(ROOT, 'README.md'), 'utf8')
const kn003 = readFileSync(join(ROOT, 'agent', 'scripts', 'verify', 'KN-003.mjs'), 'utf8')

check('the check can tell the browser is present, on this machine', () => {
  // The positive control. A detector that always says "missing" would satisfy
  // every message assertion below while being useless.
  const status = chromiumStatus(WEB)
  return status.installed ? null : `it reports the browser missing on a machine that has it: ${status.reason}`
})

check('THE CASE: a missing browser is reported BY NAME, with the command', () => {
  const status = chromiumStatus(WEB, { exists: () => false })
  if (status.installed) return 'absence was not detected at all'
  const missing = [
    ['the browser by name', /Chromium/],
    ['the path it looked at', /chrome|ms-playwright|executable/i],
    ['the command to run', /npm run setup:browsers/],
    // Without this the reader fixes it once and hits it again on the next clone.
    ['why npm install does not do it', /postinstall/],
  ].filter(([, pattern]) => !pattern.test(status.reason))
  return missing.length ? `the message omits ${missing.map(([name]) => name).join(', ')}` : null
})

check('KN-003 runs that check, and runs it FIRST', () => {
  if (!/chromiumStatus/.test(kn003)) return 'KN-003 does not check for the browser at all'
  // Located by the CALL, not by the label text. Keying off a human-readable
  // label meant that rewording it broke this check while the behaviour was
  // perfectly fine, and a mutation showed exactly that.
  const blocks = [...kn003.matchAll(/\ncheck\(/g)].map((match) => match.index ?? -1)
  if (!blocks.length) return 'KN-003 has no browser check'
  const callAt = kn003.indexOf('chromiumStatus(')
  const firstBlockEnd = blocks.length > 1 ? blocks[1] : kn003.length
  // Ordering is the point: everything slow below it needs the browser, so a
  // late check means minutes of waiting for a failure that was knowable at once.
  return callAt > blocks[0] && callAt < firstBlockEnd
    ? null
    : 'the browser check is not the first check, so the gate fails slowly'
})

check('the documented command exists and installs the right browser', () => {
  const command = pkg.scripts?.['setup:browsers']
  if (!command) return 'there is no setup:browsers script'
  if (!/playwright install/.test(command)) return `setup:browsers does not install a browser: ${command}`
  // Chromium specifically. `playwright install` with no argument fetches three
  // browsers, and the Storybook project configures exactly one.
  return /chromium/.test(command) ? null : `setup:browsers does not name chromium: ${command}`
})

check('the README says what to run, and why npm install is not enough', () => {
  if (!/npm run setup:browsers/.test(readme)) return 'the README never names the command'
  if (!/postinstall/.test(readme)) return 'the README does not say why npm install does not fetch the browser'
  return /npm install/.test(readme) ? null : 'the README does not show the install step the command follows'
})

check('the config and the command agree on which browser', () => {
  // Two places name a browser. If they drift, the gate installs one thing and
  // runs another, and the failure is the opaque one this card is about.
  const vitestConfig = readFileSync(join(WEB, 'vitest.config.ts'), 'utf8')
  const configured = /instances:\s*\[\{\s*browser:\s*'([a-z]+)'/.exec(vitestConfig)?.[1]
  if (!configured) return 'the storybook project does not name a browser instance'
  return pkg.scripts['setup:browsers'].includes(configured)
    ? null
    : `the suite runs ${configured} but setup:browsers installs something else`
})

if (failures.length) {
  process.stderr.write(`\nKN-089 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-089 verify passed.\n')
