import 'reflect-metadata'
// Loaded with the file, as schema.test.ts loads it. The first import of the
// inlined NestJS and GraphQL costs seconds, and made through runSchemaCommand's
// own dynamic import it was billed to the first case, which timed out at 5000
// ms. The command still asks for the module through its default loader, and
// finds it loaded.
import './schema.js'

import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { runSchemaCommand } from './schema-command.js'

/**
 * The schema command, in process and against the source, KN-403.
 *
 * It used to be tested only by starting the built entry four times, three of
 * them loading NestJS and GraphQL, which made the file's result a measure of
 * how busy the machine was, KN-167. The same four cases run here as calls, and
 * the built entry's own test starts only runs that never load the schema.
 */
const ROOT = join(import.meta.dirname, '..', '..')

const recorder = () => {
  const said: { stream: 'out' | 'err'; text: string }[] = []
  return {
    said,
    write: (stream: 'out' | 'err', text: string) => {
      said.push({ stream, text })
    },
  }
}

describe('the schema command, in process', () => {
  const made: string[] = []
  const scratch = async () => {
    const dir = await mkdtemp(join(tmpdir(), 'karnama-schema-command-'))
    made.push(dir)
    return dir
  }

  afterEach(async () => {
    await Promise.all(made.splice(0).map((dir) => rm(dir, { recursive: true, force: true })))
  })

  it('checks the committed schema and finds it current', async () => {
    const { said, write } = recorder()
    expect(await runSchemaCommand('check', ROOT, write)).toBe(0)
    expect(said).toHaveLength(1)
    expect(said[0]?.stream).toBe('out')
    expect(said[0]?.text).toContain('matches the resolvers')
  })

  it('fails, non-zero, when the schema on disk is stale', async () => {
    const dir = await scratch()
    await writeFile(join(dir, 'schema.gql'), 'type Query { notTheRealSchema: String! }\n')
    const { said, write } = recorder()
    expect(await runSchemaCommand('check', dir, write)).toBe(1)
    expect(said).toHaveLength(1)
    expect(said[0]?.stream).toBe('err')
    expect(said[0]?.text).toMatch(/stale[\s\S]*schema:generate/u)
  })

  it('generates into an empty directory, byte for byte the committed schema', async () => {
    // No DATABASE_URL, no WEB_ORIGIN and no server: the contract is an artefact.
    const dir = await scratch()
    const { said, write } = recorder()
    expect(await runSchemaCommand('generate', dir, write)).toBe(0)
    expect(said).toEqual([{ stream: 'out', text: 'Wrote schema.gql from the resolvers.\n' }])
    expect(await readFile(join(dir, 'schema.gql'), 'utf8')).toBe(await readFile(join(ROOT, 'schema.gql'), 'utf8'))
  })

  it('refuses an unknown command without asking for the schema', async () => {
    const { said, write } = recorder()
    const load = vi.fn(() => Promise.reject(new Error('the schema was asked for by an unknown command')))
    expect(await runSchemaCommand('sprinkle', ROOT, write, load)).toBe(1)
    expect(load).not.toHaveBeenCalled()
    expect(said).toEqual([{ stream: 'err', text: 'unknown command "sprinkle", expected generate or check\n' }])
  })
})
