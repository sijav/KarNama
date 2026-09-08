import 'reflect-metadata'

import { mkdtemp, readdir, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { resolvers } from './resolvers.js'
import { SCHEMA_FILE, checkSchema, generateSchema, readCommittedSchema } from './schema.js'

/**
 * The schema, and the check that says whether the committed one is stale.
 *
 * The whole card is about turning a side effect into an artefact, so the tests
 * are about the artefact: it is produced without a server, it is stable, it is
 * committed, and a change to a resolver makes the check fail rather than
 * silently shipping client types for a schema that no longer exists.
 */
const ROOT = join(import.meta.dirname, '..', '..')

describe('generating the schema', () => {
  it('needs no server, no environment and no database', async () => {
    // Nothing is set up before this call. If it ever starts needing the
    // environment, the failure lands here rather than on someone's first
    // clone.
    const schema = await generateSchema()
    expect(schema).toContain('type Query {')
    expect(schema).toContain('health: Health!')
  })

  it('is stable, so a diff means the schema moved rather than the printer', async () => {
    const [first, second] = await Promise.all([generateSchema(), generateSchema()])
    expect(first).toBe(second)
    // Sorted, which is what makes it stable: an unsorted print reorders on
    // unrelated edits and every review shows a schema change that is not one.
    const types = [...first.matchAll(/^type (\w+)/gm)].map((match) => match[1])
    expect(types).toEqual([...types].sort())
  })

  it('ends with exactly one newline, so the committed file has no trailing churn', async () => {
    const schema = await generateSchema()
    expect(schema.endsWith('\n')).toBe(true)
    expect(schema.endsWith('\n\n')).toBe(false)
  })
})

describe('the committed schema', () => {
  it('exists and matches what the resolvers produce', async () => {
    const result = await checkSchema(ROOT)
    expect(result.message).toContain('matches')
    expect(result.matches).toBe(true)
  })

  it('is byte for byte what the generator writes', async () => {
    expect(await readCommittedSchema(ROOT)).toBe(await generateSchema())
  })

  it('reports a MISSING file with the command that fixes it', async () => {
    const empty = await mkdtemp(join(tmpdir(), 'karnama-schema-'))
    const result = await checkSchema(empty)
    expect(result.matches).toBe(false)
    expect(result.message).toContain('is not committed')
    // The person who sees this is mid-review and has no reason to know the
    // script name, so the message carries it.
    expect(result.message).toContain('npm run schema:generate')
    expect(await readCommittedSchema(empty)).toBeNull()
  })

  it('reports a STALE file with the command that fixes it', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'karnama-schema-'))
    await writeFile(join(dir, SCHEMA_FILE), 'type Query { somethingElse: String! }\n')
    const result = await checkSchema(dir)
    expect(result.matches).toBe(false)
    expect(result.message).toContain('stale')
    expect(result.message).toContain('npm run schema:generate')
  })
})

describe('the resolver list', () => {
  it('names every resolver in the source tree', async () => {
    // The drift this closes: a resolver registered in a Nest module and absent
    // from this list is in the running server and missing from the generated
    // schema, so the client gets no type for a field that exists.
    const found: string[] = []
    const walk = async (dir: string): Promise<void> => {
      for (const entry of await readdir(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name)
        if (entry.isDirectory()) await walk(full)
        else if (entry.name.endsWith('.resolver.ts')) {
          const source = await readFile(full, 'utf8')
          for (const match of source.matchAll(/export class (\w+)/g)) found.push(match[1] ?? '')
        }
      }
    }
    await walk(join(ROOT, 'src'))

    expect(found.length).toBeGreaterThan(0)
    const listed = resolvers.map((resolver) => resolver.name)
    const missing = found.filter((name) => !listed.includes(name))
    expect(missing, 'these resolvers exist and are not in src/graphql/resolvers.ts').toEqual([])
  })
})
