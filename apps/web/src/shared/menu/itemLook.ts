import type { CSSObject, Theme } from '@mui/material'
import { spacing, type as typeScale } from '../../theme/tokens'

// Node 181:22's items are 40 tall, and Menu Item / Check's, 912:40044, too;
// neither binds a variable to it. The keyboard's ring is the three drawn inside
// that the Filter Chip and the Icon Button use, one in from the menu's edge.
export const MENU_ITEM_HEIGHT = 40
const EDGE = 1
const FOCUS_RING = 3

export interface ItemLook {
  destructive?: boolean
  blocked?: boolean
}

// The look of a menu's item, node 181:22: 40 tall, 12 at the sides and 8
// between, the Body text in text/primary, text/error for a destructive action
// and text/disabled for a blocked one. State=Hover's grey, or State=Destructive
// Hover's red/100 for a destructive item, 961:2491, KN-793; keyboard focus
// takes it too, with its ring. Shared by the Menu and the sort menus; under an
// sx key, which the lint rule reads as CSS.
export const menuItemLook = {
  sx: (theme: Theme, { destructive = false, blocked = false }: ItemLook): CSSObject => {
    const colour = theme.karnama.semantic
    const text = blocked ? colour['text/disabled'] : destructive ? colour['text/error'] : colour['text/primary']
    const hover = destructive ? colour['red/100'] : colour['bg/surface-secondary']
    return {
      position: 'relative',
      boxSizing: 'border-box',
      minHeight: MENU_ITEM_HEIGHT,
      height: MENU_ITEM_HEIGHT,
      paddingBlock: 0,
      paddingInline: `${spacing.sm}px`,
      gap: `${spacing.xs}px`,
      fontSize: `${typeScale.body.size}px`,
      lineHeight: `${typeScale.body.lineHeight}px`,
      fontWeight: typeScale.body.weight,
      letterSpacing: typeScale.body.letterSpacing,
      color: text,
      cursor: blocked ? 'default' : 'pointer',
      '&:hover, &.Mui-focusVisible': { backgroundColor: blocked ? 'transparent' : hover },
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
