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
 * Every router is told its paths; this says them once.
 *
 * **What the mapped type enforces**, asked of the compiler rather than assumed,
 * KN-701: an entry for EVERY destination, and each entry's value being its own
 * key's path. So a destination added without an entry is a type error, and
 * `{ jobs: '/network' }` is one too.
 *
 * **What it does NOT enforce**: that a `<Route>` exists for a destination, or which
 * element a route renders. A destination with an entry and no route compiles, and
 * the wildcard route in `App.tsx` then draws the board for it. **The type permits
 * the gap; the ROUTE decides what a reader sees in it.** This comment used to say
 * the type caught both, which it never did.
 *
 * Named rather than written at each `<Route>` for a second reason. A bare `/add`
 * in a prop is an address and not copy, but the string rule cannot tell, and
 * exempting the NAME `path` would exempt it in every file, which is the hole
 * KN-095 closed for `title`. A literal typed as a union of string literals is
 * skipped instead, which is that fix, reused.
 */
export const PATH: { [D in Destination]: `/${D}` } = { jobs: '/jobs', add: '/add', network: '/network' }

/**
 * The name the search goes under in the address, `/jobs?q=…`, KN-697.
 *
 * Typed rather than written as a bare literal for the same reason `PATH` is: an
 * address token is not copy, and a literal typed as a union of string literals is
 * what `useTsTypes` skips.
 *
 * **The screens import this, which is the first thing in `src/screens` to import
 * from `src/app`.** No rule forbids it and it makes no module cycle — this file
 * imports `shared/navigation` and nothing else — and the screens already read the
 * address through the router, so one token from the module that owns addresses
 * adds no coupling that was not already there. The alternative was a copy in each
 * screen, which is two places to disagree about one name.
 */
type QueryName = 'q'

export const QUERY: QueryName = 'q'

/**
 * The step a settled search makes in the address, KN-697: the parameters to write
 * and whether writing them should REPLACE the current entry or add one.
 *
 * A step for starting a search and a step for ending one, replacement for every
 * refinement in between. Replacing everywhere would leave no entry for the
 * unsearched page, so Back would leave the page rather than return to it; pushing
 * everywhere would add a step for every pause while a word is typed.
 *
 * **A settled value that changes nothing replaces too.** The bar hands over the
 * text after the pause, and typing a letter then deleting it before the pause
 * settles arrives here with the search it already had; writing the same address
 * again over the current entry adds nothing, where pushing it would leave a
 * duplicate entry and Back would appear to do nothing.
 *
 * Here rather than in each screen for two reasons: the board and the contacts page
 * had byte-identical copies of it, and a decision made in a screen can only be
 * reached through a 300 ms pause, which no story can time reliably. As a function
 * it is proved by `routes.test.ts` with no clock at all.
 */
export const searchStep = (params: URLSearchParams, search: string, text: string): { params: URLSearchParams; replace: boolean } => {
  const next = new URLSearchParams(params)
  if (text === '') next.delete(QUERY)
  else next.set(QUERY, text)
  return { params: next, replace: text === search || (search !== '' && text !== '') }
}

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
