import { useLingui } from '@lingui/react'
import { Box, Radio, RadioGroup } from '@mui/material'
import { useId } from 'react'
import { arrowsAcross } from '../../theme/sides'
import { spacing, unstyledText } from '../../theme/tokens'
import { AddStage } from '../add-stage'
import { CHOICE, StatusChoice, type StatusOption } from './StatusPicker'

// The props are documented in story-docs, not here, KN-207.
export interface GroupedStatusPickerProps {
  stages: readonly StatusOption[]
  outcomes: readonly StatusOption[]
  value: string
  onChange: (id: string) => void
  onAdd: () => void
  autoFocus?: boolean
  label?: boolean
}

// Node 636:6417 binds no variable to these: the 10 between its parts, the
// divider's one pixel, and the keyboard's three inside a choice, which the flat
// picker draws too.
const GAP = 10
const EDGE = 1
const FOCUS_RING = 3

const label = unstyledText.groupedPickerLabel
const caption = unstyledText.groupedPickerCaption

// One choice: the Status Choice as the radio's own drawing, ringed by
// border/default under the pointer and by the keyboard's three, as the flat
// picker draws its own.
const Choice = ({ option, value, autoFocus }: { option: StatusOption; value: string; autoFocus: boolean }) => (
  <Radio
    value={option.id}
    autoFocus={autoFocus && option.id === value}
    disableRipple
    icon={<StatusChoice option={option} selected={false} />}
    checkedIcon={<StatusChoice option={option} selected />}
    slotProps={{ input: { 'aria-label': option.name } }}
    sx={(theme) => ({
      padding: 0,
      verticalAlign: 'top',
      marginInlineEnd: `${spacing.xs}px`,
      marginBlockEnd: `${spacing.xs}px`,
      borderRadius: `${theme.karnama.radius.full}px`,
      [`&:hover .${CHOICE}[data-selected="false"]::after`]: { borderColor: theme.karnama.semantic['border/default'] },
      [`&.Mui-focusVisible .${CHOICE}::after`]: { borderWidth: FOCUS_RING, borderColor: theme.karnama.semantic['border/focus'] },
    })}
  />
)

// Status Picker / Grouped, node 636:6417: a status chosen with chips in two
// groups, 10 apart. «وضعیت», then «در جریان» over the stages, which the reader
// can make more of with the Add Stage chip at the end of their row, a divider,
// and «بسته‌شده» over the outcomes that close a case, which are fixed. The two
// rows are radio groups named by their captions that share one name, so the
// browser keeps one choice and one Tab stop across both, inside a group named
// «وضعیت»; the arrows move across both the way they point, KN-301. Each row
// is inline flow, its radios and the add chip 8 apart both ways, the add chip
// following the stages' group rather than sitting in it, KN-338. Told to, it
// puts focus on the chosen status as it mounts, as a dialog opening on it does.
// Without its label, as the add modal's footer opens it under its own «وضعیت:»,
// 1257:3315, the group is named by the same word, KN-752.
export const GroupedStatusPicker = ({ stages, outcomes, value, onChange, onAdd, autoFocus = false, label: labelled = true }: GroupedStatusPickerProps) => {
  const { i18n } = useLingui()
  const name = useId()
  const labelId = useId()
  const stagesId = useId()
  const outcomesId = useId()
  const captionSx = {
    sx: (color: string) => ({
      fontSize: `${caption.size}px`,
      lineHeight: `${caption.lineHeight}px`,
      fontWeight: caption.weight,
      letterSpacing: `${caption.letterSpacing}px`,
      color,
    }),
  }
  const choose = (_: unknown, chosen: string) => {
    onChange(chosen)
  }
  return (
    <Box
      role="group"
      {...(labelled ? { 'aria-labelledby': labelId } : { 'aria-label': i18n._('Status') })}
      onKeyDown={arrowsAcross}
      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: `${GAP}px` }}
    >
      {labelled ? (
        <Box
          component="span"
          id={labelId}
          sx={(theme) => ({
            fontSize: `${label.size}px`,
            lineHeight: `${label.lineHeight}px`,
            fontWeight: label.weight,
            letterSpacing: `${label.letterSpacing}px`,
            color: theme.karnama.semantic['text/secondary'],
          })}
        >
          {i18n._('Status')}
        </Box>
      ) : null}
      <Box component="span" id={stagesId} sx={(theme) => captionSx.sx(theme.karnama.semantic['text/disabled'])}>
        {i18n._('In progress')}
      </Box>
      <Box sx={{ marginBlockEnd: `-${spacing.xs}px` }}>
        <RadioGroup name={name} value={value} aria-labelledby={stagesId} onChange={choose} sx={{ display: 'inline' }}>
          {stages.map((option) => (
            <Choice key={option.id} option={option} value={value} autoFocus={autoFocus} />
          ))}
        </RadioGroup>
        <Box sx={{ display: 'inline-flex', verticalAlign: 'top', marginBlockEnd: `${spacing.xs}px` }}>
          <AddStage onClick={onAdd} />
        </Box>
      </Box>
      <Box
        component="hr"
        sx={(theme) => ({
          alignSelf: 'stretch',
          margin: 0,
          border: 0,
          height: `${EDGE}px`,
          backgroundColor: theme.karnama.semantic['border/default'],
        })}
      />
      <Box component="span" id={outcomesId} sx={(theme) => captionSx.sx(theme.karnama.semantic['text/disabled'])}>
        {i18n._('Closed')}
      </Box>
      <Box sx={{ marginBlockEnd: `-${spacing.xs}px` }}>
        <RadioGroup name={name} value={value} aria-labelledby={outcomesId} onChange={choose} sx={{ display: 'inline' }}>
          {outcomes.map((option) => (
            <Choice key={option.id} option={option} value={value} autoFocus={autoFocus} />
          ))}
        </RadioGroup>
      </Box>
    </Box>
  )
}
