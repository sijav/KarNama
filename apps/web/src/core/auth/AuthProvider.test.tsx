import { useContext } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { AuthContext, AuthProvider, codeFor, STORAGE_KEY, useMockCode, type AuthValue } from './AuthProvider'
import { sessionFor } from './auth'

/**
 * The mocked provider, driven from the node side.
 *
 * Every screen exercises it, and the browser project's coverage of a file the
 * node project also touches is thrown away, KN-103. `renderToString` gives one
 * render; the value it captures holds the actions, and each is called against
 * the real state, so what is checked is what they did.
 */
const PHONE = '09120000000'

const capture = (initial?: ReturnType<typeof sessionFor> | null, random?: () => number) => {
  let held: AuthValue | undefined
  const Probe = () => {
    held = useContext(AuthContext)
    return <span>{held.session?.phone ?? ''}</span>
  }
  const html = renderToString(
    <AuthProvider {...(initial === undefined ? {} : { initial })} {...(random === undefined ? {} : { random })}>
      <Probe />
    </AuthProvider>,
  )
  if (!held) throw new Error('the probe never rendered')
  return { held, html }
}

/** What the mock wrote to the console, which is where the code goes. */
const sentCodes = () => {
  const codes: string[] = []
  vi.spyOn(console, 'info').mockImplementation((...args: unknown[]) => {
    const said = /mock SMS to \S+: (\d+)/.exec(String(args[0]))
    if (said?.[1]) codes.push(said[1])
  })
  return codes
}

