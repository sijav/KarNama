import type { StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { i18nFor, type Locale } from '../i18n'
import type { StoryMeta } from '../shared/story-docs/story-meta'
import { StatsScreen } from './StatsScreen'

// No `component`, as the network page's: a page is a composition, rendered as
// the shell renders it.
const meta = {
  title: 'Screens/Stats',
  render: () => <StatsScreen />,
  parameters: { layout: 'fullscreen' },
} satisfies StoryMeta<typeof StatsScreen>

export default meta
type Story = StoryObj<typeof meta>

// The page's place until KN-823 builds it: the Header band and its Page Header,
// the page's one heading, «آمار من», KN-796.
const isThePlace = async (canvasElement: HTMLElement, locale: Locale) => {
  const i18n = i18nFor(locale)
  const heading = within(canvasElement).getByRole('heading', { level: 1 })
  await expect(heading).toHaveTextContent(i18n._('My stats'))
  await expect(canvasElement.querySelector('header')?.contains(heading)).toBe(true)
}

export const Placeholder: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await isThePlace(canvasElement, 'fa-IR')
  },
}

export const InEnglish: Story = {
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await isThePlace(canvasElement, 'en-US')
  },
}
