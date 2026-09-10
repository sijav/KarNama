import { renderToString } from 'react-dom/server'
import { useContext } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { PreferencesContext, PreferencesProvider, type PreferencesValue } from './PreferencesProvider'
import { defaults } from './storage'

/**
 * The context's DEFAULT value, which is the case a story never reaches.
 *
 * It is created with the defaults rather than with `undefined` so a component
 * rendered outside the provider gets Persian and light instead of throwing,
 * which is what a story that only cares about layout wants. The setters there
 * are no-ops, and that is honest: there is nowhere to put the value. This is
 * what says both halves are true.
 */
/**
 * The provider is rendered here as well as in stories, and it should not have
 * to be.
 *
 * Every story exercises it, and the browser project's coverage of it is thrown
 * away, because coverage for a file the node project also touches reports only
 * the node counters. That is KN-103. Until it lands, a file with both a unit
 * test and a story has to be exercised from the node side too or it reads as
 * uncovered, which is the tax that card is about.
 */
describe('the provider', () => {
  it('seeds from the initial value, and its setters reach storage', () => {
    const written: string[] = []
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: (_key: string, value: string) => written.push(value),
    })

    let captured: PreferencesValue | undefined
    const Probe = () => {
      captured = useContext(PreferencesContext)
      return <span>{captured.locale}</span>
    }

    const html = renderToString(
      <PreferencesProvider initial={{ locale: 'en-US', colorScheme: 'dark' }}>
        <Probe />
      </PreferencesProvider>,
    )
    expect(html).toContain('en-US')
    expect(captured?.colorScheme).toBe('dark')

    // Both setters, called outside a render, so the write is what is observed
    // rather than the re-render. A story covers the re-render.
    //
    // The second write is the one that matters, and this file used to assert the
    // DEFECT here: it expected `{ locale: 'en-US', colorScheme: 'system' }`,
    // with the locale reverted, because each setter passed the sibling field
    // captured in its own render and the second call therefore wrote the first
    // call's field back to its old value. The suite did not miss the bug, it
    // certified it. Each call now composes onto the previous call's result.
    captured?.setLocale('fa-IR')
    captured?.setColorScheme('system')
    expect(written).toEqual([
      JSON.stringify({ locale: 'fa-IR', colorScheme: 'dark' }),
      JSON.stringify({ locale: 'fa-IR', colorScheme: 'system' }),
    ])
    vi.unstubAllGlobals()
  })

  it('keeps BOTH changes when the two setters are called before a re-render', () => {
    // The card's case stated on its own, rather than as a clause of a test about
    // seeding, so a failure names the defect instead of pointing at storage.
    //
    // What is proved here is the PERSISTED value. `renderToString` never
    // re-renders, so the state half cannot be observed from the node project at
    // all, and asserting on `captured` after the calls would only re-read the
    // first render's snapshot and prove nothing. The rendered state is proved by
    // the story, in a real browser, from a single click handler that calls both.
    const written: string[] = []
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: (_key: string, value: string) => written.push(value),
    })

    let captured: PreferencesValue | undefined
    const Probe = () => {
      captured = useContext(PreferencesContext)
      return <span>{captured.locale}</span>
    }
    renderToString(
      <PreferencesProvider initial={{ locale: 'fa-IR', colorScheme: 'light' }}>
        <Probe />
      </PreferencesProvider>,
    )

    captured?.setLocale('en-US')
    captured?.setColorScheme('dark')

    // One write per call, and the LAST one carries both changes. Under the
    // defect it read `{ locale: 'fa-IR', colorScheme: 'dark' }` and the language
    // change was gone from storage entirely.
    expect(written.at(-1)).toBe(JSON.stringify({ locale: 'en-US', colorScheme: 'dark' }))
    expect(written).toHaveLength(2)
    vi.unstubAllGlobals()
  })

  it('keeps both changes when the two setters are called in the OTHER order', () => {
    // The order matters and one order is not a proof of the other. Each setter
    // used to forward the sibling field, and only the SECOND call's forwarding
    // does damage, because it overwrites what the first call just did. So a
    // suite that always sets the language first can only ever catch the defect
    // in `setColorScheme`, and `setLocale` could keep forwarding a stale colour
    // scheme forever with every test green. This case is the mirror.
    const written: string[] = []
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: (_key: string, value: string) => written.push(value),
    })

    let captured: PreferencesValue | undefined
    const Probe = () => {
      captured = useContext(PreferencesContext)
      return <span>{captured.colorScheme}</span>
    }
    renderToString(
      <PreferencesProvider initial={{ locale: 'fa-IR', colorScheme: 'light' }}>
        <Probe />
      </PreferencesProvider>,
    )

    captured?.setColorScheme('dark')
    captured?.setLocale('en-US')

    expect(written.at(-1)).toBe(JSON.stringify({ locale: 'en-US', colorScheme: 'dark' }))
    expect(written).toHaveLength(2)
    vi.unstubAllGlobals()
  })

  it('falls back to storage when no initial value is given', () => {
    vi.stubGlobal('localStorage', { getItem: () => JSON.stringify({ locale: 'en-US', colorScheme: 'system' }), setItem: () => undefined })
    const Probe = () => <span>{useContext(PreferencesContext).locale}</span>
    expect(
      renderToString(
        <PreferencesProvider>
          <Probe />
        </PreferencesProvider>,
      ),
    ).toContain('en-US')
    vi.unstubAllGlobals()
  })
})

describe('outside the provider', () => {
  it('reads the defaults and its setters do nothing, harmlessly', () => {
    const seen: string[] = []
    const Probe = () => {
      const preferences = useContext(PreferencesContext)
      seen.push(preferences.locale, preferences.colorScheme)
      // Calling them is the test: they must not throw, and they must not
      // pretend to have worked.
      preferences.setLocale('en-US')
      preferences.setColorScheme('dark')
      seen.push(preferences.locale, preferences.colorScheme)
      return <span>{preferences.locale}</span>
    }

    expect(renderToString(<Probe />)).toContain(defaults.locale)
    expect(seen).toEqual([defaults.locale, defaults.colorScheme, defaults.locale, defaults.colorScheme])
  })
})
