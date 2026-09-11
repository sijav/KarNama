import { readFileSync } from 'node:fs'
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

// Copy a reader sees, short and long, in both languages, with and without a p.
const COPY = ['Delete', 'Save', 'Cancel', 'Close', 'x', 'Delete this application', 'مصاحبه', 'حذف وضعیت', 'ذخیره']
// What has no letter in it and so cannot be copy: digits in three scripts,
// whitespace, punctuation and symbols.
const NOT_COPY = ['12', '۱۲', '١٢', ' ', '—', '…', '#', '؟', '،', '·', '→', '12:30', '(0)']

describe('the lingui rule’s ignore entries, compiled as the rule compiles them', () => {
  it('are all read out of the config', () => {
    expect(entries.length).toBeGreaterThanOrEqual(5)
    expect(entries).toContain('^(rtl|ltr|fa-IR|en-US)$')
  })

  it('whitelist no copy, in either language', () => {
    for (const text of COPY) expect(compiled.filter((pattern) => pattern.test(text)).map(String)).toEqual([])
  })

  it('still let through what has no letter in it', () => {
    const [noLetter] = compiled
    for (const text of NOT_COPY) expect(noLetter?.test(text)).toBe(true)
  })

  it('would catch the entry that meant p, {, L or } rather than any letter', () => {
    // The entry this card replaced, compiled the same way: it passes copy, so
    // the check above is one that can fail.
    const old = new RegExp('^[^\\p{L}]*$')
    expect(COPY.filter((text) => old.test(text))).toEqual(['Delete', 'Save', 'Cancel', 'Close', 'x', 'مصاحبه', 'حذف وضعیت', 'ذخیره'])
  })
})
