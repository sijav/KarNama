import { z } from 'zod'

/**
 * Configuration, validated once, at startup.
 *
 * The exit condition of this task names the behaviour: a missing required
 * variable fails AT STARTUP with a clear message, not at the first request that
 * happens to need it. The difference matters on Render's free tier, where the
 * first request arrives after a fifty second cold start and a config error
 * there looks like a timeout to whoever is watching.
 *
 * `zod` rather than `class-validator` for this one job. The env is a plain
 * object, not a class, and a schema that parses it into a typed value is the
 * whole requirement; a validated class would need a class to exist first.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  /** The port to listen on. A string in the environment, a number here. */
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),

  /**
   * Where the web app is served from, for CORS. Required, and required with no
   * default ON PURPOSE: a default here is a permissive CORS policy that nobody
   * notices until it is in production.
   */
  // The message is given as `error` and not only as the `min` message, because
  // a MISSING key raises an invalid_type issue, not a too_small one, and the
  // min message never fires for it. That is the whole case this schema is for,
  // and it took a failing test to notice: the message said "expected string,
  // received undefined", which is true and useless.
  WEB_ORIGIN: z
    .string({ error: 'WEB_ORIGIN is required: the origin the web app is served from, used for CORS' })
    .min(1, 'WEB_ORIGIN is required: the origin the web app is served from, used for CORS'),

  /**
   * Postgres. Not used yet, and still required, because a server that starts
   * without a database and fails on the first query is the failure mode this
   * whole file exists to prevent.
   */
  DATABASE_URL: z
    .string({ error: 'DATABASE_URL is required: the Postgres connection string' })
    .min(1, 'DATABASE_URL is required: the Postgres connection string'),
})

export type Env = z.infer<typeof envSchema>

/**
 * Parses and explains. The message names every missing variable at once rather
 * than the first one, because a deploy that fails four times in a row, once per
 * variable, is four cold starts and a lost afternoon.
 */
export const parseEnv = (source: Record<string, string | undefined>): Env => {
  const result = envSchema.safeParse(source)
  if (result.success) return result.data

  // No `|| '(root)'` fallback. The schema is an object schema, so every issue
  // carries the key it is about, and a fallback for a case that cannot arise is
  // a branch no test can reach: unreachable code that coverage is right to
  // refuse to call covered.
  const problems = result.error.issues.map((issue) => `  ${issue.path.join('.')}: ${issue.message}`).join('\n')
  throw new Error(`The API cannot start, ${result.error.issues.length} configuration problem(s):\n${problems}`)
}
