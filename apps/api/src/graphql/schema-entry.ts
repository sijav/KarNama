import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { isEntrypoint } from '../database/cli.js'

/**
 * `generate` writes the schema, `check` fails when it is stale.
 *
 * The same six-line shape as the database entry, and excluded from coverage for
 * the same reason: it makes no decisions, and a test spawns it as a real
 * process. Everything that decides anything is in `schema.ts`.
 */
export const runSchemaCommand = async (
  command: string,
  root: string,
  write: (stream: 'out' | 'err', text: string) => void,
): Promise<number> => {
  if (command !== 'generate' && command !== 'check') {
    write('err', `unknown command "${command}", expected generate or check\n`)
    return 1
  }
  // Loaded once the command is known to need it. `schema.ts` brings NestJS and
  // GraphQL, most of a second of CPU in a fresh process, and a mistyped command
  // has no use for them, KN-167.
  const { SCHEMA_FILE, checkSchema, generateSchema } = await import('./schema.js')
  if (command === 'generate') {
    await writeFile(join(root, SCHEMA_FILE), await generateSchema())
    write('out', `Wrote ${SCHEMA_FILE} from the resolvers.\n`)
    return 0
  }
  const result = await checkSchema(root)
  write(result.matches ? 'out' : 'err', `${result.message}\n`)
  return result.matches ? 0 : 1
}

if (isEntrypoint(import.meta.url, process.argv)) {
  void runSchemaCommand(process.argv[2] ?? '', process.cwd(), (stream, text) => {
    if (stream === 'out') process.stdout.write(text)
    else process.stderr.write(text)
  }).then((code) => {
    process.exitCode = code
  })
}
