import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { CombinedGraphQLErrors } from '@apollo/client/errors'
import {
  CurrentAccountDocument,
  ExtractJobDocument,
  HealthDocument,
  RequestLoginCodeDocument,
  SaveAccountNameDocument,
  SignOutDocument,
  VerifyLoginCodeDocument,
} from '@karnama/graphql'
import { isEmploymentType, isJobLevel } from '../../shared/job-selects'

const configured: unknown = import.meta.env.VITE_API_URL
export const apiUrl = typeof configured === 'string' ? configured : ''
const liveAuth = import.meta.env.VITE_AUTH_MODE === 'live'
type SessionKey = 'karnama.access-token'
type ApiPath = '/graphql'
type HeaderName = 'Authorization'
type AuthScheme = 'Bearer'
const TOKEN_KEY: SessionKey = 'karnama.access-token'
const GRAPHQL_PATH: ApiPath = '/graphql'
const AUTHORIZATION: HeaderName = 'Authorization'
const BEARER: AuthScheme = 'Bearer'
type SessionEvent = 'karnama:session-expired'
export const SESSION_EXPIRED: SessionEvent = 'karnama:session-expired'
type ClientCode = 'NETWORK_ERROR' | 'API_NOT_CONFIGURED' | 'INVALID_RESPONSE' | 'DEMO_EXTRACTION_UNAVAILABLE'
const NETWORK_ERROR: ClientCode = 'NETWORK_ERROR'
let token = ''
try {
  token = window.sessionStorage.getItem(TOKEN_KEY) ?? ''
} catch {
  /* Session lasts until reload when storage is blocked. */
}

export const keepToken = (next: string) => {
  token = next
  try {
    if (next) window.sessionStorage.setItem(TOKEN_KEY, next)
    else window.sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    /* In-memory sessions still work. */
  }
}
export const hasToken = () => token !== ''

export class ApiProblem extends Error {
  constructor(readonly code: ClientCode) {
    super(code)
  }
}
export const apiProblem = (error: unknown) => {
  if (error instanceof ApiProblem) return error.code
  if (CombinedGraphQLErrors.is(error)) {
    const code = error.errors[0]?.extensions?.code
    if (typeof code === 'string') return code
  }
  return NETWORK_ERROR
}

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: apiUrl || GRAPHQL_PATH,
    fetch: (input, init) => {
      if (!apiUrl) return Promise.reject(new ApiProblem('API_NOT_CONFIGURED'))
      const headers = new Headers(init?.headers)
      const authorization = [BEARER, token].join(' ')
      if (liveAuth && token) headers.set(AUTHORIZATION, authorization)
      return window.fetch(input, { ...init, headers, signal: AbortSignal.timeout(120_000) })
    },
  }),
  defaultOptions: { query: { fetchPolicy: 'no-cache' }, mutate: { fetchPolicy: 'no-cache' } },
})

const requireData = <T>(data: T | null | undefined): T => {
  if (!data) throw new ApiProblem('INVALID_RESPONSE')
  return data
}
const authenticated = async <T>(action: () => Promise<T>): Promise<T> => {
  try {
    return await action()
  } catch (error) {
    if (apiProblem(error) === 'UNAUTHENTICATED') {
      if (!liveAuth) throw new ApiProblem('DEMO_EXTRACTION_UNAVAILABLE')
      keepToken('')
      window.dispatchEvent(new Event(SESSION_EXPIRED))
    }
    throw error
  }
}
export const warmApi = () => {
  if (apiUrl) void client.query({ query: HealthDocument }).catch(() => undefined)
}

export const requestLoginCode = async (phone: string) =>
  requireData((await client.mutate({ mutation: RequestLoginCodeDocument, variables: { phone } })).data).requestLoginCode
export const verifyLoginCode = async (phone: string, code: string) =>
  requireData((await client.mutate({ mutation: VerifyLoginCodeDocument, variables: { phone, code } })).data).verifyLoginCode
export const currentAccount = async () => requireData((await client.query({ query: CurrentAccountDocument })).data).currentAccount
export const saveAccountName = (name: string) =>
  authenticated(
    async () => requireData((await client.mutate({ mutation: SaveAccountNameDocument, variables: { name } })).data).saveAccountName,
  )
export const revokeSession = async () => {
  await client.mutate({ mutation: SignOutDocument })
}
export const extractJob = (source: string) =>
  authenticated(async () => {
    const found = requireData((await client.mutate({ mutation: ExtractJobDocument, variables: { source } })).data).extractJob
    return {
      ...found,
      employmentTypes: found.employmentTypes.filter(isEmploymentType),
      jobLevel: found.jobLevel && isJobLevel(found.jobLevel) ? found.jobLevel : null,
    }
  })