describe('the mocked provider', () => {
  it('has nobody signed in until a code is asked for and given', () => {
    vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => undefined, removeItem: () => undefined })
    const codes = sentCodes()
    const { held, html } = capture()
    expect(html).not.toContain(PHONE)
    expect([held.session, held.awaiting, held.signingUp]).toEqual([null, false, false])

    // A number that is not one is refused and nothing is sent.
    expect(held.requestCode('12')).toBe(false)
    expect(codes).toEqual([])

    // One that is sends a code, to the number as it is stored.
    expect(held.requestCode('۰۹۱۲ ۰۰۰ ۰۰۰۰')).toBe(true)
    expect(codes).toHaveLength(1)
  })

  it('refuses a wrong code, sends another on request, and signs in on the right one', async () => {
    const kept: string[] = []
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: (_key: string, value: string) => kept.push(value),
      removeItem: () => kept.push(''),
    })
    const codes = sentCodes()
    const { held } = capture()

    await held.requestCode(PHONE)
    expect(held.verify('00000')).toBe('wrong')

    await held.resend()
    expect(codes).toHaveLength(2)

    // The code the mock last sent is the one that works, and signing in keeps
    // a session with no name yet, which is the first login.
    expect(held.verify(codes.at(-1) ?? '')).toBeNull()
    expect(JSON.parse(kept.at(-1) ?? '{}')).toMatchObject({ phone: PHONE, name: '' })
  })

  it('sends the codes its random source makes, a new one on a resend, and accepts only the newest, KN-466', async () => {
    vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => undefined, removeItem: () => undefined })
    const codes = sentCodes()
    // Exact in floating point, so the mock's five digits are exactly these.
    const turns = [0.5, 0.25]
    let at = 0
    const { held } = capture(undefined, () => turns[at++] ?? 0)
    await held.requestCode(PHONE)
    await held.resend()
    expect(codes).toEqual(['50000', '25000'])
    expect(held.verify('50000')).toBe('wrong')
    expect(held.verify('25000')).toBeNull()
  })

  // What the screen is GIVEN cannot be read here: `capture` renders once with
  // `renderToString`, so a code sent afterwards never reaches a second render,
  // and an assertion on a fresh provider's code says nothing about the one that
  // sent it. That is why the line this replaced was vacuous, KN-462. It is covered
  // where it is observable, in SigningInOnAPhone, which reads the code off the
  // screen, resends, and signs in with the new one. Core/AuthProvider's stories
  // read it the way the screen does, after a send and after a resend, find the
  // screen showing exactly that, and sign in with it, KN-465; and they mount
  // another provider inside the mock, whose screen gets none, KN-460.

  it('gives its code only to a component reading its own value, KN-460', () => {
    // Any value but the mock's own is another provider's, which gets nothing.
    const standIn = (): AuthValue => ({
      session: null,
      awaiting: true,
      signingUp: false,
      phone: PHONE,
      requestCode: () => true,
      resend: () => undefined,
      verify: () => null,
      saveName: () => undefined,
      signOut: () => undefined,
    })
    const mine = standIn()
    expect(codeFor({ auth: mine, code: '12345' }, mine)).toBe('12345')
    expect(codeFor({ auth: mine, code: '12345' }, standIn())).toBeNull()
    expect(codeFor(null, mine)).toBeNull()
  })

  it('is expired when no code was ever sent', () => {
    vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => undefined, removeItem: () => undefined })
    sentCodes()
    expect(capture().held.verify('12345')).toBe('expired')
  })

  it('takes the name the first login gives, and lets the reader out again', async () => {
    const kept: string[] = []
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: (_key: string, value: string) => kept.push(value),
      removeItem: () => kept.push('gone'),
    })
    const { held } = capture(sessionFor(PHONE, '2026-09-12T00:00:00.000Z'))
    expect(held.signingUp).toBe(true)

    await held.saveName('  سارا محمدی  ')
    expect(JSON.parse(kept.at(-1) ?? '{}')).toMatchObject({ name: 'سارا محمدی' })

    held.signOut()
    expect(kept.at(-1)).toBe('gone')
  })

  it('reads back a session a previous visit kept, and refuses one that is not', () => {
    const kept = sessionFor(PHONE, '2026-09-12T00:00:00.000Z', 'سارا')
    vi.stubGlobal('localStorage', { getItem: () => JSON.stringify(kept), setItem: () => undefined, removeItem: () => undefined })
    expect(capture().held.session).toEqual(kept)

    vi.stubGlobal('localStorage', { getItem: () => '{ not json', setItem: () => undefined, removeItem: () => undefined })
    expect(capture().held.session).toBeNull()
  })

  it('still works where reading localStorage at all throws', () => {
    // Site data blocked: the property itself throws on ACCESS, not just on use,
    // which is why the guard is around the read of it rather than around a call.
    const own = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('blocked')
      },
    })
    try {
      const { held } = capture()
      expect(held.session).toBeNull()
      expect(() => {
        held.signOut()
      }).not.toThrow()
    } finally {
      if (own) Object.defineProperty(globalThis, 'localStorage', own)
      else Reflect.deleteProperty(globalThis, 'localStorage')
    }
  })

  it('still works for a reader whose browser refuses storage', async () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
      removeItem: () => {
        throw new Error('blocked')
      },
    })
    sentCodes()
    const { held } = capture()
    await expect(Promise.resolve(held.requestCode(PHONE))).resolves.toBe(true)
    expect(() => {
      held.signOut()
    }).not.toThrow()
  })

  it('keeps the session under its own key, beside the preferences and the board', () => {
    expect(STORAGE_KEY).toContain('session')
  })

  it('does nothing, rather than throwing, for a component outside the provider', async () => {
    let held: AuthValue | undefined
    let code: string | null | undefined
    const Probe = () => {
      held = useContext(AuthContext)
      code = useMockCode()
      return <span>{held.phone}</span>
    }
    renderToString(<Probe />)
    // No mock above it, so no code to show, KN-460.
    expect(code).toBeNull()
    expect(held?.session).toBeNull()
    expect(held?.requestCode(PHONE)).toBe(false)
    expect(held?.verify('12345')).toBeNull()
    await expect(Promise.resolve(held?.resend())).resolves.toBeUndefined()
    await expect(Promise.resolve(held?.saveName('a'))).resolves.toBeUndefined()
    expect(() => {
      held?.signOut()
    }).not.toThrow()
  })
})
