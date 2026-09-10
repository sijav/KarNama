1. No robust repository-wide semantic distinction exists between “instructs” and “mentions” using text matching alone. A named instruction inventory is honest, but it must be authoritative and guarded: define the operational instruction corpus, then verify every registered file and require new instruction files to register themselves. The current list is only an undocumented hand-maintained guess.

2. Before deleting based on recoverability, verify the fallback itself: `git check-ignore -v <path>`, `git ls-files --error-unmatch <path>`, and `git cat-file -e HEAD:<path>`. If any fails, do not delete, stage/commit or make a recoverable backup first. The general guard is: an irreversible action needs a command that proves its stated rollback path before execution.

3. Current gates establish only that today’s TypeScript, Storybook, Vite, and Prisma workflows ignore these files. They do not cover future Docker contexts, package publishing, source-directory allowlists, licence/scanner policy, or new `*.md` globs. Add a release/build-artifact check when such a pipeline exists, and make any new source-tree walker explicitly decide whether plan sidecars are allowed.

4. The KN-071 marker is not the right artifact beside source. It has a plan filename and `# Plan` heading but is explicitly not a plan, so people and automation will misclassify it. Keep the loss record in an incident/archive location such as `agent/incidents/`, with a link from the relevant decision record if needed. Do not impersonate a recoverable plan.

Findings:

- major — The verifier claims to check “every plan file in the tree,” but its walk explicitly skips the whole `agent` directory. Creating `agent/plan-KN-999.md` leaves `node agent/scripts/verify/KN-160.mjs` green, despite `agent` already containing two plan files and being the required location for agent work. This is a concrete false pass for the stated regression guard. [KN-160.mjs](D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-160.mjs:96)

- major — “No instruction anywhere” is not proved. The verifier inspects only three hardcoded paths; a new operative file such as `agent/WORKFLOW.md` instructing `.claude/plan-KN-999.md` is invisible and the verifier still passes. The source itself acknowledges this limitation, but documenting a hole does not make the exit condition true. Use a governed instruction-file registry, or derive the corpus from a defined convention. [KN-160.mjs](D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-160.mjs:31)

- minor — The KN-071 loss marker is named and headed as a plan, although its first sentence says the plan is gone. Any later file discovery keyed on the mandated `#KN-…` filename will treat an incident report as the historical plan it is meant to find. [#KN-071 - A contact needs only a full name.md](D:/Kar/Gandom/KarNama/apps/api/prisma/#KN-071%20-%20A%20contact%20needs%20only%20a%20full%20name.md:1)

I ran the supplied verifier and board validation. Both pass, but the verifier passes with the blind spots above.

VERDICT
score: 5.8
criticals: 0
one-line: Fix KN-160’s verifier so its claimed whole-tree and instruction-corpus coverage is real, not a hardcoded partial scan.