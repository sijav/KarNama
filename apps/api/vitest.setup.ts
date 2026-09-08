/**
 * The environment every test runs against.
 *
 * It has to be here rather than in a `beforeAll`, and finding that out cost a
 * confusing failure. `ConfigModule.forRoot({ validate })` is called when
 * `app.module.ts` is IMPORTED, not when the module is instantiated, and an ESM
 * import is hoisted above everything in the file that imports it. So a
 * `beforeAll` that sets `WEB_ORIGIN` runs after the validation that needed it,
 * and the suite dies with the config error it was written to test for.
 *
 * These are deliberately not real. The database URL points nowhere, because
 * nothing in this suite connects to a database, and a test that quietly used a
 * real one would pass on this machine and nowhere else.
 */
process.env.NODE_ENV = 'test'
process.env.WEB_ORIGIN = 'https://sijav.github.io'
process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/karnama-test'
