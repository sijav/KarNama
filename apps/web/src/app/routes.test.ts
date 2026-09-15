import { describe, expect, it } from 'vitest'
import { DESTINATION_IDS, DESTINATIONS } from '../shared/navigation'
import { addressOf, destinationIn, pathForHash, siteBase } from './routes'

describe('the address and the destination', () => {
  it.each([
    ['/jobs', '/', 'jobs'],
    ['/add', '/', 'add'],
    ['/network', '/', 'network'],
    ['/KarNama/network', '/KarNama/', 'network'],
    ['/KarNama/network/', '/KarNama/', 'network'],
    ['/KarNama/add', '/KarNama/', 'add'],
  ] as const)('reads %s under %s as %s', (pathname, base, destination) => {
    expect(destinationIn(pathname, base)).toBe(destination)
  })

  it.each([
    ['/', '/', 'the base alone'],
    ['/KarNama/', '/KarNama/', 'the base alone on Pages'],
    ['/nowhere', '/', 'a page that does not exist'],
    ['/JOBS', '/', 'the wrong case'],
    ['/network', '/KarNama/', 'a path outside the base'],
    ['/iframe.html', '/', "Storybook's frame"],
  ])('falls back to the board on %s under %s, %s', (pathname, base) => {
    expect(destinationIn(pathname, base)).toBe('jobs')
  })

  it('writes the address the navigation sets, under the base', () => {
    expect(addressOf('network', '/')).toBe('/network')
    expect(addressOf('network', '/KarNama/')).toBe('/KarNama/network')
    expect(destinationIn(addressOf('add', '/KarNama/'), '/KarNama/')).toBe('add')
  })

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
