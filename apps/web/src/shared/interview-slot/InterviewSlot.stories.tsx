import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { i18nFor, type Locale } from '../../i18n'
import { darkSemantic } from '../../theme/darkMode'
import { semantic, spacing, type SemanticToken } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { InterviewSlot, type InterviewSlotProps, type InterviewSlotState } from './InterviewSlot'

// The slot's width inside the card: the card's 276 less its two edges and its
// 16 round.
const WIDTH = 242
// The day the stories are read on, Saturday 10 October 2026, 18 Mehr 1405: the
// frame's interview, «دوشنبه ۲۰ مهر · ۱۱:۰۰», is two days ahead, its
// question's «سه‌شنبه» four days back, and its wait, «از ۳ روز پیش», three
// days long.
const TODAY = '2026-10-10'
const THREE_DAYS_AGO = '2026-10-07'
// A day at an hour as the slot reads it, YYYY-MM-DDTHH:mm.
const atHour = (month: number, day: number, hours: number) => new Date(Date.UTC(2026, month - 1, day, hours)).toISOString().slice(0, 16)
const MONDAY = atHour(10, 12, 11)
const TODAY_AT_TWO = atHour(10, 10, 14)
const TUESDAY = atHour(10, 6, 10)

// The four rows and the question, typed so the lint rule reads them as values.
type Row = Exclude<InterviewSlotState, 'question'>
const NONE: Row = 'none'
const DATED: Row = 'dated'
const WAITING: Row = 'waiting'
const NEXT: Row = 'next'
const QUESTION: InterviewSlotState = 'question'
const ROWS: readonly Row[] = [NONE, DATED, WAITING, NEXT]

const meta = {
  title: 'Shared/InterviewSlot',
  component: InterviewSlot,
  args: {
    state: NONE,
    at: null,
    today: TODAY,
    waitingSince: null,
    onPlan: fn(),
    onAsk: fn(),
    onResult: fn(),
    onWaiting: fn(),
    onNextRound: fn(),
    onReschedule: fn(),
  },
  parameters: { controls: { include: ['state'] } },
  decorators: [
    (Story) => (
      <Box sx={{ width: WIDTH }}>
        <Story />
      </Box>
    ),
  ],
} satisfies StoryMeta<typeof InterviewSlot>

export default meta
type Story = StoryObj<typeof meta>

type Palette = Record<SemanticToken, string>

const px = (value: string) => Number.parseFloat(value) || 0
// The distance from one edge to another, whole, with no negative zero where the
// layout falls a hair short, as at a fractional zoom.
const apart = (to: number, from: number) => Math.round(to - from) || 0

// A colour as the browser computes it, borrowed on the host's own inline style
// and put back in the same tick. Never inside waitFor, KN-014.
const computed = (host: HTMLElement, value: string) => {
  const previous = host.style.color
  host.style.color = value
  const result = getComputedStyle(host).color
  host.style.color = previous
  return result
}
// What a fill, or an underline, the frame does not draw computes to, typed so
// the lint rule reads it as a value.
type Clear = 'rgba(0, 0, 0, 0)'
const CLEAR: Clear = 'rgba(0, 0, 0, 0)'

// The runner's own pointer, which only the runner has; outside it the story
// shows the slot at rest.
const pointAt = async (element: HTMLElement) => {
  if (!('__KARNAMA_STORY_TEST__' in globalThis)) return false
  await (await import('vitest/browser')).userEvent.hover(element)
  return true
}

// What each row of 656:6291 draws. The open rows, no date and the next round:
// 27 high, 4 above and below, nothing at the sides, 4 between, no fill, all in
// text/secondary at Regular. The boxed rows, 31 high, 6 above and below, 8 at
// the sides, 6 between, at radius 6: dated on bg/brand/container in text/brand,
// its label and its date at Medium; waiting on bg/surface-secondary in
// text/secondary, its label at Medium and how long at Regular.
interface RowFrame {
  height: number
  block: number
  inline: number
  gap: number
  fill: SemanticToken | null
  colour: SemanticToken
  label: number
  end: number | null
}

