import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import type { Locale } from '../../i18n'
import { formatCount } from '../../i18n/formatCount'
import { darkSemantic, darkStatus } from '../../theme/darkMode'
import { semantic, spacing, status } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { StatsNumber, type StatsNumberProps, type StatsNumberStatus } from './StatsNumber'

// The file's card is 200 wide, and fills its row on the page.
const CARD = 200

const InARow = (args: StatsNumberProps) => (
  <Box sx={{ width: CARD }}>
    <StatsNumber {...args} />
  </Box>
)

const FA = fixtures('fa-IR')
const EN = fixtures('en-US')

const meta = {
  title: 'Shared/StatsNumber',
  component: StatsNumber,
  args: { status: 'applied', label: FA.statsLabels.applied, value: 24 },
  argTypes: { status: { control: 'radio', options: ['applied', 'interview', 'offer', 'rejected', 'no-response'] } },
  parameters: { controls: { include: ['status', 'label', 'value'] } },
  render: (args) => <InARow {...args} />,
} satisfies StoryMeta<typeof StatsNumber>

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
type Statuses = Record<keyof typeof status, { base: string; container: string }>

// The dot's colour for each: the base of the status's pair, and text/secondary
// for no response.
const dotColour = (which: StatsNumberStatus, palette: Palette, statuses: Statuses) =>
  which === 'no-response' ? palette['text/secondary'] : statuses[which].base

// Node 1168:3159: 200 by 82, bg/surface-secondary at radius 8, 12 above and
// below and 16 at the sides; from the inline start the 8 dot and 8 after it
// the label in Body, 14 on 22, in text/secondary-strong; 4 under them the
// number in Heading/L, 24 on 32 at SemiBold, in text/primary, in the reader's
// digits.
const isTheFiles = async (card: HTMLElement, args: StatsNumberProps, locale: Locale, palette: Palette, statuses: Statuses) => {
  const box = card.getBoundingClientRect()
  await expect([box.width, box.height]).toEqual([CARD, 82])
  const style = getComputedStyle(card)
  await expect([px(style.paddingTop), px(style.paddingBottom), px(style.paddingInlineStart), px(style.paddingInlineEnd), px(style.rowGap), px(style.borderTopLeftRadius)]).toEqual([12, 12, 16, 16, 4, 8])
  await expect(style.backgroundColor).toBe(computed(card, palette['bg/surface-secondary']))
  const label = within(card).getByText(args.label)
  const words = getComputedStyle(label)
  await expect([px(words.fontSize), px(words.lineHeight), words.fontWeight]).toEqual([14, 22, '400'])
  await expect(words.color).toBe(computed(label, palette['text/secondary-strong']))
  const dot = label.previousElementSibling
  if (!(dot instanceof HTMLElement)) throw new Error('the label has no dot before it')
  await expect(dot.getAttribute('aria-hidden')).toBe('true')
  const spot = dot.getBoundingClientRect()
  await expect([spot.width, spot.height]).toEqual([8, 8])
  await expect(getComputedStyle(dot).backgroundColor).toBe(computed(dot, dotColour(args.status, palette, statuses)))
  const rtl = style.direction === 'rtl'
  await expect(Math.round(rtl ? box.right - spot.right : spot.left - box.left)).toBe(16)
  await expect(Math.round(rtl ? spot.left - label.getBoundingClientRect().right : label.getBoundingClientRect().left - spot.right)).toBe(8)
  const number = within(card).getByText(formatCount(locale, args.value))
  const figure = getComputedStyle(number)
  await expect([px(figure.fontSize), px(figure.lineHeight), figure.fontWeight]).toEqual([24, 32, '600'])
  await expect(figure.color).toBe(computed(number, palette['text/primary']))
  await expect(Math.round(number.getBoundingClientRect().top - label.getBoundingClientRect().bottom)).toBe(4)
  await expect(Math.round(rtl ? box.right - number.getBoundingClientRect().right : number.getBoundingClientRect().left - box.left)).toBe(16)
}

// A card, found by its label: the label's row is the card's first child.
const cardOf = (canvasElement: HTMLElement, label: string) => {
  const card = within(canvasElement).getByText(label).parentElement?.parentElement
  if (!(card instanceof HTMLElement)) throw new Error('no card is drawn')
  return card
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(cardOf(canvasElement, args.label), args, 'fa-IR', semantic, status)
  },
}

// The five, each with its own dot.
const EVERY: readonly { status: StatsNumberStatus; key: keyof typeof FA.statsLabels }[] = [
  { status: 'applied', key: 'applied' },
  { status: 'interview', key: 'interview' },
  { status: 'offer', key: 'offer' },
  { status: 'rejected', key: 'rejected' },
  { status: 'no-response', key: 'noResponse' },
]

export const EveryStatus: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${spacing.xs}px`, width: CARD }}>
      {EVERY.map((each, at) => (
        <StatsNumber key={each.status} status={each.status} label={FA.statsLabels[each.key]} value={at * 7} />
      ))}
    </Box>
  ),
  play: async ({ canvasElement }) => {
    for (const [at, each] of EVERY.entries()) {
      const label = FA.statsLabels[each.key]
      await isTheFiles(cardOf(canvasElement, label), { status: each.status, label, value: at * 7 }, 'fa-IR', semantic, status)
    }
  },
}

export const ALargeNumber: Story = {
  // Grouped in the reader's own way, «۱٬۲۳۴».
  args: { value: 1234 },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await expect(within(canvasElement).getByText(formatCount('fa-IR', args.value))).toBeInTheDocument()
  },
}

export const InEnglish: Story = {
  args: { label: EN.statsLabels.applied },
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Latin digits, and the dot, the label and the number at the left.
    await isTheFiles(cardOf(canvasElement, args.label), args, 'en-US', semantic, status)
  },
}

export const Dark: Story = {
  args: { status: 'interview', label: FA.statsLabels.interview },
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(cardOf(canvasElement, args.label), args, 'fa-IR', darkSemantic, darkStatus)
  },
}
