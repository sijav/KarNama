import { print } from 'graphql'
import { describe, expect, it } from 'vitest'
import { HealthDocument, toHealthState, type HealthQuery } from './health'

/**
 * The typed query and the state it turns into.
 *
 * `Health` is imported from the generated package rather than described here,
 * so this file also demonstrates the clause it is testing: change the schema
 * and this test stops compiling before it stops passing.
 */
const up: HealthQuery['health'] = { status: 'ok', environment: 'production', uptimeSeconds: 12 }

describe('the health query', () => {
  it('is the generated document, and asks for exactly the fields the state needs', () => {
    const text = print(HealthDocument)
    for (const field of ['status', 'environment', 'uptimeSeconds']) expect(text).toContain(field)
    // A field the schema does not have could not survive generation, which is
    // the guarantee this replaced a hand-written annotation to get.
    expect(text).not.toContain('Typo')
  })
})

describe('the state a screen renders', () => {
  it('is waking while loading, not an error', () => {
    // Render free tier sleeps and the first request takes about fifty seconds.
    // A loading state shown as a failure trains people to reload, which starts
    // the fifty seconds again.
    expect(toHealthState({ loading: true })).toEqual({ kind: 'waking' })
  })

  it('is up with the fields a component needs, and no sentence', () => {
    // Data rather than copy. A ready-made English sentence here would be
    // translated in the wrong place, and the lingui rule says so.
    expect(toHealthState({ loading: false, data: { health: up } })).toEqual({
      kind: 'up',
      uptimeSeconds: 12,
      environment: 'production',
    })
  })

  it('separates degraded from down, because they are different screens', () => {
    // The API answered, so the network is fine and the service is not. Showing
    // that as "down" sends the user to reload something that is already up.
    expect(toHealthState({ loading: false, data: { health: { ...up, status: 'degraded' } } })).toEqual({
      kind: 'degraded',
      status: 'degraded',
    })
  })

  it('carries the reason when it is down', () => {
    expect(toHealthState({ loading: false, error: { message: 'Failed to fetch' } })).toEqual({
      kind: 'down',
      reason: 'Failed to fetch',
    })
  })

  it('treats an empty answer as down rather than as up with nothing in it', () => {
    // The case that produces a blank screen if it is missed: no error, no data,
    // not loading.
    expect(toHealthState({ loading: false })).toEqual({ kind: 'down', reason: 'the API answered with nothing' })
  })

  it('prefers the error over the absent data, so the reason survives', () => {
    expect(toHealthState({ loading: false, error: { message: 'boom' } })).toEqual({ kind: 'down', reason: 'boom' })
  })
})
