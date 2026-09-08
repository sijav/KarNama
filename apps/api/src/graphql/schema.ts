import { GraphQLSchemaBuilderModule, GraphQLSchemaFactory } from '@nestjs/graphql'
import { NestFactory } from '@nestjs/core'
import { lexicographicSortSchema, printSchema } from 'graphql'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { resolvers } from './resolvers.js'

/**
 * The schema, generated from the resolvers WITHOUT starting a server.
 *
 * `autoSchemaFile` writes it when the application boots, which made the
 * contract between the two halves a side effect of running the thing: a fresh
 * clone had no schema, generating one needed a full environment and a writable
 * directory, and nothing could fail a build because the schema moved and the
 * client types did not. A roast rated that major and it was right.
 *
 * `GraphQLSchemaBuilderModule` reads the same decorators the running server
 * reads, so this is not a second implementation of the schema, it is the same
 * one printed earlier.
 */
export const SCHEMA_FILE = 'schema.gql'

export const generateSchema = async (): Promise<string> => {
  const app = await NestFactory.create(GraphQLSchemaBuilderModule, { logger: false })
  await app.init()
  try {
    const factory = app.get(GraphQLSchemaFactory)
    // Sorted, so the file is stable: an unsorted print reorders on unrelated
    // edits and every diff looks like a schema change.
    const schema = lexicographicSortSchema(await factory.create([...resolvers]))
    return `${printSchema(schema).trim()}\n`
  } finally {
    await app.close()
  }
}

/** What is committed, or null when nothing is. */
export const readCommittedSchema = async (root: string): Promise<string | null> => {
  try {
    return await readFile(join(root, SCHEMA_FILE), 'utf8')
  } catch {
    return null
  }
}

export interface SchemaCheck {
  matches: boolean
  message: string
}

/**
 * Compares what the resolvers produce with what is committed.
 *
 * This is the whole point of the card: a contract that cannot be checked is not
 * a contract. The message says what to run rather than only that something is
 * wrong, because the person who sees it is mid-review and has no reason to know
 * the script name.
 */
export const checkSchema = async (root: string): Promise<SchemaCheck> => {
  const generated = await generateSchema()
  const committed = await readCommittedSchema(root)

  if (committed === null) {
    return { matches: false, message: `${SCHEMA_FILE} is not committed. Run: npm run schema:generate --workspace @karnama/api` }
  }
  if (committed !== generated) {
    return {
      matches: false,
      message: `${SCHEMA_FILE} is stale: the resolvers produce a different schema. Run: npm run schema:generate --workspace @karnama/api`,
    }
  }
  return { matches: true, message: `${SCHEMA_FILE} matches the resolvers.` }
}
