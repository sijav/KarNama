import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import type { StoryMeta } from '../story-docs/story-meta'
import { FilterChip } from './FilterChip'

const meta = {
  title: 'Shared/FilterChip',
  component: FilterChip,
  args: { label: 'مصاحبه', count: 3, selected: false, onToggle: fn() },
  argTypes: {
    selected: { control: 'boolean' },
    count: { control: 'number' },
  },
} satisfies StoryMeta<typeof FilterChip>

export default meta
type Story = StoryObj<typeof meta>

// The file's geometry in every state, 159:63 to 159:69: the text 12 from both
// sides of a chip 32 tall, and no border of the chip's own, its edge drawn
// inside on its ::before, KN-282. The label is the chip's one element, a flex
// item, so its box is where the text is laid out; the gaps are rounded to a
// hundredth, since the text's width is not a whole pixel.
const isTheFiles = async (canvasElement: HTMLElement) => {
  const chip = within(canvasElement).getByRole('button')
  const text = chip.firstElementChild
  if (!text) throw new Error('the chip has no label box')
  const outer = chip.getBoundingClientRect()
  const inner = text.getBoundingClientRect()
  await expect([inner.left - outer.left, outer.right - inner.right].map((gap) => Math.round(gap * 100) / 100)).toEqual([12, 12])
  await expect(outer.height).toBe(32)
  const own = getComputedStyle(chip)
  await expect([own.borderTopWidth, own.borderRightWidth, own.borderBottomWidth, own.borderLeftWidth].map(Number.parseFloat)).toEqual([0, 0, 0, 0])
  return getComputedStyle(chip, '::before')
}

export const Default: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    const chip = within(canvasElement).getByRole('button')
    // The count is in the reader's own digits, which is the whole reason it
    // goes through i18n.number rather than into the string raw.
    await expect(chip).toHaveTextContent('مصاحبه (۳)')
    await expect(chip).toHaveAttribute('aria-pressed', 'false')
    // Node 159:63: a one pixel edge, inside, and the text 12 from each side.
    const edge = await isTheFiles(canvasElement)
    await expect([edge.borderTopStyle, Number.parseFloat(edge.borderTopWidth)]).toEqual(['solid', 1])
  },
}

export const Selected: Story = {
  args: { selected: true },
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    // Announced, not only shown. A colour change alone tells a screen reader
    // nothing, and this chip IS the filter state.
    await expect(within(canvasElement).getByRole('button')).toHaveAttribute('aria-pressed', 'true')
    // Node 159:69 draws no stroke, until KN-279's blue edge, and the text
    // still sits 12 from each side.
    const edge = await isTheFiles(canvasElement)
    await expect(edge.borderTopStyle).toBe('none')
  },
}

export const InEnglish: Story = {
  globals: { locale: 'en-US' },
  play: async ({ canvasElement }) => {
    // Same component, Latin digits. The label is record data and arrives as
    // whatever the user named the status, so it does not translate.
    await expect(within(canvasElement).getByRole('button')).toHaveTextContent('مصاحبه (3)')
    // And the same 12 either side, the direction turned.
    await isTheFiles(canvasElement)
  },
}

export const Counting: Story = {
  args: { count: 1234 },
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    // Grouping is locale business too, not just the digits.
    await expect(within(canvasElement).getByRole('button')).toHaveTextContent('۱٬۲۳۴')
  },
}

export const Toggling: Story = {
  play: async ({ args, canvasElement }) => {
    const chip = within(canvasElement).getByRole('button')
    await userEvent.click(chip)
    // Reports the state it is moving TO, so a caller never has to invert it.
    await expect(args.onToggle).toHaveBeenCalledWith(true)
  },
}

export const KeyboardOnly: Story = {
  play: async ({ args, canvasElement }) => {
    const chip = within(canvasElement).getByRole('button')
    // Selecting AND deselecting, both by keyboard, with no pointer anywhere.
    // A filter you can turn on but not off is a trap.
    await userEvent.tab()
    await expect(chip).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await expect(args.onToggle).toHaveBeenLastCalledWith(true)
    await userEvent.keyboard(' ')
    await expect(args.onToggle).toHaveBeenLastCalledWith(true)
    await expect(args.onToggle).toHaveBeenCalledTimes(2)
  },
}
