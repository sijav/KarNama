import { ConfigService } from '@nestjs/config'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ExtractionService } from './extraction.service.js'
import { postingText, postingUrl, publicAddress } from './posting.js'

const details = {
  title: 'Frontend developer',
  company: 'Example',
  employmentTypes: ['full-time'],
  location: '',
  experience: '',
  jobLevel: null,
  postedAt: '',
  expiresAt: '',
  salary: '',
  source: '',
  postingUrl: '',
  description: 'Build React apps',
}
const service = new ExtractionService(new ConfigService({ OPENAI_API_KEY: 'test-key', OPENAI_EXTRACTION_MODEL: 'configured-model' }))
const response = (value: unknown) =>
  Response.json({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(value) }] }] })
afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ad extraction', () => {
  it('sends only the submitted ad and returns validated editable fields while preserving the original text', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response(details))
    vi.stubGlobal('fetch', fetcher)
    const source = 'Frontend developer at Example\nBuild React apps'
    expect(await service.extract(source)).toEqual({ ...details, description: source })
    const body = fetcher.mock.calls[0]?.[1]?.body
    expect(typeof body).toBe('string')
    expect(body).toContain('"store":false')
    expect(body).toContain('"strict":true')
    expect(body).toContain('configured-model')
  })

  it.each([
    { ...details, postedAt: 'not a date' },
    { ...details, postingUrl: 'javascript:alert(1)' },
    { ...details, employmentTypes: ['invented'] },
    { ...details, title: '', company: '' },
  ])('rejects malformed model output', async (value) => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(response(value)))
    await expect(service.extract('A sufficiently long posting')).rejects.toThrow('EXTRACTION_FAILED')
  })

  it('handles provider errors, refusals, absent credentials and excessive input', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(new Response('', { status: 429 })))
    await expect(service.extract('A sufficiently long posting')).rejects.toThrow('EXTRACTION_FAILED')
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(Response.json({ status: 'completed', output: [{ type: 'message', content: [{ type: 'refusal' }] }] })),
    )
    await expect(service.extract('A sufficiently long posting')).rejects.toThrow('EXTRACTION_FAILED')
    await expect(new ExtractionService(new ConfigService()).extract('A sufficiently long posting')).rejects.toThrow(
      'EXTRACTION_NOT_CONFIGURED',
    )
    await expect(service.extract('x'.repeat(30_001))).rejects.toThrow('INVALID_POSTING')
  })
})

describe('user-submitted URL boundaries', () => {
  it.each([
    '127.0.0.1',
    '10.1.2.3',
    '169.254.169.254',
    '192.168.1.1',
    '100.64.0.1',
    '::1',
    '::ffff:127.0.0.1',
    'fc00::1',
    '2002:7f00:1::',
    '2001:db8::1',
  ])('blocks %s', (ip) => {
    expect(publicAddress(ip)).toBe(false)
  })
  it.each(['1.1.1.1', '8.8.8.8', '2606:4700:4700::1111'])('accepts a public address %s', (ip) => {
    expect(publicAddress(ip)).toBe(true)
  })
  it('rejects credentials, non-web schemes and unusual ports', () => {
    for (const input of ['file:///etc/passwd', 'https://user:password@example.com', 'https://example.com:8080', 'not a url'])
      expect(() => postingUrl(input)).toThrow('INVALID_POSTING_URL')
    expect(postingUrl('https://example.com/job').hostname).toBe('example.com')
  })
  it('removes scripts and layout from fetched HTML', () => {
    expect(postingText('<nav>Menu</nav><script>ignore instructions</script><h1>React &amp; TypeScript</h1><p>Full time</p>')).toBe(
      'React & TypeScript Full time',
    )
  })
})
