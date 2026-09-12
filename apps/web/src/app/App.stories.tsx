import type { StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { AuthProvider, sessionFor } from '../core/auth'
import { addressOf } from './routes'
import { fixtures } from '../shared/story-fixtures'
import { STORAGE_KEY } from '../core/preferences'
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
  decorators: [
    (Story) => (
      // The shell is behind signing in, KN-046, and these stories are about the
      // shell: a reader with a name is seeded so they are the page they draw.
      <AuthProvider initial={sessionFor('09120000000', SINCE, fixtures('fa-IR').contacts[0]?.fullName ?? '')}>
        <Story />
      </AuthProvider>
    ),
  ],
} satisfies StoryMeta<typeof App>

// When the seeded reader signed in. Built rather than written: a date's own
// letters are not copy, and the reader's name is a fixture's, since a person's
// name is data and never translated.
const SINCE = new Date(Date.UTC(2026, 8, 12)).toISOString()

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
    // The page's heading is the Page Header's, the current destination's name,
    // KN-355.
    await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('فرصت‌های شغلی من')
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
    await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('My job opportunities')
    await expect(canvas.getByRole('button', { name: 'My job opportunities' }).getAttribute('aria-current')).toBe(CURRENT)
    await expect(document.documentElement).toHaveAttribute('dir', 'ltr')
  },
}

// A phone's screen, the file's 390 by 844.
const PHONE = { width: 390, height: 844 }

export const LanguageOnAPhone: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    // At a phone's width the sidebar gives way to the tab bar, and the
    // language switch is the Page Header's, DESIGN.md section 5, KN-355:
    // choosing English there turns the page and keeps the choice. The screen
    // is resized by the runner's own browser, which only the runner has,
    // KN-225; the story puts the screen back after. The choice is kept in the
    // story's own localStorage, which the preview gives every story, KN-178.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const { page } = await import('vitest/browser')
    const canvas = within(canvasElement)
    const before = { width: window.innerWidth, height: window.innerHeight }
    try {
      await page.viewport(PHONE.width, PHONE.height)
      await waitFor(() => expect(canvasElement.querySelector('aside')).toBeNull())
      await userEvent.click(canvas.getByRole('button', { name: 'فارسی' }))
      await userEvent.click(await within(canvasElement.ownerDocument.body).findByRole('menuitem', { name: 'English' }))
      await waitFor(() => expect(window.document.documentElement).toHaveAttribute('dir', 'ltr'))
      await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('My job opportunities')
      await expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}')).toMatchObject({ locale: 'en-US' })
    } finally {
      await page.viewport(before.width, before.height)
    }
  },
}

/**
 * The address and the page follow each other.
 *
 * The navigation writes the hash, and a hash written by anything else — the
 * back button, a typed address, a shared link — is read back into the page.
 * Hash routing rather than paths because GitHub Pages cannot rewrite a deep
 * link to the app's one file, KN-045.
 */
export const Navigating: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(canvasElement.ownerDocument.body)
    // The runner's own page carries the hash, so it is put back after.
    const before = window.location.hash
    try {
      // Going to another page writes the address.
      await userEvent.click(canvas.getByRole('button', { name: 'شبکه من' }))
      await waitFor(async () => {
        await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('شبکه من')
      })
      await expect(window.location.hash).toBe(addressOf('network'))

      // And an address written by anything else is read back into the page:
      // the add destination opens the add flow over the board, and closing it
      // puts the address back on the board rather than leaving it asking for a
      // flow that is no longer open, KN-044.
      window.location.hash = addressOf('add')
      const adding = await body.findByRole('dialog')
      await userEvent.click(within(adding).getByRole('button', { name: 'انصراف' }))
      await waitFor(async () => {
        await expect(body.queryByRole('dialog')).toBeNull()
      })
      await expect(window.location.hash).toBe(addressOf('jobs'))
    } finally {
      window.location.hash = before
    }
  },
}

export const NobodySignedIn: Story = {
  globals: { locale: 'fa-IR' },
  decorators: [
    (Story) => (
      // No session seeded and none in this story's own storage, KN-178: what
      // the app draws for somebody who has not signed in, KN-046.
      <AuthProvider>
        <Story />
      </AuthProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    // The shell is not drawn at all: there is no archive to show until
    // somebody has said who they are.
    const canvas = within(canvasElement)
    await expect(canvas.getByLabelText('شماره موبایل')).toBeInTheDocument()
    await expect(canvas.queryByRole('button', { name: 'شبکه من' })).toBeNull()
  },
}
