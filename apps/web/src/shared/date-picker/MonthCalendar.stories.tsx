import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { i18nFor, type Locale } from '../../i18n'
import { formatCount } from '../../i18n/formatCount'
import { darkSemantic } from '../../theme/darkMode'
import { semantic, type SemanticToken } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { MonthCalendar } from './MonthCalendar'
import { dayName } from './words'

// The screens' today, Sunday 11 October 2026, 19 Mehr 1405, and the day they
// choose, 24 Mehr; and a today in Aban, which leaves Shahrivar and Mehr at rest
// as their variants draw them.
const SCREENS_TODAY = '2026-10-11'
const SCREENS_CHOSEN = '2026-10-16'
const IN_ABAN = '2026-11-04'
// The first days of the frame's three months, and the screens' first allowed
// day, 9 Mehr.
const SHAHRIVAR = '2026-08-23'
const MEHR = '2026-09-23'
const ABAN = '2026-10-23'
const NINTH_OF_MEHR = '2026-10-01'
// Node 773:16585's own width.
const WIDTH = 244

const meta = {
  title: 'Shared/MonthCalendar',
  component: MonthCalendar,
  args: { today: SCREENS_TODAY, selected: null, min: null, max: null, initialMonth: null, onSelect: fn() },
  // Each story's dates are the ones its play measures, so a control changing one
  // would fail a play nothing broke.
  parameters: { controls: { disable: true } },
  // The frame's own width; the calendar fills whatever holds it.
  decorators: [
    (Story) => (
      <Box sx={{ width: WIDTH }}>
        <Story />
      </Box>
    ),
  ],
} satisfies StoryMeta<typeof MonthCalendar>

export default meta
type Story = StoryObj<typeof meta>

type Palette = Record<SemanticToken, string>
const px = (value: string) => Number.parseFloat(value) || 0

// The roles a weekday and a day are drawn in, typed so the lint rule reads them
// as values.
const FRIDAY_RED: SemanticToken = 'red/500'
const WEEKDAY_INK: SemanticToken = 'text/secondary'
const DAY_INK: SemanticToken = 'text/primary'

// A colour as the browser computes it, borrowed on the host's own inline style
// and put back in the same tick. Never inside waitFor, KN-014, and never on a
// day, whose colour moves over 150 ms, KN-365: on the canvas.
const computed = (host: HTMLElement, value: string) => {
  const previous = host.style.color
  host.style.color = value
  const result = getComputedStyle(host).color
  host.style.color = previous
  return result
}

const gridIn = (canvasElement: HTMLElement) => within(canvasElement).getByRole('grid')
const calendarOf = (canvasElement: HTMLElement) => {
  const calendar = gridIn(canvasElement).parentElement
  if (!(calendar instanceof HTMLElement)) throw new Error('no calendar')
  return calendar
}

// A week of the month as day numbers, 0 where it has no day, written as the
// cells draw them in the reader's digits.
const drawn = (locale: Locale, weeks: number[][]) => weeks.map((week) => week.map((day) => (day === 0 ? '' : formatCount(locale, day))))
const weeksIn = (canvasElement: HTMLElement) =>
  within(gridIn(canvasElement))
    .getAllByRole('row')
    .slice(1)
    .map((row) =>
      within(row)
        .getAllByRole('gridcell')
        .map((cell) => cell.textContent),
    )

