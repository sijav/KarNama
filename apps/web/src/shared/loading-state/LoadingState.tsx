import { useLingui } from '@lingui/react'
import { Box, keyframes } from '@mui/material'
import { useEffect, useState } from 'react'
import { spacing, type as typeScale } from '../../theme/tokens'
import { untilSlow } from './wait'

// The props are documented in story-docs, not here, KN-207.
export interface LoadingStateProps {
  startedAt?: number
}

// Node 159:98's dots: three of 10, spacing/2xs apart, in border/focus, the
// middle one lit and the others at 0.4. The size and the opacity bind no
// variable, so they are component constants.
const DOTS = [0, 1, 2] as const
const DOT = 10
const DIM = 0.4
const LIT = 1

// The file draws one frame and leaves the motion to code, its description
// says. Each dot takes a turn of 300 ms, the design's state change, DESIGN.md
// section 7, so the lit dot crosses the three in 900; when the middle one is
// lit the others are at 0.4, which is the file's frame.
const TURN_MS = 300
const turn = keyframes({
  '0%': { opacity: DIM },
  '16.667%': { opacity: LIT },
  '33.333%': { opacity: DIM },
  '100%': { opacity: DIM },
})

// Whether the wait has run past fifteen seconds. It is timed from startedAt,
// or from when the state first shows, and a new startedAt starts it again.
const useSlow = (startedAt: number | undefined) => {
  const [shownAt] = useState(Date.now)
  const start = startedAt ?? shownAt
  // The start the wait has been seen to run past.
  const [pastFor, setPastFor] = useState(() => (untilSlow(start, shownAt) === 0 ? start : undefined))
  useEffect(() => {
    const timer = window.setTimeout(
      () => {
        setPastFor(start)
      },
      untilSlow(start, Date.now()),
    )
    return () => {
      window.clearTimeout(timer)
    }
  }, [start])
  return pastFor === start
}

// The Loading State of node 159:92, shown while a posting is read in the add
// flow: the three dots, 16 above the line that says what is happening. Past
// fifteen seconds the line says why it is slow, since a sleeping server takes
// up to a minute to wake and dots alone would look hung. The region is a
// status, so the change is read out.
export const LoadingState = ({ startedAt }: LoadingStateProps) => {
  const { i18n } = useLingui()
  const slow = useSlow(startedAt)
  return (
    <Box
      role="status"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: `${spacing.md}px`,
        boxSizing: 'border-box',
        width: 'fit-content',
        maxWidth: '100%',
        padding: `${spacing.xl}px`,
        textAlign: 'center',
      }}
    >
      {/* The dots frame's own bg/surface fill is left out: the dialog it sits in is that colour. */}
      <Box aria-hidden sx={{ display: 'flex', gap: `${spacing['2xs']}px` }}>
        {DOTS.map((dot) => (
          <Box
            key={dot}
            sx={(theme) => ({
              width: DOT,
              height: DOT,
              borderRadius: `${theme.karnama.radius.full}px`,
              backgroundColor: theme.karnama.semantic['border/focus'],
              opacity: dot === 1 ? LIT : DIM,
              animation: `${turn} ${DOTS.length * TURN_MS}ms linear infinite`,
              animationDelay: `${(dot - DOTS.length) * TURN_MS}ms`,
              // Still, the file's frame, for a reader who asked for less motion.
              '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
            })}
          />
        ))}
      </Box>
      <Box
        component="p"
        sx={(theme) => ({
          margin: 0,
          fontSize: `${typeScale.body.size}px`,
          lineHeight: `${typeScale.body.lineHeight}px`,
          fontWeight: typeScale.body.weight,
          letterSpacing: typeScale.body.letterSpacing,
          color: theme.karnama.semantic['text/secondary'],
        })}
      >
        {slow ? i18n._('Still reading. If the server was asleep, waking it takes up to a minute.') : i18n._('Reading the job posting…')}
      </Box>
    </Box>
  )
}
