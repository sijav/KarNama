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
 *
 * Since KN-484 two more things are proved here. The address is the header
 * Cloudflare writes rather than the one Express derives, and a posting the
 * service would refuse is refused BEFORE anything is counted, because
 * `auth.limit` counts and checks in one statement and there is no refund.
 */
const auth = { account: vi.fn<AuthService['account']>(), limit: vi.fn<AuthService['limit']>() }
const extraction = { extract: vi.fn<ExtractionService['extract']>() }
const resolver = new ExtractionResolver(
  auth as unknown as AuthService,
  extraction as unknown as ExtractionService,
  new ConfigService({ ALLOW_DEMO_EXTRACTION: 'true' }),
)

// A request with only what the resolver reads: the header Cloudflare writes, its
// own address, its socket's, and the authorization header.
const contextOf = (req: { header?: string; ip?: string; socket: { remoteAddress?: string }; authorization?: string }): RequestContext => ({
  req: {
    headers: {
      ...(req.header === undefined ? {} : { 'cf-connecting-ip': req.header }),
      ...(req.authorization === undefined ? {} : { authorization: req.authorization }),
    },
    ip: req.ip,
    socket: req.socket,
  } as unknown as Request,
})

const POSTING = 'A job posting'

describe('the extraction resolver, KN-486 and KN-484', () => {
  it.each([
    [
      'the header Cloudflare wrote, over its own address',
      { header: '203.0.113.9', ip: '198.51.100.7', socket: { remoteAddress: '192.0.2.4' } },
      '203.0.113.9',
    ],
    ['its own address when no header was written', { ip: '198.51.100.7', socket: { remoteAddress: '192.0.2.4' } }, '198.51.100.7'],
    ["its socket's address when it has neither", { socket: { remoteAddress: '192.0.2.4' } }, '192.0.2.4'],
    ['nothing when none of the three is there', { socket: {} }, ''],
  ])('counts demo extraction against %s, and against everyone', async (_case, req, address) => {
    auth.limit.mockClear()
    await resolver.extractJob(POSTING, contextOf(req))
    expect(auth.limit.mock.calls).toEqual([
      [`extract-demo:${address}`, 10],
      ['extract-demo:global', 20],
    ])
    expect(extraction.extract).toHaveBeenLastCalledWith(POSTING)
  })

  it('counts extraction by a signed-in account against that account', async () => {
    auth.limit.mockClear()
    auth.account.mockResolvedValue({ id: 'account-1', phone: '09123456789', name: 'Sara', since: '2026-09-15T00:00:00.000Z' })
    await resolver.extractJob(POSTING, contextOf({ socket: {}, authorization: 'Bearer a-token' }))
    expect(auth.account).toHaveBeenCalledWith('a-token')
    expect(auth.limit.mock.calls).toEqual([['extract:account-1', 20]])
    expect(extraction.extract).toHaveBeenLastCalledWith(POSTING)
  })

  it.each([
    ['too short to be a posting', 'x'],
    ['whitespace around something too short', '   short   '],
    ['longer than the service will read', 'x'.repeat(30_001)],
  ])('refuses a source %s without counting it or reaching the service', async (_case, source) => {
    auth.limit.mockClear()
    extraction.extract.mockClear()
    await expect(resolver.extractJob(source, contextOf({ header: '203.0.113.9', socket: {} }))).rejects.toThrow('INVALID_POSTING')
    // The point of the card: a source the service would refuse used to spend one
    // of ten an hour on its way to being refused.
    expect(auth.limit).not.toHaveBeenCalled()
    expect(extraction.extract).not.toHaveBeenCalled()
  })

  it('answers a bad token with UNAUTHENTICATED even when the source is also too short', async () => {
    auth.limit.mockClear()
    extraction.extract.mockClear()
    auth.account.mockRejectedValueOnce(new Error('UNAUTHENTICATED'))
    // Authentication is resolved first on purpose. The other order would tell a
    // caller their posting was the problem when their token was.
    await expect(resolver.extractJob('x', contextOf({ socket: {}, authorization: 'Bearer bad' }))).rejects.toThrow('UNAUTHENTICATED')
    expect(auth.limit).not.toHaveBeenCalled()
    expect(extraction.extract).not.toHaveBeenCalled()
  })
})
