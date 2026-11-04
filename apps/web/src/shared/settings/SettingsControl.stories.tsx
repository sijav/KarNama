import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { i18nFor, type Locale } from '../../i18n'
import { spacing } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { SettingsControl } from './SettingsControl'

// It reads the preferences and the records the providers every story renders
// already hold; its one prop is the way to sign out a phone's header gives it,
// KN-850.
const meta = {
  title: 'Shared/SettingsControl',
  component: SettingsControl,
  args: { onSignOut: fn() },
  render: (args) => <SettingsControl {...args} />,
} satisfies StoryMeta<typeof SettingsControl>

export default meta
type Story = StoryObj<typeof meta>

// An Icon Button, 32 square, named «تنظیمات» and described by what the dialog
// holds, which opens the Settings dialog and takes focus back when it closes.
const opensSettings = async (canvasElement: HTMLElement, locale: Locale) => {
  const i18n = i18nFor(locale)
  const body = within(canvasElement.ownerDocument.body)
  const button = within(canvasElement).getByRole('button', { name: i18n._('Settings') })
  const box = button.getBoundingClientRect()
  await expect([box.width, box.height]).toEqual([spacing.xl, spacing.xl])
  await expect(button).toHaveAccessibleDescription(i18n._('Language, theme and sample data'))
  await expect(button).toHaveAttribute('aria-haspopup', 'dialog')
  await userEvent.click(button)
  const dialog = within(await body.findByRole('dialog'))
  await expect(dialog.getByRole('combobox', { name: i18n._('Language') })).toBeInTheDocument()
  await userEvent.click(dialog.getByRole('button', { name: i18n._('Done') }))
  await waitFor(() => expect(body.queryByRole('dialog')).toBeNull())
  await waitFor(() => expect(button).toHaveFocus())
}

export const Default: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    await opensSettings(canvasElement, 'fa-IR')
  },
}

export const InEnglish: Story = {
  globals: { locale: 'en-US' },
  play: async ({ canvasElement }) => {
    await opensSettings(canvasElement, 'en-US')
  },
}

export const SigningOut: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ args, canvasElement }) => {
    // Given a way to sign out, the dialog carries it, and pressing it closes the
    // dialog and signs out, as a phone's header gear does, KN-850.
    const i18n = i18nFor('fa-IR')
    const body = within(canvasElement.ownerDocument.body)
    await userEvent.click(within(canvasElement).getByRole('button', { name: i18n._('Settings') }))
    const dialog = within(await body.findByRole('dialog'))
    await userEvent.click(dialog.getByRole('button', { name: i18n._('Sign out') }))
    await expect(args.onSignOut).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(body.queryByRole('dialog')).toBeNull())
  },
}

export const WithoutSigningOut: Story = {
  globals: { locale: 'fa-IR' },
  // The sidebar's gear, whose row signs out with a button of its own.
  render: ({ onSignOut: _ownButton, ...args }) => <SettingsControl {...args} />,
  play: async ({ canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    const body = within(canvasElement.ownerDocument.body)
    await userEvent.click(within(canvasElement).getByRole('button', { name: i18n._('Settings') }))
    const dialog = within(await body.findByRole('dialog'))
    await expect(dialog.queryByRole('button', { name: i18n._('Sign out') })).toBeNull()
    await userEvent.click(dialog.getByRole('button', { name: i18n._('Done') }))
  },
}
