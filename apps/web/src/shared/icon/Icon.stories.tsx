import { useLingui } from '@lingui/react'
import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { iconSize, semantic, spacing, type as typeScale } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { ICON_NAMES } from './glyphs'
import { Icon } from './Icon'

const SIZES = Object.keys(iconSize).filter((size): size is keyof typeof iconSize => size in iconSize)
const COLOURS = [...Object.keys(semantic).filter((role): role is keyof typeof semantic => role in semantic), 'inherit'] as const

const meta = {
  title: 'Shared/Icon',
  component: Icon,
  args: { name: 'link', size: 'base', color: 'text/secondary' },
  argTypes: {
    name: { control: 'select', options: ICON_NAMES },
    size: { control: 'select', options: SIZES },
    color: { control: 'select', options: COLOURS },
  },
} satisfies StoryMeta<typeof Icon>

export default meta
type Story = StoryObj<typeof meta>

// A token's colour as the browser computes it, borrowed on the host's own
// inline style and put back in the same tick.
const computedColour = (host: Element, colour: string) => {
  if (!(host instanceof SVGElement || host instanceof HTMLElement)) throw new Error('not a styled element')
  const previous = host.style.color
  host.style.color = colour
  const value = getComputedStyle(host).color
  host.style.color = previous
  return value
}

// An icon's drawn shapes, found by their element type rather than by a
// selector.
const shapesOf = (svg: Element) => [...svg.querySelectorAll('*')].filter((node): node is SVGPathElement => node instanceof SVGPathElement)

// What node 239:44 draws of an icon: the 24 grid at the size asked for, and
// its strokes two pixels with round caps and joins, whatever the size.
const isTheFiles = async (svg: Element, size: number) => {
  await expect(svg.getAttribute('viewBox')).toBe('0 0 24 24')
  const box = svg.getBoundingClientRect()
  await expect([box.width, box.height]).toEqual([size, size])
  for (const shape of shapesOf(svg).filter((node) => node.getAttribute('fill') !== 'currentColor')) {
    const style = getComputedStyle(shape)
    await expect([Number.parseFloat(style.strokeWidth), style.strokeLinecap, style.strokeLinejoin, style.vectorEffect]).toEqual([2, 'round', 'round', 'non-scaling-stroke'])
  }
}

export const Default: Story = {
  globals: { colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const svg = canvasElement.querySelector('svg')
    if (!svg) throw new Error('no icon rendered')
    await isTheFiles(svg, iconSize[args.size ?? 'base'])
    // Decorative unless named, and text/secondary unless told otherwise.
    await expect(svg).toHaveAttribute('aria-hidden', 'true')
    await expect(getComputedStyle(svg).color).toBe(computedColour(svg, semantic['text/secondary']))
  },
}

export const AllIcons: Story = {
  // Every icon at the story's size and colour, so those are the controls.
  parameters: { controls: { include: ['size', 'color'] } },
  render: (args) => (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: `${spacing.md}px` }}>
      {ICON_NAMES.map((name) => (
        <Box key={name} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: `${spacing.xs}px` }}>
          <Icon {...args} name={name} />
          <Box component="span" dir="ltr" sx={(theme) => ({ fontSize: `${typeScale.label.size}px`, lineHeight: `${typeScale.label.lineHeight}px`, color: theme.karnama.semantic['text/secondary'] })}>
            {name}
          </Box>
        </Box>
      ))}
    </Box>
  ),
  play: async ({ args, canvasElement }) => {
    const icons = [...canvasElement.querySelectorAll('svg')]
    await expect(icons).toHaveLength(30)
    for (const svg of icons) {
      await isTheFiles(svg, iconSize[args.size ?? 'base'])
      await expect(shapesOf(svg).length).toBeGreaterThan(0)
    }
    // More is the one the file fills: three dots.
    const [more] = icons.filter((_, index) => ICON_NAMES[index] === 'more')
    await expect(more ? shapesOf(more).filter((node) => node.getAttribute('fill') === 'currentColor').length : 0).toBe(3)
  },
}

export const Sizes: Story = {
  parameters: { controls: { include: ['name', 'color'] } },
  render: (args) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: `${spacing.md}px` }}>
      {SIZES.map((size) => (
        <Icon key={size} {...args} size={size} />
      ))}
    </Box>
  ),
  play: async ({ canvasElement }) => {
    // The token scale, sm 16, md 20 and base 24, and the stroke two at each.
    const icons = [...canvasElement.querySelectorAll('svg')]
    await expect(icons.map((svg) => svg.getBoundingClientRect().width)).toEqual(SIZES.map((size) => iconSize[size]))
    for (const [index, svg] of icons.entries()) {
      const size = SIZES[index]
      if (size) await isTheFiles(svg, iconSize[size])
    }
  },
}

export const Coloured: Story = {
  args: { name: 'check', color: 'text/brand' },
  globals: { colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector('svg')
    if (!svg) throw new Error('no icon rendered')
    // The colour follows the prop, and the strokes follow the colour.
    await expect(getComputedStyle(svg).color).toBe(computedColour(svg, semantic['text/brand']))
    const [shape] = shapesOf(svg)
    if (!shape) throw new Error('the icon draws nothing')
    await expect(getComputedStyle(shape).stroke).toBe(getComputedStyle(svg).color)
  },
}

export const Named: Story = {
  args: { name: 'trash' },
  parameters: { controls: { include: ['name', 'size', 'color'] } },
  render: function Render(args) {
    const { i18n } = useLingui()
    return <Icon {...args} aria-label={i18n._('Delete status')} />
  },
  play: async ({ canvasElement }) => {
    // Given a name, it is an image with that name rather than decoration.
    const svg = within(canvasElement).getByRole('img')
    await expect(svg).not.toHaveAttribute('aria-hidden')
    await expect(svg.getAttribute('aria-label')?.length).toBeGreaterThan(0)
  },
}
