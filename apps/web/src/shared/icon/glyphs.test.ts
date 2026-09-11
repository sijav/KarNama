import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { GLYPHS, ICON_NAMES } from './glyphs'

const DESIGN = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..', '..', 'DESIGN.md')

// The list in DESIGN.md's component families: the names between "The icon
// set, all at 24×24:" and the full stop before "Default colour".
const designList = () => {
  const text = readFileSync(DESIGN, 'utf8').replace(/\s+/g, ' ')
  const list = /The icon set, all at 24×24: ([^.]+)\. Default colour/.exec(text)?.[1]
  if (!list) throw new Error('DESIGN.md does not list the icon set')
  return list.split(',').map((name) => name.trim())
}

describe('the icon set', () => {
  it('is exactly the thirty DESIGN.md lists, in its order', () => {
    expect(designList()).toHaveLength(30)
    expect([...ICON_NAMES]).toEqual(designList())
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
