import { readFileSync, readdirSync } from 'node:fs'
import { extname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * No component states a colour, a spacing or a radius. Everything resolves
 * through the theme, which is generated from the Figma tokens.
 *
 * The rule is in `AGENTS.md` and it is not a style preference: a literal that
 * happens to equal the token today is a value the next design change silently
 * misses, and it is invisible because it looks right. The design is 100 percent
 * tokenised, which is what makes this checkable rather than aspirational.
 *
 * `src/theme` is where the tokens live, so it is the one place a hex belongs.
 * `src/gate-fixtures` is excluded because its whole job is to be wrong.
 */
const SRC = fileURLToPath(new URL('..', import.meta.url))
const ALLOWED_DIRECTORIES = ['theme', 'gate-fixtures']

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) return ALLOWED_DIRECTORIES.includes(entry.name) ? [] : sourceFiles(full)
    return ['.ts', '.tsx'].includes(extname(entry.name)) ? [full] : []
  })

const files = sourceFiles(SRC)

describe('no component states a design value as a literal', () => {
  it('finds files to check, so a broken walk cannot pass by finding nothing', () => {
    // The failure mode this whole file is written against. A scan that returns
    // an empty list passes every assertion below it and proves nothing, and it
    // has happened here before.
    expect(files.length).toBeGreaterThan(2)
    expect(files.map((file) => relative(SRC, file))).toContain(join('app', 'App.tsx'))
  })

  it.each(files.map((file) => [relative(SRC, file), file]))('%s has no hex colour', (_name, file) => {
    const source = readFileSync(file, 'utf8')
    const hexes = [...source.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((match) => match[0])
    expect(hexes).toEqual([])
  })

  it.each(files.map((file) => [relative(SRC, file), file]))('%s has no px, rem or em literal', (_name, file) => {
    const source = readFileSync(file, 'utf8')
    // Inside a string or a template, which is where a css value would be. A
    // number on its own is fine: `sx={{ p: 6 }}` is theme spacing, not pixels.
    const lengths = [...source.matchAll(/['"`][^'"`\n]*\b\d+(?:px|rem|em)\b[^'"`\n]*['"`]/g)].map((match) => match[0])
    expect(lengths).toEqual([])
  })

  it('would catch a literal if one were there, proved on a string rather than a file', () => {
    // The scan above passing means nothing unless the pattern can fire. Both
    // patterns are exercised here against text that is known to contain what
    // they look for.
    expect(/#[0-9a-fA-F]{3,8}\b/.test("const c = '#2563eb'")).toBe(true)
    expect(/['"`][^'"`\n]*\b\d+(?:px|rem|em)\b[^'"`\n]*['"`]/.test("const s = '12px'")).toBe(true)
    expect(/#[0-9a-fA-F]{3,8}\b/.test("const c = theme.palette.primary.main")).toBe(false)
  })
})
