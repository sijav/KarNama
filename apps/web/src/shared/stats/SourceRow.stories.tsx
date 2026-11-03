import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { expect, waitFor, within } from 'storybook/test'
import type { Locale } from '../../i18n'
import { formatCount } from '../../i18n/formatCount'
import { darkSemantic } from '../../theme/darkMode'
import { semantic, spacing } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { TOOLTIP_LABEL_SURFACE } from '../tooltip-label'
import { SourceRow, type SourceRowProps } from './SourceRow'

// The card's rows are 320 wide, and the window of every source's wider.
const CARD_WIDTH = 320
const MODAL_WIDTH = 480

const FA = fixtures('fa-IR')
const EN = fixtures('en-US')
const LARGEST = Math.max(...FA.statsSources.map((source) => source.applications))

const rowArgs = (set: typeof FA, at: number): SourceRowProps => {
  const source = set.statsSources[at]
  if (!source) throw new Error('the fixtures hold no such source')
  return { source: source.name, applications: source.applications, interviews: source.interviews, largest: LARGEST }
}

// The two places a row is drawn, typed so the lint rule reads them as values.
const CONTEXTS: readonly NonNullable<SourceRowProps['context']>[] = ['card', 'modal']

const InACard = (args: SourceRowProps) => (
  <Box sx={{ width: args.context === 'modal' ? MODAL_WIDTH : CARD_WIDTH }}>
    <SourceRow {...args} />
  </Box>
)

const meta = {
  title: 'Shared/SourceRow',
  component: SourceRow,
  args: rowArgs(FA, 0),
  argTypes: { context: { control: 'radio', options: CONTEXTS } },
  parameters: { controls: { include: ['source', 'applications', 'interviews', 'largest', 'context'] } },
  render: (args) => <InACard {...args} />,
} satisfies StoryMeta<typeof SourceRow>

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

// A row's parts, found by its name: the name, the bar and its count, and the
// interviews, in that order from the inline start.
const partsOf = (canvasElement: HTMLElement, source: string) => {
  const name = within(canvasElement).getByText(source)
  const row = name.parentElement
  if (!(row instanceof HTMLElement)) throw new Error('the name has no row')
  const [, area, interviews] = [...row.children]
  if (!(area instanceof HTMLElement) || !(interviews instanceof HTMLElement)) throw new Error('the row is missing a part')
  const count = area.lastElementChild
  const bar = area.children.length > 1 ? area.firstElementChild : null
  if (!(count instanceof HTMLElement)) throw new Error('the bar has no count')
  return { row, name, area, bar: bar instanceof HTMLElement ? bar : null, count, interviews }
}

// Node 1223:1807: 16 between the parts, all in Body, 14 on 22; the name at the
// inline start in text/primary, 140 wide in the card; the bar in data/bar at
// radius 4, 12 tall, 4 before its count in text/primary; the interviews centred
// in a 56 column at the inline end in text/secondary.
const isTheFiles = async (canvasElement: HTMLElement, args: SourceRowProps, locale: Locale, palette: Palette, nameWidth: number) => {
  const { row, name, bar, count, interviews } = partsOf(canvasElement, args.source)
  const style = getComputedStyle(row)
  await expect([px(style.columnGap), px(style.fontSize), px(style.lineHeight), style.fontWeight]).toEqual([16, 14, 22, '400'])
  const rtl = style.direction === 'rtl'
  const box = row.getBoundingClientRect()
  const named = name.getBoundingClientRect()
  await expect(named.width).toBe(nameWidth)
  await expect(Math.round(rtl ? box.right - named.right : named.left - box.left)).toBe(0)
  await expect(getComputedStyle(name).color).toBe(computed(name, palette['text/primary']))
  const counted = interviews.getBoundingClientRect()
  await expect(counted.width).toBe(56)
  await expect(Math.round(rtl ? counted.left - box.left : box.right - counted.right)).toBe(0)
  await expect(interviews).toHaveTextContent(formatCount(locale, args.interviews))
  await expect(getComputedStyle(interviews).textAlign).toBe('center')
  await expect(getComputedStyle(interviews).color).toBe(computed(interviews, palette['text/secondary']))
  await expect(count).toHaveTextContent(formatCount(locale, args.applications))
  await expect(getComputedStyle(count).color).toBe(computed(count, palette['text/primary']))
  if (bar === null) return
  const drawn = bar.getBoundingClientRect()
  await expect(drawn.height).toBe(12)
  const barStyle = getComputedStyle(bar)
  await expect(px(barStyle.borderTopLeftRadius)).toBe(4)
  await expect(barStyle.backgroundColor).toBe(computed(bar, palette['data/bar']))
  await expect(bar.getAttribute('aria-hidden')).toBe('true')
  // The bar starts 16 after the name and its count 4 after its end.
  await expect(Math.round(rtl ? named.left - drawn.right : drawn.left - named.right)).toBe(16)
  const figure = count.getBoundingClientRect()
  await expect(Math.round(rtl ? drawn.left - figure.right : figure.left - drawn.right)).toBe(4)
}

