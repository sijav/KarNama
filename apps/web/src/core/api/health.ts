import { HealthDocument, type HealthQuery } from '@karnama/graphql'

/**
 * The health query, and the state a screen renders from it.
 *
 * `HealthDocument` and `HealthQuery` are GENERATED together from the operation
 * in `packages/graphql/src/operations/health.graphql`, which codegen validates
 * against the schema. Nothing here writes a query or describes a response.
 *
 * That matters more than it looks. This file used to hold a `gql` template with
 * a hand-written `TypedDocumentNode` annotation, so a misspelled field
 * typechecked and was rejected by the server at runtime, and the response type
 * claimed the whole `Health` object rather than the three fields selected.
 * Both are impossible now: the document and its type come from the same
 * generation, and the type is the SELECTION.
 */
export { HealthDocument, type HealthQuery }

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

export const toHealthState = (input: { loading: boolean; data?: HealthQuery; error?: { message: string } }): HealthState => {
  if (input.loading) return { kind: 'waking' }
  if (input.error) return { kind: 'down', reason: input.error.message }
  if (!input.data) return { kind: 'down', reason: 'the API answered with nothing' }
  const { health } = input.data
  if (health.status !== 'ok') return { kind: 'degraded', status: health.status }
  return { kind: 'up', uptimeSeconds: health.uptimeSeconds, environment: health.environment }
}
