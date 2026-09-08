import { readFileSync, readdirSync } from 'node:fs'
import { extname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * Nothing in this package is written by hand, and nothing in the web app
 * re-declares what this package generates.
 *
 * That is the whole clause: "no hand-written interface duplicates a generated
 * one". A duplicate is not a style problem. It looks identical on the day it is
 * written and it stops moving when the schema does, so the typecheck that was
 * supposed to catch a schema change catches nothing, which is the guarantee a
 * monorepo exists to provide quietly disappearing.
 */
const PACKAGE = fileURLToPath(new URL('..', import.meta.url))
const WEB = join(PACKAGE, '..', '..', 'apps', 'web', 'src')

const generated = readFileSync(join(PACKAGE, 'src', 'generated.ts'), 'utf8')

/** Every type and enum name the generator produced. */
const generatedNames = [...generated.matchAll(/^export type (\w+)/gm)].map((match) => match[1] ?? '')

const filesUnder = (dir: string, skip: string[] = []): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) return skip.includes(entry.name) ? [] : filesUnder(full, skip)
    return ['.ts', '.tsx'].includes(extname(entry.name)) ? [full] : []
  })

describe('the generated package', () => {
  it('generated something, so an empty file cannot pass every check below', () => {
    expect(generatedNames.length).toBeGreaterThan(3)
    expect(generatedNames).toContain('Health')
    expect(generatedNames).toContain('Query')
  })

  it('declares nothing by hand outside generated.ts', () => {
    const handWritten = filesUnder(join(PACKAGE, 'src'))
      .filter((file) => !file.endsWith('generated.ts') && !file.endsWith('.test.ts'))
      .flatMap((file) => {
        const source = readFileSync(file, 'utf8')
        return [...source.matchAll(/^export (?:type|interface) (\w+)/gm)].map((match) => `${relative(PACKAGE, file)}: ${match[1] ?? ''}`)
      })
    // The barrel re-exports, it does not re-declare. A re-declaration there
    // would look identical and would stop moving when the schema does.
    expect(handWritten).toEqual([])
  })

  it('is imported by the web app rather than described again there', () => {
    const duplicates = filesUnder(WEB, ['gate-fixtures']).flatMap((file) => {
      const source = readFileSync(file, 'utf8')
      return [...source.matchAll(/^export (?:type|interface) (\w+)/gm)]
        .map((match) => match[1] ?? '')
        .filter((name) => generatedNames.includes(name))
        .map((name) => `${relative(WEB, file)} re-declares ${name}`)
    })
    expect(duplicates, 'these shadow a generated type instead of importing it').toEqual([])
  })

  it('would notice a duplicate, proved on strings rather than on the tree', () => {
    // Both scans pass today. This is what says they can fail: a regex that
    // matched nothing would report clean forever, and one in this repository
    // already did.
    const pattern = /^export (?:type|interface) (\w+)/gm
    expect([...'export interface Health {\n'.matchAll(pattern)].map((m) => m[1])).toEqual(['Health'])
    expect([...'export type Query = {\n'.matchAll(pattern)].map((m) => m[1])).toEqual(['Query'])
    expect([...'const Health = 1\n'.matchAll(pattern)]).toEqual([])
    // And an indented declaration is not a top-level one, which is why the
    // pattern is anchored.
    expect([...'  export type Nested = 1\n'.matchAll(pattern)]).toEqual([])
  })
})
