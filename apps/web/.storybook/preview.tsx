import type { Decorator, Preview } from '@storybook/react-vite'
import { AppProviders } from '../src/app/AppProviders'
import { isLocale, locales } from '../src/i18n'

/**
 * The Language toolbar is not a convenience, it is part of the done gate.
 *
 * `AGENTS.md` section 5 requires every change to be seen in Persian and in
 * English before it is called finished, because English strings are longer and
 * the direction flips, so a layout bug hides in exactly one of them. The
 * decorator renders the same `AppProviders` the application uses, so the story
 * exercises the real direction and catalog rather than a lookalike.
 */
const withProviders: Decorator = (Story, context) => {
  const selected: unknown = context.globals.locale
  const locale = typeof selected === 'string' && isLocale(selected) ? selected : 'fa-IR'
  const chosen: unknown = context.globals.colorScheme
  const colorScheme = chosen === 'dark' || chosen === 'light' || chosen === 'system' ? chosen : 'light'
  return (
    <AppProviders locale={locale} colorScheme={colorScheme}>
      <Story />
    </AppProviders>
  )
}

const preview: Preview = {
  decorators: [withProviders],
  globalTypes: {
    locale: {
      description: 'Persian is the product, English is the source language',
      toolbar: {
        title: 'Language',
        icon: 'globe',
        items: Object.entries(locales).map(([value, title]) => ({ value, title })),
        dynamicTitle: true,
      },
    },
    colorScheme: {
      description: 'Light is the design. Dark is derived from it, and is labelled as derived in the code',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark (derived)' },
          { value: 'system', title: 'System' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { locale: 'fa-IR', colorScheme: 'light' },
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    a11y: { test: 'error' },
  },
}

export default preview
