import type { StoryObj } from '@storybook/react-vite'
import { useContext } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import type { Locale } from '../../i18n'
import type { StoryMeta } from '../../shared/story-docs/story-meta'
import type { ColorSchemePreference } from '../../theme/useColorScheme'
import { PreferencesContext, PreferencesProvider } from './PreferencesProvider'
import { STORAGE_KEY } from './storage'

// A probe, not a product component, and it lives INSIDE this file on purpose:
// `vitest.config.ts` excludes `*.stories.tsx` from coverage, so a helper that
// exists only to exercise a contract does not drag the 100 percent rule behind
// it. In its own `.tsx` it would be production source owing full coverage.
//
// It reads the context rather than `usePreferences` so that a story renders the
// same values a consumer sees, and it writes them into `data-testid` spans
// because the assertion is on STATE, not on anything a user reads.
const BatchProbe = () => {
  const { locale, colorScheme, setLocale, setColorScheme } = useContext(PreferencesContext)
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="colorScheme">{colorScheme}</span>
      {/*
        ONE button, whose handler calls BOTH setters. That is the entire point.
        Two calls made after `renderToString` returns are not a React batch, and
        proving that case while describing it as the hard one is the specific
        mistake this story exists to avoid: inside an event handler React batches
        the two updates into a single render, which is where a setter built over
        a stale snapshot loses the other field.

        No label, because the rule that every user-facing string goes through
        lingui applies to stories too. `data-testid` is a structural prop and is
        exempt, which is the honest way to say this control is not product copy.
      */}
      <button data-testid="set-both" type="button" onClick={() => { setLocale('en-US'); setColorScheme('dark') }} />
    </div>
  )
}

interface ProbeProps {
  initialLocale: Locale
  initialColorScheme: ColorSchemePreference
}

// The provider is rendered from ARGS rather than from a decorator, so the story
// obeys the rule that stories render from their args and the seeded state is
// visible in the Controls table rather than buried in a wrapper.
const SeededProbe = ({ initialLocale, initialColorScheme }: ProbeProps) => (
  <PreferencesProvider initial={{ locale: initialLocale, colorScheme: initialColorScheme }}>
    <BatchProbe />
  </PreferencesProvider>
)

const meta = {
  title: 'Core/PreferencesProvider',
  component: SeededProbe,
  args: { initialLocale: 'fa-IR', initialColorScheme: 'light' },
} satisfies StoryMeta<typeof SeededProbe>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Restores whatever was in storage before the story ran.
 *
 * The provider persists on every setter call, and these stories deliberately
 * call setters, so without this a story would leave `{en-US, dark}` in the real
 * localStorage of the browser the whole suite shares. Any later story that
 * mounts a provider WITHOUT a seed reads what is stored, so this one would
 * quietly change what that one renders. In a `finally`, because a failing
 * assertion still has to clean up after itself.
 */
const clickingBothSetters = async (canvasElement: HTMLElement) => {
  const before = localStorage.getItem(STORAGE_KEY)
  try {
    const canvas = within(canvasElement)
    // The seeded state, asserted first. Without this the story could pass by
    // starting in the state it is supposed to end in.
    await expect(canvas.getByTestId('locale')).toHaveTextContent('fa-IR')
    await expect(canvas.getByTestId('colorScheme')).toHaveTextContent('light')

    await userEvent.click(canvas.getByTestId('set-both'))

    // BOTH survive. Under the defect the language change was gone: the second
    // setter recomputed from the render's snapshot and wrote `fa-IR` back.
    await expect(canvas.getByTestId('locale')).toHaveTextContent('en-US')
    await expect(canvas.getByTestId('colorScheme')).toHaveTextContent('dark')
  } finally {
    if (before === null) localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, before)
  }
}

export const Persian: Story = {
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => clickingBothSetters(canvasElement),
}

export const English: Story = {
  globals: { locale: 'en-US' },
  play: async ({ canvasElement }) => clickingBothSetters(canvasElement),
}
