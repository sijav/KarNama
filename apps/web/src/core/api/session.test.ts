import { afterEach, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.resetModules()
})

it.each(['demo', 'live'])('keeps %s authentication separate from a stored server token', async (mode) => {
  vi.stubEnv('VITE_AUTH_MODE', mode)
  vi.stubEnv('VITE_API_URL', 'https://example.test/graphql')
  const request = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
    expect(new Headers(init?.headers).get('Authorization')).toBe(mode === 'live' ? 'Bearer stale-server-token' : null)
    return Promise.resolve(
      new Response(JSON.stringify({ errors: [{ message: 'UNAUTHENTICATED', extensions: { code: 'UNAUTHENTICATED' } }], data: null }), {
        headers: { 'Content-Type': 'application/json' },
      }),
    )
  })
  const removeItem = vi.fn()
  const dispatchEvent = vi.fn()
  vi.stubGlobal('window', {
    navigator: { userAgent: 'Node.js' },
    sessionStorage: { getItem: () => 'stale-server-token', setItem: vi.fn(), removeItem },
    fetch: request,
    dispatchEvent,
  })
  const { saveAccountName, apiProblem } = await import('./client')
  const problem = await saveAccountName('Example').catch(apiProblem)
  expect(problem).toBe(mode === 'live' ? 'UNAUTHENTICATED' : 'DEMO_EXTRACTION_UNAVAILABLE')
  expect(request).toHaveBeenCalledTimes(1)
  expect(removeItem).toHaveBeenCalledTimes(mode === 'live' ? 1 : 0)
  expect(dispatchEvent).toHaveBeenCalledTimes(mode === 'live' ? 1 : 0)
})
