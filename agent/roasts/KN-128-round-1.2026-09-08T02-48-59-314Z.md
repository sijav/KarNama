1. **The current codegen path genuinely validates the document.** I ran the installed generator entirely in memory against the actual configuration and operation. The planted typo produced:

   `GraphQL Document Validation failed … Cannot query field "environmentTypo" on type "Health".`

   The verifier’s field-name grep alone does not establish that provenance. Require that validation diagnostic as well. However, I found no incidental TypeScript failure that explains this result in the current build: the mutation changes only the `.graphql` source. The distinction matters for preventing future false passes, not for whether validation works today.

2. **Yes, the probe belongs to the TypeScript project.** `include: ["src", "*.ts"]` includes it, and `lint:tsc` runs `tsc --noEmit`. Using an in-memory compiler-host overlay, I confirmed the probe produces **TS2339**, specifically that `addedByTheVerifier` does not exist on the selected response type.

   Matching the probe filename, TS2339, and the property name would establish the reason more precisely than the current grep. Ordinary unrelated compiler failures would not satisfy the current property-name check.

3. **The generation chain holds, but the consumer build has a hole.** The GraphQL workspace validates operations and compares generated output; the API recompiles its resolvers and compares their schema. However, the web build runs only `vite build`.

   Concrete sequence: remove `environment` from the operation, regenerate, then run the root build. Both generation checks agree, but nothing typechecks `toHealthState`. I reproduced the resulting consumer TS2339 in memory and executed the reducer with the reduced response: it returns `{ kind: 'up', uptimeSeconds: 12, environment: undefined }`. Separate `lint:tsc` catches this; root `build` does not. This build-script weakness predates this change.

4. **Normal unwinding restores the tracked inputs; interruption is not covered.** Terminating the process can bypass `finally`, leaving mutations, the untracked probe, and compiled API output behind. Git checkout restores committed tracked files, but cannot recover pre-existing uncommitted edits from the verifier’s lost in-memory snapshots.

   Recovery also requires removing the probe and rebuilding API output. `dist` is ignored and is not restored by checkout. The restoration compiler’s status is ignored, although the final root build retries API compilation.

   There is another concrete cleanup defect: `check-generated.mjs` calls `process.exit(1)` inside its `try`. That bypasses its `finally`, leaving temporary directories behind on failed checks, including the intentional typo check.

5. **I found no remote schema, timestamp, or environment-dependent generation setting.** With the installed dependencies, regeneration matched the committed file byte-for-byte.

   There is nevertheless a machine-dependent failure: `.gitattributes` pins LF for `schema.gql`, but not `generated.ts` or the operation. A CRLF checkout makes the generated-file comparison fail. It also prevents the verifier’s exact `'    environment\n'` replacement from matching. I confirmed both with in-memory CRLF variants.

Findings:

- **critical — The required-field planted case is missing.** [KN-128.mjs:117](D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-128.mjs:117) adds `nullable: true` and an optional TypeScript property. That does not establish the explicitly required **required-field** case. My in-memory required-field experiment passed, so this is a verification gap, not evidence that generation is broken. Plant a non-null field, supply its value in the resolver, and retain the equality and negative-access checks.

- **critical — Root build does not reject a broken operation consumer.** [apps/web/package.json:8](D:/Kar/Gandom/KarNama/apps/web/package.json:8) runs Vite without TypeScript checking. Removing a selected field and regenerating leaves [health.ts:47](D:/Kar/Gandom/KarNama/apps/web/src/core/api/health.ts:47) reading a property Apollo will not return, while the root build has no rejecting step. Include consumer typechecking in the build. This is a pre-existing gap exposed by the operation-change scenario.

- **major — Valid CRLF checkouts fail verification.** [check-generated.mjs:72](D:/Kar/Gandom/KarNama/packages/graphql/scripts/check-generated.mjs:72) compares line endings literally, and [KN-128.mjs:93](D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-128.mjs:93) assumes LF when planting the typo. Pin the affected files to LF or handle line endings consistently. The byte-comparison weakness predates this change; the new verifier adds another affected path.

- **minor — Failed generation checks leak scratch directories.** [check-generated.mjs:26](D:/Kar/Gandom/KarNama/packages/graphql/scripts/check-generated.mjs:26) exits before cleanup at line 77. Every intentional invalid-document check takes this path. Throw and handle the failure after cleanup instead. This is pre-existing.

- **minor — The generated double assertion needs an explicit policy exception.** [generated.ts:37](D:/Kar/Gandom/KarNama/packages/graphql/src/generated.ts:37) introduces `as unknown as DocumentNode<…>`, contrary to the supplied escape-hatch rule. Schema validation makes this materially different from the old hand-written assertion, but there is no recorded exception in `TECH-DEBT.md`.

I did not run the writing verifier or full build. The reproduction checks above operated entirely in memory.

VERDICT
score: 7.0
criticals: 2
one-line: Make root build typecheck consumers, and plant the required-field case the exit condition demands.