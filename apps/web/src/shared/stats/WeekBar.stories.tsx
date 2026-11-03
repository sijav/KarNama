import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import type { Locale } from '../../i18n'
import { formatCount } from '../../i18n/formatCount'
import { darkSemantic } from '../../theme/darkMode'
import { semantic, spacing } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { WeekBar, type WeekBarProps } from './WeekBar'

const meta = {
  title: 'Shared/WeekBar',
  component: WeekBar,
  args: { count: 3, current: false, height: 68 },
  parameters: { controls: { include: ['count', 'current', 'height'] } },
} satisfies StoryMeta<typeof WeekBar>

export default meta
type Story = StoryObj<typeof meta>

const px = (value: string) => Number.parseFloat(value) || 0

// A colour as the browser computes it, borrowed on the host's own inline style
// and put back in the same tick. Never inside waitFor, KN-014.
const computed = (host: HTMLElement, value: string) => {
  const previous = host.style.color
  host.style.color = value
  const result = getComputedStyle(host).color
  host.style.color = previous
  return result
}

type Palette = Record<keyof typeof semantic, string>

// A bar, found by its count: the count's parent is the bar's column.
const columnOf = (canvasElement: HTMLElement, count: number, locale: Locale) => {
  const figure = within(canvasElement).getByText(formatCount(locale, count))
  const column = figure.parentElement
  const bar = figure.nextElementSibling
  if (!(column instanceof HTMLElement) || !(bar instanceof HTMLElement)) throw new Error('no bar is drawn')
  return { column, figure, bar }
}

// Node 1168:3183: 32 wide at the height it is given; the count in Label, 12 on
// 16 at Medium, centred at the top, and 4 under it the bar filling the rest at
// radius 4: Current=No in text/secondary over bg/brand/container, Current=Yes
// in text/primary over bg/brand/default.
const isTheFiles = async (canvasElement: HTMLElement, args: WeekBarProps, locale: Locale, palette: Palette) => {
  // Never under the count, its 4 and a pixel of bar.
  const height = Math.max(args.height ?? 68, 21)
  const words: keyof Palette = args.current === true ? 'text/primary' : 'text/secondary'
  const fill: keyof Palette = args.current === true ? 'bg/brand/default' : 'bg/brand/container'
  const { column, figure, bar } = columnOf(canvasElement, args.count, locale)
  const box = column.getBoundingClientRect()
  await expect([box.width, box.height]).toEqual([32, height])
  const text = getComputedStyle(figure)
  await expect([px(text.fontSize), px(text.lineHeight), text.fontWeight]).toEqual([12, 16, '500'])
  await expect(text.color).toBe(computed(figure, palette[words]))
  const top = figure.getBoundingClientRect()
  await expect(Math.round(top.top - box.top)).toBe(0)
  await expect(Math.abs(top.left + top.width / 2 - (box.left + box.width / 2))).toBeLessThanOrEqual(0.5)
  const drawn = bar.getBoundingClientRect()
  await expect([drawn.width, drawn.height, Math.round(drawn.top - top.bottom)]).toEqual([32, height - 20, 4])
  const style = getComputedStyle(bar)
  await expect(px(style.borderTopLeftRadius)).toBe(4)
  await expect(style.backgroundColor).toBe(computed(bar, palette[fill]))
  await expect(bar.getAttribute('aria-hidden')).toBe('true')
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, 'fa-IR', semantic)
  },
}

export const Current: Story = {
  // This week, drawn strong.
  args: { current: true },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, 'fa-IR', semantic)
  },
}

// A week of each height the page could give, the tallest this one.
const WEEKS: readonly WeekBarProps[] = [
  { count: 0, height: 20 },
  { count: 2, height: 44 },
  { count: 5, height: 80 },
  { count: 8, height: 116, current: true },
]

export const AWeekOfHeights: Story = {
  // The page sets each bar's height from its count; the bar fills what is
  // left under the count, and a week with none keeps a pixel of bar, 21 in
  // all, whatever less it is given.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  render: () => (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: `${spacing.sm}px` }}>
      {WEEKS.map((week) => (
        <WeekBar key={week.count} {...week} />
      ))}
    </Box>
  ),
  play: async ({ canvasElement }) => {
    for (const week of WEEKS) await isTheFiles(canvasElement, week, 'fa-IR', semantic)
  },
}

export const InEnglish: Story = {
  args: { count: 12 },
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, 'en-US', semantic)
  },
}

export const Dark: Story = {
  render: () => (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: `${spacing.sm}px` }}>
      <WeekBar count={3} />
      <WeekBar count={4} current />
    </Box>
  ),
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ canvasElement }) => {
    await isTheFiles(canvasElement, { count: 3 }, 'fa-IR', darkSemantic)
    await isTheFiles(canvasElement, { count: 4, current: true }, 'fa-IR', darkSemantic)
  },
}
