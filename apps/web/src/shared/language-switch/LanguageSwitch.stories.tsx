import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { i18nFor, localeOrder, locales, type Locale } from '../../i18n'
import { iconSize, spacing } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { LanguageSwitch } from './LanguageSwitch'

// Room on the side the menu opens to, since a menu at the viewport's edge is
// clamped 16 from it: from the sidebar it opens above the button and runs to
// the inline end, so the button sits at the start; from the header it opens
// below and runs back to the start, so the button sits at the end.
const ROOM = spacing['3xl'] * 2

const meta = {
  title: 'Shared/LanguageSwitch',
  component: LanguageSwitch,
  args: { placement: 'sidebar' },
  argTypes: { placement: { control: 'inline-radio', options: ['sidebar', 'header'] } },
  decorators: [
    (Story, { args }) => (
      <Box sx={{ display: 'flex', justifyContent: args.placement === 'header' ? 'flex-end' : 'flex-start', padding: `${ROOM}px` }}>
        <Story />
      </Box>
    ),
  ],
} satisfies StoryMeta<typeof LanguageSwitch>

export default meta
type Story = StoryObj<typeof meta>

// The flag in a control, found by what it is rather than by a class name.
const flagOf = (control: Element) => {
  const flag = control.querySelector('svg')
  if (!flag) throw new Error('this control has no flag')
  return flag
}

// The switch's button, by its name in a language.
const buttonOf = (canvasElement: HTMLElement, locale: Locale) =>
  within(canvasElement).getByRole('button', { name: i18nFor(locale)._('Language') })

// Where the open menu sits against its button: 4 above or below it, and flush
// with the side it hangs from, the right or the left as the direction makes it.
const opensFrom = async (button: HTMLElement, panel: HTMLElement, { above, side }: { above: boolean; side: 'start' | 'end' }) => {
  const [anchor, menu] = [button.getBoundingClientRect(), panel.getBoundingClientRect()]
  await expect(Math.round(above ? anchor.top - menu.bottom : menu.top - anchor.bottom)).toBe(spacing['2xs'])
  const rtl = getComputedStyle(button).direction === 'rtl'
  if ((side === 'start') === rtl) await expect(Math.round(menu.right)).toBe(Math.round(anchor.right))
  else await expect(Math.round(menu.left)).toBe(Math.round(anchor.left))
}

// Opens the menu in a language and checks it: both languages naming themselves
// in their own language beside a flag each, the two flags different, the
// button's the current language's, the menu named in the reader's language,
// and the panel clear of the button on the side it opens to.
const menuOpens =
  (locale: Locale, where: { above: boolean; side: 'start' | 'end' }): NonNullable<Story['play']> =>
  async ({ canvasElement }) => {
    const i18n = i18nFor(locale)
    const button = buttonOf(canvasElement, locale)
    await userEvent.click(button)
    const menu = await within(canvasElement.ownerDocument.body).findByRole('menu')
    const panel = menu.parentElement
    if (!panel) throw new Error('the menu has no panel')
    const items = within(menu).getAllByRole('menuitem')
    await expect(items.map((item) => item.textContent)).toEqual(localeOrder.map((value) => locales[value]))
    const flags = items.map((item) => flagOf(item).innerHTML)
    await expect(new Set(flags).size).toBe(localeOrder.length)
    await expect(flagOf(button).innerHTML).toBe(flags[localeOrder.indexOf(locale)])
    await expect(menu).toHaveAccessibleName(i18n._('Language'))
    await opensFrom(button, panel, where)
    await userEvent.keyboard('{Escape}')
  }

export const Sidebar: Story = {
  // Pinned, because the play function names a language. A story that asserts
  // Persian while the toolbar is set to English fails for a reason that is not
  // a defect.
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    // An Icon Button, 32 square, its icon the current language's 20 wide flag,
    // named «زبان» and described by the language's own name, which is its tip.
    const button = buttonOf(canvasElement, 'fa-IR')
    const box = button.getBoundingClientRect()
    await expect([box.width, box.height]).toEqual([spacing.xl, spacing.xl])
    await expect(flagOf(button).getBoundingClientRect().width).toBe(iconSize.md)
    await expect(button).toHaveAccessibleDescription(locales['fa-IR'])
    await expect(button).toHaveAttribute('aria-haspopup', 'menu')
  },
}

export const Header: Story = {
  args: { placement: 'header' },
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    const box = buttonOf(canvasElement, 'fa-IR').getBoundingClientRect()
    await expect([box.width, box.height]).toEqual([spacing.xl, spacing.xl])
  },
}

export const Open: Story = {
  globals: { locale: 'fa-IR' },
  play: menuOpens('fa-IR', { above: true, side: 'start' }),
}

export const OpenInEnglish: Story = {
  globals: { locale: 'en-US' },
  play: menuOpens('en-US', { above: true, side: 'start' }),
}

export const OpenInTheHeader: Story = {
  args: { placement: 'header' },
  globals: { locale: 'fa-IR' },
  play: menuOpens('fa-IR', { above: false, side: 'end' }),
}

export const OpenInTheHeaderInEnglish: Story = {
  args: { placement: 'header' },
  globals: { locale: 'en-US' },
  play: menuOpens('en-US', { above: false, side: 'end' }),
}

export const Switching: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    await userEvent.click(buttonOf(canvasElement, 'fa-IR'))
    const english = (await within(canvasElement.ownerDocument.body).findAllByRole('menuitem'))[localeOrder.indexOf('en-US')]
    if (!english) throw new Error('the menu did not render an English option')
    const englishFlag = flagOf(english).innerHTML
    await userEvent.click(english)

    // The whole point of the control: the button is named in English now, shows
    // English's flag and is described by English's name, and the document's
    // direction and language followed it.
    const button = await within(canvasElement).findByRole('button', { name: i18nFor('en-US')._('Language') })
    await expect(button).toHaveAccessibleDescription(locales['en-US'])
    await expect(flagOf(button).innerHTML).toBe(englishFlag)
    await expect(document.documentElement).toHaveAttribute('dir', 'ltr')
    await expect(document.documentElement).toHaveAttribute('lang', 'en-US')
  },
}
