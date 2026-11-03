import { Box } from '@mui/material'
import { useState } from 'react'
import { usePreferences } from '../../core/preferences'
import { formatCount } from '../../i18n/formatCount'
import { spacing, type as typeScale } from '../../theme/tokens'
import { TooltipLabel } from '../tooltip-label'

// The props are documented in story-docs, not here, KN-207.
export interface SourceRowProps {
  source: string
  applications: number
  interviews: number
  largest?: number
  context?: 'card' | 'modal'
}

// The card's row unless told otherwise, typed so the lint rule reads it as a
// value and not as copy.
const CARD: NonNullable<SourceRowProps['context']> = 'card'

// Node 1223:1807 binds no variable to these: the interviews' column, 56; the
// name's, 140 in the card and 200 in the window of every source, which shows up
// to three lines; the bar's 12. The room kept at the bar's end for its count
// and the 4 before it, so the largest source's bar and the others' are in
// proportion: four digits of Body and the gap.
const INTERVIEWS = 56
const NAME_IN_CARD = 140
const NAME_IN_MODAL = 200
const MODAL_LINES = 3
const BAR = 12
const COUNT_ROOM = 32

const { body } = typeScale

// Stats / Source Row, node 1223:1807, Context=Card and Context=Modal: one source
// of the Stats page's applications. From the inline start its name, then a bar
// in data/bar at radius sm, 12 tall, as long against the largest source's as
// its applications are against the largest's, with the count of them 4 after
// its end in text/primary, and last the interviews it brought, centred in a 56
// column in text/secondary, 16 between the three, all in Body. A single source
// has no bar, so a row given no largest draws none. In the card the name is one
// line, cut with an ellipsis and shown whole in a label under the pointer; in
// the window of every source it takes up to three lines. The bar is the count
// drawn, so it is hidden from a screen reader.
export const SourceRow = ({ source, applications, interviews, largest, context = CARD }: SourceRowProps) => {
  const { locale } = usePreferences()
  const inCard = context === CARD
  // Whether the card's name is cut, read when the pointer reaches it, so the
  // label shows only a name that does not fit.
  const [cut, setCut] = useState(false)
  const share = largest === undefined || largest <= 0 ? null : Math.min(1, Math.max(0, applications / largest))
  const name = (
    <Box
      component="span"
      onMouseEnter={(event) => {
        setCut(event.currentTarget.scrollWidth > event.currentTarget.clientWidth)
      }}
      sx={(theme) => ({
        flexShrink: 0,
        boxSizing: 'border-box',
        width: inCard ? NAME_IN_CARD : NAME_IN_MODAL,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        color: theme.karnama.semantic['text/primary'],
        ...(inCard
          ? { whiteSpace: 'nowrap' }
          : { display: '-webkit-box', WebkitLineClamp: MODAL_LINES, WebkitBoxOrient: 'vertical', overflowWrap: 'anywhere' }),
      })}
    >
      {source}
    </Box>
  )
  return (
    <Box
      sx={{
        boxSizing: 'border-box',
        width: '100%',
        display: 'flex',
        alignItems: inCard ? 'center' : 'flex-start',
        gap: `${spacing.md}px`,
        fontSize: `${body.size}px`,
        lineHeight: `${body.lineHeight}px`,
        fontWeight: body.weight,
        letterSpacing: `${body.letterSpacing}px`,
      }}
    >
      {inCard ? <TooltipLabel title={cut ? source : ''}>{name}</TooltipLabel> : name}
      <Box sx={{ flex: '1 1 auto', minWidth: 0, display: 'flex', alignItems: 'center', gap: `${spacing['2xs']}px` }}>
        {share === null ? null : (
          <Box
            aria-hidden
            sx={(theme) => ({
              flex: '0 1 auto',
              minWidth: 0,
              width: `calc(${share} * (100% - ${COUNT_ROOM}px))`,
              height: BAR,
              borderRadius: `${theme.karnama.radius.sm}px`,
              backgroundColor: theme.karnama.semantic['data/bar'],
            })}
          />
        )}
        <Box component="span" sx={(theme) => ({ flexShrink: 0, whiteSpace: 'nowrap', color: theme.karnama.semantic['text/primary'] })}>
          {formatCount(locale, applications)}
        </Box>
      </Box>
      <Box
        component="span"
        sx={(theme) => ({ flexShrink: 0, width: INTERVIEWS, textAlign: 'center', color: theme.karnama.semantic['text/secondary'] })}
      >
        {formatCount(locale, interviews)}
      </Box>
    </Box>
  )
}
