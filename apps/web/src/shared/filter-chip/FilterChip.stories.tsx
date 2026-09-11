import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { contrast } from '../../theme/darkMode'
import { spacing } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { statusName } from '../story-fixtures'
import { FilterChip } from './FilterChip'

const px = (value: string) => Number.parseFloat(value) || 0

// A computed rgb() colour as the hex the WCAG contrast formula takes.
const hexOf = (rgb: string) => {
  const channels = rgb.match(/\d+/g)?.slice(0, 3) ?? []
  if (channels.length !== 3) throw new Error(`not an rgb colour: ${rgb}`)
  return `#${channels.map((channel) => Number(channel).toString(16).padStart(2, '0')).join('')}`
}

// A box in the viewport, by its four edges.
interface Extent {
  left: number
  top: number
  right: number
  bottom: number
}

const edges = (box: Extent) => [box.left, box.top, box.right, box.bottom].map((edge) => Math.round(edge * 100) / 100)

// How far past its own box a style paints: its outline, and any shadow cast
// outside it, the largest of its offset, blur and spread. An inset shadow
// paints inside, so it does not count.
const reach = (style: CSSStyleDeclaration) => {
  const outline = style.outlineStyle === 'none' ? 0 : px(style.outlineWidth) + px(style.outlineOffset)
  const shadows = style.boxShadow === 'none' ? [] : style.boxShadow.split(/,(?![^(]*\))/).filter((shadow) => !/\binset\b/.test(shadow))
  const cast = shadows.map((shadow) => {
    const [x = 0, y = 0, blur = 0, spread = 0] = (shadow.replace(/rgba?\([^)]*\)/, '').match(/-?[\d.]+(?=px)/g) ?? []).map(Number)
    return Math.max(Math.abs(x), Math.abs(y)) + blur + spread
  })
  return Math.max(0, outline, ...cast)
}

// Everything the chip's focus can paint, as one box: the chip's own box,
// grown by what it paints past itself, and the boxes of its two
// pseudo-elements, the edge and the ring, grown the same way. Filters and
// transforms, which nothing in the chip uses, are not read.
const focusExtent = (chip: HTMLElement): Extent => {
  const box = chip.getBoundingClientRect()
  const grow = reach(getComputedStyle(chip))
  const extent = { left: box.left - grow, top: box.top - grow, right: box.right + grow, bottom: box.bottom + grow }
  for (const style of [getComputedStyle(chip, '::before'), getComputedStyle(chip, '::after')]) {
    if (style.content === 'none') continue
    const out = reach(style)
    extent.left = Math.min(extent.left, box.left + px(style.left) - out)
    extent.top = Math.min(extent.top, box.top + px(style.top) - out)
    extent.right = Math.max(extent.right, box.right - px(style.right) + out)
    extent.bottom = Math.max(extent.bottom, box.bottom - px(style.bottom) + out)
  }
  return extent
}

// Every ancestor that clips what overflows it, on either axis.
const clippingAncestors = (element: HTMLElement) => {
  const found: HTMLElement[] = []
  for (let node = element.parentElement; node; node = node.parentElement) {
    const style = getComputedStyle(node)
    if (style.overflowX !== 'visible' || style.overflowY !== 'visible') found.push(node)
  }
  return found
}

// Where an ancestor clips: its padding box, inside its borders. A scrollbar
// and a rounded clip are not modelled; the hosts here are square and hidden,
// and the verifier's screenshots are the rendered proof.
const clipEdge = (node: HTMLElement): Extent => {
  const box = node.getBoundingClientRect()
  const style = getComputedStyle(node)
  return { left: box.left + px(style.borderLeftWidth), top: box.top + px(style.borderTopWidth), right: box.right - px(style.borderRightWidth), bottom: box.bottom - px(style.borderBottomWidth) }
}

// How far an extent passes each side of a box: only the sides it passes, so
// an extent inside the box gives none, and a failure names the side.
const overshoot = (inner: Extent, outer: Extent) =>
  Object.entries({ left: outer.left - inner.left, top: outer.top - inner.top, right: inner.right - outer.right, bottom: inner.bottom - outer.bottom }).filter(([, by]) => by > 0)

// The area of a w by h box whose four corners are rounded to r.
const rounded = (w: number, h: number, r: number) => w * h - (4 - Math.PI) * r * r

