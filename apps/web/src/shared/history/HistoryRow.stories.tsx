import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { i18nFor, type Locale } from '../../i18n'
import { darkSemantic } from '../../theme/darkMode'
import { semantic } from '../../theme/tokens'
import { formatDay } from '../job-modal/format'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { HistoryRow, type HistoryRowProps } from './HistoryRow'

// The job modal's history tab is 672 wide, and a phone's detail page 358.
const TAB_WIDTH = 672
const PHONE_WIDTH = 358

const FA = fixtures('fa-IR')
const EN = fixtures('en-US')
type Fixtures = typeof FA

// The day the file's rows show, 13 Shahrivar 1405.
const DAY = '2026-09-04'

// The status of the job opportunity's change at that place in its history:
// the first is the saved status, recorded automatically, the third the interview.
const statusAt = (set: Fixtures, index: number) => {
  const found = set.statusOptions.find((option) => option.id === set.jobDetail.history[index]?.status)
  if (!found) throw new Error('the fixtures hold no such change')
  return { token: found.token, name: found.name }
}

// A row's props but its callback, which the meta's args give as fn().
type RowArgs = HistoryRowProps extends infer Row ? (Row extends unknown ? Omit<Row, 'onEdit'> : never) : never

// A status the job opportunity entered, by hand, in the middle of the list.
const statusRow = (set: Fixtures, locale: Locale): RowArgs => ({
  kind: 'status',
  status: statusAt(set, 2),
  date: formatDay(locale, DAY),
  source: set.historyWords.manual,
  lineAbove: true,
  lineBelow: true,
})

// The saved row, the oldest, recorded automatically and locked, as the job
// modal's History List ends.
const savedRow = (set: Fixtures, locale: Locale): RowArgs => ({
  kind: 'status',
  status: statusAt(set, 0),
  date: formatDay(locale, DAY),
  source: set.historyWords.automatic,
  lineAbove: true,
  lineBelow: false,
  locked: true,
})

// An interview round, with its time and result.
const roundRow = (set: Fixtures, locale: Locale): RowArgs => ({
  kind: 'round',
  title: set.historyWords.roundTitle,
  date: formatDay(locale, DAY),
  source: set.historyWords.roundDetail,
  lineAbove: true,
  lineBelow: true,
})

const InTheList = (args: HistoryRowProps) => (
  <Box sx={{ width: args.layout === 'mobile' ? PHONE_WIDTH : TAB_WIDTH }}>
    <HistoryRow {...args} />
  </Box>
)

const meta = {
  title: 'Shared/HistoryRow',
  component: HistoryRow,
  args: { ...statusRow(FA, 'fa-IR'), onEdit: fn() },
  parameters: { controls: { include: ['date', 'source', 'lineAbove', 'lineBelow', 'locked', 'layout'] } },
  render: (args) => <InTheList {...args} />,
} satisfies StoryMeta<typeof HistoryRow>

export default meta
type Story = StoryObj<typeof meta>

const px = (value: string) => Number.parseFloat(value) || 0

// A colour as the browser computes it, borrowed on the host's own inline style
// and put back in the same tick. Never inside waitFor, KN-014.
const computed = (host: HTMLElement | SVGElement, value: string) => {
  const previous = host.style.color
  host.style.color = value
  const result = getComputedStyle(host).color
  host.style.color = previous
  return result
}

type Palette = Record<keyof typeof semantic, string>

// The row's parts: its own box, the marker's line above, dot and line below,
// the heading, and the date, source and pencil.
const partsOf = (canvasElement: HTMLElement, args: HistoryRowProps) => {
  const date = within(canvasElement).getByText(args.date)
  // The date sits in its group, the group in the content, the content in the row.
  const holder = date.parentElement
  const row = holder?.parentElement?.parentElement
  if (!(row instanceof HTMLElement) || !holder) throw new Error('the row is missing')
  const marker = row.firstElementChild
  const [above, dot, below] = marker ? [...marker.children] : []
  const source = within(holder).getByText(`· ${args.source}`)
  const pencil = holder.querySelector('svg')
  if (!(above instanceof HTMLElement) || !(dot instanceof HTMLElement) || !(below instanceof HTMLElement) || !pencil) throw new Error('the row is missing a part')
  return { row, above, dot, below, date, source, pencil, holder }
}

// Node 749:32 on a desktop: 43 tall at radius 8, 12 at the sides and 12
// between; the marker 12 wide, its lines two of border/default, its dot a solid
// 10 of text/secondary for a status and a hollow 8 for a round; the date and its
// source 12 on 19 at Regular in text/secondary, 6 apart, the pencil hidden.
const isTheFiles = async (canvasElement: HTMLElement, args: HistoryRowProps, palette: Palette) => {
  const { row, above, dot, below, date, source, pencil } = partsOf(canvasElement, args)
  const style = getComputedStyle(row)
  await expect(row.getBoundingClientRect().height).toBe(43)
  await expect([px(style.paddingInlineStart), px(style.paddingInlineEnd), px(style.columnGap), px(style.borderTopLeftRadius)]).toEqual([12, 12, 12, 8])
  await expect(row.firstElementChild?.getBoundingClientRect().width).toBe(12)
  for (const line of [above, below]) {
    await expect(line.getBoundingClientRect().width).toBe(2)
    await expect(getComputedStyle(line).backgroundColor).toBe(computed(line, palette['border/default']))
  }
  const spot = dot.getBoundingClientRect()
  if (args.kind === 'status') {
    await expect([spot.width, spot.height]).toEqual([10, 10])
    await expect(getComputedStyle(dot).backgroundColor).toBe(computed(dot, palette['text/secondary']))
  } else {
    await expect([spot.width, spot.height]).toEqual([8, 8])
    // The one and a half inside, an inset shadow: its colour, then 0 0 0 and 1.5.
    const edge = getComputedStyle(dot).boxShadow
    await expect(edge.startsWith(computed(dot, palette['text/secondary']))).toBe(true)
    await expect((edge.match(/-?[\d.]+(?=px)/g) ?? []).map(Number)).toEqual([0, 0, 0, 1.5])
    await expect(edge.endsWith('inset')).toBe(true)
    await expect(getComputedStyle(dot).backgroundColor).toBe(computed(dot, palette['bg/surface']))
  }
  for (const words of [date, source]) {
    const set = getComputedStyle(words)
    await expect([px(set.fontSize), px(set.lineHeight), set.fontWeight]).toEqual([12, 19, '400'])
    await expect(set.color).toBe(computed(words, palette['text/secondary']))
  }
  await expect(getComputedStyle(pencil).display).toBe('none')
}

