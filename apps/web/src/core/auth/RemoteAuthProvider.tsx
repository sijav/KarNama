import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  apiProblem,
  currentAccount,
  hasToken,
  keepToken,
  requestLoginCode,
  revokeSession,
  saveAccountName,
  SESSION_EXPIRED,
  verifyLoginCode,
  warmApi,
} from '../api'
import { normalisePhone, type CodeProblem, type Session } from './auth'
import { AuthContext, type AuthValue } from './AuthProvider'
const EXPIRED: CodeProblem = 'expired'
const WRONG: CodeProblem = 'wrong'
type SessionError = 'UNAUTHENTICATED'
const UNAUTHENTICATED: SessionError = 'UNAUTHENTICATED'

export const RemoteAuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [phone, setPhone] = useState('')
  const [awaiting, setAwaiting] = useState(false)
  const [busy, setBusy] = useState(false)
  const [restoring, setRestoring] = useState(hasToken)
  const [retryAt, setRetryAt] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [retry, setRetry] = useState(0)
  const pending = useRef(false)
  useEffect(() => {
    warmApi()
    const expired = () => {
      setSession(null)
      setAwaiting(false)
      setError(UNAUTHENTICATED)
    }
    window.addEventListener(SESSION_EXPIRED, expired)
    return () => {
      window.removeEventListener(SESSION_EXPIRED, expired)
    }
  }, [])

  useEffect(() => {
    if (!hasToken()) return
    let active = true
    void currentAccount().then(
      (account) => {
        if (active) {
          setSession(account)
          setRestoring(false)
          setError(null)
        }
      },
      (problem: unknown) => {
        if (!active) return
        if (apiProblem(problem) === 'UNAUTHENTICATED') {
          keepToken('')
          setRestoring(false)
        } else setError(apiProblem(problem))
      },
    )
    return () => {
      active = false
    }
  }, [retry])

  const run = async <T,>(action: () => Promise<T>): Promise<T> => {
    pending.current = true
    setBusy(true)
    setError(null)
    try {
      return await action()
    } catch (problem) {
      setError(apiProblem(problem))
      throw problem
    } finally {
      pending.current = false
      setBusy(false)
    }
  }
  const send = async (number: string) => {
    const delivery = await requestLoginCode(number)
    setPhone(delivery.phone)
    setAwaiting(true)
    setRetryAt(Date.now() + delivery.retryAfterSeconds * 1000)
  }

  const value: AuthValue = {
    session,
    phone,
    awaiting,
    busy,
    restoring,
    error,
    retryAt,
    retrySession: () => {
      setError(null)
      setRetry((value) => value + 1)
    },
    signingUp: session !== null && !session.name.trim(),
    mockCode: null,
    requestCode: async (typed) => {
      const number = normalisePhone(typed)
      if (!number) return false
      if (pending.current) return true
      await run(() => send(number))
      return true
    },
    resend: async () => {
      if (pending.current || Date.now() < retryAt) return
      await run(() => send(phone))
    },
    verify: async (code) => {
      if (pending.current) return null
      try {
        await run(async () => {
          const login = await verifyLoginCode(phone, code)
          keepToken(login.token)
          setSession(login.account)
          setAwaiting(false)
        })
        return null
      } catch (problem) {
        const code = apiProblem(problem)
        if (code === 'CODE_EXPIRED' || code === 'CODE_LOCKED') {
          setError(null)
          return EXPIRED
        }
        if (code === 'CODE_WRONG') {
          setError(null)
          return WRONG
        }
        throw problem
      }
    },
    saveName: async (name) => {
      if (pending.current) return
      await run(async () => {
        setSession(await saveAccountName(name))
      })
    },
    signOut: () => {
      if (pending.current) return
      void run(async () => {
        await revokeSession()
        keepToken('')
        setSession(null)
        setPhone('')
        setAwaiting(false)
      }).catch(() => undefined)
    },
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
