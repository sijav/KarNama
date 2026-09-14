import type { StoryObj } from '@storybook/react-vite'
import { IR, US } from 'country-flag-icons/react/3x2'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { expect, within } from 'storybook/test'
import { localeOrder, locales } from '../../i18n'
import { iconSize, radius, semantic } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { LanguageFlag } from './LanguageFlag'

const meta = {
  title: 'Shared/LanguageFlag',
  component: LanguageFlag,
  args: { locale: 'fa-IR' },
  argTypes: { locale: { control: 'inline-radio', options: localeOrder } },
} satisfies StoryMeta<typeof LanguageFlag>

export default meta
type Story = StoryObj<typeof meta>

// What the package's own component draws, rendered apart from the canvas, so a
// story can say which flag is on screen without naming the flag's colours.
const drawnBy = (Flag: typeof IR) => {
  const host = document.createElement('div')
  const root = createRoot(host)
  flushSync(() => {
    root.render(<Flag />)
  })
  const markup = host.querySelector('svg')?.innerHTML
  root.unmount()
  return markup
}

// A token's colour as the browser computes it, borrowed on the host's own
// inline style and put back in the same tick. Never inside waitFor, KN-014.
const computed = (host: HTMLElement, value: string) => {
  const previous = host.style.borderLeftColor
  host.style.borderLeftColor = value
  const result = getComputedStyle(host).borderLeftColor
  host.style.borderLeftColor = previous
  return result
}

// The flag's drawing and the box that holds it.
const flagIn = (canvasElement: HTMLElement) => {
  const svg = canvasElement.querySelector('svg')
  const host = svg?.parentElement
  if (!svg || !host) throw new Error('no flag rendered')
  return { svg, host }
}

export const Persian: Story = {
  globals: { colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const { svg, host } = flagIn(canvasElement)
    // Iran's flag, as the package draws it, three by two across the 20 column.
    await expect(svg.innerHTML).toBe(drawnBy(IR))
    const box = host.getBoundingClientRect()
    await expect(box.width).toBe(iconSize.md)
    await expect(box.height).toBeCloseTo((iconSize.md * 2) / 3, 1)
    await expect(svg.getBoundingClientRect().width).toBe(iconSize.md)
    // Rounded at radius sm and ringed by one pixel of border/default, drawn over
    // the flag's own edge so a white edge still shows on a white surface.
    await expect(Number.parseFloat(getComputedStyle(host).borderTopLeftRadius)).toBe(radius.sm)
    const ring = getComputedStyle(host, '::after')
    await expect([Number.parseFloat(ring.borderTopWidth), ring.borderTopStyle, ring.position]).toEqual([1, 'solid', 'absolute'])
    await expect(ring.borderTopColor).toBe(computed(host, semantic['border/default']))
    // Decorative: hidden from screen readers, and no title for one to read.
    await expect(host).toHaveAttribute('aria-hidden', 'true')
    await expect(svg.querySelector('title')).toBeNull()
  },
}

export const English: Story = {
  args: { locale: 'en-US' },
  play: async ({ canvasElement }) => {
    const { svg, host } = flagIn(canvasElement)
    // The United States' flag, the owner's choice for English.
    await expect(svg.innerHTML).toBe(drawnBy(US))
    await expect(host).toHaveAttribute('aria-hidden', 'true')
  },
}

export const Named: Story = {
  args: { locale: 'en-US', 'aria-label': locales['en-US'] },
  play: async ({ canvasElement }) => {
    // Given a name, the flag is an image with that name, for a control made of
    // the flag alone. The name is said once, from the label, not again from a
    // title inside the drawing.
    const image = within(canvasElement).getByRole('img', { name: locales['en-US'] })
    await expect(image).not.toHaveAttribute('aria-hidden')
    await expect(image.querySelector('title')).toBeNull()
  },
}
