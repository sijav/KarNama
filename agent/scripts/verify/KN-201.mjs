#!/usr/bin/env node
// Verifies KN-201: the docs guard sees every export form Storybook indexes, and
// only those.
//
// The card's exit condition is about which exports need documentation, so this
// plants each form in a real story file and requires the guard to demand docs
// for exactly the ones Storybook would index. Both directions matter: missing a
// form lets a story escape documentation, and inventing one demands
// documentation for something that never appears in the sidebar.
//
// The ORACLE is Storybook's own CSF parser, not my reading of it. A plan check
// asserted that export lists are not indexed and exported classes are; the
// installed indexer says the opposite on both counts, and the table below is
// what it actually reported.
//
// NOT read-only: it appends to a story file and restores it in a finally.

import { readFileSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const STORIES = join(WEB, 'src', 'shared', 'language-switch', 'LanguageSwitch.stories.tsx')

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

const guard = () => {
  const result = spawnSync('npx', ['vitest', 'run', '--project', 'unit', 'src/shared/story-docs/guard.test.ts'], {
    cwd: WEB,
    encoding: 'utf8',
    shell: true,
  })
  return { code: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}

/** Appends `addition` to the story file, runs the guard, and always restores. */
const withStory = (addition) => {
  const original = readFileSync(STORIES, 'utf8')
  try {
    writeFileSync(STORIES, original + addition)
    return guard()
  } finally {
    writeFileSync(STORIES, original)
  }
}

check('the guard passes before anything is planted', () => {
  // The positive control. Every case below wants a specific outcome, and a
  // guard that is broken outright supplies failures for free.
  const { code, output } = guard()
  return code === 0 ? null : `the guard fails on the clean tree:\n${output.slice(-1000)}`
})

// Forms Storybook DOES index. An undocumented one must be demanded.
for (const [name, addition, expected] of [
  ['a function declaration', '\nexport function PlantedFn() {\n  return null\n}\n', 'PlantedFn'],
  ['an export list', '\nconst plantedLocal = {}\nexport { plantedLocal }\n', 'plantedLocal'],
  ['a renaming export list', '\nconst plantedInner = {}\nexport { plantedInner as PlantedOut }\n', 'PlantedOut'],
]) {
  check(`a story exported as ${name} is DEMANDED`, () => {
    const { code, output } = withStory(addition)
    if (code === 0) return `the guard passed with an undocumented story exported as ${name}`
    return output.includes(`story "${expected}" has no entry`)
      ? null
      : `it failed, but not for ${expected}:\n${output.slice(-800)}`
  })
}

// Forms Storybook does NOT index. Demanding these would be stricter than
// Storybook, which is its own kind of wrong: it asks an author to document
// something that never appears in the sidebar.
for (const [name, addition] of [
  ['an exported class', '\nexport class PlantedClass {}\n'],
  [
    'the reserved __namedExportsOrder',
    // It must list EVERY story: a partial list makes Storybook's own index
    // generator refuse the file with MultipleIndexingError.
    "\nexport const __namedExportsOrder = ['Sidebar', 'Header', 'Open', 'Switching', 'InEnglish']\n",
  ],
]) {
  check(`${name} is NOT demanded, because Storybook does not index it`, () => {
    const { code, output } = withStory(addition)
    return code === 0 ? null : `the guard demanded documentation for ${name}:\n${output.slice(-800)}`
  })
}

check('the guard reads CSF through Storybook, not through its own AST walk', () => {
  // The structural claim behind all of the above. Two hand-rolled versions
  // drifted from Storybook in one card, so the parser being the source is the
  // fix rather than a detail of it.
  const source = readFileSync(join(WEB, 'src', 'shared', 'story-docs', 'guard.test.ts'), 'utf8')
  if (!/loadCsf/.test(source)) return 'the guard no longer uses Storybook\'s CSF parser'
  return /indexInputs/.test(source) ? null : 'the guard does not take its story list from indexInputs'
})

check('the guard still passes, so nothing above leaked', () => {
  const { code, output } = guard()
  return code === 0 ? null : `the tree was left broken by this verifier:\n${output.slice(-1000)}`
})

if (failures.length) {
  process.stderr.write(`\nKN-201 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-201 verify passed.\n')
