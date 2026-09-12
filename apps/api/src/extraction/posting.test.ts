import { describe, expect, it } from 'vitest'
import { postingText, postingUrl, publicAddress } from './posting.js'

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
  it('reads HTML-escaped posting content without passing layout code to extraction', () => {
    expect(
      postingText(
        '&lt;style&gt;.layout{display:grid}&lt;/style&gt;&lt;nav&gt;Sign in&lt;/nav&gt;&lt;h1&gt;Software Engineer&lt;/h1&gt;&lt;p&gt;Remote &amp; flexible&lt;/p&gt;',
      ),
    ).toBe('Software Engineer Remote & flexible')
  })
})
