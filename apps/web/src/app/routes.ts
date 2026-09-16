import { DESTINATION_IDS, type Destination } from '../shared/navigation'

/**
 * What the router cannot do for us, KN-698.
 *
 * `destinationIn` and `addressOf` lived here and are gone: react-router reads the
 * address and writes it, which is the whole point of taking a library. What is
 * left is the three things it has no opinion about: which path each destination
 * answers to, an address from when the page was in the hash, and the base.
 */

/**
 * The path each destination answers to, under the base the router carries as its
 * basename.
 *
 * Every router is told its paths; this says them once. The mapped type ties each
 * to its own key, so a destination added with no route, or a route pointed at the
 * wrong page, is a type error rather than a page that quietly falls through to the
 * board.
 *
 * Named rather than written at each `<Route>` for a second reason. A bare `/add`
 * in a prop is an address and not copy, but the string rule cannot tell, and
 * exempting the NAME `path` would exempt it in every file, which is the hole
 * KN-095 closed for `title`. A literal typed as a union of string literals is
 * skipped instead, which is that fix, reused.
 */
export const PATH: { [D in Destination]: `/${D}` } = { jobs: '/jobs', add: '/add', network: '/network' }

const isDestination = (value: string): value is Destination => DESTINATION_IDS.some((id) => id === value)

/**
 * An address from when the page was in the hash, `#/network?from=a`: the path it
 * names now under the base, the query it carried kept, which lived in the hash
 * rather than in `location.search`; or nothing, when the hash names no page.
 *
 * KN-042 put the page in the hash on the claim that Pages could not serve a deep
 * link, which was false; an address shared from then is read once and replaced by
 * its path, KN-505. **This must run before the router is constructed**, because
 * `history.replaceState` fires no `popstate` and a router that has already read
 * its initial location would go on routing the old one.
 */
export const pathForHash = (hash: string, base: string): string | undefined => {
  const [page = '', query] = hash.replace(/^#\/?/, '').split('?')
  if (!isDestination(page)) return undefined
  return query === undefined ? `${base}${page}` : `${base}${page}?${query}`
}

/**
 * The base as a path, read against the page it was loaded on, and handed to the
 * router as its basename.
 *
 * The app's build gives an absolute base, `/KarNama/` or `/`, which this leaves as
 * it is. Storybook's builder sets `base: './'` unless KARNAMA_STORYBOOK_BASE names
 * one, and a relative base is no path at all until it is resolved: under `./` the
 * shell would never find its page, while the frame it runs in is
 * `/KarNama/storybook/iframe.html`.
 */
export const siteBase = (configured: string, href: string): string => new URL(configured, href).pathname
