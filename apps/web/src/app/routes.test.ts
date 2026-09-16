import { describe, expect, it } from 'vitest'
import { DESTINATION_IDS, DESTINATIONS } from '../shared/navigation'
import { pathForHash, siteBase } from './routes'

/**
 * What is left of `routes.ts` once react-router owns the addresses, KN-698.
 *
 * `destinationIn` and `addressOf` are gone, and their cases with them: reading a
 * path and writing one are the router's work now, and `addresses.spec.ts` holds
 * it to that end to end. These two are what the router has no opinion about.
 */
describe('the address and the destination', () => {
  it.each([
    ['#/network', '/KarNama/', '/KarNama/network'],
    ['#network', '/', '/network'],
    ['#/add?from=a', '/', '/add?from=a'],
    ['#/jobs', '/KarNama/', '/KarNama/jobs'],
  ] as const)('sends the old %s under %s to %s', (hash, base, path) => {
    expect(pathForHash(hash, base)).toBe(path)
  })

  it.each(['', '#', '#/nowhere', '#/JOBS', '#section'])('leaves the hash %j alone, since it names no page', (hash) => {
    expect(pathForHash(hash, '/')).toBeUndefined()
  })

  it.each([
    ['/KarNama/', 'https://sijav.github.io/KarNama/network?from=a', '/KarNama/', "the app's, on Pages"],
    ['/', 'http://localhost:4173/add', '/', "the app's, on a server of its own"],
    ['./', 'https://sijav.github.io/KarNama/storybook/iframe.html?id=app-shell--persian', '/KarNama/storybook/', "a Storybook build's"],
    ['./', 'https://sijav.github.io/KarNama/storybook/network', '/KarNama/storybook/', 'the same, once the shell pushed a page'],
  ])('reads the base %s on %s as %s, %s', (configured, href, base) => {
    expect(siteBase(configured, href)).toBe(base)
  })

  it('knows the pages the navigation draws, so the build writes one for each', () => {
    expect(DESTINATIONS.map((destination) => destination.id)).toEqual([...DESTINATION_IDS])
  })
})
