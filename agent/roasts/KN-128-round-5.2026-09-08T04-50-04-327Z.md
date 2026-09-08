1. **The current implementation satisfies the exit condition. The verifier still has a bypass.**

   - **“A query selecting a field that does not exist fails the build”: yes.** Root build invokes `codegen:check`, which propagates document-validation failures. In-memory generation using the actual configuration rejected `environmentTypo` with the expected diagnostic.
   - **“The response type reflects the SELECTION rather than the whole object type”: yes.** Fresh generation matched the committed output. [generated.ts:34](D:/Kar/Gandom/KarNama/packages/graphql/src/generated.ts:34) contains exactly the three selected fields.
   - **“Adding a required field to Health does not change HealthQueryData”: yes.** Now named `HealthQuery`. Adding `addedByTheVerifier: String!` in memory changed `Health` without changing the operation type. Through the public barrel, both positive controls compiled and the unselected access produced exactly one TS2339.
   - **“Each is proved by a planted case”: yes.** The committed verifier contains those plants, including the required model field, resolver value and non-null SDL assertion. I independently reproduced generation and compiler cases in memory; I did not execute the writing verifier or rerun the reported full gate.

   The previous whole-object barrel alias now produces TS2741 and is caught. The baseline check is present. The original basename collision is fixed, but exact path attribution remains incomplete.

2. **I found another concrete bypass: replace the exported document while retaining the correct exported type.**

   Replace [core/api/index.ts:1](D:/Kar/Gandom/KarNama/apps/web/src/core/api/index.ts:1) with:

   ```ts
   import { parse } from 'graphql'

   export { toHealthState, type HealthQuery, type HealthState } from './health'

   export const HealthDocument = parse(
     'query Health { health { status environmentTypo uptimeSeconds } }'
   )
   ```

   With this mutation and the required-field plant, my compiler-overlay runs produced:

   - Baseline web typecheck: zero diagnostics.
   - Actual verifier probe: exactly its expected TS2339.
   - GraphQL validation of the exported document: `Cannot query field "environmentTypo" on type "Health"`.

   The verifier scans `health.ts`, validates the package operation, and probes the separately exported `HealthQuery`. None examines this replacement document. The document test also imports directly from `./health`, bypassing the barrel.

   **I cannot certify that all twenty mutations remain caught: their executable cases are absent.** This mutation leaves the existing verifier mechanisms intact, but that is not evidence of twenty successful mutation runs.

3. **Both findings below concern files touched by KN-128.** Neither belongs to the previously filed unrelated defects. I have not counted KN-131 through KN-136 again.

Findings:

- **major — The verifier does not establish that consumers receive the generated document.** [KN-128.mjs:233](D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-128.mjs:233) imports only `HealthQuery`; its source inspection at [line 102](D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-128.mjs:102) examines only `health.ts`. The mutation above preserves every checked type property while exposing an invalid, ungenerated operation. Verify the public `HealthDocument` against the generated document and test its inferred response type. This is a demonstrated regression-detection gap, not a defect in today’s exported document.

- **minor — Path attribution still uses substring matching rather than exact location matching.** [KN-128.mjs:261](D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-128.mjs:261) classifies a diagnostic from `e2e/src/core/api/kn-128-probe.ts` as belonging to the probe. I reproduced this with TypeScript’s diagnostic formatter. Parse the diagnostic location and compare the normalized path exactly. The baseline catches pre-existing errors; this finding establishes incorrect attribution, not a complete verifier false pass.

VERDICT
score: 9.0
criticals: 0
one-line: Verify the public HealthDocument and its inferred response type, not only the separately exported HealthQuery.