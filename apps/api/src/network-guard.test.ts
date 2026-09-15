import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { describe, expect, it, vi } from 'vitest'

/**
 * The guard `vitest.setup.ts` puts over `fetch`, KN-486: no test reaches a
 * provider, or any host but 127.0.0.1.
 *
 * Each request to another host goes out already aborted, so this test cannot reach
 * one even when the guard is broken: Node's own `fetch` refuses an aborted signal
 * before any lookup or connection, with an abort error rather than the guard's. A
 * plant that let every host through sent these requests for real, with no signal.
 */
const ABORTED = () => AbortSignal.abort()

describe('no test reaches a provider, KN-486', () => {
  it.each([
    'https://api.groq.com/openai/v1/chat/completions',
    'https://api.openai.com/v1/responses',
    'https://api.kavenegar.com/v1/key/verify/lookup.json',
    'https://example.com/jobs/1',
    'http://localhost:4400/graphql',
  ])('refuses %s before a request is made', async (url) => {
    await expect(fetch(url, { method: 'POST', signal: ABORTED() })).rejects.toThrow('KN-486')
  })

  it('lets a test reach 127.0.0.1', async () => {
    const server = createServer((_request, response) => {
      response.end('here')
    })
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', resolve)
    })
    try {
      const { port } = server.address() as AddressInfo
      const response = await fetch(`http://127.0.0.1:${port}/`)
      expect(await response.text()).toBe('here')
    } finally {
      await new Promise((resolve) => {
        server.close(resolve)
      })
    }
  })

  it('is still there after a test stubs fetch and puts the stub away', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(new Response('stubbed')))
    const stubbed = await fetch('https://api.groq.com/')
    expect(await stubbed.text()).toBe('stubbed')
    vi.unstubAllGlobals()
    await expect(fetch('https://api.groq.com/', { signal: ABORTED() })).rejects.toThrow('KN-486')
  })
})
