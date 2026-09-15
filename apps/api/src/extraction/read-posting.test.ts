import type { LookupAddress } from 'node:dns'
import type { RequestOptions } from 'node:http'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { readPosting } from './posting.js'

/**
 * `readPosting` with no network at all, KN-486.
 *
 * The DNS answer is the test's, and every HTTP response is played back by a
 * request of the test's own, so what is checked is this code: that the address it
 * checked is the only one the socket is handed, the redirects it follows and the
 * ones it refuses, the pages it will not read, and the size it stops at.
 */

// A response to play back: its status and headers, its body in chunks, or an
// error the request or the response raises instead.
interface Reply {
  status?: number
  headers?: Record<string, string>
  body?: string[]
  fails?: 'request' | 'response'
}

// A request as it was made, with what its own lookup answered in both forms.
interface Made {
  scheme: string
  url: URL
  options: RequestOptions
  one?: unknown[]
  all?: unknown[]
}

type Listener = (...args: unknown[]) => void

const net = vi.hoisted(() => {
  const made: Made[] = []
  const replies: Reply[] = []
  const lookup = vi.fn<(host: string, options: { all: true }) => Promise<LookupAddress[]>>()

  // The little of an event emitter the code uses, written here because the
  // test's own imports are not there yet when a hoisted mock is made.
  const emitter = () => {
    const listeners = new Map<string, Listener[]>()
    return {
      on(event: string, listener: Listener) {
        listeners.set(event, [...(listeners.get(event) ?? []), listener])
        return this
      },
      emit(event: string, ...args: unknown[]) {
        for (const listener of listeners.get(event) ?? []) listener(...args)
      },
    }
  }

  const requester = (scheme: string) => (url: URL, options: RequestOptions, respond: (response: unknown) => void) => {
    const call: Made = { scheme, url, options }
    made.push(call)
    const reply = replies.shift() ?? {}
    let destroyed = false
    const request = Object.assign(emitter(), {
      destroy(error?: Error) {
        destroyed = true
        if (error) request.emit('error', error)
      },
      end() {
        setTimeout(() => {
          // The socket asks the request's own lookup where to connect, as Node's
          // does, in the form for one address and the form for all of them.
          options.lookup?.(url.hostname, {}, (...answer: unknown[]) => {
            call.one = answer
          })
          options.lookup?.(url.hostname, { all: true }, (...answer: unknown[]) => {
            call.all = answer
          })
          if (reply.fails === 'request') {
            request.emit('error', new Error('ECONNREFUSED'))
            return
          }
          const response = Object.assign(emitter(), { statusCode: reply.status, headers: reply.headers ?? {}, resume: () => undefined })
          respond(response)
          if (reply.fails === 'response') {
            response.emit('error', new Error('ECONNRESET'))
            return
          }
          for (const chunk of reply.body ?? []) {
            if (destroyed) return
            response.emit('data', Buffer.from(chunk))
          }
          if (!destroyed) response.emit('end')
        }, 0)
      },
    })
    return request
  }

  return { made, replies, lookup, requester }
})

vi.mock('node:dns/promises', () => ({ lookup: net.lookup }))
vi.mock('node:http', () => ({ request: net.requester('http') }))
vi.mock('node:https', () => ({ request: net.requester('https') }))

// An address anyone can reach, and a page of HTML.
const PUBLIC: LookupAddress = { address: '93.184.216.34', family: 4 }
const HTML = { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } }

afterEach(() => {
  net.made.length = 0
  net.replies.length = 0
  net.lookup.mockReset()
})

