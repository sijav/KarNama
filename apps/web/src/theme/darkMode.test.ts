import { describe, expect, it } from 'vitest'
import { darkSemantic, darkStatus, deriveDark, deriveDarkSurface, hexToHsl, hslToHex } from './darkMode'
import { semantic, status } from './tokens'

/**
 * The dark palette is derived, so what is testable is the DERIVATION, not a
 * table of expected hexes. A test that listed twenty dark values would be the
 * same hand-picked table the derivation exists to avoid, restated where it can
 * never disagree with itself.
 */
describe('the colour conversion round trips', () => {
  it.each(Object.values(semantic))('%s survives hex to HSL and back', (hex) => {
    // Within one step per channel. HSL is lossy at 8 bits and an exact equality
    // here would be a test of the rounding rather than of the conversion.
    const back = hslToHex(hexToHsl(hex))
    for (let index = 1; index < 7; index += 2) {
      const before = Number.parseInt(hex.slice(index, index + 2), 16)
      const after = Number.parseInt(back.slice(index, index + 2), 16)
      expect(Math.abs(before - after)).toBeLessThanOrEqual(1)
    }
  })

  it('handles pure grey, which has no hue to preserve', () => {
    expect(hexToHsl('#ffffff')).toEqual({ h: 0, s: 0, l: 1 })
    expect(hexToHsl('#000000')).toEqual({ h: 0, s: 0, l: 0 })
    expect(hslToHex({ h: 0, s: 0, l: 1 })).toBe('#ffffff')
  })

  it.each([
    ['#ff0000', 0],
    ['#00ff00', 120],
    ['#0000ff', 240],
  ])('puts %s at hue %i, so every branch of the sector maths is exercised', (hex, hue) => {
    expect(Math.round(hexToHsl(hex).h)).toBe(hue)
    expect(hslToHex({ h: hue, s: 1, l: 0.5 })).toBe(hex)
  })

  it.each([60, 180, 300])('round trips hue %i as well', (hue) => {
    expect(Math.round(hexToHsl(hslToHex({ h: hue, s: 1, l: 0.5 })).h)).toBe(hue)
  })
})

describe('the derivation does what it says', () => {
  it('never moves the hue, because hue is the part that carries meaning', () => {
    for (const hex of Object.values(semantic)) {
      const before = hexToHsl(hex)
      const after = hexToHsl(deriveDark(hex))
      if (before.s === 0) continue
      expect(Math.abs(before.h - after.h), `${hex} changed hue`).toBeLessThan(1)
    }
  })

  it('flips the page and the surface, so a light page becomes a dark one', () => {
    expect(hexToHsl(darkSemantic['bg/page']).l).toBeLessThan(0.2)
    expect(hexToHsl(darkSemantic['bg/surface']).l).toBeLessThan(0.2)
    expect(hexToHsl(darkSemantic['text/primary']).l).toBeGreaterThan(0.8)
  })

  it('keeps the raised surface lighter than the page, the same way round as the design', () => {
    // This is the test that caught the first version of the derivation. Light:
    // page #f6f7f9 is slightly darker than surface #ffffff, so a card reads as
    // raised. A lightness FLIP reverses that, because both are crowded against
    // white, and the card came out darker than the page it sits on: elevation
    // running backwards across the whole board. Neutral backgrounds are
    // remapped order-preservingly instead of flipped, which is why
    // `deriveDarkSurface` exists.
    expect(hexToHsl(semantic['bg/page']).l).toBeLessThan(hexToHsl(semantic['bg/surface']).l)
    expect(hexToHsl(darkSemantic['bg/page']).l).toBeLessThan(hexToHsl(darkSemantic['bg/surface']).l)
    expect(hexToHsl(darkSemantic['bg/surface-secondary']).l).toBeLessThan(hexToHsl(darkSemantic['bg/page']).l)
  })

  it('puts every neutral background in the dark band, none of them near white', () => {
    for (const name of ['bg/page', 'bg/surface', 'bg/surface-secondary'] as const) {
      const { l } = hexToHsl(darkSemantic[name])
      expect(l, `${name} is not in the dark band`).toBeGreaterThanOrEqual(0.07)
      expect(l, `${name} is not in the dark band`).toBeLessThanOrEqual(0.19)
    }
  })

  it('clamps a neutral outside the light surface band to the ends of the dark one', () => {
    // Nothing in the token set sits outside the band, so these two are the
    // guard rails rather than a real case: without the clamp a mid grey would
    // land above the band and a black would land below it, and the first time
    // that mattered would be the first time someone added a token.
    expect(hexToHsl(deriveDarkSurface('#000000')).l).toBeCloseTo(0.08, 2)
    expect(hexToHsl(deriveDarkSurface('#808080')).l).toBeCloseTo(0.08, 2)
    expect(hexToHsl(deriveDarkSurface('#ffffff')).l).toBeCloseTo(0.18, 2)
  })

  it('still flips a chromatic background, because a container is not a surface', () => {
    // bg/brand/container is a pale blue. It carries hue, not elevation, so the
    // surface band would be the wrong rule and would flatten it into a grey.
    expect(hexToHsl(darkSemantic['bg/brand/container']).s).toBeGreaterThan(0.2)
  })

  it('gives every chromatic colour a lightness floor, so it stays readable on dark', () => {
    for (const [name, hex] of Object.entries(darkSemantic)) {
      const { s, l } = hexToHsl(hex)
      if (s <= 0.2) continue
      expect(l, `${name} is too dark to read on a dark surface`).toBeGreaterThanOrEqual(0.54)
    }
  })

  it('derives all twenty semantic tokens and all nine status pairs', () => {
    expect(Object.keys(darkSemantic).toSorted()).toEqual(Object.keys(semantic).toSorted())
    expect(Object.keys(darkStatus).toSorted()).toEqual(Object.keys(status).toSorted())
  })

  it('is not the light palette wearing a different name', () => {
    // No dark value equals ANY light value, which is stronger than checking key
    // by key and needs no cast to get the keys back.
    const light = new Set<string>(Object.values(semantic))
    const survivors = Object.entries(darkSemantic).filter(([, hex]) => light.has(hex))
    expect(survivors.map(([name]) => name)).toEqual([])
  })
})
