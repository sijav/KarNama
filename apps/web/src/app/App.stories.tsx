import type { StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { CURRENT } from '../shared/navigation'
import type { StoryMeta } from '../shared/story-docs/story-meta'
import { App } from './App'

/**
 * The shell, in both languages.
 *
 * Two stories rather than one because the done gate asks for every change to be
 * seen in Persian and in English: English strings are longer and the direction
 * flips, so a layout defect hides in exactly one of them. Setting the global
 * here rather than only in the toolbar means the browser test project checks
 * both on every run instead of only whichever the toolbar happened to be on.
 */
const meta = {
  title: 'App/Shell',
  component: App,
  parameters: { layout: 'fullscreen' },
} satisfies StoryMeta<typeof App>

/** Relative luminance of an `rgb(r, g, b)` string, 0 for black and 1 for white. */
const luminanceOf = (colour: string) => {
  const [r = 0, g = 0, b = 0] = [...colour.matchAll(/\d+/g)].map((match) => Number(match[0]) / 255)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export default meta
type Story = StoryObj<typeof meta>

export const Persian: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('کارنما')
    // The navigation is in the shell, the board the current page.
    await expect(canvas.getByRole('button', { name: 'فرصت‌های شغلی من' }).getAttribute('aria-current')).toBe(CURRENT)
    await expect(document.documentElement).toHaveAttribute('dir', 'rtl')
  },
}

export const PersianDark: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ canvasElement }) => {
    // The design has no dark tokens, so this palette is derived. What can be
    // asserted is the direction of the derivation: the page is dark and the
    // text is light, which is the thing that breaks if the flip is dropped.
    const page = getComputedStyle(canvasElement.firstElementChild ?? canvasElement).backgroundColor
    await expect(luminanceOf(page)).toBeLessThan(0.3)
  },
}

export const SystemScheme: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'system' },
  play: async ({ canvasElement }) => {
    // Whatever the runner's OS says, the shell renders and picks one of the two.
    await expect(within(canvasElement).getByRole('heading', { level: 1 })).toBeVisible()
  },
}

export const English: Story = {
  globals: { locale: 'en-US' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // The English catalog is an identity map, so the id IS the rendered text.
    // That is what makes a missing Persian translation render English rather
    // than a key or an empty node.
    await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('KarNama')
    await expect(canvas.getByRole('button', { name: 'My job opportunities' }).getAttribute('aria-current')).toBe(CURRENT)
    await expect(document.documentElement).toHaveAttribute('dir', 'ltr')
  },
}
