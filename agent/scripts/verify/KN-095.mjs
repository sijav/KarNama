#!/usr/bin/env node
// Verifies KN-095: a story's meta title is exempt from the lingui rule, and
// nothing else in a story is.
//
// Exit condition: a story containing <Box title="Delete this application" />
// fails npm run lint while the same file keeps its meta title App/Shell, a
// committed fixture holds both, and agent/scripts/verify/KN-087.mjs requires it
// by name.
//
// The exemption used to be the NAME `title`, added in a stories-only block, and
// ESLint matches a name wherever it appears. It is a TYPE now: `StoryMeta`
// narrows a meta's title to the union of registered story paths, and the rule's
// `useTsTypes` skips a literal typed as a union of string literals.
//
// Two mutations carry the weight. Re-adding the name must make the fixture PASS,
// or the fixture is not testing the name. Dropping `StoryMeta` from the fixture
// must add a SECOND error, on the meta title, or the title is passing for some
// reason other than its type.
//
// NOT read-only: it edits eslint.config.js and the fixture, hides the fixture
// while KN-087 runs, and restores each in a finally. It also builds Storybook
// into a scratch directory under the OS temp folder and removes it.

import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const CONFIG = join(WEB, 'eslint.config.js')
const FIXTURE_NAME = 'unlocalized-story-title.stories.tsx'
const FIXTURE_REL = `src/gate-fixtures/${FIXTURE_NAME}`
const FIXTURE = join(WEB, FIXTURE_REL)

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