const meta = {
  title: 'Shared/FilterChip',
  component: FilterChip,
  args: { label: statusName('fa-IR', 'interview'), count: 3, selected: false, onToggle: fn() },
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
    await expect(chip).toHaveTextContent(`${statusName('fa-IR', 'interview')} (۳)`)
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
    await expect(within(canvasElement).getByRole('button')).toHaveTextContent(`${statusName('fa-IR', 'interview')} (3)`)
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

export const FocusedInAClippingHost: Story = {
  // Two chips, not selected and selected, each in its own host. Both take the
  // story's label and count, which change the width the ring has to cover, so
  // those are the controls; `selected` is set on each, KN-294.
  parameters: { controls: { include: ['label', 'count'] } },
  render: (args) => (
    // Each host clips what overflows it, with no padding and no border, sized
    // to its chip: the file's Chips row, which clips at the chips' top and
    // bottom, or a row that scrolls sideways, KN-294.
    <Box sx={{ display: 'flex', gap: `${spacing.md}px` }}>
      <Box data-testid="unselected-host" sx={{ display: 'inline-flex', overflow: 'hidden' }}>
        <FilterChip {...args} selected={false} />
      </Box>
      <Box data-testid="selected-host" sx={{ display: 'inline-flex', overflow: 'hidden' }}>
        <FilterChip {...args} selected />
      </Box>
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const hosts = [within(canvasElement).getByTestId('unselected-host'), within(canvasElement).getByTestId('selected-host')]
    for (const host of hosts) {
      const chip = within(host).getByRole('button')
      // Flush: the host clips on both axes, has no padding and no border, and
      // its box is the chip's, so it clips at the chip's own edge.
      const surface = getComputedStyle(host)
      await expect([surface.overflowX, surface.overflowY]).toEqual(['hidden', 'hidden'])
      const inset = [surface.paddingTop, surface.paddingRight, surface.paddingBottom, surface.paddingLeft, surface.borderTopWidth, surface.borderRightWidth, surface.borderBottomWidth, surface.borderLeftWidth]
      await expect(inset.map(px)).toEqual([0, 0, 0, 0, 0, 0, 0, 0])
      await expect(edges(host.getBoundingClientRect())).toEqual(edges(chip.getBoundingClientRect()))

      await userEvent.tab()
      await expect(chip).toHaveFocus()
      // The state measured is the focused one. Whether a dispatched Tab
      // matches :focus-visible depends on the page's earlier input, so it is
      // asserted rather than assumed; the verifier presses a real Tab.
      await expect(chip.matches(':focus-visible')).toBe(true)

      // Everything the focus can paint lies inside every ancestor that clips,
      // the host among them. A ring round the chip passes the host by four on
      // every side, KN-294.
      const extent = focusExtent(chip)
      const clips = clippingAncestors(chip)
      await expect(clips).toContain(host)
      for (const clip of clips) await expect(overshoot(extent, clipEdge(clip))).toEqual([])

      // The ring: solid, at least two wide, at 3:1 or more on the chip's own
      // fill, which is what it is drawn over.
      const ring = getComputedStyle(chip, '::after')
      const [from, width] = [px(ring.top), px(ring.borderTopWidth)]
      await expect(ring.borderTopStyle).toBe('solid')
      await expect(width).toBeGreaterThanOrEqual(2)
      await expect(contrast(hexOf(ring.borderTopColor), hexOf(getComputedStyle(chip).backgroundColor))).toBeGreaterThanOrEqual(3)

      // And its band covers WCAG 2.4.13's two-pixel perimeter of the chip as
      // it is seen, for a rounded one 4W + 4H - (16 - 4π)r: the pill from the
      // ring's inset to its inset plus its width, its ends concentric.
      const { width: w, height: h } = chip.getBoundingClientRect()
      const r = Math.min(px(getComputedStyle(chip).borderTopLeftRadius), h / 2)
      const band = rounded(w - 2 * from, h - 2 * from, r - from) - rounded(w - 2 * (from + width), h - 2 * (from + width), r - from - width)
      await expect(band - (4 * w + 4 * h - (16 - 4 * Math.PI) * r)).toBeGreaterThanOrEqual(0)
    }
  },
}
