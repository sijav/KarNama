import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { i18nFor, type Locale } from '../../i18n'
import { spacing } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { ShellControls } from './ShellControls'

const meta = {
  title: 'Shared/ShellControls',
  component: ShellControls,
  args: { placement: 'sidebar', onSignOut: fn() },
  argTypes: { placement: { control: 'inline-radio', options: ['sidebar', 'header'] } },
  // Room above and below, where the language menu opens.
  decorators: [
    (Story) => (
      <Box sx={{ paddingBlock: `${spacing['3xl'] * 2}px` }}>
        <Story />
      </Box>
    ),
  ],
} satisfies StoryMeta<typeof ShellControls>

export default meta
type Story = StoryObj<typeof meta>

// The buttons found by their names in a language, in the row's order: the
// language, settings, and signing out when there is someone to sign out.
const buttonsIn = (canvasElement: HTMLElement, locale: Locale, withSignOut: boolean) => {
  const i18n = i18nFor(locale)
  const names = [i18n._('Language'), i18n._('Settings'), ...(withSignOut ? [i18n._('Sign out')] : [])]
  return names.map((name) => within(canvasElement).getByRole('button', { name }))
}

// One row from the inline start: each an Icon Button, 32 square, on one line,
// 12 apart, in the order given.
const isTheRow = async (buttons: HTMLElement[]) => {
  const rtl = buttons[0] !== undefined && getComputedStyle(buttons[0]).direction === 'rtl'
  const boxes = buttons.map((button) => button.getBoundingClientRect())
  for (const [index, box] of boxes.entries()) {
    await expect([box.width, box.height]).toEqual([spacing.xl, spacing.xl])
    const next = boxes[index + 1]
    if (!next) continue
    await expect(next.top).toBe(box.top)
    await expect(Math.round(rtl ? box.left - next.right : next.left - box.right)).toBe(spacing.sm)
  }
}

export const InTheSidebar: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ args, canvasElement }) => {
    const buttons = buttonsIn(canvasElement, 'fa-IR', true)
    await isTheRow(buttons)
    // Each tip says what the name does not, so a screen reader hears the name
    // and then something more, never the name twice.
    const [, settings, signOut] = buttons
    const i18n = i18nFor('fa-IR')
    await expect(settings).toHaveAccessibleDescription(i18n._('Language, theme and sample data'))
    await expect(signOut).toHaveAccessibleDescription(i18n._('Signs you out of your account on this device'))
    await userEvent.click(signOut ?? canvasElement)
    await expect(args.onSignOut).toHaveBeenCalledTimes(1)
  },
}

export const InTheHeader: Story = {
  args: { placement: 'header' },
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    await isTheRow(buttonsIn(canvasElement, 'fa-IR', true))
  },
}

export const WithoutSigningOut: Story = {
  globals: { locale: 'fa-IR' },
  // Nobody to sign out: the prop is left out.
  render: (args) => <ShellControls placement={args.placement} />,
  play: async ({ canvasElement }) => {
    await isTheRow(buttonsIn(canvasElement, 'fa-IR', false))
    await expect(within(canvasElement).queryByRole('button', { name: i18nFor('fa-IR')._('Sign out') })).toBeNull()
  },
}

export const InEnglish: Story = {
  globals: { locale: 'en-US' },
  play: async ({ canvasElement }) => {
    const buttons = buttonsIn(canvasElement, 'en-US', true)
    await isTheRow(buttons)
    // Left to right, the language button is the leftmost.
    const [language, , signOut] = buttons
    await expect(language?.getBoundingClientRect().left).toBeLessThan(signOut?.getBoundingClientRect().left ?? 0)
  },
}
