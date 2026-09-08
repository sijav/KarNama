1. The Vitest split is a test-runner workaround, not proof production is safe. The current lockfile resolves one `graphql@16.14.2`, so the built server is not presently duplicating it. If production ever resolves two physical GraphQL copies, Nest can construct a schema using scalar/type instances from copy A while `GraphQLSchema` validates against copy B, producing the same “another module or realm” error during schema construction or startup. The split needs a recorded debt entry and a production dependency-resolution check.

2. Byte comparison can fail without an API shape change due to:
   - CRLF checkout versus generator-written LF. No `.gitattributes` rule fixes `schema.gql` to LF.
   - A `graphql` or `@nestjs/graphql` upgrade changing `printSchema`, decorator metadata handling, built-in directives, descriptions, or sort behavior.
   - A changed generated header or generator formatting.
   - Runtime-derived descriptions, if introduced later.
   
   Locale sorting is not a current cause: GraphQL 16.14.2 uses its own code-unit `naturalCompare`, not `localeCompare`. A description containing a newline is part of the SDL description, so it changes the checked artifact even if it does not alter executable fields.

3. The resolver scan is not a reliable registration check. It misses resolvers outside `*.resolver.ts`, default exports, re-exports/aliased classes, and decorators on classes that do not use the exact `export class Name` text. It falsely requires every exported class in a conventionally named file, even if it is not a resolver. More importantly, it does not inspect Nest module providers at all, so it cannot distinguish a runtime resolver deliberately excluded from generation, or detect an extra generator-only resolver.

4. Nothing makes a normal build fail for a stale schema. `apps/api`’s build overwrites it with `schema:generate`, then exits zero. The root build only delegates to workspace builds. `schema:check` is invoked solely by the task verifier. Wire a no-write `schema:check` into the normal API/root CI build gate, before any command that regenerates the committed artifact. Generation belongs in an explicit update command, otherwise build silently repairs the evidence it should reject.

Findings:

- critical — `npm run build` does not detect staleness; it destroys it. A developer can change a resolver, leave the committed `schema.gql` stale, run the normal build, and receive success because line 8 regenerates the file before any comparison. The only invocation of `schema:check` is in the optional KN-120 verifier. This fails the stated exit condition. [apps/api/package.json](D:/Kar/Gandom/KarNama/apps/api/package.json:8) [package.json](D:/Kar/Gandom/KarNama/package.json:28) [agent/scripts/verify/KN-120.mjs](D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-120.mjs:74)

- critical — The claimed single resolver source of truth does not exist. The schema generator uses `resolvers`, but the running Nest application registers `HealthResolver` independently in `HealthModule`. Add a resolver as a module provider from a nonconforming file/default export and production exposes it while generation and `schema:check` remain green. Conversely, add one only to `resolvers` and the committed schema gains a field the server does not expose. [apps/api/src/graphql/resolvers.ts](D:/Kar/Gandom/KarNama/apps/api/src/graphql/resolvers.ts:6) [apps/api/src/health/health.module.ts](D:/Kar/Gandom/KarNama/apps/api/src/health/health.module.ts:4) [apps/api/src/graphql/schema.test.ts](D:/Kar/Gandom/KarNama/apps/api/src/graphql/schema.test.ts:88)

- major — The two-project `noExternal`/dedupe arrangement is explicitly a workaround, but it has no required `TECH-DEBT.md` entry describing the cause, removal condition, and retirement check. This violates the repository’s workaround rule and leaves the claimed production safety unverified. [apps/api/vitest.config.ts](D:/Kar/Gandom/KarNama/apps/api/vitest.config.ts:14) [TECH-DEBT.md](D:/Kar/Gandom/KarNama/TECH-DEBT.md:1)

- minor — `schema:check` compares raw bytes but the repository does not pin `apps/api/schema.gql` to LF. A Windows checkout configured with CRLF conversion can report stale before any resolver changed. [apps/api/src/graphql/schema.ts](D:/Kar/Gandom/KarNama/apps/api/src/graphql/schema.ts:78) [.gitattributes](D:/Kar/Gandom/KarNama/.gitattributes:4)

I confirmed the committed schema is tracked and the built checker currently reports it matches. Vitest could not be run here because Vite must write its temporary config under the read-only workspace.

VERDICT
score: 3.5
criticals: 2
one-line: Make the ordinary build/CI run a no-write schema staleness check, and derive generation from the same resolver registration the running Nest application uses.