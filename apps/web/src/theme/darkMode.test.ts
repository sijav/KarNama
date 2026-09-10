import { describe, expect, it } from 'vitest'
import { DARK_FILLS, MIN_CONTRAST, contrast, darkSemantic, darkStatus, deriveDark, deriveDarkFill, deriveDarkSurface, ensureContrast, hexToHsl, hslToHex, luminance } from './darkMode'
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
    // Foregrounds and accents, that is: a fill is meant to be dark, and has its
    // own assertions below, KN-272.
    const fills = new Set<string>(DARK_FILLS)
    for (const [name, hex] of Object.entries(darkSemantic)) {
      const { s, l } = hexToHsl(hex)
      if (s <= 0.2 || fills.has(name)) continue
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

/**
 * Contrast, which is the thing the first version of this file got wrong.
 *
 * Every check it had was about HSL, and every one of them passed while eight of
 * the nine status chips sat between 1.01 and 1.51 to one. HSL lightness is not
 * perceptual and it is not contrast, so a pair can be far apart in lightness
 * and unreadable, or close in lightness and fine. These assert the ratio a
 * person actually experiences.
 */
describe('the derived palette is readable', () => {
  const surface = darkSemantic['bg/surface']

  it.each([
    ['text/primary', darkSemantic['text/primary']],
    ['text/secondary', darkSemantic['text/secondary']],
    ['text/brand', darkSemantic['text/brand']],
    ['text/error', darkSemantic['text/error']],
  ])('%s clears WCAG AA on the dark surface', (_name, colour) => {
    expect(contrast(colour, surface)).toBeGreaterThanOrEqual(MIN_CONTRAST)
  })

  it('puts readable text on the brand fill', () => {
    expect(contrast(darkSemantic['text/on-accent'], darkSemantic['bg/brand/default'])).toBeGreaterThanOrEqual(MIN_CONTRAST)
  })

  it.each(Object.entries(darkStatus))('the %s chip has readable text on its own fill', (_name, chip) => {
    expect(contrast(chip.base, chip.container)).toBeGreaterThanOrEqual(MIN_CONTRAST)
  })

  it('and the LIGHT palette clears it too, so the design itself is checked as well', () => {
    for (const [name, chip] of Object.entries(status)) {
      expect(contrast(chip.base, chip.container), `light ${name}`).toBeGreaterThanOrEqual(MIN_CONTRAST)
    }
  })

  it('measures contrast the way WCAG does, checked against the two values everyone knows', () => {
    // Black on white is 21 to one and a colour against itself is 1 to one. If
    // this ever stopped being true the ratios above would be meaningless while
    // still looking like numbers.
    expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 1)
    expect(contrast('#2563eb', '#2563eb')).toBeCloseTo(1, 5)
    expect(luminance('#ffffff')).toBeCloseTo(1, 5)
    expect(luminance('#000000')).toBeCloseTo(0, 5)
  })

  it('fixes white on white by darkening, which is the lightness lever alone', () => {
    // My first expectation here was that this could not be fixed, which was
    // wrong: white on white darkens until it clears the ratio, and it does so
    // without touching saturation because there is none to touch.
    expect(contrast(ensureContrast('#ffffff', '#ffffff'), '#ffffff')).toBeGreaterThanOrEqual(MIN_CONTRAST)
  })

  it('walks a colour away from a fill of its own hue until it is readable', () => {
    const fill = '#8b4a4a'
    const fixed = ensureContrast('#d43030', fill)
    expect(contrast(fixed, fill)).toBeGreaterThanOrEqual(MIN_CONTRAST)
    // Same colour, moved, not a different one.
    expect(Math.abs(hexToHsl(fixed).h - hexToHsl('#d43030').h)).toBeLessThan(1)
  })

  it('makes every chip fill a DARK tint, which is what the text is readable on', () => {
    // The bug this rule was written for: `deriveDarkSurface` handed a pale but
    // saturated container straight to the flip, which applied the chromatic
    // floor and produced a LIGHT fill. Light text on a light fill, and no
    // amount of adjusting the text fixes it, because the ceiling is the fill.
    for (const [name, chip] of Object.entries(darkStatus)) {
      expect(hexToHsl(chip.container).l, `${name} fill is not dark`).toBeLessThanOrEqual(0.25)
      expect(hexToHsl(chip.base).l, `${name} text is not light`).toBeGreaterThan(0.4)
    }
  })

  it('keeps each chip fill in its own hue rather than flattening it to grey', () => {
    const lightContainers: Record<string, string> = Object.fromEntries(
      Object.entries(status).map(([name, chip]) => [name, chip.container]),
    )
    for (const [name, chip] of Object.entries(darkStatus)) {
      const original = hexToHsl(lightContainers[name] ?? '#000000')
      // Below a fifth of full saturation the hue is 8-bit rounding noise rather
      // than a colour: `new`'s container is a near-grey and its hue wobbles by
      // two degrees between representations. Asserting on it would be asserting
      // on the rounding.
      if (original.s < 0.2) continue
      expect(Math.abs(hexToHsl(chip.container).h - original.h), `${name} fill changed hue`).toBeLessThan(1)
    }
  })

  it('returns what it has rather than looping when neither lever is enough', () => {
    // Both loops are bounded and both guard rails are exercised here. Nothing in
    // the token set reaches this, but an unbounded walk would hang the build.
    // Grey on grey has no saturation to drain, so it ends at the lightness rail;
    // a saturated pair drains to zero saturation and ends at that one.
    expect(() => ensureContrast('#808080', '#808080', 21)).not.toThrow()
    expect(() => ensureContrast('#b91c1c', '#b91c1c', 21)).not.toThrow()
    // 21 to one is only black against white, so neither can reach it, and both
    // have to come back with something rather than spin.
    expect(contrast(ensureContrast('#808080', '#808080', 21), '#808080')).toBeLessThan(21)
  })

  it('leaves a pair alone when it already clears the ratio', () => {
    expect(ensureContrast('#000000', '#ffffff')).toBe('#000000')
  })
})

