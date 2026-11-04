import { Box, MenuItem, type MenuItemProps } from '@mui/material'
import { iconSize, type as typeScale } from '../../theme/tokens'
import { Icon } from '../icon'
import { menuItemLook } from '../menu/itemLook'

// The props are documented in story-docs, not here, KN-207. The rest are MUI's
// MenuItem's, which the menu list passes to its items.
export interface CheckMenuItemProps extends Omit<MenuItemProps, 'children' | 'component' | 'role' | 'selected' | 'sx'> {
  label: string
  selected: boolean
}

// The tick's room, 16 at the inline start whether the tick is drawn or not, so
// the labels of a menu line up.
const CHECK = iconSize.sm

// Menu Item / Check, node 912:40044, Default, Hover, Selected and Selected
// Hover: one of a choice of orders, a radio in the menu. The menu item's look,
// 40 tall, 12 at the sides and 8 between, its label the Body text in
// text/primary; chosen, the label turns text/brand at Medium and the check, 16
// in the same, fills the room at the inline start. Under the pointer, and under
// keyboard focus with its ring, either fills with bg/surface-secondary.
export const CheckMenuItem = ({ label, selected, ...rest }: CheckMenuItemProps) => (
  <MenuItem
    {...rest}
    role="menuitemradio"
    aria-checked={selected}
    selected={selected}
    disableRipple
    sx={(theme) => {
      const colour = theme.karnama.semantic
      return {
        ...menuItemLook.sx(theme, {}),
        '&.Mui-selected': { backgroundColor: 'transparent', color: colour['text/brand'], fontWeight: typeScale.label.weight },
        '&.Mui-selected:hover, &.Mui-selected.Mui-focusVisible': { backgroundColor: colour['bg/surface-secondary'] },
      }
    }}
  >
    <Box component="span" aria-hidden sx={{ display: 'inline-flex', flexShrink: 0, width: CHECK, height: CHECK }}>
      {selected ? <Icon name="check" size="sm" color="inherit" /> : null}
    </Box>
    <Box component="span" sx={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {label}
    </Box>
  </MenuItem>
)
