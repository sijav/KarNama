#!/usr/bin/env node
// Verifies KN-222: the tooltip's 260 is its own, not the app reset's, and the
// story finds the surface by a marker rather than by DOM position.
//
// Exit condition: the tooltip surface sets its own box-sizing, and a story
// rendering it WITHOUT CssBaseline measures 260; the width story finds the
// surface by a marker the component puts on the tooltip slot itself rather than
// by DOM position; and a mutation removing the box-sizing fails the no-reset
// story.
//
// NOT read-only: it edits Tooltip.tsx and restores it in a finally.

import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const COMPONENT = join(WEB, 'src', 'shared', 'tooltip', 'Tooltip.tsx')
const STORIES = join(WEB, 'src', 'shared', 'tooltip', 'Tooltip.stories.tsx')

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

const stories = () => {
  const result = spawnSync('npx vitest run --project storybook src/shared/tooltip', { cwd: WEB, encoding: 'utf8', shell: true })
  return { code: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}

const withBreak = (file, from, to) => {
  const original = readFileSync(file, 'utf8')
  if (!original.includes(from)) return { stale: true, code: null, output: '' }
  try {
    writeFileSync(file, original.replace(from, () => to))
    return stories()
  } finally {
    writeFileSync(file, original)
  }
}

check('the tooltip stories pass as they stand, the no-reset story included', () => {
  const { code, output } = stories()
  if (code !== 0) return `they fail before anything is broken:\n${output.slice(-1000)}`
  return /export const WithoutCssBaseline/.test(readFileSync(STORIES, 'utf8')) ? null : 'there is no story rendering the tip without the reset'
})

check('THE CASE: without its own box-sizing the tip is 284 on a page without the reset, and the story fails', () => {
  const { stale, code, output } = withBreak(COMPONENT, "          boxSizing: 'border-box',\n", '')
  if (stale) return 'the component no longer sets its own box-sizing'
  if (code === 0) return 'the stories passed with the tip depending on the reset, so nothing tests it'
  if (!/Without Css Baseline/.test(output)) return `it failed, but not in the no-reset story:\n${output.slice(-600)}`
  // 260 plus 12 at each side: the exact size a content-box tip draws.
  return /expected 284 to be 260/.test(output) ? null : `it failed, but not at 284:\n${output.slice(-600)}`
})

check('the no-reset story really removes the reset, rather than trusting it is gone', () => {
  // A story that "ran without CssBaseline" while the reset still applied would
  // pass whether or not the tip sets its own sizing. It must assert the page is
  // content-box before it measures anything.
  const source = readFileSync(STORIES, 'utf8')
  const story = /export const WithoutCssBaseline[\s\S]*?\n}\n/.exec(source)?.[0] ?? ''
  if (!/html\.style\.boxSizing = 'content-box'/.test(story)) return 'the story does not undo the reset at html'
  // Storybook's own preview makes body border-box for a padded story, and the
  // first version missed it: green under Vitest, failing in the production build.
  if (!/body\.style\.boxSizing = 'content-box'/.test(story)) return "the story does not undo Storybook's own border-box body"
  // Checked on the tip's own container, the popper, which is the element whose
  // box-sizing the surface would otherwise inherit.
  if (!/getComputedStyle\(popper\)\)\.toHaveProperty\('boxSizing', 'content-box'\)/.test(story)) {
    return 'the story never checks that the tip has nothing above it handing it border-box'
  }
  return /return \(\) =>/.test(story) ? null : 'the story does not put the reset back, so later stories run without it'
})

check('the surface is found by the class on the tooltip slot, not by DOM position', () => {
  const component = readFileSync(COMPONENT, 'utf8')
  if (!/className: TOOLTIP_SURFACE,/.test(component)) return 'the tooltip slot carries no marker class'
  const code = readFileSync(STORIES, 'utf8').replace(/^\s*\/\/.*$/gm, '').replace(/\/\*\*[\s\S]*?\*\//g, '')
  if (/firstElementChild/.test(code)) return 'a story still measures the first child of the popper'
  return /querySelector\(`\.\$\{TOOLTIP_SURFACE\}`\)/.test(code) ? null : 'the stories do not look the surface up by its class'
})

check('MUTATION: taking the marker off the surface fails the width story', () => {
  // With no class on the drawn surface, the stories must fail to find it rather
  // than quietly measure some other element, which is what the old lookup by
  // position would have done.
  const { stale, code } = withBreak(
    COMPONENT,
    '        className: TOOLTIP_SURFACE,\n',
    '',
  )
  if (stale) return 'the marker line changed shape, so this break no longer applies'
  return code === 0 ? 'the stories passed with no marker on the surface, so they are not using it' : null
})

if (failures.length) {
  process.stderr.write(`\nKN-222 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-222 verify passed.\n')
