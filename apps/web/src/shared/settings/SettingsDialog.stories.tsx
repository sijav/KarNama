import { useLingui } from '@lingui/react'
import type { StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { useArgs } from 'storybook/preview-api'
import { expect, fn, userEvent, within } from 'storybook/test'
import { i18nFor } from '../../i18n'
import { Button } from '../button'
import type { StoryMeta } from '../story-docs/story-meta'
import { SettingsDialog, type SettingsDialogProps } from './SettingsDialog'

const HIDDEN_CONTROLS: (keyof SettingsDialogProps)[] = ['open']

const WithTrigger = ({ args, updateArgs }: { args: SettingsDialogProps; updateArgs: (next: Partial<SettingsDialogProps>) => void }) => {
  const [open, setOpen] = useState(false)
  const { i18n } = useLingui()
  return (
    <>
      <Button
        onClick={() => {
          setOpen(true)
        }}
      >
        {i18n._('Settings')}
      </Button>
      <SettingsDialog
        {...args}
        open={open}
        onClose={() => {
          args.onClose()
          setOpen(false)
        }}
        onLocaleChange={(locale) => {
          args.onLocaleChange(locale)
          updateArgs({ locale })
        }}
        onColorSchemeChange={(colorScheme) => {
          args.onColorSchemeChange(colorScheme)
          updateArgs({ colorScheme })
        }}
        onLoadSamples={() => {
          args.onLoadSamples()
          updateArgs({ loaded: true })
        }}
      />
    </>
  )
}

const meta = {
  title: 'Shared/SettingsDialog',
  component: SettingsDialog,
  args: {
    open: false,
    locale: 'en-US',
    colorScheme: 'light',
    loaded: false,
    onClose: fn(),
    onLocaleChange: fn(),
    onColorSchemeChange: fn(),
    onLoadSamples: fn(),
  },
  parameters: { controls: { exclude: HIDDEN_CONTROLS } },
  render: function Render(args) {
    const [, updateArgs] = useArgs<SettingsDialogProps>()
    return <WithTrigger args={args} updateArgs={updateArgs} />
  },
} satisfies StoryMeta<typeof SettingsDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Preferences: Story = {
  play: async ({ args, canvasElement, globals }) => {
    const i18n = i18nFor(globals.locale === 'en-US' ? 'en-US' : 'fa-IR')
    await userEvent.click(within(canvasElement).getByRole('button', { name: i18n._('Settings') }))
    const dialog = within(await within(canvasElement.ownerDocument.body).findByRole('dialog'))
    await userEvent.click(dialog.getByRole('radio', { name: i18n._('Dark') }))
    await expect(args.onColorSchemeChange).toHaveBeenCalledWith('dark')
    await userEvent.click(dialog.getByRole('button', { name: i18n._('Load sample data') }))
    await expect(args.onLoadSamples).toHaveBeenCalledTimes(1)
    await userEvent.click(dialog.getByRole('button', { name: i18n._('Done') }))
  },
}

export const Loaded: Story = { args: { loaded: true } }
