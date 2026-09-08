import { isEntrypoint, main } from './cli.js'

/**
 * The six lines that turn `main` into a command.
 *
 * Separated so `cli.ts` has nothing in it that a test cannot reach. This file
 * makes no decisions: it reads argv and the environment, calls `main`, and sets
 * an exit code. It is the ONLY file excluded from coverage in this workspace,
 * and it is not unverified, because `cli-entry.test.ts` spawns it as a real
 * process and reads what it printed. Coverage cannot see a subprocess; that is
 * a limitation of the instrument, not a gap in the checking.
 */
if (isEntrypoint(import.meta.url, process.argv)) {
  void main(process.argv, process.env, (stream, text) => {
    if (stream === 'out') process.stdout.write(text)
    else process.stderr.write(text)
  }).then((code) => {
    process.exitCode = code
  })
}
