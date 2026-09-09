// The environment a verifier hands to a child process.
//
// Spreading `process.env` straight into a spawn gives the child whatever the
// shell or the CI job happened to be holding. That is ordinarily harmless, and
// it is exactly wrong for one variable: KARNAMA_GATE_FIXTURES adds a test
// DESIGNED TO FAIL to the web unit project, so an ambient value turns an
// ordinary run red for a reason nobody would connect to the environment they
// are standing in. The verifier would report that the gate is broken when the
// only broken thing is a leftover variable.
//
// So the copy is scrubbed of that key and a run that WANTS gate mode asks for
// it by name through `extraEnv`. Opting in is possible; inheriting it is not.

/**
 * Keys a child must never inherit.
 *
 * Removed rather than set to '', because a scrub should not depend on how the
 * reader is written. Empty is falsy only because apps/web/vitest.config.ts
 * compares against the exact string; a reader asking whether the name is
 * `in process.env` would still find it and turn gate mode on.
 */
const SCRUBBED = ['KARNAMA_GATE_FIXTURES']

/**
 * `source` is a parameter so the scrub can be checked against an environment
 * this process does not have to be standing in, which is the only way to check
 * the Windows case below on a machine that is not Windows.
 *
 * The match is on the UPPERCASED key rather than the key. Windows environment
 * variables are case-insensitive and `{ ...process.env }` is a plain object
 * that is not, so a parent holding `Karnama_Gate_Fixtures` survives
 * `delete env.KARNAMA_GATE_FIXTURES` and still reaches the child, where Windows
 * resolves it case-insensitively again and gate mode comes back on.
 *
 * CI and FORCE_COLOR are set here because every verifier wants the same thing
 * from a child: non-interactive, and no escape codes in the output it parses.
 */
export const childEnv = (extraEnv = {}, source = process.env) => {
  const env = { ...source, CI: '1', FORCE_COLOR: '0' }
  for (const key of Object.keys(env)) {
    if (SCRUBBED.includes(key.toUpperCase())) delete env[key]
  }
  return { ...env, ...extraEnv }
}
