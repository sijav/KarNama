#!/usr/bin/env node
// Verifies KN-262: FromArgs asks the Input's own blank rule, so a change to the
// rule reaches the story without the story being edited.
//
// Exit condition: the blank rule lives in one module that the Input and its
// stories both import, with no second copy of the pattern anywhere under src;
// a unit test covers the rule's boundaries; and a mutation that widens the
// rule in that module changes what FromArgs expects without editing the story.
//
// The third clause shows only with an error set, since unset is blank under
// any rule. So a temporary story, FromArgs with error x7, is appended to the
// stories file and run through the Storybook Vitest browser project, where its
// play function runs: with the rule widened until x7 is blank it must still
// pass, because it asks the same rule; with the rule widened AND the old copy
// put back into FromArgs it must fail, which is what gives the first result a
// meaning. Public API only: no Storybook internals.
//
// Backslashes are built from their char code, so no escape in this file is
// rewritten on its way to disk.
//
// NOT read-only: it edits blank.ts and Input.stories.tsx and restores each in
// a finally. Run it on a worktree nobody else is editing.

import { spawnSync } from 'node:child_process'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const DIR = join(WEB, 'src', 'shared', 'input')
const RULE = join(DIR, 'blank.ts')
const STORIES = join(DIR, 'Input.stories.tsx')
const BS = String.fromCharCode(92)
const SHARED = 'const blank = args.error === undefined || isBlank(args.error)'
const COPY = `const blank = args.error === undefined || /^[${BS}s${BS}p{Cf}]*$/u.test(args.error)`
const PROBE = "\nexport const FromArgsWithAnError: Story = { ...FromArgs, args: { ...FromArgs.args, error: 'x7' } }\n"

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

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })

const blankLine = () => readFileSync(RULE, 'utf8').split('\n').find((line) => line.startsWith('const BLANK = ')) ?? ''
const widened = () => blankLine().replace(`${BS}s`, () => `${BS}s${BS}p{L}${BS}p{N}`)

// Run FromArgs with an error set, with the given edits in place for the run.
const fromArgsWithAnError = (edits) => {
  const originals = [RULE, STORIES].map((file) => [file, readFileSync(file, 'utf8')])
  try {
    for (const [file, from, to] of edits) {
      const text = readFileSync(file, 'utf8')
      if (!text.includes(from)) throw new Error(`the anchor for this edit is gone in ${relative(WEB, file)}:\n${from}`)
      writeFileSync(file, text.replace(from, () => to))
    }
    writeFileSync(STORIES, readFileSync(STORIES, 'utf8') + PROBE)
    const result = spawnSync('npx vitest run --project storybook src/shared/input -t "From Args With An Error"', { cwd: WEB, encoding: 'utf8', shell: true })
    const output = `${result.stdout ?? ''}${result.stderr ?? ''}`
    return { ran: /Tests {2}(1 failed|1 passed)/.test(output), passed: result.status === 0, output }
  } finally {
    for (const [file, text] of originals) writeFileSync(file, text)
  }
}

check('the rule is defined once under src, and the Input and FromArgs both import it', () => {
  // Any of the rule's building blocks, in any shape: the property escapes, and
  // a trim()-emptiness test. Allowed in the rule itself and in the catalog
  // test's own, deliberately separate contract, which KN-268 is about.
  const blocks = [`${BS}p{Cf}`, `${BS}p{M}`, 'Default_Ignorable_Code_Point', "trim() === ''", 'trim().length === 0']
  const allowed = ['src/shared/input/blank.ts', 'src/i18n/catalog.test.ts']
  const found = walk(join(WEB, 'src'))
    .filter((path) => /\.(ts|tsx)$/.test(path))
    .filter((path) => blocks.some((block) => readFileSync(path, 'utf8').includes(block)))
    .map((path) => relative(WEB, path).split(BS).join('/'))
  const extra = found.filter((path) => !allowed.includes(path))
  if (extra.length) return `the rule's building blocks also appear in: ${extra.join(', ')}`
  if (!found.includes('src/shared/input/blank.ts')) return 'blank.ts no longer holds the rule'
  if (!readFileSync(join(DIR, 'Input.tsx'), 'utf8').includes("import { isBlank } from './blank'")) return 'the Input does not import the rule'
  const stories = readFileSync(STORIES, 'utf8')
  return stories.includes("import { isBlank } from './blank'") && stories.includes(SHARED) ? null : 'FromArgs does not ask the shared rule'
})

check('a unit test covers the rule at its boundaries', () => {
  const result = spawnSync('npx vitest run --project unit src/shared/input/blank.test.ts', { cwd: WEB, encoding: 'utf8', shell: true })
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`
  if (result.status !== 0) return `it fails:\n${output.slice(-600)}`
  const passed = Number(/Tests {2}(\d+) passed \(\1\)/.exec(output)?.[1] ?? 0)
  return passed >= 40 ? null : `expected at least forty boundary cases, read ${passed}`
})

check('as the files stand, FromArgs with error x7 passes, x7 being a real message', () => {
  const run = fromArgsWithAnError([])
  if (!run.ran) return `the probe story did not run:\n${run.output.slice(-600)}`
  return run.passed ? null : `it fails:\n${run.output.slice(-600)}`
})

check('THE CASE: the rule widened until x7 is blank, story untouched, FromArgs still passes', () => {
  const line = blankLine()
  if (!line) return 'blank.ts has no BLANK line'
  const run = fromArgsWithAnError([[RULE, line, widened()]])
  if (!run.ran) return `the probe story did not run:\n${run.output.slice(-600)}`
  return run.passed ? null : `FromArgs failed when only the rule changed, so it does not follow the rule:\n${run.output.slice(-600)}`
})

check('the control: the same widening with the old copy back in FromArgs fails it', () => {
  const run = fromArgsWithAnError([
    [RULE, blankLine(), widened()],
    [STORIES, SHARED, COPY],
  ])
  if (!run.ran) return `the probe story did not run:\n${run.output.slice(-600)}`
  return run.passed ? 'FromArgs passed with a copy that disagrees with the rule, so passing proves nothing' : null
})

if (failures.length) {
  process.stderr.write(`\nKN-262 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-262 verify passed.\n')
