import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { LanguageSwitch } from './LanguageSwitch'

const meta = {
  title: 'Shared/LanguageSwitch',
  component: LanguageSwitch,
  args: { placement: 'sidebar' },
  argTypes: { placement: { control: 'inline-radio', options: ['sidebar', 'header'] } },
} satisfies Meta<typeof LanguageSwitch>

export default meta
type Story = StoryObj<typeof meta>

export const Sidebar: Story = {
  // Pinned, because the play function names a language. A story that asserts
  // Persian while the toolbar is set to English fails for a reason that is not
  // a defect, and a red interaction badge nobody can explain is worse than no
  // badge: the next person learns to ignore it.
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    // The button shows the CURRENT language in its own language, which is the
    // one label that must not be translated: a reader who cannot read the
    // current language has to be able to find their own.
    await expect(within(canvasElement).getByRole('button')).toHaveTextContent('فارسی')
  },
}

export const Header: Story = { args: { placement: 'header' } }

export const Open: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button'))
    // The menu portals out of the canvas, so it is found on the document, and
    // `find` rather than `get` because MUI transitions it in: asserting on the
    // container immediately catches it mid-animation and calls it invisible.
    // Presence and content rather than visibility: MUI grows the menu in, and
    // `findBy` retries on presence, not on the transition finishing, so a
    // visibility assertion here catches it mid-animation every time.
    const items = await within(document.body).findAllByRole('menuitem')
    await expect(items).toHaveLength(2)
    // Both languages name themselves in their own language, which is the point:
    // a reader who cannot read the current one still finds theirs.
    await expect(items[0]).toHaveTextContent('فارسی')
    await expect(items[1]).toHaveTextContent('English')
    // And the one label that IS translated, which proves the catalog reached
    // the portalled popover rather than only the tree under the provider.
    await expect(items[0]?.closest('[role="menu"]')).toHaveAttribute('aria-label', 'زبان')
  },
}

export const Switching: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('button')).toHaveTextContent('فارسی')

    await userEvent.click(canvas.getByRole('button'))
    const items = await within(document.body).findAllByRole('menuitem')
    const english = items[1]
    if (!english) throw new Error('the menu did not render an English option')
    await userEvent.click(english)

    // The whole point of the control. The button now names the language it
    // switched to, and the document direction followed it, which is the part a
    // locale change is easiest to get wrong.
    await expect(canvas.getByRole('button')).toHaveTextContent('English')
    await expect(document.documentElement).toHaveAttribute('dir', 'ltr')
    await expect(document.documentElement).toHaveAttribute('lang', 'en-US')
  },
}

export const InEnglish: Story = {
  globals: { locale: 'en-US' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button')).toHaveTextContent('English')
    await userEvent.click(within(canvasElement).getByRole('button'))
    // The accessible name of the menu IS translated, unlike the language names
    // inside it, so this is what proves the catalog reached the popover.
    await expect(within(document.body).getByRole('menu')).toHaveAccessibleName('Language')
  },
}
