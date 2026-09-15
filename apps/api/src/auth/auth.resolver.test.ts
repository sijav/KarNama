import type { Request } from 'express'
import 'reflect-metadata'
import { describe, expect, it, vi } from 'vitest'
import { AuthResolver, type RequestContext } from './auth.resolver.js'
import type { AuthService } from './auth.service.js'

/**
 * The auth resolver called directly, KN-486: supertest always gives a request its
 * own address, so the fallbacks to the socket's and to nothing never ran. The
 * service is a stand-in; nothing here reaches a database or an SMS provider.
 */
const PHONE = '09123456789'

const auth = { requestCode: vi.fn<AuthService['requestCode']>(), verify: vi.fn<AuthService['verify']>() }
const resolver = new AuthResolver(auth as unknown as AuthService)

// A request with only what the resolver reads: its address and its socket's.
const contextOf = (req: { ip?: string; socket: { remoteAddress?: string } }): RequestContext => ({
  req: { ip: req.ip, socket: req.socket, headers: {} } as unknown as Request,
})

describe('the auth resolver, KN-486', () => {
  it.each([
    ['its own address', { ip: '203.0.113.9', socket: { remoteAddress: '198.51.100.7' } }, '203.0.113.9'],
    ["its socket's address when it has none", { socket: { remoteAddress: '198.51.100.7' } }, '198.51.100.7'],
    ['nothing when neither has one', { socket: {} }, ''],
  ])('counts a code request and a sign-in against %s', (_case, req, address) => {
    const context = contextOf(req)
    void resolver.requestLoginCode(PHONE, context)
    void resolver.verifyLoginCode(PHONE, '12345', context)
    expect(auth.requestCode).toHaveBeenLastCalledWith(PHONE, address)
    expect(auth.verify).toHaveBeenLastCalledWith(PHONE, '12345', address)
  })
})