/**
 * The borders that show a state, focus and error, against every background a
 * control sits on. Three to one is WCAG 1.4.11's bar for them, written here as
 * the number rather than the imported constant, so lowering the constant fails
 * these instead of lowering them with it, KN-271.
 */
describe('the borders that show a state can be seen', () => {
  const borders = ['border/focus', 'border/error'] as const
  const backgrounds = ['bg/page', 'bg/surface', 'bg/surface-secondary'] as const
  const pairs = borders.flatMap((border) => backgrounds.map((background) => [border, background] as const))

  it.each(pairs)('%s clears 3:1 on the dark %s', (border, background) => {
    expect(contrast(darkSemantic[border], darkSemantic[background])).toBeGreaterThanOrEqual(3)
  })

  it.each(pairs)('and the light %s clears it on %s, so the design is checked too', (border, background) => {
    expect(contrast(semantic[border], semantic[background])).toBeGreaterThanOrEqual(3)
  })

  // The check walks lightness only, so each border is still its own colour.
  // Measured round the circle, so a red at 359 and one at 1 are 2 apart.
  it.each(borders)('%s keeps the hue of its light token', (border) => {
    const apart = Math.abs(hexToHsl(darkSemantic[border]).h - hexToHsl(semantic[border]).h)
    expect(Math.min(apart, 360 - apart)).toBeLessThan(1)
  })
})

/**
 * The fills: a dark tint of their own hue, and what the product draws on them
 * readable. The brand container is the selected Filter Chip: text/brand on it,
 * and its pressed edge in border/focus, KN-272. The ratios are written as the
 * numbers, WCAG's, so lowering a constant cannot lower them.
 */
describe('the fills are dark tints of their own hue, and what sits on them reads', () => {
  it.each(DARK_FILLS)('%s is derived as a fill, a dark tint of its own hue', (fill) => {
    expect(darkSemantic[fill]).toBe(deriveDarkFill(semantic[fill]))
    const { h, l } = hexToHsl(darkSemantic[fill])
    const apart = Math.abs(h - hexToHsl(semantic[fill]).h)
    expect(Math.min(apart, 360 - apart)).toBeLessThan(1)
    expect(l).toBeGreaterThanOrEqual(0.12)
    expect(l).toBeLessThanOrEqual(0.22)
  })

  it('text/brand clears 4.5:1 on the dark brand container, as a selected Filter Chip draws it', () => {
    expect(contrast(darkSemantic['text/brand'], darkSemantic['bg/brand/container'])).toBeGreaterThanOrEqual(4.5)
  })

  it('border/focus clears 3:1 on the dark brand container, as a pressed selected Filter Chip draws it', () => {
    expect(contrast(darkSemantic['border/focus'], darkSemantic['bg/brand/container'])).toBeGreaterThanOrEqual(3)
  })

  it('and the light design holds both pairs too', () => {
    expect(contrast(semantic['text/brand'], semantic['bg/brand/container'])).toBeGreaterThanOrEqual(4.5)
    expect(contrast(semantic['border/focus'], semantic['bg/brand/container'])).toBeGreaterThanOrEqual(3)
  })
})

describe('the old assertions, kept', () => {
  it('still is not the light palette wearing a different name', () => {
    // No dark value equals ANY light value, which is stronger than checking key
    // by key and needs no cast to get the keys back.
    const light = new Set<string>(Object.values(semantic))
    const survivors = Object.entries(darkSemantic).filter(([, hex]) => light.has(hex))
    expect(survivors.map(([name]) => name)).toEqual([])
  })
})
