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
 * Relative luminance and contrast ratio, both from WCAG 2.
 *
 * Here because the first version of this file did not have them and was wrong
 * because of it. Every check it had was about HSL: hue preserved, lightness
 * flipped, a floor under the chromatic values. All of those passed while eight
 * of the nine dark status chips came out at between 1.01 and 1.51 to one, which
 * is text you cannot read. HSL is not perceptual and lightness is not contrast.
 */
const channelLuminance = (channel: number) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)

export const luminance = (hex: string): number => {
  const value = hex.replace('#', '')
  // Read channel by channel rather than through an array. `noUncheckedIndexedAccess`
  // makes a destructured element possibly undefined, and the `?? 0` that
  // silences it is a branch no test can ever reach: unreachable code that
  // coverage correctly refuses to call covered.
  const channel = (offset: number) => channelLuminance(Number.parseInt(value.slice(offset, offset + 2), 16) / 255)
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4)
}

export const contrast = (a: string, b: string): number => {
  const first = luminance(a)
  const second = luminance(b)
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
}

/** WCAG AA for normal text. The design is a reading surface, so this is the bar. */
export const MIN_CONTRAST = 4.5

/**
 * Walks a colour's lightness away from a background until it is readable.
 *
 * Hue and saturation are untouched, so this is still the same colour: it is the
 * smallest change that makes the pair legible rather than a new palette. The
 * direction is decided by the background, so a light foreground on a dark fill
 * gets lighter and the reverse gets darker, and the walk gives up rather than
 * looping if a hue simply cannot reach the ratio.
 *
 * There was a second loop here that drained saturation when lightness alone
 * could not get there, and it was dead code: at lightness 1 or 0 the colour is
 * white or black whatever its saturation, so once the first loop hits a rail
 * there is nothing left for a second lever to do. Coverage is what said so.
 * The real fix for the case that motivated it was `deriveDarkFill`, below:
 * the problem was never the text, it was a fill that came out light.
 */
export const ensureContrast = (foreground: string, background: string, ratio = MIN_CONTRAST): string => {
  const { h, s, l } = hexToHsl(foreground)
  const towardsLight = luminance(background) < 0.5
  let best = foreground

  let lightness = l
  for (let step = 0; step < 100; step += 1) {
    if (contrast(best, background) >= ratio) return best
    lightness = towardsLight ? Math.min(1, lightness + 0.01) : Math.max(0, lightness - 0.01)
    best = hslToHex({ h, s, l: lightness })
    if (lightness === 0 || lightness === 1) break
  }
  return best
}

/** The surface everything is read against, computed once so the text rows can cite it. */
const darkSurface = deriveDarkSurface(semantic['bg/surface'])

/**
 * Every semantic token, derived. Not the design's values.
 *
 * Written out one line per token rather than mapped over `Object.entries`,
 * because mapping needs a cast to get the keys back and this codebase does not
 * use `as`. One line per token also makes the derivation visible at the point
 * of use: each row says which light token it came from, and whether it was then
 * checked for contrast.
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
  // Text is derived AND THEN checked against the surface it sits on. The
  // derivation alone left secondary at 3.71 to one, brand at 2.62 and error at
  // 3.38, all below the 4.5 that makes normal text readable, while every HSL
  // assertion passed. `text/disabled` is exempt on purpose: disabled text is
  // meant to recede, and WCAG does not require contrast from it.
  'text/primary': ensureContrast(deriveDark(semantic['text/primary']), darkSurface),
  'text/secondary': ensureContrast(deriveDark(semantic['text/secondary']), darkSurface),
  'text/disabled': deriveDark(semantic['text/disabled']),
  'text/on-accent': ensureContrast(deriveDark(semantic['text/on-accent']), deriveDarkSurface(semantic['bg/brand/default'])),
  'text/brand': ensureContrast(deriveDark(semantic['text/brand']), darkSurface),
  'text/error': ensureContrast(deriveDark(semantic['text/error']), darkSurface),
  'border/default': deriveDark(semantic['border/default']),
  'border/focus': deriveDark(semantic['border/focus']),
  'border/error': deriveDark(semantic['border/error']),
  'accent/200': deriveDark(semantic['accent/200']),
  'accent/700': deriveDark(semantic['accent/700']),
  'gray/200': deriveDark(semantic['gray/200']),
} satisfies Record<keyof typeof semantic, string>


/**
 * A status pair, and the two halves need OPPOSITE treatment.
 *
 * The first version put both through the same flip with the same chromatic
 * floor, so both landed near lightness 0.55 and collapsed onto each other:
 * eight of the nine chips came out between 1.01 and 1.51 to one, which is text
 * you cannot read, while every test passed because every test was about HSL.
 *
 * The container is a FILL, so it takes the surface rule and becomes a dark tint
 * of its own hue. The base is TEXT on that fill, so it stays light and is then
 * walked away from the fill until it clears 4.5 to one. That is the same
 * relationship the light design has, base readable on container, expressed the
 * other way up.
 */
const LIGHT_FILL_BAND = { from: 0.85, to: 1 }
const DARK_FILL_BAND = { from: 0.12, to: 0.22 }

/**
 * A chip fill in dark mode: the same hue, at a dark tint of it.
 *
 * `deriveDarkSurface` was the wrong tool and it is worth saying why, because it
 * looked right. A container like rejected's `#fee2e2` is a pale red with high
 * saturation, so the surface rule handed it straight to `deriveDark`, which
 * applied the chromatic FLOOR and produced a LIGHT red. A light fill under
 * light text is the collapse this whole pair function exists to avoid, and no
 * amount of walking the text away from it helps, because the ceiling is the
 * fill. A fill is not a surface and it is not a foreground: it needs its own
 * rule, which is the band remap with no saturation gate in front of it.
 */
export const deriveDarkFill = (hex: string): string => {
  const { h, s, l } = hexToHsl(hex)
  const position = Math.min(1, Math.max(0, (l - LIGHT_FILL_BAND.from) / (LIGHT_FILL_BAND.to - LIGHT_FILL_BAND.from)))
  return hslToHex({ h, s, l: DARK_FILL_BAND.from + position * (DARK_FILL_BAND.to - DARK_FILL_BAND.from) })
}

const pair = (name: keyof typeof status) => {
  const container = deriveDarkFill(status[name].container)
  return { base: ensureContrast(deriveDark(status[name].base), container), container }
}

/** Every status pair, derived. The base is readable on the container, and it is checked. */
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
