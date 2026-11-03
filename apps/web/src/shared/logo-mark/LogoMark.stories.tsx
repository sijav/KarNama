import { useLingui } from '@lingui/react'
import type { StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { darkSemantic } from '../../theme/darkMode'
import { semantic } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { LogoMark, SHAPES } from './LogoMark'

const meta = {
  title: 'Shared/LogoMark',
  component: LogoMark,
  // Its one prop is the name a caller gives it, which Named sets from the
  // catalog; every play measures the drawing, which no control changes.
  parameters: { controls: { disable: true } },
} satisfies StoryMeta<typeof LogoMark>

export default meta
type Story = StoryObj<typeof meta>


// A token's colour as the browser computes it, borrowed on the host's own
// inline style and put back in the same tick.
const computed = (host: SVGElement, value: string) => {
  const previous = host.style.color
  host.style.color = value
  const result = getComputedStyle(host).color
  host.style.color = previous
  return result
}

const markIn = (canvasElement: HTMLElement) => {
  const mark = canvasElement.querySelector('svg')
  if (!mark) throw new Error('no mark was drawn')
  return mark
}

// What node 576:7665 draws: the 32 square, the asset's three shapes in its
// order, which mark.test.ts holds to the asset itself, and each in the colour
// its token takes in the scheme the story pins.
const isTheFiles = async (mark: SVGSVGElement, palette: Record<(typeof SHAPES)[number]['fill'], string>) => {
  await expect(mark.getAttribute('viewBox')).toBe('0 0 32 32')
  const box = mark.getBoundingClientRect()
  await expect([box.width, box.height]).toEqual([32, 32])
  const shapes = [...mark.querySelectorAll('path')]
  await expect(shapes.map((shape) => shape.getAttribute('d'))).toEqual(SHAPES.map((shape) => shape.d))
  for (const [index, shape] of shapes.entries()) {
    const expected = SHAPES[index]
    if (!expected) throw new Error('a shape the asset does not have')
    await expect(getComputedStyle(shape).fill).toBe(computed(mark, palette[expected.fill]))
  }
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const mark = markIn(canvasElement)
    await isTheFiles(mark, semantic)
    await expect(mark.getAttribute('aria-hidden')).toBe('true')
  },
}

export const InEnglish: Story = {
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const mark = markIn(canvasElement)
    await isTheFiles(mark, semantic)
    // A mark has no direction: the capsule stays on the left in either language.
    const [stem] = [...mark.querySelectorAll('path')]
    if (!stem) throw new Error('no capsule')
    await expect(Math.round(stem.getBoundingClientRect().left - mark.getBoundingClientRect().left)).toBe(0)
  },
}

export const Dark: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ canvasElement }) => {
    await isTheFiles(markIn(canvasElement), darkSemantic)
  },
}

export const Named: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  render: function Render() {
    const { i18n } = useLingui()
    return <LogoMark aria-label={i18n._('KarNama')} />
  },
  play: async ({ canvasElement }) => {
    const mark = within(canvasElement).getByRole('img')
    await expect(mark.getAttribute('aria-label')?.length).toBeGreaterThan(0)
    await expect(mark.getAttribute('aria-hidden')).toBeNull()
  },
}