// Node 773:16585 at rest: 244 wide, 4 between its rows; the header 28 high with
// 4 under it, the previous month at the inline start, the title 14 on 22 at
// Medium in text/primary between, the next month at the inline end; the
// weekdays, seven 34 by 24 cells of 12 on 19 at Regular in text/secondary,
// Friday's in red/500; the weeks, 238 wide, seven 34 by 32 cells each.
const isTheFrame = async (canvasElement: HTMLElement, locale: Locale, palette: Palette, weeks: number) => {
  const i18n = i18nFor(locale)
  const rtl = locale === 'fa-IR'
  const calendar = calendarOf(canvasElement)
  const box = calendar.getBoundingClientRect()
  await expect(box.width).toBe(244)
  const previous = within(calendar)
    .getByRole('button', { name: i18n._('Previous month') })
    .getBoundingClientRect()
  const next = within(calendar)
    .getByRole('button', { name: i18n._('Next month') })
    .getBoundingClientRect()
  await expect([Math.round(previous.top - box.top), Math.round(next.top - box.top)]).toEqual([0, 0])
  await expect(rtl ? [box.right - previous.right, next.left - box.left] : [previous.left - box.left, box.right - next.right]).toEqual([
    0, 0,
  ])
  const heading = within(calendar).getByRole('heading')
  const headingStyle = getComputedStyle(heading)
  await expect([px(headingStyle.fontSize), px(headingStyle.lineHeight), Number(headingStyle.fontWeight)]).toEqual([14, 22, 500])
  await expect(headingStyle.color).toBe(computed(canvasElement, palette['text/primary']))
  const middle = heading.getBoundingClientRect()
  await expect(Math.abs(middle.left + middle.width / 2 - (box.left + box.width / 2))).toBeLessThanOrEqual(1)

  const grid = gridIn(canvasElement)
  const [header, ...rows] = within(grid).getAllByRole('row')
  if (!header) throw new Error('no weekdays')
  const headerBox = header.getBoundingClientRect()
  await expect([headerBox.width, headerBox.height, Math.round(headerBox.top - box.top)]).toEqual([238, 24, 36])
  await expect(Math.round(headerBox.left - box.left)).toBe(3)
  const letters = within(header).getAllByRole('columnheader')
  await expect(letters).toHaveLength(7)
  for (const [index, letter] of letters.entries()) {
    const style = getComputedStyle(letter)
    await expect([letter.getBoundingClientRect().width, px(style.fontSize), px(style.lineHeight), Number(style.fontWeight)]).toEqual([
      34, 12, 19, 400,
    ])
    await expect(style.color).toBe(computed(canvasElement, palette[index === 6 ? FRIDAY_RED : WEEKDAY_INK]))
  }
  await expect(rows).toHaveLength(weeks)
  for (const [index, row] of rows.entries()) {
    const rowBox = row.getBoundingClientRect()
    await expect([rowBox.width, rowBox.height, Math.round(rowBox.top - box.top)]).toEqual([238, 32, 64 + index * 32])
  }
  await expect(Math.round(box.height)).toBe(64 + weeks * 32)
  return heading
}

// The days of the month, Friday's in red/500: every Friday's cell draws its
// number in it, every other day's in text/primary.
const fridaysAreRed = async (canvasElement: HTMLElement, palette: Palette) => {
  for (const row of within(gridIn(canvasElement)).getAllByRole('row').slice(1)) {
    for (const [index, cell] of within(row).getAllByRole('gridcell').entries()) {
      const button = cell.querySelector('button')
      if (button === null) continue
      await expect(getComputedStyle(button).color).toBe(computed(canvasElement, palette[index === 6 ? FRIDAY_RED : DAY_INK]))
    }
  }
}

export const Shahrivar1405: Story = {
  args: { initialMonth: SHAHRIVAR, today: IN_ABAN },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await expect(await isTheFrame(canvasElement, 'fa-IR', semantic, 5)).toHaveTextContent('شهریور ۱۴۰۵')
    await expect(
      within(gridIn(canvasElement))
        .getAllByRole('columnheader')
        .map((letter) => letter.textContent),
    ).toEqual(['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'])
    await expect(weeksIn(canvasElement)).toEqual(
      drawn('fa-IR', [
        [0, 1, 2, 3, 4, 5, 6],
        [7, 8, 9, 10, 11, 12, 13],
        [14, 15, 16, 17, 18, 19, 20],
        [21, 22, 23, 24, 25, 26, 27],
        [28, 29, 30, 31, 0, 0, 0],
      ]),
    )
    await fridaysAreRed(canvasElement, semantic)
  },
}

