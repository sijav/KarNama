1. Heading-keyword association is brittle and fails silently. A prior numbered example headed “If a task is done, roast it…” is selected over the real step if the real heading says “Close the task, then request review.” The check passes a reversed real block. Use an explicit stable marker for the normative block, not prose keywords.

2. Checking only the normative close-and-roast block is the right scope. Checking every fence would reject legitimate counterexamples. If more normative blocks arise, each needs an explicit identifier or declared rule.

3. The inline old implementation is historical evidence, not protection for current behavior. It is not load-bearing; the decisive current-function fixture is. Keep it only if documenting the regression is valuable, otherwise remove it and retain the fixture asserting the real expected result.

Findings:

- critical — Heading selection can still let an earlier correctly ordered example mask a reversed real block. `findIndex` chooses the first numbered line containing both `done` and `roast`, rather than the actual close-and-roast step. I ran a fixture with a correct step 2 headed “If a task is done, roast it only after closing it” and a reversed step 5 headed “Close the task, then request review”; `closesBeforeRoasting` returned `{ ok: true }`. This violates the stated exit condition. [prompt-order.mjs:32](D:\Kar\Gandom\KarNama\agent\scripts\verify\lib\prompt-order.mjs:32)

- critical — The command recognizers accept arbitrary text containing command-shaped substrings as real commands. In the normative block, `echo "todo move <id> done"` followed by the real roast command and then the real close command passes, because the unanchored close regex treats `echo` as a close. I ran that fixture and received `{ ok: true }`, despite the actual roast preceding the actual close. The existing comment-only handling is insufficient. [prompt-order.mjs:70](D:\Kar\Gandom\KarNama\agent\scripts\verify\lib\prompt-order.mjs:70)

The supplied verifier passes, but its fixtures do not cover either bypass.

VERDICT
score: 3.0
criticals: 2
one-line: Replace keyword-based block selection with an explicit normative-block marker, then recognize actual shell commands rather than matching command text anywhere on a line.