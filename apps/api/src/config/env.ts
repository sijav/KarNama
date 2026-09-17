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
export const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    AUTH_SECRET: z.string().min(32).optional(),
    KAVENEGAR_API_KEY: z.string().min(1).optional(),
    KAVENEGAR_TEMPLATE: z.string().min(1).optional(),
    OPENAI_API_KEY: z.string().min(1).optional(),
    OPENAI_EXTRACTION_MODEL: z.string().min(1).optional(),
    // No default, and that absence is load bearing, KN-485. A default is applied
    // DURING parsing, so the refinement below would read `openai` whether anyone
    // chose it or not, and "the provider was never chosen" would be a state no
    // rule could ever see. Nothing downstream loses the fallback: both readers
    // already carry their own, `extraction.service.ts` by treating anything that
    // is not groq as OpenAI, and `health.resolver.ts` by `?? 'openai'`.
    EXTRACTION_PROVIDER: z.enum(['openai', 'groq']).optional(),
    GROQ_API_KEY: z.string().min(1).optional(),
    GROQ_EXTRACTION_MODEL: z.string().min(1).default('openai/gpt-oss-120b'),
    ALLOW_DEMO_EXTRACTION: z.enum(['true', 'false']).default('false'),
    TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(5).default(0),

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
  /**
   * Demo extraction needs a secret, a provider and that provider's credentials,
   * and a process missing any of them starts anyway and fails every extraction,
   * KN-485. The owner diagnosed exactly that by hand, from a phone.
   *
   * Each problem is attached to the KEY it is about rather than to the object,
   * because `parseEnv` prints `issue.path` and an issue with an empty path
   * would print a bare `: message`. A refusal that cannot name the variable to
   * set is a refusal that costs another deploy to understand.
   */
  .superRefine((env, ctx) => {
    if (env.ALLOW_DEMO_EXTRACTION !== 'true') return
    const missing = (key: string, message: string) => {
      ctx.addIssue({ code: 'custom', path: [key], message })
    }

    if (!env.AUTH_SECRET) {
      missing(
        'AUTH_SECRET',
        'AUTH_SECRET is required when ALLOW_DEMO_EXTRACTION is true: demo limits are keyed by HMAC, so every demo extraction fails without it',
      )
    }

    // A missing provider reports ONLY itself. The keys below are checked for
    // the provider that was chosen, and listing OpenAI's alongside "you chose
    // nothing" would answer a question nobody asked yet.
    if (env.EXTRACTION_PROVIDER === undefined) {
      missing(
        'EXTRACTION_PROVIDER',
        'EXTRACTION_PROVIDER is required when ALLOW_DEMO_EXTRACTION is true: name openai or groq rather than leaving the fallback to decide',
      )
      return
    }

    if (env.EXTRACTION_PROVIDER === 'groq') {
      if (!env.GROQ_API_KEY) {
        missing('GROQ_API_KEY', 'GROQ_API_KEY is required when EXTRACTION_PROVIDER is groq and demo extraction is on')
      }
      // GROQ_EXTRACTION_MODEL is not checked: it has a default here AND a
      // second fallback at the call site, so it cannot be missing.
      return
    }

    if (!env.OPENAI_API_KEY) {
      missing('OPENAI_API_KEY', 'OPENAI_API_KEY is required when EXTRACTION_PROVIDER is openai and demo extraction is on')
    }
    // Demanded because OpenAI's model, unlike Groq's, has no default anywhere:
    // `extraction.service.ts` reads it bare and fails EXTRACTION_NOT_CONFIGURED
    // on `!key || !model`. That asymmetry is deliberate, and tidying the two
    // branches into symmetry would put this outage back.
    if (!env.OPENAI_EXTRACTION_MODEL) {
      missing(
        'OPENAI_EXTRACTION_MODEL',
        'OPENAI_EXTRACTION_MODEL is required when EXTRACTION_PROVIDER is openai and demo extraction is on: it has no default, unlike the Groq model',
      )
    }
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
