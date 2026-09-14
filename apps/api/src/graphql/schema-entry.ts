import { isEntrypoint } from '../database/cli.js'
import { runSchemaCommand } from './schema-command.js'

/**
 * The lines that turn `runSchemaCommand` into a command.
 *
 * Separated so `schema-command.ts` has nothing in it a test cannot reach, as
 * `database/cli-entry.ts` is for `cli.ts`, KN-403. This file makes no decisions:
 * it reads argv, calls the command with the process's streams and sets an exit
 * code. That is why it is excluded from coverage, and it is not unverified:
 * `schema-entry.test.ts` starts the built file as a real process.
 */
if (isEntrypoint(import.meta.url, process.argv)) {
  void runSchemaCommand(process.argv[2] ?? '', process.cwd(), (stream, text) => {
    if (stream === 'out') process.stdout.write(text)
    else process.stderr.write(text)
  }).then((code) => {
    process.exitCode = code
  })
}
