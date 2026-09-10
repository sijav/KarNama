#!/usr/bin/env node
// Verifies KN-094: the token-name value exemption no longer reaches aria-label
// or title.
//
// Exit condition: aria-label="delete/application" and title="delete/application"
// both fail `npm run lint`, a committed fixture holds both, the Foundations
// token story still passes, and agent/scripts/verify/KN-087.mjs requires the
// fixture by name.
//
// The exemption was `^[a-z-]+/[a-z0-9-/]+$`, added so a token name rendered as
// a label, `bg/page`, would pass. It was dropped rather than narrowed, because
// a probe found nothing in `src` needed it: the Foundations page reads its
// labels out of the token objects, so they are data rather than literals.
//
// The check that carries the weight is the MUTATION: it puts the exemption back
// and requires the fixture to pass. Without it the fixture might be failing for
// some unrelated reason and this whole file would be green over a hole.
//
// NOT read-only: it edits apps/web/eslint.config.js and hides the fixture, and
// restores both in a finally.

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const CONFIG = join(WEB, 'eslint.config.js')
const FIXTURE = 'src/gate-fixtures/unlocalized-tokenlike.tsx'
const EXEMPTION = "'^[a-z-]+/[a-z0-9-/]+$',"

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

const run = (command) => {
  const result = spawnSync(command, { cwd: WEB, encoding: 'utf8', shell: true, env: { ...process.env, FORCE_COLOR: '0' } })
  return { code: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}

const lintFixture = () => run(`npx eslint ${FIXTURE} --no-ignore`)

check('the fixture holding both props exists', () => {
  if (!existsSync(join(WEB, FIXTURE))) return `${FIXTURE} is missing, so nothing pins this hole shut`
  const source = readFileSync(join(WEB, FIXTURE), 'utf8')
  const missing = [
    ['aria-label="delete/application"', /aria-label="delete\/application"/],
    ['title="delete/application"', /title="delete\/application"/],
  ].filter(([, pattern]) => !pattern.test(source))
  return missing.length ? `the fixture no longer holds ${missing.map(([name]) => name).join(' or ')}` : null
})

check('THE CASE: both props fail the lint, on the lingui rule', () => {
  const { code, output } = lintFixture()
  if (code === 0) return 'the fixture passed, so copy shaped like a token name is still exempt'
  const errors = output.match(/lingui\/no-unlocalized-strings/g)?.length ?? 0
  if (errors === 0) return `it failed for another reason:\n${output.slice(0, 400)}`
  // Two props, two errors. A count rather than line numbers, so reformatting the
  // fixture does not break this, but deleting one of the two exports does.
  return errors === 2 ? null : `${errors} lingui error(s), expected one for aria-label and one for title:\n${output.slice(0, 400)}`
})

check('THE MUTATION: putting the exemption back makes the fixture pass again', () => {
  // The strongest evidence in this file. It proves the fixture fails BECAUSE of
  // the exemption's removal, not because of some unrelated defect that would
  // keep this green after someone quietly re-added the pattern.
  const original = readFileSync(CONFIG, 'utf8')
  const anchor = "    '^(rtl|ltr|fa-IR|en-US)$',"
  if (!original.includes(anchor)) return 'the ignore list changed shape, so this mutation no longer applies and proves nothing'
  try {
    // A FUNCTION replacer, not a string. The pattern ends in `$'`, and in a
    // replacement string `$'` means "everything after the match", so a string
    // replacer pasted the rest of the config into the middle of it. ESLint then
    // crashed loading the file, the lint exited non-zero, and this check
    // reported the fixture as failing for some other reason: true, and useless.
    writeFileSync(CONFIG, original.replace(anchor, () => `    ${EXEMPTION}\n${anchor}`))
    const { code, output } = lintFixture()
    if (code === 0) return null
    // Say WHY, and only what the output shows. The second version of this
    // message guessed "the config did not lint at all" for anything that was not
    // a lingui error, and a mutation promptly produced an unused import instead:
    // the lint ran perfectly well and the message was wrong about it.
    return /lingui\/no-unlocalized-strings/.test(output)
      ? `the fixture still fails on the lingui rule with the exemption restored, so something else is keeping it red:\n${output.slice(0, 400)}`
      : `with the exemption restored the lint still exits ${String(code)}, and not on the lingui rule:\n${output.slice(0, 600)}`
  } finally {
    writeFileSync(CONFIG, original)
  }
})

check('the exemption is gone from the config, not merely unused', () => {
  // Comments are stripped first. The paragraph recording why the pattern was
  // removed has to be allowed to quote it, or the config cannot warn anyone off
  // re-adding it and this check fires on its own explanation. That trap has now
  // caught four different checks in this repository.
  const code = readFileSync(CONFIG, 'utf8').replace(/^\s*\/\/.*$/gm, '')
  return code.includes('[a-z0-9-/]') ? 'the lower-case shape exemption is back in the ignore list' : null
})

check('the removal did not just break the build: the whole workspace still lints', () => {
  // The other way to make the fixture fail is to make everything fail. The
  // Foundations page is the file this exemption existed for, so if dropping it
  // cost anything, it costs it here.
  const { code, output } = run('npm run lint')
  return code === 0 ? null : output.split('\n').slice(-25).join('\n')
})

check('the Foundations token story still passes', () => {
  const { code, output } = run('npx vitest run --project storybook src/theme')
  return code === 0 ? null : `the token story broke:\n${output.slice(-800)}`
})

check('KN-087 requires the fixture BY NAME: hide it and KN-087 fails, naming it', () => {
  // Run, not read. The first version of this check looked for the file name
  // anywhere in KN-087's source, and the name is in two lists there: removing
  // it from the list that actually LINTS the fixture left it in the other, and
  // the check stayed green. A mutation showed exactly that. Hiding the fixture
  // and running KN-087 asks the real question, which is whether KN-087 notices.
  const fixture = join(WEB, FIXTURE)
  const hidden = `${fixture}.hidden`
  renameSync(fixture, hidden)
  try {
    const result = spawnSync('node agent/scripts/verify/KN-087.mjs', { cwd: ROOT, encoding: 'utf8', shell: true })
    const output = `${result.stdout ?? ''}${result.stderr ?? ''}`
    if (result.status === 0) return 'KN-087 passed with the fixture gone, so deleting it would go unnoticed'
    return output.includes('unlocalized-tokenlike.tsx')
      ? null
      : `KN-087 failed, but without naming the fixture:\n${output.slice(-500)}`
  } finally {
    renameSync(hidden, fixture)
  }
})

check('KN-003 names the fixture in its required list', () => {
  // KN-003 is the full gate and takes minutes, so it is read rather than run:
  // the name has to be an element of the `required` array, with comments
  // stripped so a remark about the fixture cannot stand in for requiring it.
  const source = readFileSync(join(ROOT, 'agent', 'scripts', 'verify', 'KN-003.mjs'), 'utf8').replace(/^\s*\/\/.*$/gm, '')
  const required = /const required = \[([\s\S]*?)\]/.exec(source)?.[1]
  if (required === undefined) return 'KN-003 has no required list, so this check is stale'
  return required.includes("'unlocalized-tokenlike.tsx'")
    ? null
    : 'KN-003 does not require the fixture by name, so it could be deleted and replaced by any other'
})

if (failures.length) {
  process.stderr.write(`\nKN-094 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-094 verify passed.\n')
