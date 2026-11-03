import type { Theme } from '@mui/material'
import { spacing } from '../../theme/tokens'

// The radius the redesign's popovers draw, 10, which binds no variable and is
// none of the radius scale, and their one pixel edge.
const RADIUS = 10
const EDGE = 1

// The panel the redesign's popovers share, read on 2026-11-03 from Popover /
// نتیجهٔ مصاحبه, 844:85811, and the two date popovers, 755:22108 and
// 774:16705: bg/surface with one pixel of border/default inside, which the
// file counts in the layout, so here it is a border; 16 of padding and 12
// between the parts; radius 10 and a shadow of their own, elevation.popover.
// The width is the caller's: 369 for an interview's result, 276 for a date.
// Under an sx key, which the lint rule reads as CSS, as the modal's paper is.
export const popoverPaper = {
  sx: (theme: Theme, width: number) =>
    ({
      boxSizing: 'border-box',
      width,
      display: 'flex',
      flexDirection: 'column',
      gap: `${spacing.sm}px`,
      padding: `${spacing.md}px`,
      borderStyle: 'solid',
      borderWidth: EDGE,
      borderColor: theme.karnama.semantic['border/default'],
      borderRadius: `${RADIUS}px`,
      backgroundColor: theme.karnama.semantic['bg/surface'],
      backgroundImage: 'none',
      boxShadow: theme.karnama.elevation.popover,
    }) as const,
}