export const Mehr1405: Story = {
  args: { initialMonth: MEHR, today: IN_ABAN },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await expect(await isTheFrame(canvasElement, 'fa-IR', semantic, 5)).toHaveTextContent('مهر ۱۴۰۵')
    await expect(weeksIn(canvasElement)).toEqual(
      drawn('fa-IR', [
        [0, 0, 0, 0, 1, 2, 3],
        [4, 5, 6, 7, 8, 9, 10],
        [11, 12, 13, 14, 15, 16, 17],
        [18, 19, 20, 21, 22, 23, 24],
        [25, 26, 27, 28, 29, 30, 0],
      ]),
    )
    await fridaysAreRed(canvasElement, semantic)
  },
}

export const Aban1405: Story = {
  args: { initialMonth: ABAN, today: SCREENS_TODAY },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await expect(await isTheFrame(canvasElement, 'fa-IR', semantic, 6)).toHaveTextContent('آبان ۱۴۰۵')
    await expect(weeksIn(canvasElement)).toEqual(
      drawn('fa-IR', [
        [0, 0, 0, 0, 0, 0, 1],
        [2, 3, 4, 5, 6, 7, 8],
        [9, 10, 11, 12, 13, 14, 15],
        [16, 17, 18, 19, 20, 21, 22],
        [23, 24, 25, 26, 27, 28, 29],
        [30, 0, 0, 0, 0, 0, 0],
      ]),
    )
  },
}

// A day's button by its full name, and the circle that draws its state.
const dayIn = (canvasElement: HTMLElement, locale: Locale, day: string) =>
  within(gridIn(canvasElement)).getByRole('button', { name: dayName(locale, day) })
const circleOf = (button: HTMLElement) => {
  const circle = button.firstElementChild
  if (!(circle instanceof HTMLElement)) throw new Error('no circle')
  return circle
}

export const TodayAndChosen: Story = {
  // As the screens draw it: today, 19 Mehr, ringed in border/focus with its
  // number in text/brand at Medium, and the chosen 24 Mehr on bg/brand/default.
  args: { selected: SCREENS_CHOSEN },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const today = dayIn(canvasElement, 'fa-IR', SCREENS_TODAY)
    const ring = getComputedStyle(circleOf(today))
    await expect([px(ring.borderTopWidth), ring.borderTopColor, ring.color, Number(ring.fontWeight)]).toEqual([
      1,
      computed(canvasElement, semantic['border/focus']),
      computed(canvasElement, semantic['text/brand']),
      500,
    ])
    await expect(today).toHaveAttribute('aria-current', 'date')
    const chosen = dayIn(canvasElement, 'fa-IR', SCREENS_CHOSEN)
    await expect(getComputedStyle(circleOf(chosen)).backgroundColor).toBe(computed(canvasElement, semantic['bg/brand/default']))
    await expect(chosen.closest('[role="gridcell"]')).toHaveAttribute('aria-selected', 'true')
    await expect(chosen).toHaveAttribute('tabindex', '0')
    await expect(today).toHaveAttribute('tabindex', '-1')
  },
}

export const DaysOff: Story = {
  // As the screens draw a field that starts on 9 Mehr: the days before it off,
  // in text/disabled, and a press on one does nothing.
  args: { min: NINTH_OF_MEHR },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const eighth = dayIn(canvasElement, 'fa-IR', '2026-09-30')
    await expect(eighth).toHaveAttribute('aria-disabled', 'true')
    await expect(getComputedStyle(eighth).color).toBe(computed(canvasElement, semantic['text/disabled']))
    await userEvent.click(eighth)
    await expect(args.onSelect).not.toHaveBeenCalled()
    const ninth = dayIn(canvasElement, 'fa-IR', NINTH_OF_MEHR)
    await expect(ninth).not.toHaveAttribute('aria-disabled')
    await userEvent.click(ninth)
    await expect(args.onSelect).toHaveBeenCalledWith(NINTH_OF_MEHR)
  },
}

