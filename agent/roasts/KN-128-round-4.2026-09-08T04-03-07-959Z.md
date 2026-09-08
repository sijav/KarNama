1. **Yes to all three clauses for the current implementation.**

   - **“A query selecting a field that does not exist fails the build.” Yes.** The root build invokes GraphQL’s generation check. In-memory generation using the actual configuration rejected `environmentTypo` with the required field/type diagnostic. The committed verifier plants this case at [KN-128.mjs:118](D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-128.mjs:118).
   - **“The response type reflects the SELECTION rather than the whole object type.” Yes.** Fresh generation matched the committed output exactly. [generated.ts:34](D:/Kar/Gandom/KarNama/packages/graphql/src/generated.ts:34) explicitly contains the three selected fields. The compiler probe accepted both positive controls and reported exactly one TS2339 for the unselected field.
   - **“Adding a required field to Health does not change HealthQueryData.” Yes.** The type is now named `HealthQuery`. Adding `addedByTheVerifier: String!` in memory preserved its generated shape. The committed verifier additionally plants the model field, supplies its resolver value, and checks the emitted non-null schema field.

   **“Each is proved by a planted case”: yes, those cases exist.** I independently reproduced the generation and consumer-type cases in memory. I did not execute the writing verifier or reproduce the reported full gate.

2. **There is still a consumer-export bypass.** Replace [core/api/index.ts:1](D:/Kar/Gandom/KarNama/apps/web/src/core/api/index.ts:1) with:

   ```ts
   export { HealthDocument, toHealthState, type HealthState } from './health'
   export { type Query as HealthQuery } from '@karnama/graphql'
   ```

   The public response type now claims the whole object, while the verifier continues importing the correct type from `./health`.

   I tested this against the complete web TypeScript project with the required field planted:

   - Current verifier probe: exactly the expected TS2339, satisfying its acceptance conditions.
   - Same probe importing the public barrel: TS2741 on the positive control, because the response incorrectly requires the unselected field.

   This change leaves the verifier’s existing mechanisms untouched. **I cannot certify that all eighteen mutations remain caught because their executable cases are still absent.** Filing KN-136 does not supply that evidence.

3. **The whole-workspace check adds cost and unrelated-failure coupling, but I found no demonstrated flakiness.** My compiler-overlay runs loaded 1,449 files and took approximately 3.6–4.9 seconds each. These are compiler timings, excluding npm startup and generation.

   The round-three `health.ts` alias now produces TS2741 in both `health.test.ts` and the probe. The verifier correctly refuses to conclude because of the outside error. That earlier defect is fixed.

   **Windows separators work; exact file attribution does not.** TypeScript-formatted diagnostic fixtures passed the parser with both slash styles and with pretty output enabled or disabled. However, an error from `apps/web/e2e/kn-128-probe.ts` was also classified as belonging to the probe. The parser matches a filename substring, not the diagnostic’s resolved source path. Also, without a baseline web typecheck, “the plant broke” cannot distinguish pre-existing errors from mutation-induced errors.

Findings:

- **major — The probe still bypasses the public consumer barrel.** [KN-128.mjs:208](D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-128.mjs:208) imports `./health`. The barrel mutation above restores the whole-object public response type while preserving the verifier’s expected diagnostic. Import through `src/core/api` and retain both positive controls. This is a regression-detection gap; the current production export is correct.

- **minor — Per-file attribution accepts another file with the same basename.** [KN-128.mjs:234](D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-128.mjs:234) searches the entire diagnostic line for `kn-128-probe.ts`. I reproduced misclassification using TypeScript’s own diagnostic formatter. Parse and normalize the diagnostic location, then compare it with the exact probe path. The demonstrated issue is attribution; I did not reproduce a full-verifier false pass from this collision.

VERDICT
score: 9.0
criticals: 0
one-line: Probe HealthQuery through the public core/api barrel.