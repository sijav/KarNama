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
 * Line-based rather than parsed: three specific facts about a short file we
 * control, and adding a YAML dependency to assert them would cost more than it
 * proves. If this file grows a fourth rule, parse it properly.
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

  it('stays on the free plan', () => {
    // Not frugality for its own sake: the owner asked for free, and a plan
    // change is the kind of thing that happens in a dashboard and never in a
    // review.
    expect(directives).toMatch(/plan:\s*free/)
  })
})
