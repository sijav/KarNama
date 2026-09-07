import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
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
} satisfies Meta<typeof App>

export default meta
type Story = StoryObj<typeof meta>

export const Persian: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('کارنما')
    await expect(canvas.getByText('فرصت‌های شغلی من')).toBeVisible()
    await expect(document.documentElement).toHaveAttribute('dir', 'rtl')
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
    await expect(canvas.getByText('My job opportunities')).toBeVisible()
    await expect(document.documentElement).toHaveAttribute('dir', 'ltr')
  },
}