const run = (command, cwd = WEB) => {
  const result = spawnSync(command, { cwd, encoding: 'utf8', shell: true, env: { ...process.env, FORCE_COLOR: '0' } })
  return { code: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}

/**
 * The lingui errors the fixture produces, as line numbers.
 *
 * STDOUT only. npm prints its notices on stderr, and the first version of this
 * read both streams run together, so JSON.parse met a notice after the report.
 */
const linguiLines = () => {
  const result = spawnSync(`npx eslint ${FIXTURE_REL} --no-ignore --format json`, {
    cwd: WEB,
    encoding: 'utf8',
    shell: true,
    env: { ...process.env, FORCE_COLOR: '0' },
  })
  const stdout = result.stdout ?? ''
  const start = stdout.indexOf('[')
  if (start < 0) throw new Error(`eslint printed no report:\n${stdout.slice(0, 200)}${(result.stderr ?? '').slice(0, 400)}`)
  const [report] = JSON.parse(stdout.slice(start))
  if (report.messages.some((message) => message.fatal)) throw new Error(`eslint could not parse the fixture: ${JSON.stringify(report.messages)}`)
  return report.messages.filter((message) => message.ruleId === 'lingui/no-unlocalized-strings').map((message) => message.line)
}

/** The 1-based line of the first source line containing `text`. */
const lineOf = (source, text) => source.split('\n').findIndex((line) => line.includes(text)) + 1

// A function replacer everywhere, never a string: a replacement string expands
// `$'` and `$&`, and that turned a mutation in KN-094's verifier into a crash.
const withEdit = (file, from, to, body) => {
  const original = readFileSync(file, 'utf8')
  if (!original.includes(from)) return `the anchor for this mutation is gone, so it no longer applies:\n  ${from}`
  try {
    writeFileSync(file, original.replace(from, () => to))
    return body()
  } finally {
    writeFileSync(file, original)
  }
}

const source = existsSync(FIXTURE) ? readFileSync(FIXTURE, 'utf8') : ''
const jsxTitleLine = lineOf(source, 'title="Delete this application"')
const metaTitleLine = lineOf(source, "title: 'App/Shell'")

check('the fixture holds both: a JSX title and a meta title App/Shell', () => {
  if (!source) return `${FIXTURE_REL} is missing`
  if (!jsxTitleLine) return 'it no longer renders <Box title="Delete this application" />'
  if (!metaTitleLine) return "its meta no longer carries title: 'App/Shell'"
  // Named `.stories.tsx` on purpose: a stories-only block, which is what
  // reopened this hole, applies only to files with that name.
  return FIXTURE_NAME.endsWith('.stories.tsx') ? null : 'it is not named .stories.tsx, so a stories-only block would never reach it'
})

check('THE CASE: exactly one lingui error, on the JSX title and not on the meta title', () => {
  const lines = linguiLines()
  if (lines.length === 0) return 'the fixture passed, so a JSX title in a story is still exempt'
  if (lines.includes(metaTitleLine)) return `the meta title is flagged too (line ${metaTitleLine}), so real stories would fail the lint`
  return lines.length === 1 && lines[0] === jsxTitleLine ? null : `errors on lines ${lines.join(', ')}, expected only line ${jsxTitleLine}`
})

check('MUTATION: exempting the NAME title again makes the fixture pass', () => {
  // The regression this card closes, reintroduced the way it was first written:
  // a block for stories files that adds `title` to the exempt names.
  const anchor = '  // There is deliberately NO stories-only lingui block any more.'
  const block = [
    '  {',
    "    files: ['**/*.stories.tsx'],",
    '    plugins: { lingui },',
    "    rules: { 'lingui/no-unlocalized-strings': ['error', { ...linguiOptions, ignoreNames: [{ regex: { pattern: `^(${structuralProps}|title)$` } }] }] },",
    '  },',
    '',
    anchor,
  ].join('\n')
  return withEdit(CONFIG, anchor, block, () => {
    const lines = linguiLines()
    return lines.length === 0 ? null : `the fixture still fails with title exempt by name (lines ${lines.join(', ')}), so it is not testing the name`
  })
})

check('MUTATION: typing the meta with plain Meta adds an error on the meta title', () => {
  // Proves the meta title passes BECAUSE of StoryMeta. `App/Shell` contains a p,
  // so KN-214's broken no-letter pattern does not whitelist it by accident.
  const retyped = (text) =>
    text
      .replace("import type { StoryObj } from '@storybook/react-vite'", () => "import type { Meta, StoryObj } from '@storybook/react-vite'")
      .replace("import type { StoryMeta } from '../shared/story-docs/story-meta'\n", () => '')
      .replace('} satisfies StoryMeta<typeof TitledBox>', () => '} satisfies Meta<typeof TitledBox>')
  const original = readFileSync(FIXTURE, 'utf8')
  const mutated = retyped(original)
  // Judged on the CODE lines the mutation targets. The first version refused to
  // run because the word StoryMeta was still in the file, in the comment that
  // explains it: a check matching its own documentation, again.
  const applied = mutated.includes('} satisfies Meta<typeof TitledBox>') && !mutated.includes("from '../shared/story-docs/story-meta'")
  if (!applied) return 'the fixture changed shape, so this mutation no longer applies'
  try {
    writeFileSync(FIXTURE, mutated)
    const lines = linguiLines()
    // The line number comes from the MUTATED file. The mutation deletes an
    // import, so every line moves up one, and the first version of this check
    // looked for the error on the meta title's old line and missed it.
    const mutatedMetaLine = lineOf(mutated, "title: 'App/Shell'")
    return lines.includes(mutatedMetaLine)
      ? null
      : `the meta title (line ${mutatedMetaLine}) still passed without StoryMeta, errors on ${lines.join(', ') || 'no lines'}, so its type is not what exempts it`
  } finally {
    writeFileSync(FIXTURE, original)
  }
})

check('the name title is exempt nowhere in the config', () => {
  // Comments stripped, so the note recording why the block is gone can quote it.
  const code = readFileSync(CONFIG, 'utf8').replace(/^\s*\/\/.*$/gm, '')
  if (/\|title\b/.test(code)) return 'a |title alternative is back in an exempt-name pattern'
  const props = /const structuralProps =\s*([\s\S]*?)\n\n/.exec(code)?.[1] ?? ''
  return /\btitle\b/.test(props) ? 'title is in the structural prop list' : null
})

check('every real story still lints: the workspace is clean', () => {
  // The other way to make the fixture fail is to make every meta fail with it.
  const { code, output } = run('npm run lint')
  return code === 0 ? null : output.split('\n').slice(-25).join('\n')
})

check('Storybook indexes every real story and not the fixture', () => {
  const out = mkdtempSync(join(tmpdir(), 'kn095-sb-'))
  try {
    const { code, output } = run(`npx storybook build --output-dir "${out}" --quiet`)
    if (code !== 0) return `Storybook did not build:\n${output.slice(-600)}`
    const index = JSON.parse(readFileSync(join(out, 'index.json'), 'utf8'))
    const files = new Set(Object.values(index.entries).map((entry) => entry.importPath))
    if ([...files].some((file) => file.includes('gate-fixtures'))) return 'the fixture is indexed, so a probe sits in the sidebar as a second App/Shell'
    // The exclusion glob is an extglob, and a glob that silently matched nothing
    // would also keep the fixture out. So the real stories must all be there.
    const expected = run('git ls-files "src/**/*.stories.tsx"').output.split('\n').filter((line) => line && !line.includes('gate-fixtures'))
    const missing = expected.filter((file) => !files.has(`./${file}`))
    return missing.length ? `the exclusion also dropped real stories: ${missing.join(', ')}` : null
  } finally {
    rmSync(out, { recursive: true, force: true })
  }
})

check('KN-087 requires the fixture BY NAME: hide it and KN-087 fails, naming it', () => {
  const hidden = `${FIXTURE}.hidden`
  renameSync(FIXTURE, hidden)
  try {
    const { code, output } = run('node agent/scripts/verify/KN-087.mjs', ROOT)
    if (code === 0) return 'KN-087 passed with the fixture gone, so deleting it would go unnoticed'
    return output.includes(FIXTURE_NAME) ? null : `KN-087 failed, but without naming the fixture:\n${output.slice(-500)}`
  } finally {
    renameSync(hidden, FIXTURE)
  }
})

check('KN-003 names the fixture in its required list', () => {
  const kn003 = readFileSync(join(ROOT, 'agent', 'scripts', 'verify', 'KN-003.mjs'), 'utf8').replace(/^\s*\/\/.*$/gm, '')
  const required = /const required = \[([\s\S]*?)\]/.exec(kn003)?.[1]
  if (required === undefined) return 'KN-003 has no required list, so this check is stale'
  return required.includes(`'${FIXTURE_NAME}'`) ? null : 'KN-003 does not require the fixture by name'
})

if (failures.length) {
  process.stderr.write(`\nKN-095 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-095 verify passed.\n')