describe('readPosting, with no network, KN-486', () => {
  it('reads a page from the address it checked, and hands the socket that address alone', async () => {
    net.lookup.mockResolvedValue([PUBLIC])
    net.replies.push({ ...HTML, body: ['<h1>Frontend', ' developer</h1>'] })
    await expect(readPosting('https://example.com/jobs/1')).resolves.toBe('<h1>Frontend developer</h1>')
    expect(net.lookup).toHaveBeenCalledWith('example.com', { all: true })
    const [call] = net.made
    expect([call?.scheme, call?.url.href]).toEqual(['https', 'https://example.com/jobs/1'])
    expect(call?.options).toMatchObject({ agent: false, headers: { Accept: 'text/html, text/plain' } })
    // What the socket was told is the checked answer, and DNS was asked once.
    expect(call?.one).toEqual([null, PUBLIC.address, PUBLIC.family])
    expect(call?.all).toEqual([null, [PUBLIC]])
    expect(net.lookup).toHaveBeenCalledOnce()
  })

  it('reads plain text over http, from a bracketed address looked up without its brackets', async () => {
    const six: LookupAddress = { address: '2606:4700:4700::1111', family: 6 }
    net.lookup.mockResolvedValue([six])
    net.replies.push({ status: 200, headers: { 'content-type': 'text/plain' }, body: ['Job'] })
    await expect(readPosting('http://[2606:4700:4700::1111]/job')).resolves.toBe('Job')
    expect(net.lookup).toHaveBeenCalledWith('2606:4700:4700::1111', { all: true })
    expect(net.made[0]?.scheme).toBe('http')
  })

  it.each([
    ['a private address among the answers', [PUBLIC, { address: '10.0.0.1', family: 4 }]],
    ['no answer at all', []],
  ])('refuses %s before any request is made', async (_case, answers) => {
    net.lookup.mockResolvedValue(answers)
    await expect(readPosting('https://example.com/job')).rejects.toThrow('INVALID_POSTING_URL')
    expect(net.made).toHaveLength(0)
  })

  it('makes no request once its signal has been aborted', async () => {
    net.lookup.mockResolvedValue([PUBLIC])
    await expect(readPosting('https://example.com/job', 0, AbortSignal.abort())).rejects.toThrow()
    expect(net.made).toHaveLength(0)
  })

  it.each([
    ['a status other than 200', { status: 404, headers: { 'content-type': 'text/html' } }],
    ['a response with no status', { headers: { 'content-type': 'text/html' } }],
    ['a type that is not text', { status: 200, headers: { 'content-type': 'application/json' } }],
    ['a response with no type', { status: 200 }],
  ])('refuses %s', async (_case, reply) => {
    net.lookup.mockResolvedValue([PUBLIC])
    net.replies.push(reply)
    await expect(readPosting('https://example.com/job')).rejects.toThrow('POSTING_UNAVAILABLE')
  })

  it('follows a redirect to a relative location, and checks the address it leads to', async () => {
    net.lookup.mockResolvedValue([PUBLIC])
    net.replies.push({ status: 302, headers: { location: '/jobs/2' } }, { ...HTML, body: ['Moved job'] })
    await expect(readPosting('https://example.com/jobs/1')).resolves.toBe('Moved job')
    expect(net.made.map((call) => call.url.href)).toEqual(['https://example.com/jobs/1', 'https://example.com/jobs/2'])
    expect(net.lookup).toHaveBeenCalledTimes(2)
  })

  it('refuses a redirect to a private address', async () => {
    net.lookup.mockResolvedValueOnce([PUBLIC]).mockResolvedValueOnce([{ address: '169.254.169.254', family: 4 }])
    net.replies.push({ status: 301, headers: { location: 'http://metadata.internal/latest' } })
    await expect(readPosting('https://example.com/job')).rejects.toThrow('INVALID_POSTING_URL')
    expect(net.made).toHaveLength(1)
  })

  it('follows three redirects and refuses a fourth', async () => {
    net.lookup.mockResolvedValue([PUBLIC])
    for (const status of [301, 303, 307, 308]) net.replies.push({ status, headers: { location: '/again' } })
    await expect(readPosting('https://example.com/job')).rejects.toThrow('POSTING_UNAVAILABLE')
    expect(net.made).toHaveLength(4)
  })

  it.each([
    ['no location', { status: 302 }],
    ['a location that is no URL', { status: 302, headers: { location: 'https://exa mple.com/' } }],
  ])('refuses a redirect with %s', async (_case, reply) => {
    net.lookup.mockResolvedValue([PUBLIC])
    net.replies.push(reply)
    await expect(readPosting('https://example.com/job')).rejects.toThrow('POSTING_UNAVAILABLE')
  })

  it('reads a page of exactly two million bytes, and stops at the byte after', async () => {
    net.lookup.mockResolvedValue([PUBLIC])
    net.replies.push({ ...HTML, body: ['a'.repeat(1_000_000), 'b'.repeat(1_000_000)] })
    await expect(readPosting('https://example.com/job')).resolves.toHaveLength(2_000_000)
    net.replies.push({ ...HTML, body: ['a'.repeat(1_000_000), 'b'.repeat(1_000_000), 'c', 'never read'] })
    await expect(readPosting('https://example.com/job')).rejects.toThrow('POSTING_TOO_LARGE')
  })

  it.each([
    ['request', 'ECONNREFUSED'],
    ['response', 'ECONNRESET'],
  ] as const)('passes on an error the %s raises', async (fails, message) => {
    net.lookup.mockResolvedValue([PUBLIC])
    net.replies.push({ ...HTML, fails })
    await expect(readPosting('https://example.com/job')).rejects.toThrow(message)
  })
})
