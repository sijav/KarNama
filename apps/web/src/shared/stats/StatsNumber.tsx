import { Box } from '@mui/material'
import { usePreferences } from '../../core/preferences'
import { formatCount } from '../../i18n/formatCount'
import { spacing, type as typeScale } from '../../theme/tokens'

// What a number on the Stats page's first row counts: four of the board's
// statuses, and the job opportunities that never had an answer.
export type StatsNumberStatus = 'applied' | 'interview' | 'offer' | 'rejected' | 'no-response'

// The props are documented in story-docs, not here, KN-207.
export interface StatsNumberProps {
  status: StatsNumberStatus
  label: string
  value: number
}

// Node 1168:3159's dot is 8 across, bound to no variable.
const DOT = 8
const NO_RESPONSE: StatsNumberStatus = 'no-response'

const { body } = typeScale
const heading = typeScale['heading/l']

// Stats / Number, node 1168:3159, Status=Applied, Interview, Offer, Rejected and
// NoResponse: the Stats page's first row. On bg/surface-secondary at radius md,
// 12 above and below and 16 at the sides, from the inline start: a dot of 8 in
// the status's colour on the board, the base of its pair, and for no response
// text/secondary, 8 before the label in Body in text/secondary-strong; and 4
// under them the number in Heading/L in text/primary, in the reader's digits.
// It fills the width its row gives it. The dot is decoration: the label says
// what is counted.
export const StatsNumber = ({ status, label, value }: StatsNumberProps) => {
  const { locale } = usePreferences()
  return (
    <Box
      sx={(theme) => ({
        boxSizing: 'border-box',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: `${spacing['2xs']}px`,
        paddingBlock: `${spacing.sm}px`,
        paddingInline: `${spacing.md}px`,
        borderRadius: `${theme.karnama.radius.md}px`,
        backgroundColor: theme.karnama.semantic['bg/surface-secondary'],
      })}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: `${spacing.xs}px`, maxWidth: '100%' }}>
        <Box
          aria-hidden
          sx={(theme) => ({
            flexShrink: 0,
            width: DOT,
            height: DOT,
            borderRadius: `${theme.karnama.radius.full}px`,
            backgroundColor: status === NO_RESPONSE ? theme.karnama.semantic['text/secondary'] : theme.karnama.status[status].base,
          })}
        />
        <Box
          component="span"
          sx={(theme) => ({
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: `${body.size}px`,
            lineHeight: `${body.lineHeight}px`,
            fontWeight: body.weight,
            letterSpacing: `${body.letterSpacing}px`,
            color: theme.karnama.semantic['text/secondary-strong'],
          })}
        >
          {label}
        </Box>
      </Box>
      <Box
        component="span"
        sx={(theme) => ({
          fontSize: `${heading.size}px`,
          lineHeight: `${heading.lineHeight}px`,
          fontWeight: heading.weight,
          letterSpacing: `${heading.letterSpacing}px`,
          color: theme.karnama.semantic['text/primary'],
        })}
      >
        {formatCount(locale, value)}
      </Box>
    </Box>
  )
}
