import { describe, expect, it } from 'vitest'
import { DESTINATION_IDS, DESTINATIONS } from '../shared/navigation'
import { pathForHash, searchStep, siteBase } from './routes'

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

/**
 * What a settled search does to the address, KN-697. Proved here rather than in a
 * story because the decision is only reachable through the Search Bar's 300 ms
 * pause, which no story can time reliably; as a function every case is exact.
 */
describe('the step a settled search makes in the address', () => {
  const stepFor = (held: string, search: string, text: string) => {
    const made = searchStep(new URLSearchParams(held), search, text)
    return [made.params.toString(), made.replace]
  }

  it.each([
    ['', '', 'ab', 'q=ab', false, 'starting a search is a step, so Back returns the page unsearched'],
    ['q=ab', 'ab', 'abc', 'q=abc', true, 'refining one is not, or a word would leave an entry for every pause'],
    ['q=abc', 'abc', '', '', false, 'ending one is a step again, so Back undoes the clear'],
    ['', '', '', '', true, 'and a settled value that changes nothing writes the same address, adding no entry'],
    ['q=ab', 'ab', 'ab', 'q=ab', true, 'which is the same when a search is already running'],
    ['from=a', '', 'ab', 'from=a&q=ab', false, 'and whatever else the address carries is kept'],
  ])('%j searching %j, settling on %j, writes %j, replacing %j: %s', (held, search, text, written, replaced) => {
    expect(stepFor(held, search, text)).toEqual([written, replaced])
  })
})
