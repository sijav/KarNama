import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'

// eslint-plugin-lingui compiles every entry of the ignore option with
// new RegExp(entry) and no flags, so an entry that needs a flag to mean what it
// says means something else in the rule. This reads the entries out of the
// config as written and compiles them the same way, KN-214.
// Read out of the configuration ESLint is actually handed, not out of the
// file's text, KN-367. The old reader matched single-quoted lines with a
// regular expression, so an entry written any other way, double-quoted, a
// template, or split over two lines, was invisible to it: an entry of `.*`
// could have whitelisted every string in the codebase while this test stayed
// green and went on asserting about the entries it could still see.
const RULE = 'lingui/no-unlocalized-strings'

interface RuleBlock {
  rules?: Record<string, unknown>
}

/** The ignore entries a flat config gives that rule, refusing anything ambiguous. */
export const ignoreEntriesIn = (config: readonly RuleBlock[]): string[] => {
  const blocks = config.filter((entry) => entry.rules !== undefined && RULE in entry.rules)
  // Exactly one: taking the first would read the wrong options the day a later
  // block overrides the rule.
  if (blocks.length !== 1) throw new Error(`expected exactly one block configuring ${RULE}, found ${String(blocks.length)}`)
  const setting = blocks[0]?.rules?.[RULE]
  const options: unknown = Array.isArray(setting) ? setting[1] : undefined
  const ignore = (options as { ignore?: unknown } | undefined)?.ignore
  if (!Array.isArray(ignore)) throw new Error(`${RULE} has no ignore array`)
  return ignore.map(String)
}

const loaded = await import('../../eslint.config.js')
const entries = ignoreEntriesIn(loaded.default)
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

describe('reading the entries out of the configuration itself', () => {
  it('sees an entry the old reader could not, one written with double quotes', async () => {
    // The point is the SOURCE, not the value: once JavaScript has evaluated
    // them, a double-quoted literal and a single-quoted one are the same
    // string, so a config-shaped object built here would prove nothing. This
    // imports a real module whose own text uses double quotes, which the reader
    // that matched single-quoted lines out of the config could not see at all,
    // KN-367.
    const fixture = await import('../gate-fixtures/double-quoted-ignore.config.js')
    expect(ignoreEntriesIn(fixture.default)).toEqual(['^(rtl|ltr|fa-IR|en-US)$', '^double-quoted$'])
  })

  it('refuses a configuration that settles the rule in more than one place', () => {
    const twice = [
      { rules: { 'lingui/no-unlocalized-strings': ['error', { ignore: ['a'] }] } },
      { rules: { 'lingui/no-unlocalized-strings': ['error', { ignore: ['b'] }] } },
    ]
    // Taking the first would read the wrong options the day a later block
    // overrides the rule, and read them without saying so.
    expect(() => ignoreEntriesIn(twice)).toThrow(/exactly one/u)
  })
})
