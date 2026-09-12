import { ConfigService } from '@nestjs/config'
import { afterEach, expect, it, vi } from 'vitest'
import { SmsService } from './sms.service.js'

afterEach(() => {
  vi.unstubAllGlobals()
})
const service = new SmsService(new ConfigService({ KAVENEGAR_API_KEY: 'test-key', KAVENEGAR_TEMPLATE: 'login' }))

it('uses the verification template and accepts only successful delivery responses', async () => {
  const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ return: { status: 200 } }))
  vi.stubGlobal('fetch', fetcher)
  await service.send('09123456789', '12345')
  expect(fetcher.mock.calls[0]?.[0]).toBe('https://api.kavenegar.com/v1/test-key/verify/lookup.json')
  const options = fetcher.mock.calls[0]?.[1]
  expect(options?.method).toBe('POST')
  expect(options?.body).toBeInstanceOf(URLSearchParams)
  const body = options?.body
  if (!(body instanceof URLSearchParams)) throw new Error('SMS request must use form data')
  expect(body.toString()).toBe('receptor=09123456789&token=12345&template=login')
})

it.each([Response.json({ return: { status: 401 } }), new Response('', { status: 503 }), Response.json({})])(
  'rejects provider errors without revealing the provider payload',
  async (response) => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(response))
    await expect(service.send('09123456789', '12345')).rejects.toThrow('SMS_DELIVERY_FAILED')
  },
)

it('does not attempt delivery without configuration and handles network failure', async () => {
  const fetcher = vi.fn<typeof fetch>().mockRejectedValue(new Error('network contains secret test-key'))
  vi.stubGlobal('fetch', fetcher)
  await expect(new SmsService(new ConfigService()).send('09123456789', '12345')).rejects.toThrow('SMS_NOT_CONFIGURED')
  expect(fetcher).not.toHaveBeenCalled()
  await expect(service.send('09123456789', '12345')).rejects.toThrow('SMS_DELIVERY_FAILED')
})
