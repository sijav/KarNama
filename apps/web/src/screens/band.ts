import type { SxProps, Theme } from '@mui/material'
import { spacing } from '../theme/tokens'

/**
 * The frame the board and the network share, read from their frames with
 * use_figma on 2026-09-14, KN-481: `241:2` and `252:2` at 1440, `241:146` and
 * `252:411` at 390.
 *
 * A page opens on a Header band, `241:17`, `252:36`, `241:147` and `252:412`:
 * `bg/surface` with one pixel of `border/default` along its foot, holding the
 * Page Header, the page's toolbar and, on a phone's board, the status chips. A
 * desktop's band is 32 above and at the sides, 16 below and 16 between its
 * rows; a phone's is 16, 12 and 12. What follows it sits on the page's own
 * `bg/page` in the same gutter, 32 or 16, which is all the room a page has at
 * its edges: the shell gives it none of its own, KN-452.
 */

// One pixel, as every stroke in the file.
const EDGE = 1

/** The page's gutter: the band's sides, and the room round what follows it. */
export const gutterOf = (wide: boolean) => (wide ? spacing.xl : spacing.md)

// Between the band's rows, and under the last of them.
const stepOf = (wide: boolean) => (wide ? spacing.md : spacing.sm)

// Under an sx key, which the lint rule reads as CSS.
export const band = {
  sx:
    (wide: boolean): SxProps<Theme> =>
    (theme) => ({
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      gap: `${stepOf(wide)}px`,
      paddingBlockStart: `${gutterOf(wide)}px`,
      paddingInline: `${gutterOf(wide)}px`,
      paddingBlockEnd: `${stepOf(wide)}px`,
      backgroundColor: theme.karnama.semantic['bg/surface'],
      // Drawn inside and taking no space, as DESIGN.md says every stroke in the
      // file is: the band is its rows and its padding, 144 on a desktop.
      '&::after': {
        content: '""',
        position: 'absolute',
        insetInline: 0,
        insetBlockEnd: 0,
        borderBlockEndStyle: 'solid',
        borderBlockEndWidth: EDGE,
        borderBlockEndColor: theme.karnama.semantic['border/default'],
        pointerEvents: 'none',
      },
    }),
}
