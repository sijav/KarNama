import { ConfigService } from '@nestjs/config'
import type { Request } from 'express'
import 'reflect-metadata'
import { describe, expect, it, vi } from 'vitest'
import type { RequestContext } from '../auth/auth.resolver.js'
import type { AuthService } from '../auth/auth.service.js'
import { ExtractionResolver } from './extraction.resolver.js'
import type { ExtractionService } from './extraction.service.js'

/**
 * The extraction resolver called directly, KN-486: which limits a request is
 * counted against, as a demo reader by its address or as a signed-in account.
 * Both services are stand-ins, the extraction among them, so nothing here reaches
 * a database or an AI provider.
 */
const auth = { account: vi.fn<AuthService['account']>(), limit: vi.fn<AuthService['limit']>() }
const extraction = { extract: vi.fn<ExtractionService['extract']>() }
const resolver = new ExtractionResolver(
  auth as unknown as AuthService,
  extraction as unknown as ExtractionService,
  new ConfigService({ ALLOW_DEMO_EXTRACTION: 'true' }),
)

// A request with only what the resolver reads: its address, its socket's, and
// the authorization header.
const contextOf = (req: { ip?: string; socket: { remoteAddress?: string }; authorization?: string }): RequestContext => ({
  req: {
    ip: req.ip,
    socket: req.socket,
    headers: req.authorization === undefined ? {} : { authorization: req.authorization },
  } as unknown as Request,
})

describe('the extraction resolver, KN-486', () => {
  it.each([
    ['its own address', { ip: '203.0.113.9', socket: { remoteAddress: '198.51.100.7' } }, '203.0.113.9'],
    ["its socket's address when it has none", { socket: { remoteAddress: '198.51.100.7' } }, '198.51.100.7'],
    ['nothing when neither has one', { socket: {} }, ''],
  ])('counts demo extraction against %s, and against everyone', async (_case, req, address) => {
    auth.limit.mockClear()
    await resolver.extractJob('A job posting', contextOf(req))
    expect(auth.limit.mock.calls).toEqual([
      [`extract-demo:${address}`, 10],
      ['extract-demo:global', 20],
    ])
    expect(extraction.extract).toHaveBeenLastCalledWith('A job posting')
  })

  it('counts extraction by a signed-in account against that account', async () => {
    auth.limit.mockClear()
    auth.account.mockResolvedValue({ id: 'account-1', phone: '09123456789', name: 'Sara', since: '2026-09-15T00:00:00.000Z' })
    await resolver.extractJob('A job posting', contextOf({ socket: {}, authorization: 'Bearer a-token' }))
    expect(auth.account).toHaveBeenCalledWith('a-token')
    expect(auth.limit.mock.calls).toEqual([['extract:account-1', 20]])
    expect(extraction.extract).toHaveBeenLastCalledWith('A job posting')
  })
})
