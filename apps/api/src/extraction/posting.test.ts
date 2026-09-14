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

/**
 * The chain postingText ran before KN-483, kept as the meaning its scans must
 * keep. Its block and tag patterns take minutes on a hostile page, so it only
 * ever reads the short pages below.
 */
const before = (html: string) =>
  html
    .replace(/&lt;/giu, '<')
    .replace(/&gt;/giu, '>')
    .replace(/<(script|style|nav|footer)\b[^>]*>[\s\S]*?<\/\1\s*>/giu, ' ')
    .replace(/<[^>]+>/gu, ' ')
    .replace(/&nbsp;/giu, ' ')
    .replace(/&amp;/giu, '&')
    .replace(/&quot;/giu, '"')
    .replace(/&#39;/gu, "'")
    .replace(/\s+/gu, ' ')
    .trim()
    .slice(0, 30_000)

// A seeded generator, mulberry32, so a page that fails names itself and comes
// back on the next run.
const seeded = (seed: number) => {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let mixed = Math.imul(state ^ (state >>> 15), state | 1)
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61)
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296
  }
}

// What a page is built from: the pieces the two passes read, in every case the
// patterns' `i` flag treats alike, with `ſ` and the Kelvin sign, which the `u`
// flag folds into word characters.
const PIECES = [
  '<',
  '>',
  '/',
  '<>',
  ' ',
  '\n',
  '\t',
  'a',
  'b',
  '-',
  '"',
  "'",
  '=',
  'ſ',
  'K',
  'script',
  'SCRIPT',
  'Script',
  'ſcript',
  'style',
  'STYLE',
  'nav',
  'NAV',
  'footer',
  'navs',
  'styles',
  '<script',
  '<script>',
  '</script>',
  '</SCRIPT >',
  '</script',
  '<style a="b">',
  '</style>',
  '<nav>',
  '</nav >',
  '<footer>',
  '</footer>',
  '&lt;',
  '&gt;',
  '&amp;',
  '&nbsp;',
  '&quot;',
  '&#39;',
  '&LT;',
  '&lt;/nav&gt;',
  '&lt;script&gt;',
]

const TWO_MILLION = 2_000_000

describe('postingText reads a page once, however it is built, KN-483', () => {
  it('gives what the old patterns gave on twenty thousand generated pages', () => {
    const random = seeded(483)
    const differing: string[] = []
    for (let page = 0; page < 20_000; page += 1) {
      let html = ''
      const pieces = 1 + Math.floor(random() * 40)
      for (let piece = 0; piece < pieces; piece += 1) html += PIECES[Math.floor(random() * PIECES.length)] ?? ''
      if (postingText(html) !== before(html)) differing.push(html)
    }
    expect(differing.slice(0, 5)).toEqual([])
  })

  it.each([
    ['a script followed by a letter that folds to a word character is no block', '<scriptſ>x</script>Job', 'x Job'],
    ['a script followed by the Kelvin sign is no block', '<scriptK>x</script>Job', 'x Job'],
    ['an opening in one case closes in another', '<ſcript>x</SCRIPT >Job', 'Job'],
    ['an unclosed opening, a block inside it and a later block', '<script <style>x</style>Job<nav>menu</nav>', '<script Job'],
    ['an opening with no > anywhere after it', '<p>Job</p><script src=x', 'Job <script src=x'],
    ['a name that never closes, opened again', '<script>a<script>b', 'a b'],
    ['a name that never closes, then another that does', '<nav>a<footer>b</footer>c', 'a c'],
    ['an empty tag', 'a <> b', 'a <> b'],
    ['a one-letter tag', 'a <x> b', 'a b'],
    ['several < before one >', 'a << < b > c', 'a c'],
    ['a < with no > after it', 'Salary < 5000', 'Salary < 5000'],
    ['styles is not style', '<styles>Job</styles>', 'Job'],
  ])('%s', (_case, html, text) => {
    expect(before(html)).toBe(text)
    expect(postingText(html)).toBe(text)
  })

  it.each([
    ['&lt;', '&lt;'.repeat(TWO_MILLION / 4)],
    ['<script with no >', '<script'.repeat(Math.floor(TWO_MILLION / 7))],
    ['<script> that never closes', '<script>'.repeat(TWO_MILLION / 8)],
    ['&lt;nav&gt; that never closes', '&lt;nav&gt;'.repeat(Math.floor(TWO_MILLION / 11))],
    ['one < before letters', `<${'a'.repeat(TWO_MILLION - 1)}`],
    ['<> repeated', '<>'.repeat(TWO_MILLION / 2)],
    ['every opening, and one > at the end', `${'<script<style<nav<footer'.repeat(Math.floor(TWO_MILLION / 24))}>`],
  ])('returns within a second from two million characters of %s', (_shape, html) => {
    const started = performance.now()
    postingText(html)
    expect(performance.now() - started).toBeLessThan(1000)
  })

  it("gives the card's page of &lt; back as the first 30,000 of its <", () => {
    expect(postingText('&lt;'.repeat(TWO_MILLION / 4))).toBe('<'.repeat(30_000))
  })

  it('keeps a posting whose text starts after 60,000 characters of markup', () => {
    const head = '<style>.a{color:red}</style><script>var x = 1;</script>'.repeat(1200)
    expect(head.length).toBeGreaterThan(60_000)
    expect(
      postingText(
        `<html><head>${head}</head><body><nav>Home</nav><h1>Senior Backend Engineer</h1><p>Remote &amp; full time</p></body></html>`,
      ),
    ).toBe('Senior Backend Engineer Remote & full time')
  })
})
