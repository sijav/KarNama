import { useLingui } from '@lingui/react'
import { Box, keyframes } from '@mui/material'
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { spacing } from '../../theme/tokens'
import { untilSlow } from './wait'

// The props are documented in story-docs, not here, KN-207.
export interface LoadingStateProps {
  startedAt?: number
  lineId?: string
  announceFirstLine?: boolean
}

// Node 1031:3818's dots: three of 10, spacing/2xs apart, in border/focus, in a
// box 22 high, the lit one at its top and opaque and the other two 8 lower at
// 0.45. The dot, the box, the drop and the dim bind no variable, so they are
// component constants.
const DOTS = [0, 1, 2] as const
const DOT = 10
const BOX_HEIGHT = 22
const DROP = 8
const DIM = 0.45
const LIT = 1

// The file's prototype: each step holds 300 ms, After delay, and then moves to
// the next in 250 by Smart animate, ease in and out, which is cubic-bezier
// 0.42, 0, 0.58, 1, CSS's ease-in-out, so the lit dot steps 1, 2, 3 and back to
// 1 every 1650 ms.
const HOLD_MS = 300
const MOVE_MS = 250
const STEP_MS = HOLD_MS + MOVE_MS
const CYCLE_MS = DOTS.length * STEP_MS
const at = (ms: number) => `${(ms / CYCLE_MS) * 100}%`
// How many steps ago each dot's cycle began: the left one's now, the middle
// one's two steps ago, so it is lit one step on, and the right one's one step
// ago, so it is lit two steps on.
const stepsAgo = (dot: number) => (DOTS.length - dot) % DOTS.length

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

// The out of sight lines' one pixel box, written as pixels: MUI reads a bare
// number up to 1 as a fraction.
const EDGE = 1

interface OutOfSightProps {
  component: 'span' | 'p'
  id?: string
  'aria-hidden'?: boolean
  children: string
}

// A line out of sight but read by a screen reader, the usual clip, and out of
// flow, so the frame keeps the file's size.
const OutOfSight = (props: OutOfSightProps) => (
  <Box
    {...props}
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
  />
)

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

// Loading / Extract, node 1031:3818, shown while a posting is read in the add
// flow: the three dots, the lit one stepping from left to right, and no text on
// screen, the owner's decision of 1 Aban. What the file does not draw is said
// out of sight. The region is a status, read whole, and what a screen reader
// hears of it is only its spoken line, written after the region appears,
// KN-326; past fifteen seconds the line says why the wait is slow, since a
// sleeping server takes up to a minute to wake. The same line stands under
// lineId for a panel to be named by, and where focus lands on that panel, which
// says the first line already, the region leaves that line out and speaks only
// a later one, KN-362.
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
        boxSizing: 'border-box',
        width: 'fit-content',
        maxWidth: '100%',
        // 32 round the dots, which the frame leaves unbound at spacing/xl's value.
        padding: `${spacing.xl}px`,
      }}
    >
      {/* The frames' own bg/surface fill is left out: the dialog they sit in is
          that colour. dir is an attribute, which the RTL plugin does not mirror,
          so the lit dot steps from left to right in both languages, as the
          file's description says. */}
      <Box aria-hidden dir="ltr" sx={{ display: 'flex', alignItems: 'flex-start', gap: `${spacing['2xs']}px`, height: BOX_HEIGHT }}>
        {DOTS.map((dot) => (
          <Box
            key={dot}
            sx={(theme) => {
              // A dot as the file draws it lit and dim. The keyframes are the
              // left dot's cycle: lit through its step's hold, falling as the
              // middle one rises, and rising as the right one falls. Each dot
              // plays it a step after the one before, so the first frame
              // painted is Step 1, KN-324.
              const lit = { opacity: LIT, transform: 'translateY(0)' }
              const dim = { opacity: DIM, transform: `translateY(${DROP}px)` }
              const step = keyframes({
                '0%': lit,
                [at(HOLD_MS)]: lit,
                [at(STEP_MS)]: dim,
                [at(CYCLE_MS - MOVE_MS)]: dim,
                '100%': lit,
              })
              return {
                flexShrink: 0,
                width: DOT,
                height: DOT,
                borderRadius: `${theme.karnama.radius.full}px`,
                backgroundColor: theme.karnama.semantic['border/focus'],
                ...(dot === 0 ? lit : dim),
                animation: `${step} ${CYCLE_MS}ms ease-in-out infinite`,
                animationDelay: `${-stepsAgo(dot) * STEP_MS}ms`,
                // Step 1 standing still, for a reader who asked for less motion.
                '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
              }
            }}
          />
        ))}
      </Box>
      <OutOfSight component="span">{spoken}</OutOfSight>
      <OutOfSight component="p" aria-hidden {...(lineId === undefined ? {} : { id: lineId })}>
        {line}
      </OutOfSight>
    </Box>
  )
}
