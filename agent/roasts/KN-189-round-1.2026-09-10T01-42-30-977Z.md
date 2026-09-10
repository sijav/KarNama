1. Copying/stripping is loud only if the real prompt is validated. A second or stale marker is currently silent when its block is correctly ordered. An inline prose mention is also accepted as a marker. Require one standalone marker per target document and validate the real document.

2. Checking every marked block is wrong for this singular normative rule. Two markers should fail as ambiguous; marked examples cannot deliberately be wrong because the marker declares them normative.

3. The prior reviewer is right. The two inline old-implementation checks are historical evidence, not protection. Keep the fixtures that characterize required behavior; move historical reproduction to the roast/plan rather than maintaining duplicate pseudo-implementations.

Findings:

- **critical** — No live prompt is validated or marked. `KN-184.mjs` runs only generated fixtures, while the active local loop still roasts at [`.claude/ralph-loop.local.md:70`](D:/Kar/Gandom/KarNama/.claude/ralph-loop.local.md:70) and closes at [`.claude/ralph-loop.local.md:87`](D:/Kar/Gandom/KarNama/.claude/ralph-loop.local.md:87), with no fenced marker. The verifier’s passing cases at [`KN-184.mjs:65`](D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-184.mjs:65) do not establish that any normative block is declared or ordered correctly. This fails the task’s exit condition.

- **major** — The marker is not a stable declaration and duplicate/stale markers pass silently. [`prompt-order.mjs:48`](D:/Kar/Gandom/KarNama/agent/scripts/verify/lib/prompt-order.mjs:48) accepts the marker anywhere in a line, and [`prompt-order.mjs:87`](D:/Kar/Gandom/KarNama/agent/scripts/verify/lib/prompt-order.mjs:87) accepts any number of marked blocks if each happens to be ordered. I ran a document with `Note: <!-- roast-order -->` immediately above a correct fence, plus a later unmarked reversed real fence; it returned `{"ok":true}`. I also ran two correctly ordered marked fences; it returned `{"ok":true}`. A stale marker therefore masks the moved real block, recreating the exact false-pass class.

VERDICT
score: 3.0
criticals: 1
one-line: Validate the actual loop prompt and require exactly one standalone marker, rather than declaring fixture-only success.