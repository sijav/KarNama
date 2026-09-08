import { defineConfig, env } from 'prisma/config'

/**
 * Prisma 7 moved the connection URL out of `schema.prisma`.
 *
 * The datasource block may no longer carry `url`, so the schema is now purely a
 * data model with no environment in it, and the URL lives here for the CLI and
 * behind an adapter for the client. That is a better split than it looks: the
 * schema file is the thing that gets reviewed and diffed, and it no longer
 * mentions where the data is.
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    // The seed is a real script rather than a `prisma db seed` shim, so it can
    // be run against a throwaway database in a test as easily as against a
    // development one.
    seed: 'node dist/database/cli-entry.js seed',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
