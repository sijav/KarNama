import { useLingui } from '@lingui/react'
import { Box, InputBase, MenuItem, Select as MuiSelect, useTheme } from '@mui/material'
import { useId, useState } from 'react'
import { spacing, type as typeScale } from '../../theme/tokens'
import { Icon } from '../icon'
import { OptionLabel, optionRow, optionsMenuList, optionsMenuPaper } from '../select'
import { SORT_ORDERS, isSortOrder, sortLabels, type SortOrder } from './orders'

// The props are documented in story-docs, not here, KN-207.
export interface SortControlProps {
  value: SortOrder
  onChange: (value: SortOrder) => void
}

// Node 408:512's control is 36 tall and its menu, 447:601, 240 wide and 6 below
// it; none binds a variable. The edges are the file's: one pixel at rest, one
// and a half while open, an inset shadow over the one pixel border since
// Chromium floors a border of 1.5, the Filter Chip's way, KN-282, and the
// Select family's two when focused by the keyboard, which the set does not draw.
const HEIGHT = 36
const MENU_WIDTH = 240
const MENU_GAP = 6
const EDGE = 1
const FOCUS_EDGE = 2
const OPEN_EDGE = 1.5
const CHEVRON = 16

// MUI's own class for the chevron, which the control positions and keeps still.
const Chevron = ({ className }: { className?: string }) => (
  <Box component="span" className={className} sx={{ display: 'inline-flex' }}>
    <Icon name="chevron-down" size="sm" color="inherit" />
  </Box>
)

// The Sort Control of node 408:512, Default, Hover and Open: the sort icon,
// «مرتب‌سازی:» and the current order, then the chevron, on MUI's Select, which
// brings the listbox and its keys. The four orders are the only ones, DESIGN.md;
// status is not one, since the board's columns already are. A change is read
// out from a status region that is in the page from the start.
export const SortControl = ({ value, onChange }: SortControlProps) => {
  const { i18n } = useLingui()
  const labels = sortLabels(i18n)
  const prefixId = useId()
  const end = useTheme().direction === 'rtl' ? 'left' : 'right'
  // What the status region says: nothing until the order changes.
  const [said, setSaid] = useState('')
  return (
    <>
      <Box
        role="status"
        sx={{
          position: 'absolute',
          width: `${EDGE}px`,
          height: `${EDGE}px`,
          margin: `-${EDGE}px`,
          padding: 0,
          border: 0,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
          whiteSpace: 'nowrap',
        }}
      >
        {said}
      </Box>
      <MuiSelect<SortOrder>
        labelId={prefixId}
        value={value}
        onChange={(event) => {
          const next = event.target.value
          if (!isSortOrder(next)) return
          setSaid(`${i18n._('Sorted by')} ${labels[next]}`)
          onChange(next)
        }}
        IconComponent={Chevron}
        input={<InputBase />}
        renderValue={(chosen) => (
          <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: `${spacing.xs}px` }}>
            <Icon name="sort" size="sm" />
            <Box component="span" id={prefixId} sx={(theme) => ({ color: theme.karnama.semantic['text/secondary'] })}>
              {i18n._('Sort:')}
            </Box>
            <Box component="span" sx={(theme) => ({ fontWeight: typeScale.label.weight, color: theme.karnama.semantic['text/primary'] })}>
              {labels[chosen]}
            </Box>
          </Box>
        )}
        MenuProps={{
          // Menus open instantly, the prototype map's motion, DESIGN.md.
          transitionDuration: 0,
          // It hangs from the control's inline end, as 447:601 does.
          anchorOrigin: { vertical: 'bottom', horizontal: end },
          transformOrigin: { vertical: 0, horizontal: end },
          slotProps: {
            paper: { sx: (theme) => ({ ...optionsMenuPaper.sx(theme), width: MENU_WIDTH, marginTop: `${MENU_GAP}px` }) },
            list: optionsMenuList,
          },
        }}
        sx={(theme) => {
          const colour = theme.karnama.semantic
          return {
            position: 'relative',
            height: HEIGHT,
            boxSizing: 'border-box',
            paddingInline: `${spacing.sm}px`,
            borderRadius: `${theme.karnama.radius.md}px`,
            backgroundColor: 'transparent',
            fontSize: `${typeScale.body.size}px`,
            lineHeight: `${typeScale.body.lineHeight}px`,
            fontWeight: typeScale.body.weight,
            '& .MuiSelect-select.MuiSelect-select.MuiSelect-select.MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              paddingBlock: 0,
              paddingInlineStart: 0,
              paddingInlineEnd: `${CHEVRON + spacing.xs}px`,
              minHeight: 0,
              backgroundColor: 'transparent',
            },
            // The chevron: 16 in text/secondary at the inline end, 12 in, and
            // never turned, as the open state draws it.
            '& .MuiSelect-icon': {
              top: '50%',
              insetInlineEnd: `${spacing.sm}px`,
              transform: 'translateY(-50%)',
              color: colour['text/secondary'],
            },
            '& .MuiSelect-iconOpen': { transform: 'translateY(-50%)' },
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              borderStyle: 'solid',
              borderWidth: EDGE,
              borderColor: colour['border/default'],
              pointerEvents: 'none',
            },
            '&:hover': { backgroundColor: colour['bg/surface-secondary'] },
            '&.Mui-focused::before': { borderWidth: FOCUS_EDGE, borderColor: colour['border/focus'] },
            // Open, 408:511: the hover fill and one and a half of border/focus.
            '&&:has([aria-expanded="true"])': {
              backgroundColor: colour['bg/surface-secondary'],
              boxShadow: `inset 0 0 0 ${OPEN_EDGE}px ${colour['border/focus']}`,
            },
            '&&:has([aria-expanded="true"])::before': { borderWidth: EDGE, borderColor: colour['border/focus'] },
          }
        }}
      >
        {SORT_ORDERS.map((order) => (
          <MenuItem key={order} value={order} disableRipple sx={optionRow.sx}>
            <OptionLabel label={labels[order]} chosen={order === value} />
          </MenuItem>
        ))}
      </MuiSelect>
    </>
  )
}
