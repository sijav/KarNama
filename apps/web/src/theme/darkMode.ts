import { semantic, status } from './tokens'

/**
 * A DERIVED dark palette. **The design does not have one.**
 *
 * `DESIGN.md` is explicit: the Figma file defines light values only, there are
 * no dark tokens, and any dark palette must be labelled in the code as derived
 * rather than presented as the design's. This is that label. If the design ever
 * ships real dark tokens, replace this file wholesale rather than reconciling
 * it, because a half-derived palette is worse than either.
 *
 * Every value here is COMPUTED from its light counterpart by `deriveDark`
 * below, never hand picked. That is the whole point: a table of twenty
 * hand-chosen dark hexes would look exactly like design and would not be, and
 * nobody reviewing it later could tell which values someone had decided and
 * which had been guessed. One stated rule can be argued with.
 */

interface Hsl {
  h: number
  s: number
  l: number
}

/** sRGB hex to HSL, with h in degrees and s and l in 0..1. */
export const hexToHsl = (hex: string): Hsl => {
  const value = hex.replace('#', '')
  const r = Number.parseInt(value.slice(0, 2), 16) / 255
  const g = Number.parseInt(value.slice(2, 4), 16) / 255
  const b = Number.parseInt(value.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const delta = max - min

  if (delta === 0) return { h: 0, s: 0, l }

  const s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min)
  const h =
    max === r ? ((g - b) / delta + (g < b ? 6 : 0)) * 60 : max === g ? ((b - r) / delta + 2) * 60 : ((r - g) / delta + 4) * 60

  return { h, s, l }
}

/** HSL back to a six digit hex, rounded the same way in every channel. */
export const hslToHex = ({ h, s, l }: Hsl): string => {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  const sector = Math.floor(((h % 360) + 360) % 360 / 60)
  const rgb: readonly [number, number, number] =
    sector === 0 ? [c, x, 0] : sector === 1 ? [x, c, 0] : sector === 2 ? [0, c, x] : sector === 3 ? [0, x, c] : sector === 4 ? [x, 0, c] : [c, 0, x]

  const channel = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${channel(rgb[0])}${channel(rgb[1])}${channel(rgb[2])}`
}

/**
 * The rule, and it is deliberately one sentence long.
 *
 * Hue is never touched, because hue is the only part of a token that carries
 * meaning: brand blue stays blue and rejected red stays red. Lightness is
 * flipped about the middle, so what was nearly white becomes nearly black.
 * Chromatic colours then get a floor, because a saturated hue at 12 percent
 * lightness is unreadable on a dark surface, and neutrals do not, because a
 * neutral at 12 percent is exactly the dark page this needs.
 *
 * `NEUTRAL_MAX_SATURATION` is where "a grey" ends and "a colour" begins. The
 * token set has nothing between 0.07 and 0.45, so the boundary is not a
 * judgement call that any real token sits near.
 */
const NEUTRAL_MAX_SATURATION = 0.2
const CHROMATIC_MIN_LIGHTNESS = 0.55

export const deriveDark = (hex: string): string => {
  const { h, s, l } = hexToHsl(hex)
  const flipped = 1 - l
  const lightness = s <= NEUTRAL_MAX_SATURATION ? flipped : Math.max(flipped, CHROMATIC_MIN_LIGHTNESS)
  return hslToHex({ h, s, l: lightness })
}

/**
 * Backgrounds need the OTHER rule, and finding out why is the reason the tests
 * exist.
 *
 * A lightness flip reverses order, and the neutral backgrounds are all crowded
 * against white: page `#f6f7f9` is 0.971 and surface `#ffffff` is 1.0, so a
 * flip puts the page at 0.029 and the surface at 0.0 and the card ends up
 * DARKER than the page it sits on. In light the raised surface is the lighter
 * one, and in dark it has to stay the lighter one, because that is what
 * elevation looks like in both. So the neutral backgrounds are not flipped,
 * they are remapped, order preserved, from the narrow band they occupy near
 * white onto a narrow band near black.
 *
 * Chromatic backgrounds, the brand and danger containers, still take the flip:
 * they carry hue rather than elevation, and a container that is not a surface
 * should not follow the surface rule.
 */
const LIGHT_SURFACE_BAND = { from: 0.9, to: 1 }
const DARK_SURFACE_BAND = { from: 0.08, to: 0.18 }

export const deriveDarkSurface = (hex: string): string => {
  const { h, s, l } = hexToHsl(hex)
  if (s > NEUTRAL_MAX_SATURATION) return deriveDark(hex)

  const position = Math.min(1, Math.max(0, (l - LIGHT_SURFACE_BAND.from) / (LIGHT_SURFACE_BAND.to - LIGHT_SURFACE_BAND.from)))
  return hslToHex({ h, s, l: DARK_SURFACE_BAND.from + position * (DARK_SURFACE_BAND.to - DARK_SURFACE_BAND.from) })
}

/**
 * Every semantic token, derived. Not the design's values.
 *
 * Written out one line per token rather than mapped over `Object.entries`,
 * because mapping needs a cast to get the keys back and this codebase does not
 * use `as`. One line per token also makes the derivation visible at the point
 * of use: each row says which light token it came from.
 */
export const darkSemantic = {
  'bg/page': deriveDarkSurface(semantic['bg/page']),
  'bg/surface': deriveDarkSurface(semantic['bg/surface']),
  'bg/surface-secondary': deriveDarkSurface(semantic['bg/surface-secondary']),
  'bg/brand/default': deriveDarkSurface(semantic['bg/brand/default']),
  'bg/brand/hover': deriveDarkSurface(semantic['bg/brand/hover']),
  'bg/brand/container': deriveDarkSurface(semantic['bg/brand/container']),
  'bg/danger/default': deriveDarkSurface(semantic['bg/danger/default']),
  'bg/danger/hover': deriveDarkSurface(semantic['bg/danger/hover']),
  'text/primary': deriveDark(semantic['text/primary']),
  'text/secondary': deriveDark(semantic['text/secondary']),
  'text/disabled': deriveDark(semantic['text/disabled']),
  'text/on-accent': deriveDark(semantic['text/on-accent']),
  'text/brand': deriveDark(semantic['text/brand']),
  'text/error': deriveDark(semantic['text/error']),
  'border/default': deriveDark(semantic['border/default']),
  'border/focus': deriveDark(semantic['border/focus']),
  'border/error': deriveDark(semantic['border/error']),
  'accent/200': deriveDark(semantic['accent/200']),
  'accent/700': deriveDark(semantic['accent/700']),
  'gray/200': deriveDark(semantic['gray/200']),
} satisfies Record<keyof typeof semantic, string>

const pair = (name: keyof typeof status) => ({
  base: deriveDark(status[name].base),
  container: deriveDark(status[name].container),
})

/** Every status pair, derived. The base stays the readable end on a dark chip. */
export const darkStatus = {
  new: pair('new'),
  applied: pair('applied'),
  interview: pair('interview'),
  rejected: pair('rejected'),
  offer: pair('offer'),
  'custom-1': pair('custom-1'),
  'custom-2': pair('custom-2'),
  'custom-3': pair('custom-3'),
  'custom-4': pair('custom-4'),
} satisfies Record<keyof typeof status, { base: string; container: string }>
