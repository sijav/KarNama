#!/usr/bin/env node
// Verifies KN-292: an Input icon given a string with nothing to read, spaces,
// a line break, a zero-width space or a joiner, draws no slot.
//
// Exit condition: an Input given a string icon that isBlank holds for, spaces,
// a line break, a zero-width space or a joiner, draws no slot and its text box
// sits 16 from that edge; IconsTurnedOff covers a space and a zero-width space
// among its cases and asserts no slot, and a mutation dropping the blank check
// fails it by name; and the story docs say the direct values draw no slot,
// while an element that renders nothing leaves a slot that collapses and takes
// no room.
//
// The 16 is to the input's box, the proxy KN-283 replaces. KN-291's verifier,
// run last, reads every field of the story in a production build in both
// directions.
//
// NOT read-only: it edits Input.tsx for its mutation and restores it in a
// finally, and it runs KN-291's verifier, which does the same.

import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const COMPONENT = join(WEB, 'src', 'shared', 'input', 'Input.tsx')
const STORIES = join(WEB, 'src', 'shared', 'input', 'Input.stories.tsx')
const STORY = 'Icons Turned Off'

// The blank check, and the string branch as KN-291 left it, every non-empty
// string drawn, with the guard for null and booleans kept.
const BLANK = "!(typeof node === 'string' && isBlank(node))"
const KN291 = "node !== ''"

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
  const result = spawnSync('npx vitest run --project storybook src/shared/input --reporter=verbose', { cwd: WEB, encoding: 'utf8', shell: true })
  return { code: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}

const ran = (output, mark) => output.split('\n').some((line) => mark.test(line) && line.includes(`> ${STORY}`))

check('the Input stories pass, IconsTurnedOff by name, with a space and a zero-width space among its fields that draw no slot', () => {
  const source = readFileSync(STORIES, 'utf8')
  const missing = [
    ['the zero-width space by code point', 'const ZERO_WIDTH_SPACE = String.fromCodePoint(0x200b)'],
    ['the line break by code point', 'const LINE_BREAK = String.fromCodePoint(0x0a)'],
    ['the joiner by code point', 'const ZERO_WIDTH_JOINER = String.fromCodePoint(0x200d)'],
    ['a space and a zero-width space', '<Box data-testid="no-slot">\n        <JobTitle leadingIcon={\' \'} trailingIcon={ZERO_WIDTH_SPACE} />'],
    ['a line break and a joiner', '<Box data-testid="no-slot">\n        <JobTitle leadingIcon={LINE_BREAK} trailingIcon={ZERO_WIDTH_JOINER} />'],
    ['all four fields counted', "const plain = canvas.getAllByTestId('no-slot')\n    await expect(plain).toHaveLength(4)"],
  ].filter(([, text]) => !source.includes(text))
  if (missing.length) return `the story does not have ${missing.map(([what]) => what).join(', ')}`
  const { code, output } = stories()
  if (code !== 0) return `they fail:\n${output.slice(-800)}`
  return ran(output, /✓/) ? null : 'IconsTurnedOff did not run and pass'
})

check('THE CASE: the blank check dropped, every non-empty string drawn as KN-291 left it, fails IconsTurnedOff by name', () => {
  const original = readFileSync(COMPONENT, 'utf8')
  if (!original.includes(BLANK)) return `the blank check is not where the mutation expects it: ${BLANK}`
  try {
    writeFileSync(COMPONENT, original.replace(BLANK, () => KN291))
    const { code, output } = stories()
    if (code === 0) return 'the stories passed with blank strings drawn, so nothing measures them'
    return ran(output, /[×✗]/) ? null : `it failed, but not in IconsTurnedOff:\n${output.slice(-500)}`
  } finally {
    writeFileSync(COMPONENT, original)
  }
})

check('the docs, in both languages, say blank strings draw no slot and an element that renders nothing leaves a collapsed slot', () => {
  const read = (locale) => readFileSync(join(WEB, 'src', 'shared', 'story-docs', locale, 'Shared-Input.md'), 'utf8').replace(/\s+/g, ' ')
  const [en, fa] = [read('en'), read('fa')]
  const missing = [
    ['en: the prop', en, /given a string with nothing to read, empty, spaces or a zero-width character, it draws no slot/],
    ['en: the story, no slot', en, /a string with nothing to read, empty, a space, a zero-width space, a line break or a joiner, draw no slot at all/],
    ['en: the story, a collapsed slot', en, /leaves a slot that collapses and takes no room/],
    ['fa: the prop', fa, /رشته‌ای بگیرد که چیزی برای خواندن ندارد، خالی، فاصله یا نویسهٔ صفرعرض، جایگاهی کشیده نمی‌شود/],
    ['fa: the story, no slot', fa, /شکستِ خط یا اتصال‌دهنده، هیچ جایگاهی نمی‌کشند/],
    ['fa: the story, a collapsed slot', fa, /جایگاهی به جا می‌گذارد که جمع می‌شود و جایی نمی‌گیرد/],
  ].filter(([, text, pattern]) => !pattern.test(text))
  return missing.length ? `the docs do not say ${missing.map(([what]) => what).join(', ')}` : null
})

check("KN-291's verifier passes, reading all five fields in a production build in both directions", () => {
  const result = spawnSync('node', [join(ROOT, 'agent', 'scripts', 'verify', 'KN-291.mjs')], { cwd: ROOT, encoding: 'utf8' })
  const output = `${result.stdout}${result.stderr}`
  process.stdout.write(output.split('\n').filter((line) => /^\s+(fa-IR|en-US):/.test(line)).map((line) => `${line}\n`).join(''))
  return result.status === 0 ? null : `it fails:\n${output.slice(-800)}`
})

if (failures.length) {
  process.stderr.write(`\nKN-292 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-292 verify passed.\n')
