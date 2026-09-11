import { Divider, MenuItem, Menu as MuiMenu, useTheme } from '@mui/material'
import { inlineEndOf } from '../../theme/sides'
import { spacing, type as typeScale } from '../../theme/tokens'
import { Tooltip } from '../tooltip'

export interface MenuAction {
  id: string
  label: string
  onSelect: () => void
  destructive?: boolean
  disabled?: boolean
  reason?: string
}

// The props are documented in story-docs, not here, KN-207.
export interface MenuProps {
  label: string
  anchorEl: HTMLElement | null
  actions: readonly MenuAction[]
  onClose: () => void
}

// Node 512:8350's menus are fixed at 220 and 181:22's items at 40; neither
// binds a variable. The edge is the file's one pixel, and the keyboard's ring
// the three drawn inside that the Filter Chip and the Icon Button use.
const WIDTH = 220
const ITEM_HEIGHT = 40
const EDGE = 1
const FOCUS_RING = 3

// The Menu of node 512:8350 and its items, 181:22, on MUI's Menu, which closes
// on Escape and on a press outside and gives focus back to the element that
// opened it. The destructive actions come last, set apart by a divider, as
// both of the file's menus draw them, so they are told apart by place and by
// their verb as well as by their red. A disabled action stays in the keyboard's
// path so its reason, beside it, can be read. Choosing an action calls it and
// nothing else: whether the menu closes is the action's to decide, since the
// Status menu's colour replaces the menu rather than closing it.
export const Menu = ({ label, anchorEl, actions, onClose }: MenuProps) => {
  // It hangs from the trigger's inline end, as 259:2 hangs it from the column
  // header's three dots; MUI's Popover places by left and right.
  const end = inlineEndOf(useTheme().direction)
  const firstDestructive = actions.findIndex((action) => action.destructive === true)
  return (
    <MuiMenu
      anchorEl={anchorEl}
      open={anchorEl !== null}
      onClose={onClose}
      // Menus open instantly, the prototype map's motion, DESIGN.md.
      transitionDuration={0}
      // Its top, 0 from the top of the menu, at the trigger's foot.
      anchorOrigin={{ vertical: 'bottom', horizontal: end }}
      transformOrigin={{ vertical: 0, horizontal: end }}
      slotProps={{
        paper: {
          sx: (theme) => ({
            width: WIDTH,
            marginTop: `${spacing['2xs']}px`,
            borderRadius: `${theme.karnama.radius.md}px`,
            backgroundColor: theme.karnama.semantic['bg/surface'],
            backgroundImage: 'none',
            boxShadow: theme.karnama.elevation.card,
            // The edge, inside and out of layout, the Options Menu's way.
            outline: `${EDGE}px solid ${theme.karnama.semantic['border/default']}`,
            outlineOffset: `-${EDGE}px`,
          }),
        },
        list: { 'aria-label': label, disabledItemsFocusable: true, sx: { paddingBlock: `${spacing['2xs']}px` } },
      }}
    >
      {actions.flatMap((action, index) => {
        const blocked = action.disabled === true
        const item = (
          <MenuItem
            key={action.id}
            disableRipple
            aria-disabled={blocked}
            onClick={() => {
              if (!blocked) action.onSelect()
            }}
            sx={(theme) => {
              const colour = theme.karnama.semantic
              const text = blocked ? colour['text/disabled'] : action.destructive === true ? colour['text/error'] : colour['text/primary']
              return {
                position: 'relative',
                boxSizing: 'border-box',
                minHeight: ITEM_HEIGHT,
                height: ITEM_HEIGHT,
                paddingBlock: 0,
                paddingInline: `${spacing.sm}px`,
                gap: `${spacing.xs}px`,
                fontSize: `${typeScale.body.size}px`,
                lineHeight: `${typeScale.body.lineHeight}px`,
                fontWeight: typeScale.body.weight,
                letterSpacing: typeScale.body.letterSpacing,
                color: text,
                cursor: blocked ? 'default' : 'pointer',
                '&:hover, &.Mui-focusVisible': { backgroundColor: blocked ? 'transparent' : colour['bg/surface-secondary'] },
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
            }}
          >
            {action.label}
          </MenuItem>
        )
        const shown =
          blocked && action.reason !== undefined ? (
            <Tooltip key={action.id} title={action.reason} placement="start">
              {item}
            </Tooltip>
          ) : (
            item
          )
        return index === firstDestructive && index > 0
          ? [
              <Divider
                key={`${action.id}-divider`}
                component="li"
                sx={(theme) => ({ '&&': { marginBlock: 0, borderColor: theme.karnama.semantic['border/default'] } })}
              />,
              shown,
            ]
          : [shown]
      })}
    </MuiMenu>
  )
}
