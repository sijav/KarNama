1. Yes. A live prompt edit can split the agent’s behavior: its current context can still follow the old roast-first sequence, while its next iteration silently follows the new file. A line in the prompt is not a sufficient signal because it is only read at the next boundary. For a rule that changes task closure semantics, coordinate a restart or interruption, and make the hook require acknowledgement of a revision/hash before continuing.

2. Sharing one verifier is right. The verifier is one behavioral contract, not one per-card artifact. When KN-182 moves it, update closed cards’ `verify` fields atomically to the new command, while retaining the old command and commit in immutable `evidence`. The `verify` field should mean “current way to re-run this check,” not historical provenance.

3. No, the inference is not sound enough to close a critical card. The frontmatter and incrementing counter show that this file has loop-like state, not that the Stop hook resolves and injects this exact path. Actual observation without running a loop is tracing the installed Stop-hook registration and its script/config to the resolved prompt pathname. This repository contains no such registration; the only claim is the prompt/plan’s self-description.

Findings:

- **critical** — The verifier does not inspect the command block despite claiming that it does. It compares the first `todo move <id> done` and first `roast.py task` anywhere in the whitespace-collapsed document. A future editor can leave an earlier harmless/example close-then-roast pair and reverse the real Step 5 fenced block; this verifier passes. That fails the card’s requirement that a contradiction in the command block fail. [`agent/scripts/verify/KN-166.mjs:125-140`](D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-166.mjs:125)

- **critical** — The work is marked done while admitting it has not established that the edited file is the active hook input. The sibling repository has no checked-in Stop-hook registration or settings file, and the claim rests on self-referential prose in the untracked plan. If the hook resolves another prompt, the live behavior remains unfixed. [`agent/board.json:4213`](D:/Kar/Gandom/KarNama/agent/board.json:4213) and [`../SkipBureau/.claude/#KN-181 - The loop prompt fires the roast before the close.md:7-8`](D:/Kar/Gandom/SkipBureau/.claude/%23KN-181%20-%20The%20loop%20prompt%20fires%20the%20roast%20before%20the%20close.md:7)

- **major** — The author’s own required plan is untracked under `.claude`, directly violating the active prompt’s “Never `.claude/`” and “committed with the work” rules. The plan explicitly justifies the prohibited location. It can disappear with the same checkout/reset scenario the change claims to prevent. [`../SkipBureau/.claude/#KN-181 - The loop prompt fires the roast before the close.md:1-3`](D:/Kar/Gandom/SkipBureau/.claude/%23KN-181%20-%20The%20loop%20prompt%20fires%20the%20roast%20before%20the%20close.md:1) and [`../SkipBureau/.claude/ralph-loop.local.md:100-104`](D:/Kar/Gandom/SkipBureau/.claude/ralph-loop.local.md:100)

- **minor** — The new prompt text introduces an em dash, despite SkipBureau’s documentation rule prohibiting them. [`../SkipBureau/.claude/ralph-loop.local.md:79-81`](D:/Kar/Gandom/SkipBureau/.claude/ralph-loop.local.md:79)

VERDICT
score: 3.0
criticals: 2
one-line: Parse and test the actual Step 5 fenced block, and trace the real Stop hook before claiming this live loop is fixed.