const FRAMES: Record<Row, RowFrame> = {
  none: { height: 27, block: 4, inline: 0, gap: 4, fill: null, colour: 'text/secondary', label: 400, end: null },
  next: { height: 27, block: 4, inline: 0, gap: 4, fill: null, colour: 'text/secondary', label: 400, end: null },
  dated: { height: 31, block: 6, inline: 8, gap: 6, fill: 'bg/brand/container', colour: 'text/brand', label: 500, end: 500 },
  waiting: { height: 31, block: 6, inline: 8, gap: 6, fill: 'bg/surface-secondary', colour: 'text/secondary', label: 500, end: 400 },
}

// Each row's label in a language.
const labelOf = (locale: Locale, kind: Row) => {
  const i18n = i18nFor(locale)
  if (kind === 'dated') return i18n._('Interview')
  if (kind === 'waiting') return i18n._('Result pending')
  if (kind === 'next') return i18n._('Second round date')
  return i18n._('Interview date')
}

// The row a label sits in.
const rowOf = (canvasElement: HTMLElement, label: string) => {
  const row = within(canvasElement).getByText(label).parentElement
  if (!(row instanceof HTMLElement)) throw new Error('no row')
  return row
}

// A row as its frame draws it, in a language and a palette: its size, fill and
// colour, the icon at 14 at the inline start, the label after it and, when the
// row has one, its end at the inline end, each on one line and not cut.
const isTheRow = async (canvasElement: HTMLElement, kind: Row, locale: Locale, palette: Palette) => {
  const frame = FRAMES[kind]
  const row = rowOf(canvasElement, labelOf(locale, kind))
  const style = getComputedStyle(row)
  const box = row.getBoundingClientRect()
  await expect([Math.round(box.width), Math.round(box.height)]).toEqual([WIDTH, frame.height])
  await expect([px(style.paddingTop), px(style.paddingBottom), px(style.paddingInlineStart), px(style.paddingInlineEnd)]).toEqual([
    frame.block,
    frame.block,
    frame.inline,
    frame.inline,
  ])
  await expect(px(style.columnGap)).toBe(frame.gap)
  await expect(style.backgroundColor).toBe(frame.fill === null ? CLEAR : computed(row, palette[frame.fill]))
  if (frame.fill !== null) await expect(px(style.borderTopLeftRadius)).toBe(6)
  const ink = computed(row, palette[frame.colour])
  await expect(style.color).toBe(ink)

  const [icon, label] = [...row.children]
  if (!(icon instanceof HTMLElement) || !(label instanceof HTMLElement)) throw new Error('no icon or label')
  const iconBox = icon.getBoundingClientRect()
  await expect([iconBox.width, iconBox.height]).toEqual([14, 14])
  const glyph = icon.querySelector('svg')
  if (glyph === null) throw new Error('no glyph')
  await expect(getComputedStyle(glyph).color).toBe(ink)
  const labelStyle = getComputedStyle(label)
  await expect([px(labelStyle.fontSize), px(labelStyle.lineHeight), Number(labelStyle.fontWeight)]).toEqual([12, 19, frame.label])
  await expect(label.scrollWidth).toBeLessThanOrEqual(label.clientWidth)
  const labelBox = label.getBoundingClientRect()
  const rtl = locale === 'fa-IR'
  await expect(rtl ? apart(box.right, iconBox.right) : apart(iconBox.left, box.left)).toBe(frame.inline)
  await expect(rtl ? apart(iconBox.left, labelBox.right) : apart(labelBox.left, iconBox.right)).toBe(frame.gap)

  if (frame.end === null) {
    await expect(row.children).toHaveLength(2)
    return row
  }
  // The end, after the spacer that holds it at the inline end.
  const end = row.lastElementChild
  if (!(end instanceof HTMLElement) || row.children.length !== 4) throw new Error('no end')
  const endStyle = getComputedStyle(end)
  await expect([px(endStyle.fontSize), px(endStyle.lineHeight), Number(endStyle.fontWeight)]).toEqual([12, 19, frame.end])
  await expect(end.scrollWidth).toBeLessThanOrEqual(end.clientWidth)
  const endBox = end.getBoundingClientRect()
  await expect(rtl ? apart(endBox.left, box.left) : apart(box.right, endBox.right)).toBe(frame.inline)
  await expect(rtl ? endBox.right <= labelBox.left - 2 * frame.gap : endBox.left >= labelBox.right + 2 * frame.gap).toBe(true)
  return row
}

