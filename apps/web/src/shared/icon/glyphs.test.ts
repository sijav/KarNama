import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { GLYPHS, ICON_NAMES } from './glyphs'

const DESIGN = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..', '..', 'DESIGN.md')

// A comma list DESIGN.md writes after a phrase, up to the full stop that ends it.
const listIn = (pattern: RegExp, what: string) => {
  const text = readFileSync(DESIGN, 'utf8').replace(/\s+/g, ' ')
  const list = pattern.exec(text)?.[1]
  if (!list) throw new Error(`DESIGN.md does not list ${what}`)
  return list.split(',').map((name) => name.trim())
}

// The file's set in DESIGN.md's component families: the names between "The icon
// set, all at 24×24:" and the full stop before "Default colour".
const designList = () => listIn(/The icon set, all at 24×24: ([^.]+)\. Default colour/, 'the icon set')

// The owner's icons beyond the file's, KN-478: the names after "The owner's
// icons, beyond the file's thirty:".
const addedList = () => listIn(/The owner's icons, beyond the file's thirty: ([^.]+)\./, "the owner's icons")

describe('the icon set', () => {
  it("is the thirty DESIGN.md lists, in its order, then the owner's additions", () => {
    expect(designList()).toHaveLength(30)
    expect([...ICON_NAMES]).toEqual([...designList(), ...addedList()])
  })

  it('draws every icon it names, inside the 24 grid', () => {
    expect(Object.keys(GLYPHS).sort()).toEqual([...ICON_NAMES].sort())
    for (const name of ICON_NAMES) {
      const { stroke, fill } = GLYPHS[name]
      expect(stroke.length + fill.length).toBeGreaterThan(0)
      for (const d of [...stroke, ...fill]) {
        const numbers = (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number)
        expect(Math.min(...numbers)).toBeGreaterThanOrEqual(0)
        expect(Math.max(...numbers)).toBeLessThanOrEqual(24)
      }
    }
  })

  it('strokes every icon but more, which the file fills', () => {
    for (const name of ICON_NAMES) expect(GLYPHS[name].fill.length > 0).toBe(name === 'more')
  })
})
