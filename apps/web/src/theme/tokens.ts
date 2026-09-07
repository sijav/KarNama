/**
 * The Figma token set, transcribed from `DESIGN.md`.
 *
 * `DESIGN.md` is the contract and it is checked against Figma by
 * `agent/scripts/verify/KN-004.mjs`. This file is checked against `DESIGN.md`
 * by its own test, so a value cannot drift here without the test noticing, and
 * cannot drift in `DESIGN.md` without the verifier noticing. Nothing in a
 * component may state a colour, a spacing or a radius: it comes from here,
 * through the MUI theme.
 */

export const semantic = {
  'bg/page': '#f6f7f9',
  'bg/surface': '#ffffff',
  'bg/surface-secondary': '#f3f4f6',
  'bg/brand/default': '#2563eb',
  'bg/brand/hover': '#1d4ed8',
  'bg/brand/container': '#dbeafe',
  'bg/danger/default': '#ef4444',
  'bg/danger/hover': '#d43030',
  'text/primary': '#111827',
  'text/secondary': '#6b7280',
  'text/disabled': '#9ca3af',
  'text/on-accent': '#ffffff',
  'text/brand': '#1d4ed8',
  'text/error': '#b91c1c',
  'border/default': '#e5e7eb',
  'border/focus': '#2563eb',
  'border/error': '#ef4444',
  'accent/200': '#bfdbfe',
  'accent/700': '#1e40af',
  'gray/200': '#e5e7eb',
} as const

/**
 * Five defaults and four reserved for statuses the user defines. `base` is the
 * text and the 4px stripe, `container` is the chip fill. The Persian labels are
 * the DEFAULTS only: a user can rename any status, so the label is data.
 */
export const status = {
  new: { base: '#4b5563', container: '#e5e7eb' },
  applied: { base: '#4f46e5', container: '#e0e7ff' },
  interview: { base: '#b45309', container: '#fef3c7' },
  rejected: { base: '#b91c1c', container: '#fee2e2' },
  offer: { base: '#166534', container: '#dcfce7' },
  'custom-1': { base: '#0f766e', container: '#ccfbf1' },
  'custom-2': { base: '#7e22ce', container: '#f3e8ff' },
  'custom-3': { base: '#be185d', container: '#fce7f3' },
  'custom-4': { base: '#155e75', container: '#cffafe' },
} as const

export const spacing = { '2xs': 4, xs: 8, sm: 12, md: 16, lg: 24, xl: 32, '2xl': 48, '3xl': 64 } as const

export const radius = { none: 0, sm: 4, md: 8, lg: 16, full: 999 } as const

export const iconSize = { sm: 16, md: 20, base: 24 } as const

/**
 * Five type roles and only five. `Body/Small` at 13 was deleted from the design
 * and must not come back; the document records that and so does this comment,
 * because a sixth role is the kind of thing that gets re-added by someone who
 * needs a size between two others.
 */
export const type = {
  'heading/l': { size: 24, lineHeight: 32, weight: 600, letterSpacing: 0 },
  'heading/m': { size: 20, lineHeight: 28, weight: 600, letterSpacing: 0 },
  title: { size: 16, lineHeight: 24, weight: 500, letterSpacing: 0 },
  body: { size: 14, lineHeight: 22, weight: 400, letterSpacing: 0 },
  label: { size: 12, lineHeight: 16, weight: 500, letterSpacing: 0.2 },
} as const

/** The two effect styles. A card sits on the page, a modal sits above everything. */
export const elevation = {
  card: '0 1px 3px 0 #0000000F, 0 1px 2px 0 #0000000A',
  modal: '0 8px 24px -4px #0000001F, 0 2px 6px -2px #00000014',
} as const

export const fontFamily = "'Vazirmatn Variable', 'Vazirmatn', system-ui, sans-serif"

export type SemanticToken = keyof typeof semantic
export type StatusToken = keyof typeof status
export type SpacingToken = keyof typeof spacing
export type RadiusToken = keyof typeof radius
export type TypeRole = keyof typeof type
