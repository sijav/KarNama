import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

/**
 * `generate` writes the schema, `check` fails when it is stale.
 *
 * Out of the entry file, so what decides anything is tested in process and
 * covered, KN-403, the way `database/cli.ts` holds `runCommand` beside its
 * six-line entry. The schema module brings NestJS and GraphQL, most of a second
 * of CPU in a fresh process, so it is loaded only once the command is known to
 * need it, KN-167, and through `load`, so a test can see that an unknown command
 * never asks for it.
 */
export type SchemaModule = Pick<typeof import('./schema.js'), 'SCHEMA_FILE' | 'checkSchema' | 'generateSchema'>

export const runSchemaCommand = async (
  command: string,
  root: string,
  write: (stream: 'out' | 'err', text: string) => void,
  load: () => Promise<SchemaModule> = () => import('./schema.js'),
): Promise<number> => {
  if (command !== 'generate' && command !== 'check') {
    write('err', `unknown command "${command}", expected generate or check\n`)
    return 1
  }
  const { SCHEMA_FILE, checkSchema, generateSchema } = await load()
  if (command === 'generate') {
    await writeFile(join(root, SCHEMA_FILE), await generateSchema())
    write('out', `Wrote ${SCHEMA_FILE} from the resolvers.\n`)
    return 0
  }
  const result = await checkSchema(root)
  write(result.matches ? 'out' : 'err', `${result.message}\n`)
  return result.matches ? 0 : 1
}
