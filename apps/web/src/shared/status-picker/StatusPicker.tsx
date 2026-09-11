import { useLingui } from '@lingui/react'
import { Box, ButtonBase, Radio, RadioGroup } from '@mui/material'
import { useId } from 'react'
import { arrowsAcross } from '../../theme/sides'
import { spacing, type StatusToken, type as typeScale } from '../../theme/tokens'
import { Icon } from '../icon'
import { StatusChip } from '../status-chip'

export interface StatusOption {
  id: string
  token: StatusToken
  name: string
}

// The props are documented in story-docs, not here, KN-207.
export interface StatusPickerProps {
  statuses: readonly StatusOption[]
  value: string
  onChange: (id: string) => void
  onAdd: () => void
  autoFocus?: boolean
}

// Node 427:567's ring is two pixels drawn inside the choice, 4 round its chip,
// and the add chip of 427:587 is 28 tall with a one pixel dashed edge; neither
// binds a variable. The keyboard's ring is the three drawn inside that the
// Filter Chip uses, told from Selected's two by its width.
const RING = 2
const FOCUS_RING = 3
const EDGE = 1
const ADD_HEIGHT = 28

// The class on a choice's shell, so the radio round it can colour its ring.
const CHOICE = 'KarnamaStatusChoice-shell'

// A Status Choice, node 427:567: the medium Status Chip in a shell of 4 whose
// ring is none at rest, border/default under the pointer and border/focus when
// selected. The chip inside stays display only.
export const StatusChoice = ({ option, selected }: { option: StatusOption; selected: boolean }) => (
  <Box
    component="span"
    className={CHOICE}
    data-selected={selected}
    sx={(theme) => ({
      position: 'relative',
      display: 'inline-flex',
      padding: `${spacing['2xs']}px`,
      borderRadius: `${theme.karnama.radius.full}px`,
      '&::after': {
        content: '""',
        position: 'absolute',
        inset: 0,
        borderRadius: 'inherit',
        borderStyle: 'solid',
        borderWidth: RING,
        borderColor: selected ? theme.karnama.semantic['border/focus'] : 'transparent',
        pointerEvents: 'none',
      },
    })}
  >
    <StatusChip status={option.token} label={option.name} size="M" />
  </Box>
)

// The Status Picker of node 427:592: «وضعیت» above a wrapping row of Status
// Choices and the dashed «+ وضعیت تازه» that makes a new status in place. Status
// is chosen with chips, never a dropdown, DESIGN.md. A native radio group
// through MUI gives one Tab stop and arrows that move and choose, the Color
// Picker's way; the add chip is the next stop. Told to, it puts focus on the
// chosen status as it mounts, as a dialog opening on it does, KN-337.
export const StatusPicker = ({ statuses, value, onChange, onAdd, autoFocus = false }: StatusPickerProps) => {
  const { i18n } = useLingui()
  const labelId = useId()
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${spacing.xs}px` }}>
      <Box
        component="span"
        id={labelId}
        sx={(theme) => ({
          fontSize: `${typeScale.label.size}px`,
          lineHeight: `${typeScale.label.lineHeight}px`,
          fontWeight: typeScale.label.weight,
          letterSpacing: `${typeScale.label.letterSpacing}px`,
          color: theme.karnama.semantic['text/secondary'],
        })}
      >
        {i18n._('Status')}
      </Box>
      <RadioGroup
        row
        value={value}
        aria-labelledby={labelId}
        onChange={(_, chosen) => {
          onChange(chosen)
        }}
        // Left and right move the way they point in every browser, the Color
        // Picker's arrowsAcross, KN-373; an arrow on the add chip, which sits in
        // this group, is left to the browser.
        onKeyDown={arrowsAcross}
        // The file's Choices, 427:571: a row that wraps, 8 both ways, its items
        // at the top of their line.
        sx={{ flexWrap: 'wrap', alignItems: 'flex-start', gap: `${spacing.xs}px` }}
      >
        {statuses.map((option) => (
          <Radio
            key={option.id}
            value={option.id}
            autoFocus={autoFocus && option.id === value}
            disableRipple
            icon={<StatusChoice option={option} selected={false} />}
            checkedIcon={<StatusChoice option={option} selected />}
            slotProps={{ input: { 'aria-label': option.name } }}
            sx={(theme) => ({
              padding: 0,
              borderRadius: `${theme.karnama.radius.full}px`,
              [`&:hover .${CHOICE}[data-selected="false"]::after`]: { borderColor: theme.karnama.semantic['border/default'] },
              [`&.Mui-focusVisible .${CHOICE}::after`]: { borderWidth: FOCUS_RING, borderColor: theme.karnama.semantic['border/focus'] },
            })}
          />
        ))}
        <ButtonBase
          disableRipple
          onClick={onAdd}
          sx={(theme) => ({
            position: 'relative',
            height: ADD_HEIGHT,
            paddingInline: `${spacing.sm}px`,
            gap: `${spacing['2xs']}px`,
            borderRadius: `${theme.karnama.radius.full}px`,
            color: theme.karnama.semantic['text/brand'],
            fontSize: `${typeScale.body.size}px`,
            lineHeight: `${typeScale.body.lineHeight}px`,
            fontWeight: typeScale.label.weight,
            // The dashed edge, inside and out of layout.
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              borderStyle: 'dashed',
              borderWidth: EDGE,
              borderColor: theme.karnama.semantic['border/default'],
              pointerEvents: 'none',
            },
            '&.Mui-focusVisible::after': {
              content: '""',
              position: 'absolute',
              inset: EDGE,
              borderRadius: 'inherit',
              borderStyle: 'solid',
              borderWidth: FOCUS_RING,
              borderColor: theme.karnama.semantic['border/focus'],
              pointerEvents: 'none',
            },
          })}
        >
          <Icon name="plus" size="sm" />
          {i18n._('New status')}
        </ButtonBase>
      </RadioGroup>
    </Box>
  )
}
