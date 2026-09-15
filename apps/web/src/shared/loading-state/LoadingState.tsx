import { useLingui } from '@lingui/react'
import { Box, keyframes } from '@mui/material'
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { spacing, type as typeScale } from '../../theme/tokens'
import { untilSlow } from './wait'

// The props are documented in story-docs, not here, KN-207.
export interface LoadingStateProps {
  startedAt?: number
  lineId?: string
  announceFirstLine?: boolean
}

// Node 159:98's dots: three of 10, spacing/2xs apart, in border/focus, the
// middle one lit and the others at 0.4. The size and the opacity bind no
// variable, so they are component constants.
const DOTS = [0, 1, 2] as const
const MIDDLE = 1
const DOT = 10
const DIM = 0.4
const LIT = 1

// The file draws one frame and leaves the motion to code, its description
// says. Each dot takes a turn of 300 ms, the design's state change, DESIGN.md
// section 7, so the lit dot crosses the three in 900. A dot is lit at the ends
// of its cycle, brightening over the half turn before and dimming over the
// half turn after, and the motion starts on the middle dot's lit moment, so
// the first frame painted is the file's, KN-324.
const TURN_MS = 300
const turn = keyframes({
  '0%': { opacity: LIT },
  '16.667%': { opacity: DIM },
  '83.333%': { opacity: DIM },
  '100%': { opacity: LIT },
})
// How many turns ago each dot was lit when the motion starts: the middle one
// now, the one before it one turn ago and the one after it two, so the lit dot
// travels from the inline start to the inline end.
const turnsAgo = (dot: number) => (DOTS.length + MIDDLE - dot) % DOTS.length

// Whether the wait has run past fifteen seconds, timed from startedAt or from when the state
// first shows. The answer is the clock's, so it is a store outside React for each start,
// KN-325: its snapshot is read from the clock the first time and kept, so React's repeated
// reads agree, and its timer, set for every start, marks it past when the fifteen seconds are
// up and tells React. A start already past shows the slow line on the render that gives it,
// and a clock set back after the timer fired does not take the line back.
const slowStore = (start: number) => {
  let slow: boolean | undefined
  return {
    subscribe: (onChange: () => void) => {
      const timer = window.setTimeout(
        () => {
          slow = true
          onChange()
        },
        untilSlow(start, Date.now()),
      )
      return () => {
        window.clearTimeout(timer)
      }
    },
    past: () => (slow ??= untilSlow(start, Date.now()) === 0),
  }
}

const useSlow = (startedAt: number | undefined) => {
  const [shownAt] = useState(Date.now)
  const start = startedAt ?? shownAt
  const store = useMemo(() => slowStore(start), [start])
  return useSyncExternalStore(store.subscribe, store.past)
}

// The out of sight line's one pixel edge, written as pixels: MUI reads a bare
// number up to 1 as a fraction.
const EDGE = 1

// How long the status region stays in the page empty before its first line is
// written, KN-326. No standard names a delay every screen reader needs; 100 ms
// is the convention the plan's review named, and it is one timer, which a
// background tab still runs.
const FIRST_LINE_AFTER_MS = 100

// Whether the line has been written into the status region. Not on the render
// that mounts it: a region that enters the page already holding its text is
// not read out by every screen reader, where a change to a region already there
// is, KN-326. The cleanup clears the timer, so a state gone before it fires
// leaves nothing behind.
const useWritten = () => {
  const [written, setWritten] = useState(false)
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setWritten(true)
    }, FIRST_LINE_AFTER_MS)
    return () => {
      window.clearTimeout(timer)
    }
  }, [])
  return written
}

// The Loading State of node 159:92, shown while a posting is read in the add
// flow: the three dots, 16 above the line that says what is happening. Past
// fifteen seconds the line says why it is slow, since a sleeping server takes
// up to a minute to wake and dots alone would look hung. The region is a
// status, read whole; what a screen reader hears of it is only its out of
// sight line, written after the region appears, while the line on screen is
// drawn from the first frame. Where focus lands on a panel named by the line on
// screen, which says the first line already, the region leaves that line out and
// speaks only a later one, KN-362.
export const LoadingState = ({ startedAt, lineId, announceFirstLine = true }: LoadingStateProps) => {
  const { i18n } = useLingui()
  const slow = useSlow(startedAt)
  const written = useWritten()
  const line = slow
    ? i18n._('Still reading. If the server was asleep, waking it takes up to a minute.')
    : i18n._('Reading the job posting…')
  const spoken = (announceFirstLine ? written : slow) ? line : ''
  return (
    <Box
      role="status"
      aria-atomic
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
              opacity: dot === MIDDLE ? LIT : DIM,
              animation: `${turn} ${DOTS.length * TURN_MS}ms linear infinite`,
              animationDelay: `${-turnsAgo(dot) * TURN_MS}ms`,
              // Still, the file's frame, for a reader who asked for less motion.
              '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
            })}
          />
        ))}
      </Box>
      {/* Out of sight but read by a screen reader, the usual clip, and out of
          flow, so the dots and the line keep their gap. */}
      <Box
        component="span"
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
        {spoken}
      </Box>
      <Box
        component="p"
        aria-hidden
        {...(lineId === undefined ? {} : { id: lineId })}
        sx={(theme) => ({
          margin: 0,
          fontSize: `${typeScale.body.size}px`,
          lineHeight: `${typeScale.body.lineHeight}px`,
          fontWeight: typeScale.body.weight,
          letterSpacing: typeScale.body.letterSpacing,
          color: theme.karnama.semantic['text/secondary'],
        })}
      >
        {line}
      </Box>
    </Box>
  )
}
