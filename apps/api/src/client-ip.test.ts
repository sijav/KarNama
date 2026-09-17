import type { Request } from 'express'
import { describe, expect, it } from 'vitest'
import { clientIp } from './client-ip.js'

/**
 * The address a rate limit is keyed on, KN-484.
 *
 * Every branch is driven from here rather than through a resolver, because the
 * three call sites that use it should be asserting THAT they use it, not
 * re-proving what it does.
 */
const requestOf = (req: { header?: string | string[]; ip?: string; socket?: { remoteAddress?: string } }): Request =>
  ({
    headers: req.header === undefined ? {} : { 'cf-connecting-ip': req.header },
    ip: req.ip,
    socket: req.socket ?? {},
  }) as unknown as Request

describe('the caller address a limit is keyed on, KN-484', () => {
  it.each([
    [
      'the header Cloudflare writes, over everything else',
      { header: '203.0.113.9', ip: '198.51.100.7', socket: { remoteAddress: '192.0.2.4' } },
      '203.0.113.9',
    ],
    ['the first of a repeated header', { header: ['203.0.113.9', '198.51.100.7'], ip: '192.0.2.4', socket: {} }, '203.0.113.9'],
    ['the request address when no header was written', { ip: '198.51.100.7', socket: { remoteAddress: '192.0.2.4' } }, '198.51.100.7'],
    ["the socket's address when neither is there", { socket: { remoteAddress: '192.0.2.4' } }, '192.0.2.4'],
    ['nothing at all, rather than undefined', { socket: {} }, ''],
  ])('takes %s', (_case, req, address) => {
    expect(clientIp(requestOf(req))).toBe(address)
  })

  it('takes the request address when the header was sent empty, which is not a caller the limit can key on', () => {
    // An empty array is what a header parsed to nothing would give, and an
    // empty string is what a header sent blank would give. Neither identifies
    // anybody, so both fall through rather than keying every blank sender into
    // one bucket.
    expect(clientIp(requestOf({ header: [], ip: '198.51.100.7', socket: {} }))).toBe('198.51.100.7')
  })
})
