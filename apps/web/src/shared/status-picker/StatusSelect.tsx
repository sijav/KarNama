import { useLingui } from '@lingui/react'
import { Box, ButtonBase, Popover, useTheme } from '@mui/material'
import { useState } from 'react'
import { inlineStartOf } from '../../theme/sides'
import { spacing, type as typeScale } from '../../theme/tokens'
import { Icon } from '../icon'
import { StatusChip } from '../status-chip'
import { GroupedStatusPicker } from './GroupedStatusPicker'
import type { StatusOption } from './StatusPicker'

// The props are documented in story-docs, not here, KN-207.
export interface StatusSelectProps {
  stages: readonly StatusOption[]
  outcomes: readonly StatusOption[]
  value: string
  onChange: (id: string) => void
  onAdd: () => void
}

// Node 1257:3315 binds no variable to these: the field's 44, its edge of one
// inside, two of border/focus for the keyboard, as the Select's field draws
// its focus, and the menu's 538, the grouped picker's 512 with 12 and an edge
// on each side.
const HEIGHT = 44
const EDGE = 1
const FOCUS_EDGE = 2
const MENU_WIDTH = 538

// Status Select / Footer, node 1257:3315: the status of a job opportunity
// being added, in the add modal's footer beside Add. A field 44 tall that hugs
// its width, bg/surface at radius md, 16 at the sides and 8 between: «وضعیت:» in
// Body text/secondary, the chosen status's small chip and the chevron at 20.
// Its edge is border/default, text/secondary under the pointer where there is
// hover, and border/focus while open. A press opens above it, 4 up and from its
// inline start, a menu of bg/surface at radius lg, 12 round, an edge of
// border/default and Elevation/Modal, holding Status Picker / Grouped without
// its label, focus on the chosen status. A choice closes it and hands the status
// over; the add chip closes it and asks for a stage; Escape and a press outside
// close it, focus back on the field. The status is still chosen with chips,
// DESIGN.md.
export const StatusSelect = ({ stages, outcomes, value, onChange, onAdd }: StatusSelectProps) => {
  const { i18n } = useLingui()
  const start = inlineStartOf(useTheme().direction)
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const open = anchor !== null
  const chosen = [...stages, ...outcomes].find((option) => option.id === value)
  const close = () => {
    setAnchor(null)
  }
  return (
    <>
      <ButtonBase
        disableRipple
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={(event) => {
          setAnchor(event.currentTarget)
        }}
        sx={(theme) => {
          const colour = theme.karnama.semantic
          return {
            position: 'relative',
            boxSizing: 'border-box',
            flexShrink: 0,
            height: HEIGHT,
            gap: `${spacing.xs}px`,
            paddingInline: `${spacing.md}px`,
            borderRadius: `${theme.karnama.radius.md}px`,
            backgroundColor: colour['bg/surface'],
            fontFamily: 'inherit',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              borderStyle: 'solid',
              borderWidth: EDGE,
              borderColor: open ? colour['border/focus'] : colour['border/default'],
              pointerEvents: 'none',
            },
            '@media (hover: hover)': { '&:hover:not([aria-expanded="true"])::before': { borderColor: colour['text/secondary'] } },
            '&.Mui-focusVisible::before': { borderWidth: FOCUS_EDGE, borderColor: colour['border/focus'] },
          }
        }}
      >
        <Box
          component="span"
          sx={(theme) => ({
            fontSize: `${typeScale.body.size}px`,
            lineHeight: `${typeScale.body.lineHeight}px`,
            fontWeight: typeScale.body.weight,
            color: theme.karnama.semantic['text/secondary'],
            whiteSpace: 'nowrap',
          })}
        >
          {i18n._('Status:')}
        </Box>
        {chosen === undefined ? null : <StatusChip status={chosen.token} label={chosen.name} size="S" />}
        <Icon name="chevron-down" size="md" />
      </ButtonBase>
      <Popover
        open={open}
        anchorEl={anchor}
        onClose={close}
        transitionDuration={0}
        anchorOrigin={{ vertical: 'top', horizontal: start }}
        transformOrigin={{ vertical: 'bottom', horizontal: start }}
        slotProps={{
          paper: {
            role: 'dialog',
            'aria-label': i18n._('Status'),
            sx: (theme) => ({
              boxSizing: 'border-box',
              width: MENU_WIDTH,
              maxWidth: `calc(100% - ${2 * spacing.md}px)`,
              marginTop: `-${spacing['2xs']}px`,
              padding: `${spacing.sm}px`,
              borderStyle: 'solid',
              borderWidth: EDGE,
              borderColor: theme.karnama.semantic['border/default'],
              borderRadius: `${theme.karnama.radius.lg}px`,
              backgroundColor: theme.karnama.semantic['bg/surface'],
              backgroundImage: 'none',
              boxShadow: theme.karnama.elevation.modal,
            }),
          },
        }}
      >
        <GroupedStatusPicker
          stages={stages}
          outcomes={outcomes}
          value={value}
          label={false}
          autoFocus
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
