import { useLingui } from '@lingui/react'
import type { StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { useArgs } from 'storybook/preview-api'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { i18nFor, localeOrder, locales, type Locale } from '../../i18n'
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

// The catalog of the language the toolbar is set to.
const catalogFor = (locale: unknown) => i18nFor(locale === 'en-US' ? 'en-US' : 'fa-IR')

// Opens the dialog from its trigger, and finds the language's Select by its
// label, which is its whole accessible name.
const openSettings = async (canvasElement: HTMLElement, locale: unknown) => {
  const i18n = catalogFor(locale)
  await userEvent.click(within(canvasElement).getByRole('button', { name: i18n._('Settings') }))
  const dialog = within(await within(canvasElement.ownerDocument.body).findByRole('dialog'))
  return { i18n, dialog, language: dialog.getByRole('combobox', { name: i18n._('Language') }) }
}

export const Preferences: Story = {
  play: async ({ args, canvasElement, globals }) => {
    const body = within(canvasElement.ownerDocument.body)
    const { i18n, dialog, language } = await openSettings(canvasElement, globals.locale)
    // The language is a Select, KN-480. Choosing the other language calls
    // onLocaleChange with it, the list closes, portalled outside the dialog as
    // it is, and focus goes back to the field.
    const other: Locale = args.locale === 'en-US' ? 'fa-IR' : 'en-US'
    await userEvent.click(language)
    await userEvent.click(await body.findByRole('option', { name: locales[other] }))
    await expect(args.onLocaleChange).toHaveBeenCalledWith(other)
    await waitFor(() => expect(body.queryByRole('listbox')).toBeNull())
    await waitFor(() => expect(language).toHaveFocus())
    await userEvent.click(dialog.getByRole('radio', { name: i18n._('Dark') }))
    await expect(args.onColorSchemeChange).toHaveBeenCalledWith('dark')
    await userEvent.click(dialog.getByRole('button', { name: i18n._('Load sample data') }))
    await expect(args.onLoadSamples).toHaveBeenCalledTimes(1)
    await userEvent.click(dialog.getByRole('button', { name: i18n._('Done') }))
  },
}

export const Loaded: Story = { args: { loaded: true } }

// What each of the four combinations shows, KN-480: the field holds the current
// language's flag and its own name, and the list both languages, each led by a
// flag of its own, the chosen one's the field's.
const languagesShown: NonNullable<Story['play']> = async ({ args, canvasElement, globals }) => {
  const { language } = await openSettings(canvasElement, globals.locale)
  const flag = language.querySelector('svg')
  if (!flag) throw new Error('the language field shows no flag')
  await expect(language).toHaveTextContent(locales[args.locale])
  await userEvent.click(language)
  const options = await within(canvasElement.ownerDocument.body).findAllByRole('option')
  await expect(options.map((option) => option.textContent)).toEqual(localeOrder.map((value) => locales[value]))
  const flags = options.map((option) => option.querySelector('svg')?.innerHTML)
  await expect(new Set(flags).size).toBe(localeOrder.length)
  await expect(flags[localeOrder.indexOf(args.locale)]).toBe(flag.innerHTML)
  await userEvent.keyboard('{Escape}')
}

export const PersianLight: Story = {
  args: { locale: 'fa-IR', colorScheme: 'light' },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: languagesShown,
}

export const PersianDark: Story = {
  args: { locale: 'fa-IR', colorScheme: 'dark' },
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: languagesShown,
}

export const EnglishLight: Story = {
  args: { locale: 'en-US', colorScheme: 'light' },
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: languagesShown,
}

export const EnglishDark: Story = {
  args: { locale: 'en-US', colorScheme: 'dark' },
  globals: { locale: 'en-US', colorScheme: 'dark' },
  play: languagesShown,
}
