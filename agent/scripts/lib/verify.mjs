// Running a task's verify command.
//
// Extracted so it can be TESTED. The first version of KN-058's verifier
// asserted the absence of `shell: true` by slicing todo.mjs source between two
// string markers, which tests text rather than behaviour: a harmless refactor
// renaming a variable makes it fail, and a stale comment containing both markers
// makes it pass while the close path is broken. A reviewer was right to call
// that out, and right that the claim it "drives the real todo.mjs" was false.
//
// Now the close path and the test call the same function.

import { spawnSync } from 'node:child_process'

/**
 * Characters a shell would treat as an operator or as quoting.
 *
 * The command is spawned as argv with NO shell, so none of these could actually
 * do anything. They are rejected because a command containing one does not mean
 * what whoever wrote it thinks: `node verify.mjs || exit 0` reads as a fallback
 * and behaves as a filename. Rejecting them keeps the written command and the
 * executed command the same thing.
 *
 * `\` is deliberately NOT here. It was, and that refused every Windows path
 * argument, which the advertised `[args]` format is supposed to allow and which
 * argv execution handles safely. `%` and `^` are here because cmd.exe treats
 * them specially, so a command carrying them is equally misleading to read.
 */
export const SHELL_OPERATORS = /[|&;<>()$`"'\n\r%^]/

export class VerifyError extends Error {}

/** Split a verify command into argv, refusing anything that reads as shell syntax. */
export const verifyArgv = (command) => {
  const operator = SHELL_OPERATORS.exec(command)
  if (operator) {
    throw new VerifyError(
      `a verify command may not contain the shell character ${JSON.stringify(operator[0])}: ${command}\n` +
        'It is run directly rather than through a shell, so an operator would not do what it looks like.\n' +
        'Put the logic inside the verify script instead, where it can be read and tested.',
    )
  }
  const argv = command.split(/\s+/).filter(Boolean)
  if (argv[0] !== 'node') throw new VerifyError(`a verify command must start with "node": ${command}`)
  return argv
}

/**
 * Run it. Returns the child's exit status.
 *
 * `process.execPath` rather than a PATH lookup for `node`, and no shell, which
 * is what removed the last Windows-specific shell dependency from the close.
 */
export const runVerify = (root, command) => {
  const [, ...args] = verifyArgv(command)
  const result = spawnSync(process.execPath, args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'inherit', 'inherit'],
  })
  if (result.error) throw new VerifyError(`could not run the verify command: ${result.error.message}`)
  return result.status
}
