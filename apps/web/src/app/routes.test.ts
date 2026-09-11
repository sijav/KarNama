import { describe, expect, it } from 'vitest'
import { addressOf, destinationIn } from './routes'

describe('the address and the destination', () => {
  it.each([
    ['#/jobs', 'jobs'],
    ['#/add', 'add'],
    ['#/network', 'network'],
    ['#network', 'network'],
    ['#/network?from=a', 'network'],
  ] as const)('reads %s as %s', (hash, destination) => {
    expect(destinationIn(hash)).toBe(destination)
  })

  it.each([
    ['', 'nothing at all'],
    ['#', 'a bare hash'],
    ['#/nowhere', 'a page that does not exist'],
    ['#/JOBS', 'the wrong case'],
  ])('falls back to the board on %s, %s', (hash) => {
    expect(destinationIn(hash)).toBe('jobs')
  })

  it('writes the address the navigation sets', () => {
    expect(addressOf('network')).toBe('#/network')
    expect(destinationIn(addressOf('add'))).toBe('add')
  })
})