// The label's underline: clear at rest, drawn under the pointer over the
// 120 ms dissolve.
const labelStyleOf = (row: HTMLElement) => {
  const label = row.children[1]
  if (!(label instanceof HTMLElement)) throw new Error('no label')
  return getComputedStyle(label)
}
const isUnderlinedUnderThePointer = async (row: HTMLElement) => {
  await expect(labelStyleOf(row).textDecorationColor).toBe(CLEAR)
  if (!(await pointAt(row))) return
  const ink = getComputedStyle(row).color
  await waitFor(() => expect(labelStyleOf(row).textDecorationColor).toBe(ink))
  await expect(labelStyleOf(row).textDecorationLine).toBe('underline')
}

// A row's words, its label and, when it has one, its end.
const wordsIn = (row: HTMLElement) => [...row.children].map((child) => child.textContent).filter((text) => text !== '')

// A variant of the frame, at rest or under the pointer, with the frame's words.
const variant = (kind: Row, hovered: boolean): Story => ({
  args: {
    state: kind,
    at: kind === 'dated' ? MONDAY : null,
    waitingSince: kind === 'waiting' ? THREE_DAYS_AGO : null,
  },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const row = await isTheRow(canvasElement, kind, 'fa-IR', semantic)
    await expect(row.tagName).toBe('BUTTON')
    if (kind === 'none') await expect(wordsIn(row)).toEqual(['تاریخ مصاحبه'])
    if (kind === 'next') await expect(wordsIn(row)).toEqual(['تاریخ دور دوم'])
    if (kind === 'dated') await expect(wordsIn(row)).toEqual(['مصاحبه', 'دوشنبه ۲۰ مهر · ۱۱:۰۰'])
    if (kind === 'waiting') await expect(wordsIn(row)).toEqual(['منتظر نتیجهٔ مصاحبه', 'از ۳ روز پیش'])
    if (hovered) await isUnderlinedUnderThePointer(row)
  },
})

export const NoDate: Story = variant(NONE, false)
export const NoDateHover: Story = variant(NONE, true)
export const Dated: Story = variant(DATED, false)
export const DatedHover: Story = variant(DATED, true)
export const Waiting: Story = variant(WAITING, false)
export const WaitingHover: Story = variant(WAITING, true)
export const NextRound: Story = variant(NEXT, false)
export const NextRoundHover: Story = variant(NEXT, true)

// The question as 656:6290 draws it: 97 high on bg/surface-secondary at radius
// 6, 8 round and 8 between; the question at 12 on 19 at Medium in
// text/primary, then the three answers 6 apart from the inline start, «دور
// بعدی», «منتظر نتیجه» and «نتیجه گرفتم», on one line where they fit, then
// «تاریخش عوض شد».
const isTheQuestion = async (canvasElement: HTMLElement, locale: Locale, palette: Palette) => {
  const i18n = i18nFor(locale)
  const rtl = locale === 'fa-IR'
  const group = within(canvasElement).getByRole('group')
  const style = getComputedStyle(group)
  const box = group.getBoundingClientRect()
  await expect(Math.round(box.width)).toBe(WIDTH)
  await expect([px(style.paddingTop), px(style.paddingInlineStart), px(style.rowGap), px(style.borderTopLeftRadius)]).toEqual([8, 8, 8, 6])
  await expect(style.backgroundColor).toBe(computed(group, palette['bg/surface-secondary']))
  const question = group.firstElementChild
  if (!(question instanceof HTMLElement)) throw new Error('no question')
  await expect(group).toHaveAccessibleName(question.textContent)
  const questionStyle = getComputedStyle(question)
  await expect([px(questionStyle.fontSize), px(questionStyle.lineHeight), Number(questionStyle.fontWeight)]).toEqual([12, 19, 500])
  await expect(questionStyle.color).toBe(computed(group, palette['text/primary']))

  const answers = [i18n._('Next round'), i18n._('Waiting for the result'), i18n._('Got the result')].map((name) =>
    within(group).getByRole('button', { name }),
  )
  const [first, second, third] = answers.map((answer) => answer.getBoundingClientRect())
  if (!first || !second || !third) throw new Error('no answers')
  await expect(rtl ? apart(box.right, first.right) : apart(first.left, box.left)).toBe(8)
  for (const answer of [first, second, third]) {
    await expect(answer.left).toBeGreaterThanOrEqual(box.left + 8 - 0.5)
    await expect(answer.right).toBeLessThanOrEqual(box.right - 8 + 0.5)
  }
  const link = within(group).getByRole('button', { name: i18n._('Its date changed') })
  const linkBox = link.getBoundingClientRect()
  await expect(rtl ? apart(box.right, linkBox.right) : apart(linkBox.left, box.left)).toBe(8)
  return { group, first, second, third }
}

