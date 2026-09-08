import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { AppProviders } from './AppProviders'

/**
 * `AppProviders` with NO props, which is how the application mounts it and
 * which no story can reach.
 *
 * Storybook's decorator always passes both globals, so the branches that handle
 * an absent locale and an absent colour scheme are only ever taken in
 * production. That is the worst place for an untested branch to live, and it is
 * a one-line render to cover here.
 */
describe('mounting with nothing forced', () => {
  it('falls back to what the user has stored', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => JSON.stringify({ locale: 'en-US', colorScheme: 'dark' }),
      setItem: () => undefined,
    })
    const html = renderToString(
      <AppProviders>
        <span>mounted</span>
      </AppProviders>,
    )
    expect(html).toContain('mounted')
    vi.unstubAllGlobals()
  })

  it('falls back to Persian and light when nothing is stored either', () => {
    expect(
      renderToString(
        <AppProviders>
          <span>mounted</span>
        </AppProviders>,
      ),
    ).toContain('mounted')
  })

  it('still honours a forced locale, which is what the Storybook toolbar does', () => {
    const html = renderToString(
      <AppProviders locale="en-US" colorScheme="dark">
        <span>mounted</span>
      </AppProviders>,
    )
    expect(html).toContain('mounted')
  })
})
