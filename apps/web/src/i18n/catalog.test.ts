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

/** Ids used in code: `<Trans id="..." />` and `i18n._('...')`. */
const usedIds = new Map<string, string[]>()
for (const file of files) {
  const source = readFileSync(file, 'utf8')
  for (const match of source.matchAll(/<Trans\s+id="([^"]+)"|i18n\._\((?:'([^']+)'|"([^"]+)")/g)) {
    const id = match[1] ?? match[2] ?? match[3]
    if (!id) continue
    usedIds.set(id, [...(usedIds.get(id) ?? []), relative(SRC, file)])
  }
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

  it('has no Persian message left as its English id, which is an untranslated string wearing a translation', () => {
    const untranslated = Object.entries(fa).filter(([id, message]) => message === id && /[A-Za-z]/.test(id))
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
    expect(/<Trans\s+id="([^"]+)"/.exec('<Trans id="KarNama" />')?.[1]).toBe('KarNama')
    expect(/i18n\._\('([^']+)'/.exec("i18n._('Language')")?.[1]).toBe('Language')
  })
})
