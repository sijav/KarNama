import geometry from './glyphs.json'

// The 30 icons of node 239:44, their geometry exported from the file on
// 2026-09-11 into glyphs.json, each in its 24 grid: path data is drawing, not
// copy, so it lives in JSON with the rest of the file's numbers. Every icon but
// one is a stroke, two pixels, round cap and join; `more` is three filled dots,
// as the file draws it.

export type IconName =
  | 'link'
  | 'search'
  | 'x'
  | 'arrow-right'
  | 'plus'
  | 'check'
  | 'mail'
  | 'trash'
  | 'pencil'
  | 'chevron-down'
  | 'more'
  | 'download'
  | 'file'
  | 'external-link'
  | 'user'
  | 'phone'
  | 'building'
  | 'calendar'
  | 'map-pin'
  | 'briefcase'
  | 'banknote'
  | 'clock'
  | 'log-out'
  | 'filter'
  | 'sort'
  | 'alert-circle'
  | 'user-plus'
  | 'tag'
  | 'layers'
  | 'note'
  | 'settings'

// In DESIGN.md's order, which the unit test holds it to: the file's thirty,
// then the owner's addition, `settings`, KN-478. The file draws no settings, so
// its geometry is Lucide 1.41.0's own, the family the thirty are redrawn from,
// written into this grid; Lucide's licence travels with it in LICENSE-lucide.txt.
export const ICON_NAMES = [
  'link',
  'search',
  'x',
  'arrow-right',
  'plus',
  'check',
  'mail',
  'trash',
  'pencil',
  'chevron-down',
  'more',
  'download',
  'file',
  'external-link',
  'user',
  'phone',
  'building',
  'calendar',
  'map-pin',
  'briefcase',
  'banknote',
  'clock',
  'log-out',
  'filter',
  'sort',
  'alert-circle',
  'user-plus',
  'tag',
  'layers',
  'note',
  'settings',
] as const satisfies readonly IconName[]

// What an icon draws: its stroked paths and its filled ones.
export interface Glyph {
  stroke: readonly string[]
  fill: readonly string[]
}

export const GLYPHS: Readonly<Record<IconName, Glyph>> = geometry
