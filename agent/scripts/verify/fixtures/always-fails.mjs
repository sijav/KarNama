// A verifier that always fails, quietly, so tests of the close gate exercise a
// real non-zero exit rather than a missing file.
//
// Committed rather than written at test time, so a verifier that uses it stays
// runnable in a read-only working tree, which is where a reviewer runs it.
//
// It lives under `fixtures/` so it can never be set as a task's verify command:
// `verifyCommand` only accepts `agent/scripts/verify/<name>.mjs` with no
// subdirectory.
process.exit(1)
