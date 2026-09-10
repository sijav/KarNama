#!/usr/bin/env node
// Verifies KN-220: under Vitest, the Checkbox Hover story cannot pass without
// its real pointer.
//
// Exit condition: under Vitest the Hover story imports the pointer API without
// a catch and fails loudly if it cannot, the published Storybook still renders
// it as a canvas with no error, and a mutation making the import fail under
// Vitest fails the story rather than passing it.
//
// The story used to catch any rejected import and return, which is the right
// behaviour in Storybook's own UI and exactly the wrong one under Vitest. It
// now decides on `__vitest_browser__` BEFORE importing, the flag Storybook's
// own addon checks, and imports without a catch.
//
// NOT read-only: it edits Checkbox.stories.tsx and restores it in a finally.

import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const STORIES = join(WEB, 'src', 'shared', 'checkbox', 'Checkbox.stories.tsx')

const IMPORT = "    const browser = await import('vitest/browser')\n"
const REJECTING = "    const browser = await import('vitest/browser').then(() => { throw new Error('simulated: the runner cannot load its pointer') })\n"

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
  const result = spawnSync('npx vitest run --project storybook src/shared/checkbox', { cwd: WEB, encoding: 'utf8', shell: true })
  return { code: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}

const withStories = (mutate, body) => {
  const original = readFileSync(STORIES, 'utf8')
  const mutated = mutate(original)
  if (mutated === original) return 'the mutation found nothing to change, so the story changed shape'
  try {
    writeFileSync(STORIES, mutated)
    return body()
  } finally {
    writeFileSync(STORIES, original)
  }
}

check('the Checkbox stories pass as they stand', () => {
  const { code, output } = stories()
  return code === 0 ? null : `they fail before anything is broken:\n${output.slice(-1000)}`
})

check('THE CASE: an import that fails under Vitest fails the Hover story', () =>
  withStories(
    (source) => source.replace(IMPORT, () => REJECTING),
    () => {
      const { code, output } = stories()
      if (code === 0) return 'Hover passed with its pointer unavailable, so it can go green having tested nothing'
      return /Hover/.test(output) && /simulated/.test(output) ? null : `it failed, but not on the pointer:\n${output.slice(-600)}`
    },
  ),
)

check('CONTROL: the old catch-and-return swallowed that same failure', () =>
  // The mutation above is only evidence if the code KN-220 replaced would have
  // passed it. So the old shape goes back in, with the same rejection, and the
  // story must PASS: that pass is the defect this card closed.
  //
  // The runner-detection block is removed by its shape, so this keeps working
  // after KN-225 replaced the Vitest internal it first checked with the
  // repository's own flag.
  withStories(
    (source) =>
      source
        .replace(/ {4}if \(!\('__KARNAMA_STORY_TEST__' in globalThis\)\) \{\n[\s\S]*?\n {4}\}\n/, () => '')
        .replace(IMPORT, () => REJECTING.replace('\n', '.catch(() => null)\n') + '    if (!browser) return\n'),
    () => {
      const { code, output } = stories()
      return code === 0 ? null : `the old shape failed too, so the mutation is not what distinguishes them:\n${output.slice(-600)}`
    },
  ),
)

check('the Storybook-UI branch is decided by the flag, before the import', () => {
  const source = readFileSync(STORIES, 'utf8').replace(/^\s*\/\/.*$/gm, '')
  // The repository's own flag since KN-225, not the Vitest internal.
  const flag = source.indexOf("if (!('__KARNAMA_STORY_TEST__' in globalThis))")
  const load = source.indexOf("await import('vitest/browser')")
  if (flag < 0) return 'the story no longer checks the story-test flag'
  if (load < 0 || load < flag) return 'the import is not after the flag check'
  return /import\('vitest\/browser'\)\s*\.catch/.test(source) ? 'the import is caught again' : null
})

check('the real pointer still runs under Vitest: KN-013 passes, mutations included', () => {
  // If the flag were ever absent under Vitest, the story would return before
  // hovering and KN-013's two hover mutations would stop failing. So KN-013
  // passing is the proof the flag is set where it has to be.
  const result = spawnSync('node agent/scripts/verify/KN-013.mjs', { cwd: ROOT, encoding: 'utf8', shell: true })
  return result.status === 0 ? null : `${result.stdout ?? ''}${result.stderr ?? ''}`.slice(-800)
})

if (failures.length) {
  process.stderr.write(`\nKN-220 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-220 verify passed.\n')