export const Question: Story = {
  args: { state: QUESTION, at: TUESDAY },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const { group, first, second, third } = await isTheQuestion(canvasElement, 'fa-IR', semantic)
    await expect(Math.round(group.getBoundingClientRect().height)).toBe(97)
    await expect(group).toHaveAccessibleName('مصاحبهٔ سه‌شنبه چی شد؟')
    await expect([apart(first.left, second.right), apart(second.left, third.right)]).toEqual([6, 6])
    await expect([first.top, second.top]).toEqual([third.top, third.top])
  },
}

export const Answering: Story = {
  // Each answer calls its own act; the result and the new date are given the
  // slot, to open their picker by.
  args: { state: QUESTION, at: TUESDAY },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    const group = within(canvasElement).getByRole('group')
    await userEvent.click(within(group).getByRole('button', { name: i18n._('Next round') }))
    await expect(args.onNextRound).toHaveBeenCalledTimes(1)
    await userEvent.click(within(group).getByRole('button', { name: i18n._('Waiting for the result') }))
    await expect(args.onWaiting).toHaveBeenCalledTimes(1)
    await userEvent.click(within(group).getByRole('button', { name: i18n._('Got the result') }))
    await expect(args.onResult).toHaveBeenCalledWith(group)
    await userEvent.click(within(group).getByRole('button', { name: i18n._('Its date changed') }))
    await expect(args.onReschedule).toHaveBeenCalledWith(group)
    await expect(args.onPlan).not.toHaveBeenCalled()
  },
}

export const Planning: Story = {
  // A press on a row with no date plans one, given the row to open the
  // calendar by; so does a press on a dated row.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  render: function Render(args) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${spacing.xs}px` }}>
        <InterviewSlot {...args} state={NONE} />
        <InterviewSlot {...args} state={DATED} at={MONDAY} />
      </Box>
    )
  },
  play: async ({ args, canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    const open = rowOf(canvasElement, i18n._('Interview date'))
    await userEvent.click(open)
    await expect(args.onPlan).toHaveBeenLastCalledWith(open)
    const dated = rowOf(canvasElement, i18n._('Interview'))
    await userEvent.click(dated)
    await expect(args.onPlan).toHaveBeenLastCalledWith(dated)
    await expect(args.onAsk).not.toHaveBeenCalled()
  },
}

export const Today: Story = {
  // An interview today says so, with its time, «امروز · ۱۴:۰۰».
  args: { state: DATED, at: TODAY_AT_TWO },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    await expect(wordsIn(rowOf(canvasElement, i18n._('Interview')))).toEqual(['مصاحبه', 'امروز · ۱۴:۰۰'])
  },
}

export const WaitingSinceToday: Story = {
  // A wait begun today says «از امروز».
  args: { state: WAITING, waitingSince: TODAY },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    await expect(wordsIn(rowOf(canvasElement, i18n._('Result pending')))).toEqual(['منتظر نتیجهٔ مصاحبه', 'از امروز'])
  },
}

