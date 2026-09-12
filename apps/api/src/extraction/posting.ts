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

export const postingText = (html: string) =>
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
