1. **The exit condition is met for the current implementation.**

   - **“A query selecting a field that does not exist fails the build.”** The root build runs the GraphQL workspace’s `codegen:check`, which invokes generation and propagates validation failure. The verifier plants `environmentTypo` and requires the complete field/type diagnostic at [KN-128.mjs:113](D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-128.mjs:113). Independently, in-memory generation using the actual configuration rejected that field with the expected diagnostic.
   - **“The response type reflects the SELECTION rather than the whole object type.”** [generated.ts:34](D:/Kar/Gandom/KarNama/packages/graphql/src/generated.ts:34) contains the three selected fields explicitly. Fresh in-memory generation matched the committed output exactly.
   - **“Adding a required field to Health does not change HealthQueryData.”** The current name is `HealthQuery`. The verifier plants a required field, supplies it in the resolver, checks the emitted `String!`, compares the operation type, and probes selected and unselected accesses. My independent required-field experiment preserved the selection type. A compiler probe through the **actual web barrel** produced exactly one TS2339 for the unselected field.
   - **“Each is proved by a planted case.”** Those cases are now present. I did not execute the writing verifier or reproduce the reported full gate.

2. **No script-controlled mutation precedes the snapshots.** [KN-128.mjs:42](D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-128.mjs:42) executes before any check or spawned command. Both round-two majors are fixed: deleting restoration writes is detectable, and a pre-existing probe causes refusal before mutation.

   A failed restoration can leave state that later checks encounter, but recorded failures remain in `failures`; a later success cannot make the overall run green. The claim covers the five listed source files and probe existence, not restoration of every build artifact. Interruption and exceptions within cleanup remain limitations already identified in round two.

3. **The missing mutation is a wrong consumer re-export.** Change the first import in `health.ts` to:

   ```ts
   import { HealthDocument, type Query as HealthQuery } from '@karnama/graphql'
   ```

   The verifier’s web-source checks still pass, while its compiler probe continues importing the correct type directly from `generated.ts`. After adding the required field, the web-exported `HealthQuery` now incorrectly exposes it.

   I tested this through an in-memory compiler overlay: the actual export rejected the unselected access; the mutated export produced **zero diagnostics**. This leaves the existing verifier mechanisms intact. I cannot certify that all seventeen mutations remain caught because their executable cases are not provided in the repository evidence I found.

4. **The actual production path is correct.** `health.ts` currently exports the genuine `HealthDocument` and `HealthQuery`; the generated AST selects exactly the fields its response type declares. Re-exporting through `core/api` preserves the document’s type parameters. Adding a second distinctly named operation introduces no inherent typing problem with this arrangement.

Findings:

- **major — The planted type check bypasses the consumer contract.** [KN-128.mjs:201](D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-128.mjs:201) imports directly from `generated.ts`, while [line 94](D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-128.mjs:94) merely checks that the web module imports the package. The alias mutation above restores the original whole-object response defect without failing this verifier. Add a planted consumer probe through `core/api`, retaining both selected-field positive controls and the unselected-field rejection. This is a regression-detection gap, not an incorrect current production type.

VERDICT
score: 9.0
criticals: 0
one-line: Probe the response type through the web consumer export as well as generated.ts.