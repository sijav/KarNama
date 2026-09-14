import type { StoryObj } from '@storybook/react-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { i18nFor, type Locale } from '../../i18n'
import { spacing } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { SettingsControl } from './SettingsControl'

// No `component`: the control takes no props, so react-docgen reports nothing
// for it and there is no Controls table to key off one, as the network page's
// stories say of theirs. It reads the preferences and the records the
// providers every story renders already hold.
const meta = {
  title: 'Shared/SettingsControl',
  render: () => <SettingsControl />,
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
