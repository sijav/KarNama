import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, waitFor, within } from 'storybook/test'
import type { StoryMeta } from '../story-docs/story-meta'
import { Navigation } from './Navigation'

const meta = {
  title: 'Shared/Navigation',
  component: Navigation,
  args: { current: 'jobs', userName: 'مهدی رضایی', userPhone: '09123456789', onNavigate: fn(), onSignOut: fn() },
  parameters: { controls: { include: ['current'] }, layout: 'fullscreen' },
} satisfies StoryMeta<typeof Navigation>

export default meta
type Story = StoryObj<typeof meta>

// The two widths the file draws.
const PHONE = { width: 390, height: 844 }
const DESKTOP = { width: 1440, height: 900 }

// At the width of whatever shows it: the sidebar on a desktop's, the tab bar on
// a phone's.
export const Default: Story = {
  globals: { locale: 'fa-IR' },
}

export const Breakpoint: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    // Below md, 900, the tab bar, pinned to the foot of the screen; from md up
    // the sidebar, the screen's height, at its right in Persian. The screen is
    // resized by the runner's own browser, which only the runner has, KN-225.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const { page } = await import('vitest/browser')
    const before = { width: window.innerWidth, height: window.innerHeight }
    try {
      await page.viewport(PHONE.width, PHONE.height)
      await waitFor(() => expect(canvasElement.querySelector('aside')).toBeNull())
      const bar = within(canvasElement).getByRole('navigation', { name: 'فضای کار' })
      await expect(Math.round(window.innerHeight - bar.getBoundingClientRect().bottom)).toBe(0)
      await page.viewport(DESKTOP.width, DESKTOP.height)
      await waitFor(() => expect(canvasElement.querySelector('aside')).not.toBeNull())
      const aside = canvasElement.querySelector('aside')
      if (!aside) throw new Error('no sidebar')
      await expect(Math.round(aside.getBoundingClientRect().height)).toBe(window.innerHeight)
      await expect(within(canvasElement).getAllByRole('navigation')).toHaveLength(1)
    } finally {
      await page.viewport(before.width, before.height)
    }
  },
}
