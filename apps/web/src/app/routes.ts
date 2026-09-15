import { DESTINATION_IDS, type Destination } from '../shared/navigation'

/**
 * Which page the address asks for, KN-505.
 *
 * A path under the site's base: `/KarNama/network` on GitHub Pages, `/network` on
 * a dev server. Pages has no rewrites, but it serves a path from the `.html` file
 * of that name, so the build writes `jobs.html`, `add.html` and `network.html`
 * beside `index.html`, each answering 200, and `404.html` for any other path,
 * which answers 404 with the app, measured on the live site. KN-042 put the page
 * in the hash on the claim that Pages could not serve a deep link, which was
 * false; an address shared from then is read once and replaced by its path.
 */
const isDestination = (value: string): value is Destination => DESTINATION_IDS.some((id) => id === value)

/** The destination a path names under the base, or the board for anything else. */
export const destinationIn = (pathname: string, base: string): Destination => {
  const rest = pathname.startsWith(base) ? pathname.slice(base.length) : ''
  const [asked = ''] = rest.split('/')
  return isDestination(asked) ? asked : 'jobs'
}

/** The address of a destination under the base, as the navigation writes it. */
export const addressOf = (destination: Destination, base: string): string => `${base}${destination}`

/**
 * An address from when the page was in the hash, `#/network?from=a`: the path it
 * names now under the base, the query it carried kept, which lived in the hash
 * rather than in `location.search`; or nothing, when the hash names no page.
 */
export const pathForHash = (hash: string, base: string): string | undefined => {
  const [page = '', query] = hash.replace(/^#\/?/, '').split('?')
  if (!isDestination(page)) return undefined
  return query === undefined ? addressOf(page, base) : `${addressOf(page, base)}?${query}`
}

/**
 * The base as a path, read against the page it was loaded on. The app's build
 * gives an absolute base, `/KarNama/` or `/`, which this leaves as it is. Storybook's
 * builder sets `base: './'` unless KARNAMA_STORYBOOK_BASE names one, and a relative
 * base is no path at all until it is resolved: under `./` the shell would never find
 * its page, while the frame it runs in is `/KarNama/storybook/iframe.html`.
 */
export const siteBase = (configured: string, href: string): string => new URL(configured, href).pathname
