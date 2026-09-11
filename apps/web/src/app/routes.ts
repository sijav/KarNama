import { DESTINATIONS, type Destination } from '../shared/navigation'

/**
 * Which page the address bar asks for, KN-042.
 *
 * A hash rather than a path: the site is served from GitHub Pages, which has no
 * server to rewrite a deep link, so `/KarNama/network` would be a 404 while
 * `#/network` is the same document every time. The three destinations are the
 * navigation's own, so a page cannot be reachable by address and missing from
 * the navigation.
 */
const isDestination = (value: string): value is Destination => DESTINATIONS.some((entry) => entry.id === value)

/** The destination an address names, or the board for anything else. */
export const destinationIn = (hash: string): Destination => {
  const asked = hash.replace(/^#\/?/, '').split('?')[0] ?? ''
  return isDestination(asked) ? asked : 'jobs'
}

/** The address of a destination, as the navigation sets it. */
export const addressOf = (destination: Destination): string => `#/${destination}`