export const Status: Story = {
  args: statusRow(FA, 'fa-IR'),
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, semantic)
  },
}

export const Round: Story = {
  // An interview round: the title at 13 on 20 Medium in text/primary, the dot
  // hollow.
  args: roundRow(FA, 'fa-IR'),
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, semantic)
    if (args.kind !== 'round') throw new Error('not a round')
    const title = within(canvasElement).getByText(args.title)
    const style = getComputedStyle(title)
    await expect([px(style.fontSize), px(style.lineHeight), style.fontWeight]).toEqual([13, 20, '500'])
    await expect(style.color).toBe(computed(title, semantic['text/primary']))
  },
}

export const Hover: Story = {
  args: statusRow(FA, 'fa-IR'),
  // Under a real pointer the row fills with bg/surface-secondary, the date
  // turns text/brand at Medium, the source gives way to the pencil in
  // text/brand. Only the test runner has a pointer to move.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const { row, date, source, pencil } = partsOf(canvasElement, args)
    const [fill, brand] = [computed(row, semantic['bg/surface-secondary']), computed(row, semantic['text/brand'])]
    const browser = await import('vitest/browser')
    await browser.userEvent.hover(row)
    await waitFor(() => expect(getComputedStyle(row).backgroundColor).toBe(fill))
    await expect([getComputedStyle(date).color, getComputedStyle(date).fontWeight]).toEqual([brand, '500'])
    await expect(getComputedStyle(source).display).toBe('none')
    await expect([getComputedStyle(pencil).display, getComputedStyle(pencil).color]).toEqual(['block', brand])
  },
}

export const KeyboardFocus: Story = {
  args: statusRow(FA, 'fa-IR'),
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Tab reaches the date as a button that asks to change it, the row draws
    // its hover look, and Enter asks.
    const button = within(canvasElement).getByRole('button', { name: `${i18nFor('fa-IR')._('Change the date')} ${args.date}` })
    await userEvent.tab()
    await expect(button).toHaveFocus()
    const { pencil } = partsOf(canvasElement, args)
    await expect(getComputedStyle(pencil).display).toBe('block')
    await userEvent.keyboard('{Enter}')
    await expect(args.onEdit).toHaveBeenCalledOnce()
  },
}

export const Locked: Story = {
  // The saved row: no button, no pencil, and the last line of the list.
  args: savedRow(FA, 'fa-IR'),
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await expect(within(canvasElement).queryByRole('button')).toBeNull()
    const { pencil, below, above } = partsOf(canvasElement, args)
    await expect(getComputedStyle(pencil).display).toBe('none')
    await expect([getComputedStyle(above).visibility, getComputedStyle(below).visibility]).toEqual(['visible', 'hidden'])
  },
}

export const First: Story = {
  // The newest row has no line above.
  args: { ...statusRow(FA, 'fa-IR'), lineAbove: false },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const { above, below } = partsOf(canvasElement, args)
    await expect([getComputedStyle(above).visibility, getComputedStyle(below).visibility]).toEqual(['hidden', 'visible'])
  },
}

// Node 1313:3390: the heading over the date, 4 apart and 8 above and below, the
// pencil always shown in text/secondary, the row 63 tall for a status and 59
// for a round.
const isThePhones = async (canvasElement: HTMLElement, args: HistoryRowProps, height: number, palette: Palette) => {
  const { row, holder, pencil } = partsOf(canvasElement, args)
  await expect(row.getBoundingClientRect().height).toBe(height)
  const content = holder.parentElement
  if (!content) throw new Error('the row has no content')
  const style = getComputedStyle(content)
  await expect([px(style.rowGap), px(style.paddingTop), px(style.paddingBottom)]).toEqual([4, 8, 8])
  await expect([getComputedStyle(pencil).display, getComputedStyle(pencil).color]).toEqual(['block', computed(row, palette['text/secondary'])])
  await expect(pencil.getBoundingClientRect().width).toBe(14)
}

export const MobileStatus: Story = {
  args: { ...statusRow(FA, 'fa-IR'), layout: 'mobile' },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isThePhones(canvasElement, args, 63, semantic)
  },
}

export const MobileRound: Story = {
  args: { ...roundRow(FA, 'fa-IR'), layout: 'mobile' },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isThePhones(canvasElement, args, 59, semantic)
  },
}

export const MobileLocked: Story = {
  args: { ...savedRow(FA, 'fa-IR'), layout: 'mobile' },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const { pencil } = partsOf(canvasElement, args)
    await expect(getComputedStyle(pencil).display).toBe('none')
    await expect(within(canvasElement).queryByRole('button')).toBeNull()
  },
}

export const InEnglish: Story = {
  args: statusRow(EN, 'en-US'),
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, semantic)
  },
}

export const Dark: Story = {
  args: roundRow(FA, 'fa-IR'),
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, darkSemantic)
  },
}