export const AskingAgain: Story = {
  // A press on the waiting row asks the question again, when the board says so.
  args: { state: WAITING, waitingSince: THREE_DAYS_AGO },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    await userEvent.click(rowOf(canvasElement, i18n._('Result pending')))
    await expect(args.onAsk).toHaveBeenCalledTimes(1)
    await expect(args.onPlan).not.toHaveBeenCalled()
  },
}

export const WaitingWithNothingToAsk: Story = {
  // With nothing to ask, the waiting row is words, as the file draws its press:
  // no button, and no underline under the pointer.
  args: { state: WAITING, waitingSince: THREE_DAYS_AGO },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  render: function Render({ onAsk: _onAsk, ...args }) {
    return <InterviewSlot {...args} />
  },
  play: async ({ canvasElement }) => {
    const row = await isTheRow(canvasElement, WAITING, 'fa-IR', semantic)
    await expect(row.tagName).toBe('DIV')
    await expect(within(canvasElement).queryByRole('button')).toBeNull()
    await expect(labelStyleOf(row).textDecorationLine).toBe('none')
  },
}

export const KeyboardFocus: Story = {
  // Tab reaches each row and draws the ring the file does not: an outline two
  // clear of the open row, three wide inside the boxed one.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  render: function Render(args) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${spacing.xs}px` }}>
        <InterviewSlot {...args} state={NONE} />
        <InterviewSlot {...args} state={DATED} at={MONDAY} />
      </Box>
    )
  },
  play: async ({ canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    const focus = computed(canvasElement, semantic['border/focus'])
    const open = rowOf(canvasElement, i18n._('Interview date'))
    await userEvent.tab()
    await expect(open).toHaveFocus()
    const outline = getComputedStyle(open)
    await expect([outline.outlineStyle, px(outline.outlineWidth), px(outline.outlineOffset), outline.outlineColor]).toEqual([
      'solid',
      3,
      2,
      focus,
    ])
    const boxed = rowOf(canvasElement, i18n._('Interview'))
    await userEvent.tab()
    await expect(boxed).toHaveFocus()
    const ring = getComputedStyle(boxed, '::after')
    await expect([px(ring.borderTopWidth), ring.borderTopStyle, ring.borderTopColor]).toEqual([3, 'solid', focus])
  },
}

// Every state at once, as a column of the board would stack them.
const everyState = (args: InterviewSlotProps) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${spacing.xs}px` }}>
    <InterviewSlot {...args} state={NONE} />
    <InterviewSlot {...args} state={DATED} at={MONDAY} />
    <InterviewSlot {...args} state={WAITING} waitingSince={THREE_DAYS_AGO} />
    <InterviewSlot {...args} state={QUESTION} at={TUESDAY} />
    <InterviewSlot {...args} state={NEXT} />
  </Box>
)

export const InEnglish: Story = {
  // Every state in English, each row on its one line with nothing cut; the
  // answers wrap where the three do not fit on one line.
  globals: { locale: 'en-US', colorScheme: 'light' },
  render: function Render(args) {
    return everyState(args)
  },
  play: async ({ canvasElement }) => {
    for (const kind of ROWS) await isTheRow(canvasElement, kind, 'en-US', semantic)
    const { group } = await isTheQuestion(canvasElement, 'en-US', semantic)
    await expect(group).toHaveAccessibleName('How did the interview on Tuesday go?')
    const i18n = i18nFor('en-US')
    await expect(wordsIn(rowOf(canvasElement, i18n._('Interview')))).toEqual(['Interview', 'Mon, Oct 12 · 11:00'])
    await expect(wordsIn(rowOf(canvasElement, i18n._('Result pending')))).toEqual(['Result pending', 'for 3 days now'])
  },
}

export const Dark: Story = {
  // Every state in the dark scheme, in the theme's dark colours.
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  render: function Render(args) {
    return everyState(args)
  },
  play: async ({ canvasElement }) => {
    for (const kind of ROWS) await isTheRow(canvasElement, kind, 'fa-IR', darkSemantic)
    await isTheQuestion(canvasElement, 'fa-IR', darkSemantic)
  },
}
