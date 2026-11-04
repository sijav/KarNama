import { Box, keyframes } from '@mui/material'
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { usePreferences } from '../../core/preferences'
import { directionFor } from '../../i18n'
import { spacing, unstyledText } from '../../theme/tokens'
import { CalendarDay } from './CalendarDay'
import {
  addDays,
  calendarOf,
  columnOf,
  FRIDAY,
  isOff,
  monthLength,
  monthStart,
  nextMonth,
  partsOf,
  previousMonth,
  WEEK,
  weeksOf,
  type CalendarSystem,
} from './month'
import { MonthArrow } from './MonthArrow'
import { dayLabel, dayName, monthTitle, weekdays } from './words'

// The props are documented in story-docs, not here, KN-207.
export interface MonthCalendarProps {
  today: string
  selected?: string | null
  min?: string | null
  max?: string | null
  initialMonth?: string | null
  onSelect: (day: string) => void
}

// Node 773:16585 binds no variable to its sizes: 244 wide, its weeks 238, seven
// cells of 34; the weekdays' cells 24 high. Its 4 between rows and under the
// header is spacing 2xs.
const WIDTH = 244
const CELL_WIDTH = 34
const WEEKDAY_HEIGHT = 24
// The month's turn, the handoff's 150 ms dissolve.
const TURN_MS = 150
const dissolve = keyframes({ from: { opacity: 0 }, to: { opacity: 1 } })

// The one day in the Tab order, which the keyboard's moves focus once drawn.
type TabStop = 'button[tabindex="0"]'
const TAB_STOP: TabStop = 'button[tabindex="0"]'

const titleText = unstyledText.calendarTitle
const weekdayText = unstyledText.calendarWeekday

// The day with the same number in another month, or its last day when that
// month is shorter.
const sameDayIn = (system: CalendarSystem, start: string, day: string) =>
  addDays(start, Math.min(partsOf(system, day).day, monthLength(system, start)) - 1)

// Date Picker / Calendar, node 773:16585, KN-754: one month, in the reader's
// calendar, the Solar Hijri in Persian and the Gregorian in English, weeks from
// Saturday with Friday in red/500. The header holds the previous month at the
// inline start, the title, «مهر ۱۴۰۵», and the next month at the inline end;
// then the weekdays' letters, then the weeks, five or six, whose turn
// dissolves in over 150 ms. Today is ringed, the chosen day is blue, and the
// days outside `min` and `max` are off. The month shown first holds
// `initialMonth`, else the chosen day, else today. The keyboard moves as a date
// grid does: one day in the Tab order, the arrows a day or a week, Home and End
// to the week's ends, Page Up and Page Down a month, a move past the month
// turning it.
export const MonthCalendar = ({ today, selected = null, min = null, max = null, initialMonth = null, onSelect }: MonthCalendarProps) => {
  const { locale } = usePreferences()
  const system = calendarOf(locale)
  const rtl = directionFor(locale) === 'rtl'
  const titleId = useId()
  const grid = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(() => initialMonth ?? selected ?? today)
  const [focus, setFocus] = useState<string | null>(null)
  const [moved, setMoved] = useState(false)
  const start = monthStart(system, shown)
  const inMonth = (day: string | null) => day !== null && monthStart(system, day) === start
  const tabbable = [focus, selected, today].find(inMonth) ?? start
  const letters = weekdays(locale)

  // A keyboard move draws the month it lands in, then focuses its day.
  useEffect(() => {
    if (!moved) return
    grid.current?.querySelector<HTMLButtonElement>(TAB_STOP)?.focus()
  }, [moved, tabbable])

  const go = (day: string) => {
    setShown(day)
    setFocus(day)
  }
  const turn = (to: string) => {
    go(sameDayIn(system, to, tabbable))
    setMoved(false)
  }
  const keyed = (day: string) => (event: KeyboardEvent<HTMLButtonElement>) => {
    const target = landing(day, event)
    if (target === null) return
    event.preventDefault()
    go(target)
    setMoved(true)
  }
  const landing = (day: string, event: KeyboardEvent<HTMLButtonElement>): string | null => {
    // The days run from the inline start, so in Persian the left arrow is the
    // next day.
    if (event.key === 'ArrowLeft') return addDays(day, rtl ? 1 : -1)
    if (event.key === 'ArrowRight') return addDays(day, rtl ? -1 : 1)
    if (event.key === 'ArrowDown') return addDays(day, WEEK)
    if (event.key === 'ArrowUp') return addDays(day, -WEEK)
    if (event.key === 'Home') return addDays(day, -columnOf(day))
    if (event.key === 'End') return addDays(day, FRIDAY - columnOf(day))
    if (event.key === 'PageDown') return sameDayIn(system, nextMonth(system, monthStart(system, day)), day)
    if (event.key === 'PageUp') return sameDayIn(system, previousMonth(system, monthStart(system, day)), day)
    return null
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: WIDTH, gap: `${spacing['2xs']}px` }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: `${spacing['2xs']}px` }}>
        <MonthArrow
          direction="previous"
          onClick={() => {
            turn(previousMonth(system, start))
          }}
        />
        <Box
          component="h2"
          id={titleId}
          aria-live="polite"
          sx={(theme) => ({
            margin: 0,
            fontSize: `${titleText.size}px`,
            lineHeight: `${titleText.lineHeight}px`,
            fontWeight: titleText.weight,
            letterSpacing: titleText.letterSpacing,
            color: theme.karnama.semantic['text/primary'],
          })}
        >
          {monthTitle(locale, start)}
        </Box>
        <MonthArrow
          direction="next"
          onClick={() => {
            turn(nextMonth(system, start))
          }}
        />
      </Box>
      <Box
        ref={grid}
        role="grid"
        aria-labelledby={titleId}
        sx={{ display: 'flex', flexDirection: 'column', alignSelf: 'center', gap: `${spacing['2xs']}px` }}
      >
        <Box role="rowgroup">
          <Box role="row" sx={{ display: 'flex' }}>
            {letters.map((weekday, column) => (
              <Box
                key={weekday.name}
                role="columnheader"
                aria-label={weekday.name}
                sx={(theme) => ({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: CELL_WIDTH,
                  height: WEEKDAY_HEIGHT,
                  fontSize: `${weekdayText.size}px`,
                  lineHeight: `${weekdayText.lineHeight}px`,
                  fontWeight: weekdayText.weight,
                  letterSpacing: weekdayText.letterSpacing,
                  color: theme.karnama.semantic[column === FRIDAY ? 'red/500' : 'text/secondary'],
                })}
              >
                {weekday.letter}
              </Box>
            ))}
          </Box>
        </Box>
        <Box
          key={start}
          role="rowgroup"
          sx={{
            animation: `${dissolve} ${TURN_MS}ms ease-out`,
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }}
        >
          {weeksOf(system, start).map((week, row) => (
            <Box key={week.find((day) => day !== null) ?? row} role="row" sx={{ display: 'flex' }}>
              {week.map((day, column) => (
                <Box key={day ?? `${row}-${column}`} role="gridcell" aria-selected={day !== null && day === selected ? true : undefined}>
                  {day === null ? (
                    <CalendarDay label={null} onSelect={() => undefined} />
                  ) : (
                    <CalendarDay
                      label={dayLabel(locale, day)}
                      name={dayName(locale, day)}
                      friday={column === FRIDAY}
                      today={day === today}
                      selected={day === selected}
                      disabled={isOff(day, min, max)}
                      tabbable={day === tabbable}
                      onKeyDown={keyed(day)}
                      onSelect={() => {
                        onSelect(day)
                      }}
                    />
                  )}
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
