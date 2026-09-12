import { AuthResolver } from '../auth/auth.resolver.js'
import { ExtractionResolver } from '../extraction/extraction.resolver.js'
import { HealthResolver } from '../health/health.resolver.js'

/**
 * Every resolver, in one list.
 *
 * The schema generator builds from THIS, and the Nest modules register from it
 * too, so a resolver cannot be in the running server and missing from the
 * generated schema. Without a single list those are two places to remember, and
 * the symptom of forgetting one is a client type that does not exist for a
 * field that does.
 *
 * `resolvers.test.ts` checks that every `*.resolver.ts` file under `src` is
 * represented here, so adding a resolver and forgetting this list is a test
 * failure rather than a missing field nobody notices until a query fails.
 */
export const resolvers = [HealthResolver, AuthResolver, ExtractionResolver] as const

export type ResolverClass = (typeof resolvers)[number]
