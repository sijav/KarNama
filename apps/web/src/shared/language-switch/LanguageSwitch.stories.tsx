import type { StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { iconSize, spacing } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { LanguageSwitch } from './LanguageSwitch'

const meta = {
  title: 'Shared/LanguageSwitch',
  component: LanguageSwitch,
  args: { placement: 'sidebar' },
  argTypes: { placement: { control: 'inline-radio', options: ['sidebar', 'header'] } },
} satisfies StoryMeta<typeof LanguageSwitch>

export default meta
type Story = StoryObj<typeof meta>

// The flag in a control, found by what it is rather than by a class name. Which
// flag each language draws is LanguageFlag's to prove; these stories prove the
// switch shows the right language's.
const flagOf = (control: Element) => {
  const flag = control.querySelector('svg')
  if (!flag) throw new Error('this control has no flag')
  return flag
}

// Where a control's written name is drawn: a range over the text itself, so a
// name centred in a wide box does not pass for one at its start.
const nameOf = (control: Element) => {
  const text = document.createTreeWalker(control, NodeFilter.SHOW_TEXT).nextNode()
  if (!text) throw new Error('this control has no written name')
  const range = document.createRange()
  range.selectNodeContents(text)
  return range.getBoundingClientRect()
}

export const Sidebar: Story = {
  // Pinned, because the play function names a language. A story that asserts
  // Persian while the toolbar is set to English fails for a reason that is not
  // a defect, and a red interaction badge nobody can explain is worse than no
  // badge: the next person learns to ignore it.
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button')
    // The button shows the CURRENT language in its own language, which is the
    // one label that must not be translated: a reader who cannot read the
    // current language has to be able to find their own. The flag beside it is
    // decoration, so the name is the language's alone.
    await expect(button).toHaveTextContent('فارسی')
    await expect(button).toHaveAccessibleName('فارسی')
    // Laid out as a Nav Item, KN-479: the flag in the 20 icon column 12 in from
    // the inline start, the right in Persian, and the name 8 after it, where a
    // Nav Item's name starts.
    const row = button.getBoundingClientRect()
    const flag = flagOf(button).getBoundingClientRect()
    await expect(Math.round(row.right - flag.right)).toBe(spacing.sm)
    await expect(flag.width).toBe(iconSize.md)
    await expect(Math.round(flag.left - nameOf(button).right)).toBe(spacing.xs)
  },
}

export const Header: Story = {
  args: { placement: 'header' },
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    // In the Page Header the flag leads the name too, 8 before it.
    const button = within(canvasElement).getByRole('button')
    await expect(button).toHaveAccessibleName('فارسی')
    await expect(Math.round(flagOf(button).getBoundingClientRect().left - nameOf(button).right)).toBe(spacing.xs)
  },
}

export const Open: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button')
    await userEvent.click(button)
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
    // Each language is led by its own flag, the two are different, and the
    // button's is the current language's. Measured by markup, not position,
    // since the menu is still growing in.
    const [persian, english] = items.map((item) => flagOf(item).innerHTML)
    await expect(persian).not.toBe(english)
    await expect(flagOf(button).innerHTML).toBe(persian)
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
    const englishFlag = flagOf(english).innerHTML
    await userEvent.click(english)

    // The whole point of the control. The button now names the language it
    // switched to, with that language's flag, and the document direction
    // followed it, which is the part a locale change is easiest to get wrong.
    await expect(canvas.getByRole('button')).toHaveTextContent('English')
    await expect(flagOf(canvas.getByRole('button')).innerHTML).toBe(englishFlag)
    await expect(document.documentElement).toHaveAttribute('dir', 'ltr')
    await expect(document.documentElement).toHaveAttribute('lang', 'en-US')
  },
}

export const InEnglish: Story = {
  globals: { locale: 'en-US' },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button')
    await expect(button).toHaveTextContent('English')
    await userEvent.click(button)
    // The accessible name of the menu IS translated, unlike the language names
    // inside it, so this is what proves the catalog reached the popover.
    await expect(within(document.body).getByRole('menu')).toHaveAccessibleName('Language')
    // The flag leading the button is English's, the second in the menu.
    const english = (await within(document.body).findAllByRole('menuitem'))[1]
    if (!english) throw new Error('the menu did not render an English option')
    await expect(flagOf(button).innerHTML).toBe(flagOf(english).innerHTML)
  },
}
