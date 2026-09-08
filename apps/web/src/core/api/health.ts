import { gql, type TypedDocumentNode } from '@apollo/client'
import type { Query } from '@karnama/graphql'

/**
 * The health query, typed by the GENERATED contract.
 *
 * `Health` and `Query` come from `@karnama/graphql`, which is generated from
 * `apps/api/schema.gql`, which is generated from the resolvers. Nothing here
 * describes the shape again: a hand-written interface would look identical the
 * day it was written and would stop moving when the schema did, which is
 * exactly the drift the monorepo exists to prevent.
 *
 * Change `uptimeSeconds` to a string on the server and this file stops
 * compiling, which is the whole guarantee.
 */
export type HealthQueryData = Pick<Query, 'health'>

export const HEALTH_QUERY: TypedDocumentNode<HealthQueryData, Record<string, never>> = gql`
  query Health {
    health {
      status
      environment
      uptimeSeconds
    }
  }
`

/**
 * Render-ready state for a cold start.
 *
 * Render's free tier sleeps, so the first request after an idle period takes
 * about fifty seconds. `waking` is not an error and must not be shown as one:
 * DESIGN.md calls for an honest loading state rather than a spinner that looks
 * identical to a hang.
 *
 * Data, not copy. An earlier version returned a ready-made English sentence and
 * the lingui rule rejected it, correctly: a module under `core` that produces
 * user-facing text is a module that will be translated in the wrong place. The
 * component renders these fields through the catalog.
 *
 * `reason` is the exception and is not ours: it is whatever the network said,
 * which cannot be translated because it was not written here.
 */
export type HealthState =
  | { readonly kind: 'waking' }
  | { readonly kind: 'up'; readonly uptimeSeconds: number; readonly environment: string }
  | { readonly kind: 'degraded'; readonly status: string }
  | { readonly kind: 'down'; readonly reason: string }

export const toHealthState = (input: { loading: boolean; data?: HealthQueryData; error?: { message: string } }): HealthState => {
  if (input.loading) return { kind: 'waking' }
  if (input.error) return { kind: 'down', reason: input.error.message }
  if (!input.data) return { kind: 'down', reason: 'the API answered with nothing' }
  const { health } = input.data
  if (health.status !== 'ok') return { kind: 'degraded', status: health.status }
  return { kind: 'up', uptimeSeconds: health.uptimeSeconds, environment: health.environment }
}
