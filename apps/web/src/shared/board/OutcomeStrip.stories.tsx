import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { type Locale } from '../../i18n'
import { formatCount } from '../../i18n/formatCount'
import { darkSemantic, darkStatus } from '../../theme/darkMode'
import { semantic, status } from '../../theme/tokens'
import { GLYPHS } from '../icon/glyphs'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { OutcomeStrip, type Outcome, type OutcomeStripProps } from './OutcomeStrip'

// The board's row is as tall as its tallest column; 400 stands in for it.
const ROW_HEIGHT = 400

const OUTCOMES: readonly Outcome[] = ['accepted', 'rejected', 'no-response', 'withdrawn']

const FA = fixtures('fa-IR')
const EN = fixtures('en-US')

const InTheRow = (args: OutcomeStripProps) => (
  <Box sx={{ display: 'flex', height: ROW_HEIGHT }}>
    <OutcomeStrip {...args} />
  </Box>
)

const meta = {
  title: 'Shared/OutcomeStrip',
  component: OutcomeStrip,
  args: { outcome: 'no-response', name: FA.outcomeNames.noResponse, count: 14, onOpen: fn() },
  argTypes: { outcome: { control: 'radio', options: OUTCOMES } },
  parameters: { controls: { include: ['outcome', 'name', 'count'] } },
  render: (args) => <InTheRow {...args} />,
} satisfies StoryMeta<typeof OutcomeStrip>

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
type Statuses = typeof status | typeof darkStatus

const stripIn = (canvasElement: HTMLElement, args: OutcomeStripProps, locale: Locale) =>
  within(canvasElement).getByRole('button', { name: `${args.name} ${formatCount(locale, args.count)}` })

// What each outcome draws in: the words, and the count's pill.
const colours = (args: OutcomeStripProps, palette: Palette, statuses: Statuses) => {
  if (args.outcome === 'accepted') return { words: statuses['custom-1'].base, pill: statuses['custom-1'].container }
  if (args.outcome === 'rejected') return { words: statuses.rejected.base, pill: statuses.rejected.container }
  return { words: palette['text/secondary'], pill: palette['bg/surface'] }
}

const GLYPH_OF = { accepted: GLYPHS.check, rejected: GLYPHS.x, 'no-response': GLYPHS.clock, withdrawn: GLYPHS['log-out'] }

// Node 638:7928: 88 wide and the row's height, bg/surface-secondary at radius
// 16, 18 above, 14 below and 8 at the sides, its parts centred 6 apart from the
// top: the outcome's icon at 20, the name at 13 on 20 SemiBold and the count at
// 12 on 19 Medium in a pill 1 and 8 round it, the reader's digits.
const isTheFiles = async (canvasElement: HTMLElement, args: OutcomeStripProps, locale: Locale, palette: Palette, statuses: Statuses) => {
  const strip = stripIn(canvasElement, args, locale)
  const box = strip.getBoundingClientRect()
  const style = getComputedStyle(strip)
  await expect([box.width, box.height]).toEqual([88, ROW_HEIGHT])
  await expect([px(style.paddingTop), px(style.paddingBottom), px(style.paddingInlineStart), px(style.paddingInlineEnd), px(style.rowGap)]).toEqual([
    18, 14, 8, 8, 6,
  ])
  await expect(px(style.borderTopLeftRadius)).toBe(16)
  await expect(style.backgroundColor).toBe(computed(strip, palette['bg/surface-secondary']))
  const [icon, name, count] = [...strip.children]
  if (!(icon instanceof SVGElement) || !(name instanceof HTMLElement) || !(count instanceof HTMLElement)) throw new Error('the strip is missing a part')
  const { words, pill } = colours(args, palette, statuses)
  const drawn = icon.getBoundingClientRect()
  await expect([drawn.width, drawn.height, Math.round(drawn.top - box.top)]).toEqual([20, 20, 18])
  await expect(icon.querySelector('path')?.getAttribute('d')).toBe(GLYPH_OF[args.outcome].stroke[0])
  await expect(getComputedStyle(icon).color).toBe(computed(strip, words))
  const named = getComputedStyle(name)
  await expect([px(named.fontSize), px(named.lineHeight), named.fontWeight, named.textAlign]).toEqual([13, 20, '600', 'center'])
  await expect(named.color).toBe(computed(strip, words))
  await expect(Math.round(name.getBoundingClientRect().top - drawn.bottom)).toBe(6)
  const counted = getComputedStyle(count)
  await expect([px(counted.fontSize), px(counted.lineHeight), counted.fontWeight]).toEqual([12, 19, '500'])
  await expect([px(counted.paddingTop), px(counted.paddingInlineStart)]).toEqual([1, 8])
  await expect(counted.color).toBe(computed(strip, words))
  await expect(counted.backgroundColor).toBe(computed(strip, pill))
  await expect(count.textContent).toBe(formatCount(locale, args.count))
  await expect(Math.round(count.getBoundingClientRect().top - name.getBoundingClientRect().bottom)).toBe(6)
}

export const NoResponse: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, 'fa-IR', semantic, status)
  },
}

export const Accepted: Story = {
  // The check, in the custom-1 pair.
  args: { outcome: 'accepted', name: FA.outcomeNames.accepted, count: 0 },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, 'fa-IR', semantic, status)
  },
}

export const Rejected: Story = {
  // The x, in the rejected pair.
  args: { outcome: 'rejected', name: FA.outcomeNames.rejected, count: 6 },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, 'fa-IR', semantic, status)
  },
}

export const Withdrawn: Story = {
  // The way out, in the strip's greys.
  args: { outcome: 'withdrawn', name: FA.outcomeNames.withdrawn, count: 1 },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, 'fa-IR', semantic, status)
  },
}

export const Open: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // A press opens it into its column.
    await userEvent.click(stripIn(canvasElement, args, 'fa-IR'))
    await expect(args.onOpen).toHaveBeenCalledOnce()
  },
}

export const KeyboardFocus: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Reached by Tab, it wears the three pixel ring inside its edge, and Enter
    // opens it.
    const strip = stripIn(canvasElement, args, 'fa-IR')
    await userEvent.tab()
    await expect(strip).toHaveFocus()
    const ring = getComputedStyle(strip, '::after')
    await expect([ring.borderTopStyle, px(ring.borderTopWidth)]).toEqual(['solid', 3])
    await expect(ring.borderTopColor).toBe(computed(strip, semantic['border/focus']))
    await userEvent.keyboard('{Enter}')
    await expect(args.onOpen).toHaveBeenCalledOnce()
  },
}

export const InEnglish: Story = {
  args: { outcome: 'accepted', name: EN.outcomeNames.accepted, count: 3 },
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, 'en-US', semantic, status)
  },
}

export const Dark: Story = {
  args: { outcome: 'rejected', name: FA.outcomeNames.rejected, count: 6 },
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, 'fa-IR', darkSemantic, darkStatus)
  },
}
