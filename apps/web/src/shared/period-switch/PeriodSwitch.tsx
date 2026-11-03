import { useLingui } from '@lingui/react'
import { Box, Radio, RadioGroup } from '@mui/material'
import { arrowsAcross } from '../../theme/sides'
import { spacing, type as typeScale } from '../../theme/tokens'

// Daily, then weekly, the file's order from the inline start; no monthly, the
// decision of 1 Aban.
export type Period = 'daily' | 'weekly'
export const PERIODS: readonly Period[] = ['daily', 'weekly']

// The props are documented in story-docs, not here, KN-207.
export interface PeriodSwitchProps {
  value: Period
  onChange: (value: Period) => void
}

// The ring inside a pill reached by the keyboard, as the chips', since the file
// draws the switch no focus, KN-294.
const FOCUS_RING = 3

// An option as node 1236:3207 draws it: its word in Label, 4 above and below
// and 12 at the sides round radius sm, on bg/surface in text/primary when it is
// the chosen one, with no fill in text/secondary when it is not. Hidden from
// assistive technology, since the radio it draws is named by the same word.
const Pill = ({ chosen, children }: { chosen: boolean; children: string }) => (
  <Box
    component="span"
    aria-hidden
    sx={(theme) => ({
      display: 'inline-flex',
      alignItems: 'center',
      paddingBlock: `${spacing['2xs']}px`,
      paddingInline: `${spacing.sm}px`,
      borderRadius: `${theme.karnama.radius.sm}px`,
      ...(chosen ? { backgroundColor: theme.karnama.semantic['bg/surface'] } : {}),
      color: theme.karnama.semantic[chosen ? 'text/primary' : 'text/secondary'],
      fontSize: `${typeScale.label.size}px`,
      lineHeight: `${typeScale.label.lineHeight}px`,
      fontWeight: typeScale.label.weight,
      letterSpacing: typeScale.label.letterSpacing,
      whiteSpace: 'nowrap',
    })}
  >
    {children}
  </Box>
)

// Stats / Period Switch, node 1236:3207: daily or weekly for the Stats page's
// applications card, the two on bg/surface-secondary, 4 round them and between
// them, radius md. A native radio group, through MUI, as the Color Picker's is:
// one Tab stop, the arrows move and choose, and the left and right ones go the
// way they point in either direction, KN-301. Which period comes first is the
// page's to say, from the reader's first application; the switch is told.
export const PeriodSwitch = ({ value, onChange }: PeriodSwitchProps) => {
  const { i18n } = useLingui()
  const names: Record<Period, string> = { daily: i18n._('Daily'), weekly: i18n._('Weekly') }
  return (
    <RadioGroup
      row
      value={value}
      aria-label={i18n._('Period')}
      onChange={(_, chosen) => {
        const period = PERIODS.find((each) => each === chosen)
        if (period) onChange(period)
      }}
      onKeyDown={arrowsAcross}
      sx={(theme) => ({
        display: 'inline-flex',
        flexWrap: 'nowrap',
        gap: `${spacing['2xs']}px`,
        padding: `${spacing['2xs']}px`,
        borderRadius: `${theme.karnama.radius.md}px`,
        backgroundColor: theme.karnama.semantic['bg/surface-secondary'],
      })}
    >
      {PERIODS.map((period) => (
        <Radio
          key={period}
          value={period}
          disableRipple
          icon={<Pill chosen={false}>{names[period]}</Pill>}
          checkedIcon={<Pill chosen>{names[period]}</Pill>}
          slotProps={{ input: { 'aria-label': names[period] } }}
          sx={(theme) => ({
            padding: 0,
            borderRadius: `${theme.karnama.radius.sm}px`,
            '&.Mui-focusVisible::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              borderStyle: 'solid',
              borderWidth: FOCUS_RING,
              borderColor: theme.karnama.semantic['border/focus'],
              pointerEvents: 'none',
            },
          })}
        />
      ))}
    </RadioGroup>
  )
}
