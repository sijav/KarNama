import { Box, type CSSObject, type Theme } from '@mui/material'
import { spacing, type as typeScale } from '../../theme/tokens'
import { Icon } from '../icon'

// The Options Menu of node 408:487 and its Option Rows, 408:465, which the
// file makes the content of both the Select and the Sort Control.

// A row is 40 tall and binds no variable; the edge is the file's one pixel,
// and the keyboard's ring the three drawn inside that the Filter Chip and the
// Icon Button use.
const OPTION_HEIGHT = 40
const EDGE = 1
const FOCUS_RING = 3

// The menu's panel: bg/surface, radius md and its own shadow, with its one
// pixel edge as an inset outline, drawn inside and out of its layout, which
// forced colours keep and a scrolling list does not carry with it. Where it
// sits under its trigger is the trigger's to say.
export const optionsMenuPaper = {
  sx: (theme: Theme): CSSObject => ({
    borderRadius: `${theme.karnama.radius.md}px`,
    backgroundColor: theme.karnama.semantic['bg/surface'],
    backgroundImage: 'none',
    boxShadow: theme.karnama.elevation.optionsMenu,
    outline: `${EDGE}px solid ${theme.karnama.semantic['border/default']}`,
    outlineOffset: `-${EDGE}px`,
  }),
}

// The list inside it, 4 above and below its rows.
export const optionsMenuList = { sx: { paddingBlock: `${spacing['2xs']}px` } }

// A row, 408:465: Default in text/primary, Hover in bg/surface-secondary,
// Selected in bg/brand/container and text/brand, Disabled in text/disabled,
// and the keyboard's row with the Hover fill and the ring. Body's size and
// line height at Label's weight, no tracking.
export const optionRow = {
  sx: (theme: Theme): CSSObject => {
    const colour = theme.karnama.semantic
    return {
      position: 'relative',
      boxSizing: 'border-box',
      minHeight: OPTION_HEIGHT,
      height: OPTION_HEIGHT,
      paddingBlock: 0,
      paddingInline: `${spacing.sm}px`,
      gap: `${spacing.xs}px`,
      fontSize: `${typeScale.body.size}px`,
      lineHeight: `${typeScale.body.lineHeight}px`,
      fontWeight: typeScale.label.weight,
      letterSpacing: typeScale.body.letterSpacing,
      color: colour['text/primary'],
      '&:hover, &.Mui-focusVisible': { backgroundColor: colour['bg/surface-secondary'] },
      '&.Mui-selected, &.Mui-selected:hover, &.Mui-selected.Mui-focusVisible': {
        backgroundColor: colour['bg/brand/container'],
        color: colour['text/brand'],
      },
      '&.Mui-disabled': { opacity: 1, color: colour['text/disabled'] },
      '&.Mui-focusVisible::after': {
        content: '""',
        position: 'absolute',
        inset: EDGE,
        borderStyle: 'solid',
        borderWidth: FOCUS_RING,
        borderColor: colour['border/focus'],
        pointerEvents: 'none',
      },
    }
  },
}

// A row's content: the name, cut rather than wrapped, and when chosen the check
// of 408:459, 16 in the row's colour, at the inline end.
export const OptionLabel = ({ label, chosen }: { label: string; chosen: boolean }) => (
  <>
    <Box component="span" sx={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {label}
    </Box>
    {chosen ? <Icon name="check" size="sm" color="inherit" /> : null}
  </>
)
