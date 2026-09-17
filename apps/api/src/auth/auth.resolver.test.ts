import type { Request } from 'express'
import 'reflect-metadata'
import { describe, expect, it, vi } from 'vitest'
import { AuthResolver, type RequestContext } from './auth.resolver.js'
import type { AuthService } from './auth.service.js'

/**
 * The auth resolver called directly, KN-486: supertest always gives a request its
 * own address, so the fallbacks to the socket's and to nothing never ran. The
 * service is a stand-in; nothing here reaches a database or an SMS provider.
 *
 * Since KN-484 the address comes from `clientIp`, so these cases are about WHICH
 * address the SMS and verify limits are keyed on, and the header Cloudflare
 * writes comes first. What that helper does with each case is proved beside it,
 * in `client-ip.test.ts`.
 */
const PHONE = '09123456789'

const auth = { requestCode: vi.fn<AuthService['requestCode']>(), verify: vi.fn<AuthService['verify']>() }
const resolver = new AuthResolver(auth as unknown as AuthService)

// A request with only what the resolver reads: the header Cloudflare writes, its
// own address, and its socket's.
const contextOf = (req: { header?: string; ip?: string; socket: { remoteAddress?: string } }): RequestContext => ({
  req: {
    headers: req.header === undefined ? {} : { 'cf-connecting-ip': req.header },
    ip: req.ip,
    socket: req.socket,
  } as unknown as Request,
})

describe('the auth resolver, KN-486 and KN-484', () => {
  it.each([
    [
      'the header Cloudflare wrote, over its own address',
      { header: '203.0.113.9', ip: '198.51.100.7', socket: { remoteAddress: '192.0.2.4' } },
      '203.0.113.9',
    ],
    ['its own address when no header was written', { ip: '198.51.100.7', socket: { remoteAddress: '192.0.2.4' } }, '198.51.100.7'],
    ["its socket's address when it has neither", { socket: { remoteAddress: '192.0.2.4' } }, '192.0.2.4'],
    ['nothing when none of the three is there', { socket: {} }, ''],
  ])('counts a code request and a sign-in against %s', (_case, req, address) => {
    const context = contextOf(req)
    void resolver.requestLoginCode(PHONE, context)
    void resolver.verifyLoginCode(PHONE, '12345', context)
    expect(auth.requestCode).toHaveBeenLastCalledWith(PHONE, address)
    expect(auth.verify).toHaveBeenLastCalledWith(PHONE, '12345', address)
  })
})
