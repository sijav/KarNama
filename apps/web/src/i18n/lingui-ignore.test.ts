import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'

// eslint-plugin-lingui compiles every entry of the ignore option with
// new RegExp(entry) and no flags, so an entry that needs a flag to mean what it
// says means something else in the rule. This reads the entries out of the
// config as written and compiles them the same way, KN-214.
const config = readFileSync(new URL('../../eslint.config.js', import.meta.url), 'utf8')
const start = config.indexOf('ignore: [')
const block = config.slice(start, config.indexOf('\n  ],', start))
// Each entry is one single-quoted string on its own line; a JS escape is a
// backslash and the character it keeps.
const entries = [...block.matchAll(/^\s*'((?:\\.|[^'\\])*)',?\s*$/gm)].map((match) => (match[1] ?? '').replace(/\\(.)/g, '$1'))
const compiled = entries.map((entry) => new RegExp(entry))

// The plugin's own whitelist of strings with no letter in them, read from the
// rule as installed, with its flag, KN-366: this config adds no entry of its
// own for them, so this is the pattern that decides.
const rule = readFileSync(createRequire(import.meta.url).resolve('eslint-plugin-lingui/lib/rules/no-unlocalized-strings.js'), 'utf8')
const builtIn = /\/(\^\[\^\\p\{L\}\]\+\$)\/u,/.exec(rule)?.[1]
const noLetter = builtIn === undefined ? undefined : new RegExp(builtIn, 'u')

// Copy a reader sees, short and long, in both languages, with and without a p.
const COPY = ['Delete', 'Save', 'Cancel', 'Close', 'x', 'Delete this application', 'مصاحبه', 'حذف وضعیت', 'ذخیره']
// The three letters in Latin-1's punctuation block, U+00AA, U+00B5 and U+00BA,
// which the entry this config used to carry let through, KN-366.
const LATIN_1_LETTERS = ['1ª', '5µ', 'º']
// What has no letter in it and so cannot be copy: digits in three scripts,
// whitespace, punctuation and symbols.
const NOT_COPY = ['12', '۱۲', '١٢', '—', '…', '#', '؟', '،', '·', '→', '12:30', '(0)']

describe('the lingui rule’s ignore entries, compiled as the rule compiles them', () => {
  it('are all read out of the config', () => {
    expect(entries.length).toBeGreaterThanOrEqual(3)
    expect(entries).toContain('^(rtl|ltr|fa-IR|en-US)$')
  })

  it('whitelist no copy, in either language, nor the three Latin-1 letters', () => {
    for (const text of [...COPY, ...LATIN_1_LETTERS]) expect(compiled.filter((pattern) => pattern.test(text)).map(String)).toEqual([])
  })

  it('leave what has no letter to the plugin, whose own pattern lets it through and checks every letter', () => {
    expect(noLetter).toBeDefined()
    for (const text of NOT_COPY) expect(noLetter?.test(text)).toBe(true)
    for (const text of [...COPY, ...LATIN_1_LETTERS]) expect(noLetter?.test(text)).toBe(false)
  })

  it('would catch the entry that meant p, {, L or } rather than any letter', () => {
    // The entry this card replaced, compiled the same way: it passes copy, so
    // the check above is one that can fail.
    const old = new RegExp('^[^\\p{L}]*$')
    expect(COPY.filter((text) => old.test(text))).toEqual(['Delete', 'Save', 'Cancel', 'Close', 'x', 'مصاحبه', 'حذف وضعیت', 'ذخیره'])
  })
})
