import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * Guards the deployment config against the mistake that already broke a deploy.
 *
 * `render.yaml` sets `NODE_ENV=production`, and **npm omits devDependencies
 * when it sees that**. So a plain `npm ci` installs neither `typescript` nor
 * `@types/pg`, and the build dies on the first typed import:
 *
 *     src/database/cli.ts(2,16): error TS7016: Could not find a declaration
 *     file for module 'pg'
 *
 * It reads like a types problem and is not. Nothing in the repository would
 * have caught it, because the file is only executed by Render — which is the
 * argument for checking it here rather than trusting a comment in the YAML.
 *
 * Line-based rather than parsed, which is now a decision with a card behind it
 * rather than a note to future somebody. It used to say "if this file grows a
 * fourth rule, parse it properly"; the file grew past four and the note was
 * still sitting here, so it was describing a rule the file broke. Parsing means
 * `yaml` as a direct dependency, which resolves in the lockfile but is declared
 * by no package, and that decision belongs to the owner: KN-723 carries it.
 *
 * Until then the rules that a stray line could fool are written to match
 * ADJACENT lines. `key: X` immediately followed by `sync: false` cannot be
 * satisfied by a key that carries a committed `value:` and says `sync: false`
 * some lines later, which a window of characters would have allowed.
 */
const RENDER_YAML = readFileSync(fileURLToPath(new URL('../../../../render.yaml', import.meta.url)), 'utf8')

/** Lines with comments removed, so a rule cannot be satisfied by prose about it. */
const directives = RENDER_YAML.split('\n')
  .filter((line) => !line.trimStart().startsWith('#'))
  .join('\n')

describe('render.yaml', () => {
  it('is found and is the API service, so the checks below are not vacuous', () => {
    // The positive control. Every assertion here is about the content of a
    // file, and a file that failed to load fails them all for the wrong reason.
    expect(directives).toMatch(/name:\s*karnama-api/)
    expect(directives).toMatch(/buildCommand:/)
  })

  it('installs devDependencies, because NODE_ENV=production makes npm skip them', () => {
    const setsProduction = /key:\s*NODE_ENV[\s\S]{0,80}?value:\s*production/.test(directives)
    if (!setsProduction) return
    const build = /buildCommand:\s*(.+)/.exec(directives)?.[1] ?? ''
    expect(
      /--include=dev|--production=false|--omit=$/.test(build),
      'render.yaml sets NODE_ENV=production, so npm ci skips devDependencies and the ' +
        'TypeScript build fails. The build command must ask for them explicitly.',
    ).toBe(true)
  })

  it('rescues a stale build command with NPM_CONFIG_PRODUCTION', () => {
    // Editing `buildCommand` does not change a service Render already created
    // from an earlier version of this file; it keeps its settings until the
    // Blueprint is re-synced. So the `--include=dev` fix was correct and still
    // produced an identical failure. An environment variable is read by every
    // npm invocation in the service, including a stale command, which is why
    // both belong here rather than either alone.
    expect(
      /key:\s*NPM_CONFIG_PRODUCTION[\s\S]{0,60}?value:\s*'?false'?/.test(directives),
      'render.yaml must set NPM_CONFIG_PRODUCTION=false, so devDependencies install ' +
        'even if Render is still running the build command it was created with.',
    ).toBe(true)
  })

  it('carries no connection string, so no credential is committed', () => {
    // `sync: false` means Render prompts for it once and it never lands in git.
    expect(directives).toMatch(/key:\s*DATABASE_URL[\s\S]{0,80}?sync:\s*false/)
    expect(directives).not.toMatch(/postgres(ql)?:\/\//)
  })

  // Everything `env.ts` refuses to start without once demo extraction is on,
  // KN-485. Declared here so the service names what decides whether it works,
  // rather than leaving it to whoever remembers the dashboard.
  const DEMO_VARIABLES = ['AUTH_SECRET', 'GROQ_API_KEY', 'EXTRACTION_PROVIDER', 'ALLOW_DEMO_EXTRACTION', 'TRUST_PROXY_HOPS']

  it.each(DEMO_VARIABLES)('declares %s, and leaves its value to the dashboard', (key) => {
    // Adjacent lines, not a window: this is what stops a key with a committed
    // `value:` and a later `sync: false` from passing as safely declared.
    expect(
      new RegExp(`key:\\s*${key}\\s*\\n\\s*sync:\\s*false`).test(directives),
      `render.yaml must declare ${key} with sync: false on the next line, so a deploy that needs it ` +
        'is told, and so no value for it is ever committed here.',
    ).toBe(true)
  })

  it('stays on the free plan', () => {
    // Not frugality for its own sake: the owner asked for free, and a plan
    // change is the kind of thing that happens in a dashboard and never in a
    // review.
    expect(directives).toMatch(/plan:\s*free/)
  })
})
