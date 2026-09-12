import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  checkCode,
  needsName,
  normalisePhone,
  readSession,
  sendCode,
  sessionFor,
  type CodeProblem,
  type SentCode,
  type Session,
} from './auth'

/** Where the session is kept between visits, beside the preferences and the board. */
export const STORAGE_KEY = 'karnama.session'

export interface AuthValue {
  /** Who is signed in, or null. */
  session: Session | null
  /** True once a code has been sent and not yet used. */
  awaiting: boolean
  /** True when the session has no name yet, which is the first login. */
  signingUp: boolean
  /** The number the code was sent to, for the screen to show. */
  phone: string
  /**
   * The code the MOCK just made, for the screen to show the reader, KN-459.
   *
   * No message is really sent, and until one is, the console was the only place
   * the code appeared. A phone has no console, so nobody could sign in on the
   * device this product is mostly for. Null once there is nothing pending, and
   * it goes the moment a real sender exists.
   */
  mockCode: string | null
  /** Sends a code to a number. False when the number is not one. */
  requestCode: (typed: string) => boolean | Promise<boolean>
  /** Sends the same number another code. */
  resend: () => void | Promise<void>
  /** Checks a code and signs in, or says why not. */
  verify: (typed: string) => CodeProblem | null | Promise<CodeProblem | null>
  /** The first login's name. */
  saveName: (name: string) => void | Promise<void>
  busy?: boolean
  error?: string | null
  retryAt?: number
  restoring?: boolean
  retrySession?: () => void
  signOut: () => void
}

const NO_AUTH: AuthValue = {
  session: null,
  awaiting: false,
  signingUp: false,
  phone: '',
  mockCode: null,
  requestCode: () => false,
  resend: () => undefined,
  verify: () => null,
  saveName: () => undefined,
  signOut: () => undefined,
}

export const AuthContext = createContext<AuthValue>(NO_AUTH)

const storage = (): Storage | undefined => {
  try {
    return globalThis.localStorage
  } catch {
    return undefined
  }
}

const stored = (): Session | null => {
  try {
    const raw = storage()?.getItem(STORAGE_KEY)
    return typeof raw === 'string' ? readSession(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

const keep = (session: Session | null) => {
  try {
    if (session) storage()?.setItem(STORAGE_KEY, JSON.stringify(session))
    else storage()?.removeItem(STORAGE_KEY)
  } catch {
    // A reader with storage blocked signs in for this visit only.
  }
}

export interface AuthProviderProps {
  /** Seeds who is signed in, for a story or a test. */
  initial?: Session | null
  children: ReactNode
}

/**
 * Who is signed in, and the mocked provider that sends the code.
 *
 * No SMS is sent: the owner's decision for the MVP, DESIGN.md section 3. The
 * code is made here and written to the console, where whoever is testing reads
 * it, and the screen says so rather than pretending a message was sent. The
 * real provider replaces `requestCode` and `verify` behind this same interface
 * when the API's auth lands, KN-036.
 */
export const AuthProvider = ({ initial, children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(() => (initial === undefined ? stored() : initial))
  const [sent, setSent] = useState<SentCode | null>(null)
  const latest = useRef<Session | null>(session)
  // What the last call produced, which is not what this render can see: an
  // action reads the code from here rather than from the render it was made
  // in, so asking for a code and giving it in one batch works, as the
  // preferences' own ref does, KN-112.
  const pending = useRef<SentCode | null>(sent)

  const hold = useCallback((next: Session | null) => {
    latest.current = next
    setSession(next)
    keep(next)
  }, [])

  const send = useCallback((phone: string) => {
    const made = sendCode(phone, Date.now())
    pending.current = made
    setSent(made)
    // Where the SMS would have gone. The mock says so out loud rather than
    // leaving whoever is testing to guess what to type.
    console.info(`KarNama mock SMS to ${made.phone}: ${made.code}`)
    return made
  }, [])

  const value = useMemo<AuthValue>(
    () => ({
      session,
      awaiting: sent !== null && session === null,
      signingUp: session !== null && needsName(session),
      phone: sent?.phone ?? session?.phone ?? '',
      // Shown on the screen because a phone has no console, KN-459.
      mockCode: sent?.code ?? null,
      requestCode: (typed) => {
        // Stored in one shape whatever the reader typed, Persian digits and a
        // +98 included, so the code goes to the number they meant.
        const phone = normalisePhone(typed)
        if (!phone) return false
        send(phone)
        return true
      },
      resend: () => {
        const held = pending.current
        if (held) send(held.phone)
      },
      verify: (typed) => {
        const held = pending.current
        const problem = checkCode(held, typed, Date.now())
        if (problem) return problem
        hold(sessionFor(held?.phone ?? '', new Date().toISOString()))
        pending.current = null
        setSent(null)
        return null
      },
      saveName: (name) => {
        if (latest.current) hold({ ...latest.current, name: name.trim() })
      },
      signOut: () => {
        hold(null)
        pending.current = null
        setSent(null)
      },
    }),
    [hold, send, sent, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthValue => useContext(AuthContext)
