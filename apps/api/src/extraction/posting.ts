import { lookup } from 'node:dns/promises'
import { request as httpRequest } from 'node:http'
import { request as httpsRequest } from 'node:https'
import { BlockList, isIP } from 'node:net'
import { fail } from '../auth/errors.js'

const blocked = new BlockList()
for (const [address, prefix] of [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 3],
] satisfies [string, number][])
  blocked.addSubnet(address, prefix, 'ipv4')
const globalV6 = new BlockList()
globalV6.addSubnet('2000::', 3, 'ipv6')
blocked.addSubnet('2001::', 23, 'ipv6')
blocked.addSubnet('2001:db8::', 32, 'ipv6')
blocked.addSubnet('2002::', 16, 'ipv6')
blocked.addSubnet('3fff::', 20, 'ipv6')

export const publicAddress = (address: string) => {
  const family = isIP(address)
  return family === 4 ? !blocked.check(address, 'ipv4') : family === 6 && globalV6.check(address, 'ipv6') && !blocked.check(address, 'ipv6')
}

export const postingUrl = (source: string) => {
  let url: URL
  try {
    url = new URL(source)
  } catch {
    return fail('INVALID_POSTING_URL')
  }
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.port) return fail('INVALID_POSTING_URL')
  return url
}

// Pin the checked DNS answer to the socket; checking before ordinary fetch permits DNS rebinding.
export const readPosting = async (source: string, redirects = 0, signal = AbortSignal.timeout(15_000)): Promise<string> => {
  const url = postingUrl(source)
  const hostname = url.hostname.replace(/^\[|\]$/gu, '')
  const addresses = await lookup(hostname, { all: true })
  const address = addresses[0]
  if (!address || addresses.some((entry) => !publicAddress(entry.address))) return fail('INVALID_POSTING_URL')
  signal.throwIfAborted()
  return new Promise((resolve, reject) => {
    const request = (url.protocol === 'https:' ? httpsRequest : httpRequest)(
      url,
      {
        signal,
        agent: false,
        headers: { Accept: 'text/html, text/plain', 'User-Agent': 'KarNama/1.0 (user-submitted job posting)' },
        lookup: (_host, options, callback) => {
          if (options.all) callback(null, [address])
          else callback(null, address.address, address.family)
        },
      },
      (response) => {
        const status = response.statusCode ?? 0
        if ([301, 302, 303, 307, 308].includes(status)) {
          response.resume()
          if (redirects >= 3 || !response.headers.location) {
            reject(new Error('POSTING_UNAVAILABLE'))
            return
          }
          try {
            void readPosting(new URL(response.headers.location, url).href, redirects + 1, signal).then(resolve, reject)
          } catch {
            reject(new Error('POSTING_UNAVAILABLE'))
          }
          return
        }
        if (status !== 200 || !/^text\/(html|plain)(?:;|$)/iu.test(response.headers['content-type'] ?? '')) {
          response.resume()
          reject(new Error('POSTING_UNAVAILABLE'))
          return
        }
        const chunks: Buffer[] = []
        let size = 0
        response.on('data', (chunk: Buffer) => {
          size += chunk.length
          if (size > 2_000_000) request.destroy(new Error('POSTING_TOO_LARGE'))
          else chunks.push(chunk)
        })
        response.on('error', reject)
        response.on('end', () => {
          resolve(Buffer.concat(chunks).toString('utf8'))
        })
      },
    )
    request.on('error', reject)
    request.end()
  })
}

// A page reaches postingText at up to two million characters, and every pass
// here reads it once, however it is built. The block and tag passes used to be
// the patterns <(script|style|nav|footer)\b[^>]*>[\s\S]*?<\/\1\s*> and
// <[^>]+>, which start again at every `<` and read on to the end of the page
// whenever nothing closes what they found: two million characters of `&lt;`
// took a minute of the API's one process, and `<script` repeated five, KN-483.
// Cutting the page first would have been quicker to write and would have cut
// markup rather than text, losing a posting that starts deep in its page. The
// scans below keep the patterns' meaning exactly, which posting.test.ts checks
// against the patterns themselves on generated pages.

// The blocks the extraction never needs, in the order the opening lists them,
// so the group a match filled names its block.
const BLOCKS = ['script', 'style', 'nav', 'footer'] as const
type Block = (typeof BLOCKS)[number]
const OPENING = /<(?:(script)|(style)|(nav)|(footer))\b/giu
const CLOSING: Record<Block, RegExp> = {
  script: /<\/script\s*>/giu,
  style: /<\/style\s*>/giu,
  nav: /<\/nav\s*>/giu,
  footer: /<\/footer\s*>/giu,
}
const blockOf = (open: RegExpExecArray) =>
  BLOCKS.reduce<Block>((found, block, at) => (open[at + 1] === undefined ? found : block), 'script')

// A block runs from its opening's `>` to the first closing tag of its own name
// after it, and becomes one space. Each search goes on from where the last one
// ended, and the one that can read to the end of the page, a closing tag that
// never comes, happens once a name: no later opening of it can close either.
const withoutBlocks = (html: string) => {
  const kept: string[] = []
  const unclosed = new Set<Block>()
  let from = 0
  OPENING.lastIndex = 0
  for (let open = OPENING.exec(html); open !== null; open = OPENING.exec(html)) {
    const block = blockOf(open)
    if (unclosed.has(block)) {
      OPENING.lastIndex = open.index + 1
      continue
    }
    // No `>` left means no opening can end, this one or any after it.
    const end = html.indexOf('>', OPENING.lastIndex)
    if (end === -1) break
    const closing = CLOSING[block]
    closing.lastIndex = end + 1
    const close = closing.exec(html)
    if (close === null) {
      // The opening stays, as the pattern left it, and the search goes on
      // inside it, where the pattern would have looked next.
      unclosed.add(block)
      OPENING.lastIndex = open.index + 1
      continue
    }
    kept.push(html.slice(from, open.index), ' ')
    from = close.index + close[0].length
    OPENING.lastIndex = from
  }
  kept.push(html.slice(from))
  return kept.join('')
}

// A tag runs from a `<` to the first `>` after it and becomes one space; `<>`
// is not one, because the pattern wanted a character between. With no `>`
// after a `<`, there is none after any later `<` either, so the rest stays.
const withoutTags = (html: string) => {
  const kept: string[] = []
  let from = 0
  for (let at = html.indexOf('<'); at !== -1;) {
    const end = html.indexOf('>', at + 1)
    if (end === -1) break
    if (end === at + 1) {
      at = html.indexOf('<', end)
      continue
    }
    kept.push(html.slice(from, at), ' ')
    from = end + 1
    at = html.indexOf('<', from)
  }
  kept.push(html.slice(from))
  return kept.join('')
}

export const postingText = (html: string) =>
  withoutTags(withoutBlocks(html.replace(/&lt;/giu, '<').replace(/&gt;/giu, '>')))
    .replace(/&nbsp;/giu, ' ')
    .replace(/&amp;/giu, '&')
    .replace(/&quot;/giu, '"')
    .replace(/&#39;/gu, "'")
    .replace(/\s+/gu, ' ')
    .trim()
    .slice(0, 30_000)
