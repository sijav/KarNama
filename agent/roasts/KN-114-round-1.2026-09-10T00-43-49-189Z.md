1. `\p{N}` includes Persian and Arabic-Indic digits, but it does not normalize them to ASCII. `۲۰۲۵`, `٢٠٢٥`, and `2025` remain different strings after `bare`, so they do not collapse. A whole legitimate message such as `iOS 17` still falsely fails if the English id is also `iOS 17`, but that conflicts directly with the requested “same id with punctuation/casing changed” rule. Proper Latin names inside an otherwise Persian sentence are safe unless the entire normalized message equals the id.

2. There is a better third shape: extract the two catalog predicates into a pure function accepting `{ en, fa }`; have `catalog.test.ts` invoke it on the real imported catalogs, and unit-test the same function with invalid in-memory catalog objects. That proves the exact validator npm runs without editing source. `vi.mock` is needlessly coupled to module loading, and a temporary catalog path does not exercise the imported catalog.

3. Stripping `Cf` is correct for detecting an otherwise blank value. A message made of RLM/LRM plus whitespace renders no label and should fail. A real translated message containing bidi controls around visible Latin or Persian text still passes, because visible non-whitespace remains after stripping.

Findings:

- major — The committed verifier can overwrite another actor’s real catalog edit. It snapshots `fa-IR.ts`, repeatedly rewrites it, then unconditionally restores that stale snapshot in `finally`. If a developer, generator, or concurrent agent changes the catalog after line 54 and before line 96, their change is silently lost. Killing the verifier leaves a planted catalog behind as the file itself admits. This is an unnecessary destructive proof harness when an injected pure validator would be hermetic. [KN-114.mjs](D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-114.mjs:54) and [KN-114.mjs](D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-114.mjs:96).

The underlying targeted test could not be run here because Vitest writes its temporary config bundle and the review sandbox is read-only; the verifier likewise correctly fails on its intentional catalog write. The Unicode behavior was checked directly: `\p{N}` retains distinct Persian, Arabic-Indic, and ASCII digit code points.

VERDICT
score: 7.0
criticals: 0
one-line: Replace the real-source mutation harness with an in-memory validator test before it corrupts or overwrites a catalog change.