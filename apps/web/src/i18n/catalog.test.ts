import { readFileSync, readdirSync } from 'node:fs'
import { extname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { messages as en } from './locales/en-US'
import { messages as fa } from './locales/fa-IR'

/**
 * The fa-IR catalog is 100 percent translated, and this is what says so.
 *
 * The earlier test only checked that every key in the English catalog had a
 * Persian entry, which is the same statement twice: both files are written by
 * hand, so they agree because someone kept them agreeing. What matters is
 * whether every id the CODE uses is in both, and whether either catalog carries
 * ids nothing uses, which is how a catalog rots.
 */
const SRC = fileURLToPath(new URL('..', import.meta.url))
const SKIP = ['i18n', 'gate-fixtures']

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) return SKIP.includes(entry.name) ? [] : sourceFiles(full)
    return ['.ts', '.tsx'].includes(extname(entry.name)) && !entry.name.endsWith('.test.ts') ? [full] : []
  })

const files = sourceFiles(SRC)

/**
 * Drops the Unicode FORMAT characters, so a message made only of them reads as
 * the nothing it renders as.
 *
 * `\p{Cf}` rather than a list of code points, because the list is the part that
 * goes stale: it covers U+200B to U+200D and U+FEFF today and whatever else the
 * standard puts in that category later. Naming the category also says WHY these
 * belong together, which a range of hex escapes does not, and it keeps invisible
 * characters out of this file, where nobody can see them to maintain them.
 */
const stripFormat = (value: string) => value.replace(/\p{Cf}/gu, '')

/**
 * Ids used in code: `<Trans id="..." />` and `i18n._('...')`, the call allowed
 * to break after its bracket as Prettier breaks a long one. The lint rejects
 * every other way of writing an id, KN-111, so these two are all there is.
 */
const ID_PATTERN = /<Trans\s+id="([^"]+)"|i18n\._\(\s*(?:'([^']+)'|"([^"]+)")/g
const idsIn = (source: string) => [...source.matchAll(ID_PATTERN)].flatMap((match) => match[1] ?? match[2] ?? match[3] ?? [])
const usedIds = new Map<string, string[]>()
for (const file of files) {
  for (const id of idsIn(readFileSync(file, 'utf8'))) usedIds.set(id, [...(usedIds.get(id) ?? []), relative(SRC, file)])
}

describe('the catalogs and the code agree', () => {
  it('found source files and found ids in them, so a broken scan cannot pass', () => {
    // Both halves. A walk that returns no files, and a regex that matches
    // nothing in the files it found, are different failures and both of them
    // make every assertion below vacuous.
    expect(files.length).toBeGreaterThan(3)
    expect(usedIds.size).toBeGreaterThan(1)
  })

  it.each([...usedIds.keys()].map((id) => [id]))('"%s" is in the English catalog', (id) => {
    expect(Object.keys(en), `used in ${(usedIds.get(id) ?? []).join(', ')}`).toContain(id)
  })

  it.each([...usedIds.keys()].map((id) => [id]))('"%s" is translated into Persian', (id) => {
    expect(Object.keys(fa), `used in ${(usedIds.get(id) ?? []).join(', ')}`).toContain(id)
  })

  it('has no Persian message that is blank, which renders as nothing at all', () => {
    // Every check above asks whether the id is a KEY in the catalog and none of
    // them looks at the value, so `{ 'Save': '' }` satisfied all of them while
    // the user saw an empty space where a label belongs. A blank is worse than
    // an English string: English tells a Persian reader the message was missed,
    // and a blank tells them nothing.
    //
    // Blank means "renders as nothing", which is wider than `\s`. A tab and a
    // non-breaking space are `\s` and are caught by it. The zero-width
    // characters are NOT: U+200C, the Persian zero-width non-joiner, is a
    // letter-joining control that appears legitimately INSIDE Persian words, so
    // it is not whitespace and `/\S/` reads a message made only of it as
    // present. It renders as nothing all the same, and a value of one ZWNJ is
    // the most plausible accidental blank in a Persian catalog of any of these,
    // which is why they are named here rather than left to `\s`.
    const blank = Object.entries(fa).filter(([, message]) => !/\S/u.test(stripFormat(message)))
    expect(blank.map(([id]) => id)).toEqual([])
  })

  it('has no Persian message left as its English id, which is an untranslated string wearing a translation', () => {
    // Was `message === id`, which caught 'Save' and let 'Save.' through, then
    // 'save', then 'SAVE!'. Each is the same untranslated string with the
    // punctuation moved, and a rule that can be evaded by adding a full stop is
    // a rule about full stops. Both sides are casefolded and stripped to letters
    // and digits before comparing.
    //
    // The `/[A-Za-z]/` guard is kept: an id made only of digits or symbols has
    // no English in it to leave untranslated, and `bare` would collapse it to an
    // empty string on both sides and match everything.
    const bare = (value: string) => value.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')
    const untranslated = Object.entries(fa).filter(([id, message]) => /[A-Za-z]/.test(id) && bare(message) === bare(id))
    expect(untranslated.map(([id]) => id)).toEqual([])
  })

  it('carries no id that nothing uses', () => {
    // A catalog that only grows is a catalog nobody trusts, because the reader
    // cannot tell which entries are live.
    const stale = Object.keys(en).filter((id) => !usedIds.has(id))
    expect(stale).toEqual([])
  })

  it('has exactly the same ids in both catalogs', () => {
    expect(Object.keys(fa).toSorted()).toEqual(Object.keys(en).toSorted())
  })

  it('would notice a missing translation, proved on a value rather than on the files', () => {
    // The patterns above pass today. This is what says they can fail.
    const pretendEn = { 'Add a job opportunity': 'Add a job opportunity' }
    const pretendFa: Record<string, string> = {}
    expect(Object.keys(pretendEn).filter((id) => !(id in pretendFa))).toEqual(['Add a job opportunity'])
    // The scan's own pattern, on each form it reads, a wrapped call included.
    expect(idsIn('<Trans id="KarNama" />')).toEqual(['KarNama'])
    expect(idsIn("i18n._('Language')")).toEqual(['Language'])
    expect(idsIn('i18n._("Language")')).toEqual(['Language'])
    expect(idsIn("i18n._(\n  'Language',\n)")).toEqual(['Language'])
  })
})