export const TurningTheMonth: Story = {
  // The arrows turn the month, its weeks dissolving in over 150 ms.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    const calendar = calendarOf(canvasElement)
    await expect(within(calendar).getByRole('heading')).toHaveTextContent('مهر ۱۴۰۵')
    await userEvent.click(within(calendar).getByRole('button', { name: i18n._('Next month') }))
    await expect(within(calendar).getByRole('heading')).toHaveTextContent('آبان ۱۴۰۵')
    const weeks = within(gridIn(canvasElement)).getAllByRole('rowgroup')[1]
    if (!weeks) throw new Error('no weeks')
    const motion = getComputedStyle(weeks)
    await expect([motion.animationDuration, motion.animationTimingFunction]).toEqual(['0.15s', 'ease-out'])
    await userEvent.click(within(calendar).getByRole('button', { name: i18n._('Previous month') }))
    await userEvent.click(within(calendar).getByRole('button', { name: i18n._('Previous month') }))
    await expect(within(calendar).getByRole('heading')).toHaveTextContent('شهریور ۱۴۰۵')
  },
}

export const Choosing: Story = {
  // A press on a day chooses it, given as its YYYY-MM-DD.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(dayIn(canvasElement, 'fa-IR', SCREENS_CHOSEN))
    await expect(args.onSelect).toHaveBeenCalledWith(SCREENS_CHOSEN)
  },
}

export const Keyboard: Story = {
  // One day is in the Tab order, the chosen one or else today. The arrows move
  // a day, mirrored in Persian, or a week; Home and End go to the week's ends;
  // Page Down turns to the next month; Enter chooses.
  args: { selected: SCREENS_CHOSEN },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    const calendar = calendarOf(canvasElement)
    await userEvent.tab()
    await userEvent.tab()
    await userEvent.tab()
    await expect(dayIn(canvasElement, 'fa-IR', SCREENS_CHOSEN)).toHaveFocus()
    await userEvent.keyboard('{ArrowLeft}')
    await expect(dayIn(canvasElement, 'fa-IR', '2026-10-17')).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}{ArrowRight}')
    await expect(dayIn(canvasElement, 'fa-IR', '2026-10-15')).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    await expect(dayIn(canvasElement, 'fa-IR', '2026-10-22')).toHaveFocus()
    await userEvent.keyboard('{Home}')
    await expect(dayIn(canvasElement, 'fa-IR', '2026-10-17')).toHaveFocus()
    await userEvent.keyboard('{End}')
    await expect(dayIn(canvasElement, 'fa-IR', '2026-10-23')).toHaveFocus()
    await userEvent.keyboard('{PageDown}')
    await expect(within(calendar).getByRole('heading')).toHaveTextContent('آذر ۱۴۰۵')
    await waitFor(() => expect(dayIn(canvasElement, 'fa-IR', '2026-11-22')).toHaveFocus())
    await userEvent.keyboard('{Enter}')
    await expect(args.onSelect).toHaveBeenCalledWith('2026-11-22')
    await expect(within(calendar).getByRole('button', { name: i18n._('Next month') })).toBeVisible()
  },
}

export const InEnglish: Story = {
  // An English reader's month is the Gregorian one, in the design's week:
  // Saturday first, Friday red, the arrows mirrored with the days.
  args: { selected: SCREENS_CHOSEN },
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await expect(await isTheFrame(canvasElement, 'en-US', semantic, 6)).toHaveTextContent('October 2026')
    await expect(
      within(gridIn(canvasElement))
        .getAllByRole('columnheader')
        .map((letter) => letter.textContent),
    ).toEqual(['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'])
    await expect(weeksIn(canvasElement)[0]).toEqual(['', '', '', '', '', '1', '2'])
    await expect(dayIn(canvasElement, 'en-US', SCREENS_CHOSEN)).toHaveTextContent('16')
  },
}

export const Dark: Story = {
  // Mehr with today and the chosen day, in the theme's dark colours.
  args: { selected: SCREENS_CHOSEN },
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ canvasElement }) => {
    await expect(await isTheFrame(canvasElement, 'fa-IR', darkSemantic, 5)).toHaveTextContent('مهر ۱۴۰۵')
    const chosen = dayIn(canvasElement, 'fa-IR', SCREENS_CHOSEN)
    await expect(getComputedStyle(circleOf(chosen)).backgroundColor).toBe(computed(canvasElement, darkSemantic['bg/brand/default']))
  },
}
