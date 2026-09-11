import { useLingui } from '@lingui/react'
import { Box, ButtonBase, Popover, useTheme } from '@mui/material'
import { useState } from 'react'
import { spacing } from '../../theme/tokens'
import { Icon } from '../icon'
import { optionsMenuPaper } from '../select'
import { StatusChip } from '../status-chip'
import { StatusPicker, type StatusOption } from './StatusPicker'

// The props are documented in story-docs, not here, KN-207.
export interface StatusControlProps {
  statuses: readonly StatusOption[]
  value: string
  onChange: (id: string) => void
  onAdd: () => void
}

// Node 199:21 draws the caret at 14, which is none of the icon sizes and binds
// no variable, and the pressed edge at one and a half, an inset shadow over the
// one pixel border since Chromium floors a border of 1.5, KN-282. The picker
// opens in a panel as wide as the file gives it in the Change Status modal,
// 464:703, 4 below the control.
const CARET = 14
const EDGE = 1
const PRESSED_EDGE = 1.5
const FOCUS_RING = 3
const PANEL_WIDTH = 372

// The Status Control of node 199:21, Default, Hover and Pressed: the small
// Status Chip and a caret in a pill, the clickable wrapper the card and the job
// modal put round a chip that stays display only. It opens the Status Picker;
// choosing a status closes it and hands the choice over, and Escape closes it
// with nothing changed. Either way focus is back on the control.
export const StatusControl = ({ statuses, value, onChange, onAdd }: StatusControlProps) => {
  const { i18n } = useLingui()
  const end = useTheme().direction === 'rtl' ? 'left' : 'right'
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const current = statuses.find((option) => option.id === value)
  const close = () => {
    setAnchor(null)
  }
  return (
    <>
      <ButtonBase
        disableRipple
        aria-haspopup="dialog"
        aria-expanded={anchor !== null}
        aria-label={current === undefined ? i18n._('Status') : `${i18n._('Status')}: ${current.name}`}
        onClick={(event) => {
          setAnchor(event.currentTarget)
        }}
        sx={(theme) => {
          const colour = theme.karnama.semantic
          return {
            position: 'relative',
            gap: `${spacing['2xs']}px`,
            paddingBlock: `${spacing['2xs']}px`,
            paddingInlineStart: `${spacing['2xs']}px`,
            paddingInlineEnd: `${spacing.xs}px`,
            borderRadius: `${theme.karnama.radius.full}px`,
            backgroundColor: colour['bg/surface'],
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
            // Pressed, 199:20, while the picker is open as while it is held.
            '&:active, &[aria-expanded="true"]': {
              backgroundColor: colour['bg/surface-secondary'],
              boxShadow: `inset 0 0 0 ${PRESSED_EDGE}px ${colour['border/focus']}`,
            },
            '&:active::before, &[aria-expanded="true"]::before': { borderColor: colour['border/focus'] },
            '&.Mui-focusVisible::after': {
              content: '""',
              position: 'absolute',
              inset: EDGE,
              borderRadius: 'inherit',
              borderStyle: 'solid',
              borderWidth: FOCUS_RING,
              borderColor: colour['border/focus'],
              pointerEvents: 'none',
            },
          }
        }}
      >
        {current === undefined ? null : <StatusChip status={current.token} label={current.name} size="S" />}
        <Box component="span" sx={{ display: 'inline-flex', width: CARET, height: CARET, '& > svg': { width: '100%', height: '100%' } }}>
          <Icon name="chevron-down" size="sm" />
        </Box>
      </ButtonBase>
      <Popover
        open={anchor !== null}
        anchorEl={anchor}
        onClose={close}
        // Menus and popovers open instantly, DESIGN.md.
        transitionDuration={0}
        anchorOrigin={{ vertical: 'bottom', horizontal: end }}
        transformOrigin={{ vertical: 0, horizontal: end }}
        slotProps={{
          paper: {
            sx: (theme) => ({
              ...optionsMenuPaper.sx(theme),
              boxSizing: 'border-box',
              width: PANEL_WIDTH,
              maxWidth: `calc(100% - ${2 * spacing.md}px)`,
              marginTop: `${spacing['2xs']}px`,
              padding: `${spacing.sm}px`,
            }),
          },
        }}
      >
        <StatusPicker
          statuses={statuses}
          value={value}
          onChange={(id) => {
            close()
            onChange(id)
          }}
          onAdd={() => {
            close()
            onAdd()
          }}
        />
      </Popover>
    </>
  )
}
