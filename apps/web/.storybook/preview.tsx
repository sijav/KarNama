// The design's type, as the app loads it in main.tsx, KN-322: without it every
// story drew its text in whatever system-ui resolves to, so a width, a line
// break or a hugging component's size in a story was not the design's.
import '@fontsource-variable/vazirmatn'
import type { Decorator, Preview } from '@storybook/react-vite'
import { AppProviders } from '../src/app/AppProviders'
import { isLocale, locales } from '../src/i18n'
import { DocsPage } from '../src/shared/story-docs/DocsPage'
import { fontFamily } from '../src/theme/tokens'

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

// A face loads only when text first asks for it, and a story measures its text
// at once, so the Persian and the Latin faces are fetched before any story
// renders, in the theme's own family, KN-322.
const withFontsLoaded = async () => {
  await Promise.all([window.document.fonts.load(`16px ${fontFamily}`, 'ا'), window.document.fonts.load(`16px ${fontFamily}`, 'a')])
}

const preview: Preview = {
  decorators: [withProviders],
  beforeEach: withFontsLoaded,
  // Autodocs is what creates a Docs page at all. Without this tag there is no
  // generated page for `parameters.docs.page` to replace, which is easy to miss
  // because the Docs tab simply does not appear rather than appearing empty.
  tags: ['autodocs'],
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
    // The Docs page is ours, because it has to follow the Language toolbar.
    // Storybook's generated page reads a description fixed at load time, which
    // cannot change language without a reload.
    docs: { page: DocsPage },
  },
}

export default preview
