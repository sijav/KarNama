#!/usr/bin/env node
// Verifies KN-005: the theme, both colour schemes, both directions.
//
// Exit condition: a Tokens story renders every colour, spacing and radius token
// with its name and value, the theme switches light and dark and RTL and LTR
// from the Storybook toolbars, and a test asserts no component file contains a
// raw hex colour.
//
// The part worth being careful about is that the design HAS NO DARK TOKENS.
// `DESIGN.md` says so, and it says any dark palette must be labelled in the
// code as derived rather than presented as the design's. A verifier that only
// checked "dark mode works" would happily pass a hand-picked dark palette
// pretending to be Figma's, which is the failure that matters here, so the
// labelling and the derivation are both checked.
//
// Read-only: reads files and runs one test file, writes nothing.

import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const read = (...parts) => readFileSync(join(WEB, ...parts), 'utf8')

const failures = []
const check = (label, run) => {
  try {
    const problem = run()
    if (problem) failures.push(`${label}: ${problem}`)
    else process.stdout.write(`  ok   ${label}\n`)
  } catch (error) {
    failures.push(`${label}: threw ${error.message}`)
  }
}

const design = readFileSync(join(ROOT, 'DESIGN.md'), 'utf8')
const darkMode = read('src', 'theme', 'darkMode.ts')
const theme = read('src', 'theme', 'theme.ts')
const preview = read('.storybook', 'preview.tsx')
const story = read('src', 'theme', 'Tokens.stories.tsx')

check('DESIGN.md still says the design has no dark tokens', () => {
  // If this ever stops being true, the whole derivation is the wrong answer and
  // should be deleted rather than reconciled. The check exists so that change
  // is loud.
  if (!/The file defines light values only/.test(design)) return 'the dark-mode section no longer says the file is light only'
  return /must be labelled in the code as derived|labelled in the code as derived/.test(design)
    ? null
    : 'DESIGN.md no longer requires a derived palette to be labelled as derived'
})

check('the dark palette says, in the code, that it is derived', () => {
  if (!/DERIVED dark palette/.test(darkMode)) return 'darkMode.ts does not announce itself as derived'
  return /The design does not have one/.test(darkMode) ? null : 'it does not say the design has no dark palette'
})

check('every dark value is COMPUTED, none of them typed in', () => {
  // The failure this is for: someone replaces the derivation with a table of
  // hand-picked dark hexes, which looks like design and is not. A hex literal
  // anywhere in this file other than inside a comment is that table.
  const code = darkMode.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
  const hexes = [...code.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((match) => match[0])
  if (hexes.length) return `hand-written colours in darkMode.ts: ${hexes.join(', ')}`
  const derived = [...darkMode.matchAll(/deriveDark(?:Surface)?\(semantic\[/g)].length
  return derived >= 20 ? null : `only ${derived} semantic tokens are derived, expected all twenty`
})

check('the theme takes a scheme and uses it', () => {
  if (!/buildTheme = \(direction: 'rtl' \| 'ltr', scheme: ColorScheme/.test(theme)) return 'buildTheme does not take a colour scheme'
  if (!/scheme === 'dark' \? darkSemantic : semantic/.test(theme)) return 'the palette does not switch on the scheme'
  return /mode: scheme/.test(theme) ? null : "MUI's own palette mode is not following the scheme"
})

check('both toolbars exist, with the derived label on the dark one', () => {
  if (!/locale:\s*\{/.test(preview)) return 'there is no language toolbar'
  if (!/colorScheme:\s*\{/.test(preview)) return 'there is no theme toolbar'
  for (const value of ['light', 'dark', 'system']) {
    if (!new RegExp(`value: '${value}'`).test(preview)) return `the theme toolbar has no ${value} option`
  }
  // The word is the point. A reviewer switching to dark should be told, in the
  // toolbar, that what they are looking at is not the design's.
  return /Dark \(derived\)/.test(preview) ? null : 'the dark option is not labelled as derived in the toolbar'
})

check('the Tokens story reads the THEME, so the toolbar changes what it shows', () => {
  // It used to read `tokens.ts` directly and went on showing the light hexes on
  // a dark page: a Foundations page that disagrees with the app it documents.
  if (!/useTheme\(\)/.test(story)) return 'the story does not read the theme'
  if (/from '\.\/tokens'/.test(story) && /semantic/.test(story.split("from './tokens'")[0] ?? '')) {
    return 'the story still imports the semantic palette directly'
  }
  const families = ['semantic', 'status', 'spacing', 'radius', 'type']
  const missing = families.filter((family) => !new RegExp(`'${family}'`).test(story))
  return missing.length ? `the story has no ${missing.join(', ')} family` : null
})

check('a test asserts no component file contains a raw hex, and it runs', () => {
  const result = spawnSync('npx vitest run src/theme/noLiterals.test.ts --project unit --coverage.enabled=false', {
    cwd: WEB,
    encoding: 'utf8',
    shell: true,
    env: { ...process.env, CI: '1', FORCE_COLOR: '0' },
  })
  if (result.status !== 0) return (result.stdout || result.stderr || '').split('\n').slice(-20).join('\n')
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`
  const count = /Tests\s+(\d+)\s+passed/.exec(output)
  if (!count) return 'the run reported no test count, so it may have scanned nothing'
  // One per source file plus the guards. A scan that found no files would still
  // exit zero, and that has happened in this repository before.
  return Number(count[1]) >= 8 ? null : `only ${count[1]} assertions ran, so the file walk found almost nothing`
})

if (failures.length) {
  process.stderr.write(`\nKN-005 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-005 verify passed.\n')
