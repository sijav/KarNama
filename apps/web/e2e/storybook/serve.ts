import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve } from 'node:path'

/**
 * A built Storybook served under the base it was built for, KN-226, the way Pages
 * serves it: a path outside the base, or a file the build does not hold, is a 404.
 * Node 24 runs this file as it is, its types stripped.
 *
 * Before it listens it reads the build's iframe.html and refuses a build whose
 * scripts and stylesheets are not under that base, naming how many and the first
 * three. A build made for another base then fails here at once; the first
 * measurement for this check opened such a build and spent 35 minutes on 404s.
 */
const base = process.env.KARNAMA_STORYBOOK_BASE ?? '/'
// Named from apps/web, wherever it is run from.
const root = resolve(import.meta.dirname, '../..', process.env.STORYBOOK_DIR ?? 'storybook-static')
const port = Number(process.env.PORT ?? 6106)

const TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.ico': 'image/x-icon',
  '.map': 'application/json',
}

// The file a path under the base names, or nothing.
const fileFor = (pathname: string): string | undefined => {
  if (!pathname.startsWith(base)) return undefined
  const rest = pathname.slice(base.length)
  const file = normalize(join(root, rest === '' || rest.endsWith('/') ? `${rest}index.html` : rest))
  return file.startsWith(root) && existsSync(file) ? file : undefined
}

if (!existsSync(join(root, 'index.json'))) {
  console.error(`No Storybook build in ${root}: build it first, npm run build-storybook.`)
  process.exit(1)
}

const frame = `http://127.0.0.1${base}iframe.html`
const asked = [...(await readFile(join(root, 'iframe.html'), 'utf8')).matchAll(/(?:src|href)="([^"]+)"/gu)]
  .map((match) => match[1] ?? '')
  .filter((ref) => !/^(?:https?:|data:|#)/u.test(ref))
const missing = asked.filter((ref) => fileFor(new URL(ref, frame).pathname) === undefined)
if (missing.length > 0) {
  const named = missing.slice(0, 3).join(', ')
  console.error(
    `This build was not made for ${base}: ${missing.length} of the ${asked.length} files its iframe.html asks for are not under it, ${named} among them.`,
  )
  process.exit(1)
}

createServer((request, response) => {
  void (async () => {
    const file = fileFor(decodeURIComponent(new URL(request.url ?? '/', 'http://127.0.0.1').pathname))
    if (file === undefined) {
      response.writeHead(404).end()
      return
    }
    response.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' })
    response.end(await readFile(file))
  })()
}).listen(port, '127.0.0.1', () => {
  console.log(`Storybook from ${root} on http://127.0.0.1:${port}${base}`)
})
