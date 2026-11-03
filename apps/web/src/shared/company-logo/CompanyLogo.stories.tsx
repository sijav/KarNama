import type { StoryObj } from '@storybook/react-vite'
import { expect, waitFor } from 'storybook/test'
import { darkSemantic } from '../../theme/darkMode'
import { semantic } from '../../theme/tokens'
import { GLYPHS } from '../icon'
import type { StoryMeta } from '../story-docs/story-meta'
import { CompanyLogo } from './CompanyLogo'
import storyLogo from './story-logo.svg'

// An address that answers with nothing an image can be made of, so the browser
// fails it as it fails a logo that has gone.
const NOT_AN_IMAGE = URL.createObjectURL(new Blob([]))

const meta = {
  title: 'Shared/CompanyLogo',
  component: CompanyLogo,
  // Its one prop is an address, which each story sets; every play measures the
  // drawing.
  parameters: { controls: { disable: true } },
} satisfies StoryMeta<typeof CompanyLogo>

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

// Node 620:3684: the 36 square at radius 8 on bg/surface-secondary, hidden
// from assistive technology, centring the set's building at 18 in
// text/disabled, its stroke the set's two pixels.
const isThePlaceholder = async (canvasElement: HTMLElement, palette: Record<keyof typeof semantic, string>) => {
  await expect(canvasElement.querySelector('img')).toBeNull()
  const icon = canvasElement.querySelector('svg')
  const square = icon?.parentElement
  if (!icon || !square) throw new Error('no placeholder was drawn')
  await expect(square.getAttribute('aria-hidden')).toBe('true')
  const box = square.getBoundingClientRect()
  await expect([box.width, box.height]).toEqual([36, 36])
  const style = getComputedStyle(square)
  await expect(px(style.borderTopLeftRadius)).toBe(8)
  await expect(style.backgroundColor).toBe(computed(square, palette['bg/surface-secondary']))
  const mark = icon.getBoundingClientRect()
  await expect([mark.width, mark.height]).toEqual([18, 18])
  await expect([mark.left - box.left, mark.top - box.top]).toEqual([9, 9])
  const paths = [...icon.querySelectorAll('path')]
  await expect(paths.map((path) => path.getAttribute('d'))).toEqual(GLYPHS.building.stroke)
  const stroke = computed(square, palette['text/disabled'])
  for (const path of paths) {
    const drawn = getComputedStyle(path)
    await expect(drawn.stroke).toBe(stroke)
    await expect(drawn.strokeWidth).toBe('2px')
    await expect(drawn.vectorEffect).toBe('non-scaling-stroke')
  }
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await isThePlaceholder(canvasElement, semantic)
  },
}

export const WithALogo: Story = {
  // A fetched logo, as the six named logos beside 620:3684 draw one: its image
  // covering the same square at the same radius, its alt empty.
  args: { src: storyLogo },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const image = canvasElement.querySelector('img')
    if (!image) throw new Error('no logo was drawn')
    await waitFor(() => expect(image.complete && image.naturalWidth > 0).toBe(true))
    await expect(image.getAttribute('src')).toBe(storyLogo)
    await expect(image.getAttribute('alt')).toBe('')
    const box = image.getBoundingClientRect()
    await expect([box.width, box.height]).toEqual([36, 36])
    const style = getComputedStyle(image)
    await expect(px(style.borderTopLeftRadius)).toBe(8)
    await expect(style.objectFit).toBe('cover')
  },
}

export const BrokenLogo: Story = {
  // A logo that fails to load gives way to the placeholder.
  args: { src: NOT_AN_IMAGE },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(canvasElement.querySelector('img')).toBeNull())
    await isThePlaceholder(canvasElement, semantic)
  },
}

export const InEnglish: Story = {
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await isThePlaceholder(canvasElement, semantic)
  },
}

export const Dark: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ canvasElement }) => {
    await isThePlaceholder(canvasElement, darkSemantic)
  },
}
