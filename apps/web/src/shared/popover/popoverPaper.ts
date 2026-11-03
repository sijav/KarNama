import type { Theme } from '@mui/material'
import { spacing } from '../../theme/tokens'

// The radius the redesign's popovers draw, 10, which binds no variable and is
// none of the radius scale, and their one pixel edge.
const RADIUS = 10
const EDGE = 1

// The surface the redesign's popovers share, read on 2026-11-03 from Popover /
// نتیجهٔ مصاحبه, 844:85811, the two date popovers, 755:22108 and 774:16705,
// and the time list, 774:16897: bg/surface with one pixel of border/default
// inside, which the file counts in the layout, so here it is a border; radius
// 10 and a shadow of their own, elevation.popover. Under an sx key, which the
// lint rule reads as CSS, as the modal's paper is.
export const popoverSurface = {
  sx: (theme: Theme) =>
    ({
      boxSizing: 'border-box',
      borderStyle: 'solid',
      borderWidth: EDGE,
      borderColor: theme.karnama.semantic['border/default'],
      borderRadius: `${RADIUS}px`,
      backgroundColor: theme.karnama.semantic['bg/surface'],
      backgroundImage: 'none',
      boxShadow: theme.karnama.elevation.popover,
    }) as const,
}

// The panel of the three popovers on that surface: 16 of padding and 12
// between the parts, at the caller's width, 369 for an interview's result and
// 276 for a date.
export const popoverPaper = {
  sx: (theme: Theme, width: number) =>
    ({
      ...popoverSurface.sx(theme),
      width,
      display: 'flex',
      flexDirection: 'column',
      gap: `${spacing.sm}px`,
      padding: `${spacing.md}px`,
    }) as const,
}
