import { useLingui } from '@lingui/react'
import { Divider, ListSubheader, MenuItem, Menu as MuiMenu, useTheme } from '@mui/material'
import { useId } from 'react'
import { inlineEndOf } from '../../theme/sides'
import { spacing, unstyledText } from '../../theme/tokens'
import { menuItemLook } from '../menu/itemLook'
import { CheckMenuItem } from './CheckMenuItem'
import type { ColumnOrder, ColumnOrderId } from './columnOrders'

// The props are documented in story-docs, not here, KN-207.
export interface SortMenuProps {
  anchorEl: HTMLElement | null
  orders: readonly ColumnOrder[]
  value: ColumnOrderId
  onChange: (order: ColumnOrderId) => void
  onClose: () => void
  actions?: { onEdit: () => void; onDelete: () => void }
}

// Nodes 912:40045 and 919:2886 are fixed at 220 and bind no variable to it. The
// edge is the file's one pixel, in the layout as the frames draw it, so the
// items are 218 wide.
const WIDTH = 220
const EDGE = 1

// The group's label, 12 on Figma's automatic 19 at Medium.
const heading = unstyledText.sortMenuLabel

// Menu / Sort, node 912:40045, and Menu / Sort (Custom), 919:2886: a column's
// orders, opened from the caption in its header. The panel is the card menu's,
// bg/surface at radius md with Elevation/Card and its edge in border/default,
// 4 above and below; «مرتب‌سازی این ستون» in text/disabled names it, 8 above, 12
// at the sides and 4 below; then each order, the chosen one ticked. A stage the
// reader made adds, 4 down and after a divider, editing the stage and deleting
// it; the default stages have the orders alone. It hangs from the column
// header's inline end, 4 below it, the frames' left edge on the header's. On
// MUI's Menu, which starts focus on the chosen order and closes on Escape and
// on a press outside; choosing closes it too, and hands over the order.
export const SortMenu = ({ anchorEl, orders, value, onChange, onClose, actions }: SortMenuProps) => {
  const { i18n } = useLingui()
  const end = inlineEndOf(useTheme().direction)
  const headingId = useId()
  const choose = (then: () => void) => () => {
    onClose()
    then()
  }
  return (
    <MuiMenu
      anchorEl={anchorEl}
      open={anchorEl !== null}
      onClose={onClose}
      // Menus open instantly, the prototype map's motion, DESIGN.md.
      transitionDuration={0}
      anchorOrigin={{ vertical: 'bottom', horizontal: end }}
      transformOrigin={{ vertical: 0, horizontal: end }}
      slotProps={{
        paper: {
          sx: (theme) => ({
            boxSizing: 'border-box',
            width: WIDTH,
            marginTop: `${spacing['2xs']}px`,
            borderRadius: `${theme.karnama.radius.md}px`,
            borderStyle: 'solid',
            borderWidth: EDGE,
            borderColor: theme.karnama.semantic['border/default'],
            backgroundColor: theme.karnama.semantic['bg/surface'],
            backgroundImage: 'none',
            boxShadow: theme.karnama.elevation.card,
          }),
        },
        list: { 'aria-labelledby': headingId, sx: { paddingBlock: `${spacing['2xs']}px` } },
      }}
    >
      <ListSubheader
        id={headingId}
        role="presentation"
        disableSticky
        sx={(theme) => ({
          paddingTop: `${spacing.xs}px`,
          paddingBottom: `${spacing['2xs']}px`,
          paddingInline: `${spacing.sm}px`,
          fontSize: `${heading.size}px`,
          lineHeight: `${heading.lineHeight}px`,
          fontWeight: heading.weight,
          letterSpacing: `${heading.letterSpacing}px`,
          color: theme.karnama.semantic['text/disabled'],
          backgroundColor: 'transparent',
        })}
      >
        {i18n._('Sort this column')}
      </ListSubheader>
      {orders.map((order) => (
        <CheckMenuItem key={order.id} label={order.label} selected={order.id === value} onClick={choose(() => {
            onChange(order.id)
          })} />
      ))}
      {actions
        ? [
            <Divider
              key="divider"
              component="li"
              sx={(theme) => ({ '&&': { marginBlockStart: `${spacing['2xs']}px`, marginBlockEnd: 0, borderColor: theme.karnama.semantic['border/default'] } })}
            />,
            <MenuItem key="edit" disableRipple onClick={choose(actions.onEdit)} sx={(theme) => menuItemLook.sx(theme, {})}>
              {i18n._('Edit status')}
            </MenuItem>,
            <MenuItem key="delete" disableRipple onClick={choose(actions.onDelete)} sx={(theme) => menuItemLook.sx(theme, { destructive: true })}>
              {i18n._('Delete status')}
            </MenuItem>,
          ]
        : null}
    </MuiMenu>
  )
}