export const Card: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, 'fa-IR', semantic, 140)
  },
}

export const SeveralSources: Story = {
  // Each bar as long against the largest's as its applications are against the
  // largest's.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  render: () => (
    <Box sx={{ width: CARD_WIDTH, display: 'flex', flexDirection: 'column', gap: `${spacing.sm}px` }}>
      {[0, 1, 2].map((at) => (
        <SourceRow key={at} {...rowArgs(FA, at)} />
      ))}
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const rows = [0, 1, 2].map((at) => rowArgs(FA, at))
    const widths = rows.map((row) => partsOf(canvasElement, row.source).bar?.getBoundingClientRect().width ?? 0)
    const [largest] = widths
    if (largest === undefined || largest === 0) throw new Error('the largest source has no bar')
    for (const [at, row] of rows.entries()) {
      await isTheFiles(canvasElement, row, 'fa-IR', semantic, 140)
      await expect(Math.abs((widths[at] ?? 0) / largest - row.applications / LARGEST)).toBeLessThan(0.02)
    }
  },
}

export const SingleSource: Story = {
  // A single source has no bar: its count stands alone after the name.
  render: ({ largest: _largest, ...args }) => <InACard {...args} />,
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const { largest: _largest, ...alone } = args
    await isTheFiles(canvasElement, alone, 'fa-IR', semantic, 140)
    await expect(partsOf(canvasElement, args.source).bar).toBeNull()
  },
}

export const ALongNameInTheCard: Story = {
  // One line, cut with an ellipsis, and shown whole in a label under the
  // pointer.
  args: rowArgs(FA, 3),
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const { name } = partsOf(canvasElement, args.source)
    await expect(name.getBoundingClientRect().height).toBe(22)
    await expect(getComputedStyle(name).textOverflow).toBe('ellipsis')
    await expect(name.scrollWidth).toBeGreaterThan(name.clientWidth)
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) {
      if (import.meta.env.MODE !== 'test') return
      throw new Error('ALongNameInTheCard is running outside Storybook without the story-test flag that .storybook/vitest.setup.ts sets')
    }
    const browser = await import('vitest/browser')
    await browser.userEvent.hover(name)
    const label = await waitFor(() => {
      const surface = canvasElement.ownerDocument.querySelector(`.${TOOLTIP_LABEL_SURFACE}`)
      if (!(surface instanceof HTMLElement)) throw new Error('no label opened')
      return surface
    })
    await expect(label).toHaveTextContent(args.source)
  },
}

export const Modal: Story = {
  // In the window of every source the name is 200 wide and takes up to three
  // lines, so the whole of it shows.
  args: { ...rowArgs(FA, 3), context: 'modal' },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, 'fa-IR', semantic, 200)
    const { name, row } = partsOf(canvasElement, args.source)
    const lines = Math.round(name.getBoundingClientRect().height / 22)
    await expect(lines).toBeGreaterThan(1)
    await expect(lines).toBeLessThanOrEqual(3)
    await expect(getComputedStyle(row).alignItems).toBe('flex-start')
  },
}

export const InEnglish: Story = {
  args: rowArgs(EN, 0),
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Left to right it mirrors: the name at the left, the interviews at the right.
    await isTheFiles(canvasElement, args, 'en-US', semantic, 140)
  },
}

export const Dark: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, 'fa-IR', darkSemantic, 140)
  },
}
