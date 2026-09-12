import { describe, expect, it, vi } from 'vitest'
import { installConsoleGuard, isOurs, MARK, report } from './console-guard'

/**
 * The guard is what says "no React warnings", so the guard itself is driven
 * here with each shape it has to tell apart, KN-401. The first version let
 * everything through that was not printf-style, which is most of what React
 * says, and nothing tested its rule: narrowing or inverting it stayed green.
 */
const fake = () => {
  const said: string[] = []
  return {
    said,
    console: {
      error: (...args: unknown[]) => said.push(`error ${args.map(String).join(' ')}`),
      warn: (...args: unknown[]) => said.push(`warn ${args.map(String).join(' ')}`),
    },
  }
}

describe('the console guard', () => {
  it('hears a printf warning, a plain string and a console.warn, and lets the product through', () => {
    const target = fake()
    const guard = installConsoleGuard(target.console)

    // React's two shapes, and its other method.
    target.console.error('Warning: Each child in a list should have a unique "key" prop.%s', ' at App')
    target.console.error('Cannot call startTransition while rendering.')
    target.console.warn('componentWillReceiveProps has been renamed')
    // And the product's own, which is marked.
    report('IconButton: its aria-label is blank')

    expect(guard.unaccounted()).toHaveLength(3)
    expect(guard.unaccounted()[1]).toContain('startTransition')
    expect(guard.unaccounted()[2]).toContain('componentWillReceiveProps')

    // Everything was still said, including what was recorded.
    expect(target.said).toHaveLength(3)
    guard.restore()
  })

  it('accounts for what a test says it provokes, and nothing else', () => {
    // A story that provokes a message from the RUNNER says so, KN-401: React's
    // act scope complains about a transition that a reader never sees.
    const target = fake()
    const guard = installConsoleGuard(target.console)
    guard.allow(/suspended inside an `act` scope/u)

    target.console.error('A component suspended inside an `act` scope, but the `act` call was not awaited.')
    target.console.error('Cannot call startTransition while rendering.')

    expect(guard.unaccounted()).toHaveLength(1)
    expect(guard.unaccounted()[0]).toContain('startTransition')
    guard.restore()
  })

  it('marks only what the product marks', () => {
    expect(isOurs([`${MARK} anything`])).toBe(true)
    expect(isOurs(['Cannot call startTransition while rendering.'])).toBe(false)
    // Not a string at all, which React does send: an Error, or an element.
    expect(isOurs([new Error('boom')])).toBe(false)
    expect(isOurs([])).toBe(false)
    // The mark has to be at the FRONT: a warning that quotes us is not ours.
    expect(isOurs([`React saw ${MARK} in a message`])).toBe(false)
  })

  it('puts the console back, so one test cannot leave the next one watched', () => {
    const target = fake()
    const { error, warn } = target.console
    installConsoleGuard(target.console).restore()
    expect(target.console.error).toBe(error)
    expect(target.console.warn).toBe(warn)
  })

  it('says what the product says through the real console, marked', () => {
    const said = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    report('Tooltip: its child did not take a ref')
    expect(said).toHaveBeenCalledWith(expect.stringContaining(MARK))
    expect(said).toHaveBeenCalledWith(expect.stringContaining('did not take a ref'))
    said.mockRestore()
  })
})
