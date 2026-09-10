#!/usr/bin/env node
// Verifies KN-201: the docs guard sees every export form Storybook indexes, and
// only those, and refuses a component it cannot resolve.
//
// Each case plants a COMPLETE, self-contained story file with its own markdown,
// runs the real guard, and removes everything it wrote. Planting a whole unit
// rather than appending to a real story file is deliberate, KN-204: a kill
// mid-run then leaves UNTRACKED files instead of silently corrupting a tracked
// file that this verifier runs against on every close.
//
// The residual risk, stated accurately because my first version of this comment
// overstated it: an interrupt AFTER all three writes leaves a VALID documented
// story, so the next guard run passes and only `git status` shows the leak. It
// is loud only for the cases whose planted export is deliberately undocumented.
// Interruption is made harmless for the TRACKED file, not harmless in general.
//
// The ORACLE for which forms count is Storybook's own CSF parser, not my
// reading of it. A plan check asserted that export lists are not indexed and
// exported classes are; running `loadCsf(...).parse().indexInputs` says the
// opposite on both counts, and these cases encode what it actually reported.
//
// NOT read-only: it writes and deletes files under apps/web/src/shared/story-docs.

import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const DOCS = join(WEB, 'src', 'shared', 'story-docs')

const TITLE = 'Planted/Case'
const STORY_FILE = join(DOCS, '__planted.stories.tsx')
const EN = join(DOCS, 'en', 'Planted-Case.md')
const FA = join(DOCS, 'fa', 'Planted-Case.md')

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

const guard = () => {
  const result = spawnSync('npx', ['vitest', 'run', '--project', 'unit', 'src/shared/story-docs/guard.test.ts'], {
    cwd: WEB,
    encoding: 'utf8',
    shell: true,
  })
  return { code: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}

/** Docs covering exactly the story `One`, so anything else is undocumented. */
const docsFor = (language) =>
  [`Planted by KN-201.mjs, in ${language}.`, '', '## Stories', '', '### One', '', 'The documented one.', ''].join('\n')

/**
 * Plants a story file whose meta is `metaBody` and which exports `One` plus
 * whatever `extra` adds, with markdown documenting only `One`.
 */
const withPlanted = (metaBody, extra) => {
  try {
    writeFileSync(STORY_FILE, [`const meta = { title: '${TITLE}'${metaBody} }`, 'export default meta', 'export const One = {}', extra, ''].join('\n'))
    writeFileSync(EN, docsFor('English'))
    writeFileSync(FA, docsFor('Persian'))
    return guard()
  } finally {
    for (const path of [STORY_FILE, EN, FA]) if (existsSync(path)) rmSync(path)
  }
}

check('the guard passes before anything is planted', () => {
  // The positive control. Every case below wants a specific outcome, and a
  // guard that is broken outright supplies failures for free.
  const { code, output } = guard()
  return code === 0 ? null : `the guard fails on the clean tree:\n${output.slice(-1000)}`
})

// Forms Storybook DOES index. An undocumented one must be demanded.
for (const [name, extra, expected] of [
  ['a function declaration', 'export function PlantedFn() {\n  return null\n}', 'PlantedFn'],
  ['an export list', 'const plantedLocal = {}\nexport { plantedLocal }', 'plantedLocal'],
  ['a renaming export list', 'const plantedInner = {}\nexport { plantedInner as PlantedOut }', 'PlantedOut'],
]) {
  check(`a story exported as ${name} is DEMANDED`, () => {
    const { code, output } = withPlanted('', extra)
    if (code === 0) return `the guard passed with an undocumented story exported as ${name}`
    return output.includes(`story "${expected}" has no entry`) ? null : `it failed, but not for ${expected}:\n${output.slice(-800)}`
  })
}

// Forms Storybook does NOT index. Demanding these would make the guard stricter
// than Storybook, which asks an author to document something that never appears
// in the sidebar.
for (const [name, extra] of [
  ['an exported class', 'export class PlantedClass {}'],
  // `__namedExportsOrder` must list EVERY story: a partial list makes
  // Storybook's own index generator refuse the file with MultipleIndexingError.
  ['the reserved __namedExportsOrder', "export const __namedExportsOrder = ['One']"],
]) {
  check(`${name} is NOT demanded, because Storybook does not index it`, () => {
    const { code, output } = withPlanted('', extra)
    return code === 0 ? null : `the guard demanded documentation for ${name}:\n${output.slice(-800)}`
  })
}

// THE CLAUSE KN-201 CLAIMED AND NEVER TESTED, which is why KN-204 exists.
// A component the guard cannot resolve must FAIL rather than be skipped: the old
// behaviour skipped the prop check whenever it could not read the component, so
// the less a meta declared, the less it owed.
for (const [name, componentExpression] of [
  ['an inline arrow', ', component: () => null'],
  ['a memo() wrapper', ', component: memo(Thing)'],
]) {
  check(`a component written as ${name} FAILS rather than being skipped`, () => {
    const { code, output } = withPlanted(componentExpression, '')
    if (code === 0) return `the guard skipped prop checking for a component written as ${name}`
    if (!/not a plain identifier/.test(output)) return `it failed, but not for the unreadable component:\n${output.slice(-800)}`
    // NAMING THE FILE is the card's wording, and the guard reported only the
    // title until a plan check pointed out the difference. A title identifies
    // the file only if you know the mapping; a path is what somebody opens.
    return output.includes('__planted.stories.tsx') ? null : 'it failed without naming the file the bad component is in'
  })
}

check('a meta with NO component at all is still legitimate', () => {
  // The other side of that boundary. Absent is not the same as unreadable, and
  // a docs-only entry has no component to check.
  const { code, output } = withPlanted('', '')
  return code === 0 ? null : `a meta with no component was rejected:\n${output.slice(-800)}`
})

check('the guard reads CSF through Storybook, not through its own AST walk', () => {
  // The structural claim behind all of the above. Two hand-rolled versions
  // drifted from Storybook in one card, so the parser being the source is the
  // fix rather than a detail of it.
  const source = readFileSync(join(DOCS, 'guard.test.ts'), 'utf8')
  if (!/loadCsf/.test(source)) return "the guard no longer uses Storybook's CSF parser"
  return /indexInputs/.test(source) ? null : 'the guard does not take its story list from indexInputs'
})

check('nothing was left behind, and the guard still passes', () => {
  for (const path of [STORY_FILE, EN, FA]) {
    if (existsSync(path)) return `${path} was left behind by this verifier`
  }
  const { code, output } = guard()
  return code === 0 ? null : `the tree was left broken by this verifier:\n${output.slice(-1000)}`
})

if (failures.length) {
  process.stderr.write(`\nKN-201 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-201 verify passed.\n')
