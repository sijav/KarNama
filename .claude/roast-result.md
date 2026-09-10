# Roast: plan

- when: 2026-09-10T01:32:05+00:00
- reviewer: codex gpt-5.6-terra, effort medium
- session: 01a08809-e3e1-71c1-91f0-9fc952fd3731 (resumed)
- subject: KN-189 Mark the normative block instead of guessing it

- earlier attempts: skipped codex/gpt-5.6: out of usage until 2026-09-10T03:48+00:00 (138 minute(s) away)

---

Verdict: the marker is the right kind of fix, but the plan needs two corrections before it can honestly meet the exit condition.

A marker is a declaration, not an inference. Rewording cannot accidentally create it. Its remaining failure mode is intentional misplacement or copying, which cannot be fully inferred away, but can be made loud: require exactly one marker, require its next nonblank line to be the fenced block, and fail on zero, two, or a detached marker. “Take the next fence” is too loose, because it can jump over unrelated content and bind a later example.

Checking every marked block is not right for the current contract. There is one normative close-and-roast block. Refuse multiple markers as ambiguous. That makes an accidental copied marker fail rather than silently broadening the rule.

No marker should be a failing “unknown”, not a pass or fallback. The check cannot establish the required ordering without a declared target. Migration is simple: add the marker to every prompt actually checked before switching the selector.

The plan’s “both loop prompts” step is not supported by the current files. SkipBureau’s prompt has the close-and-roast shell block; KarNama’s active `.claude/ralph-loop.local.md` does not. Add the marker only to the former unless KarNama gains an equivalent normative command block and is passed through `closesBeforeRoasting`. Otherwise the second marker is untested documentation.

`<!-- roast-order -->` is valid CommonMark HTML-comment syntax and normally invisible in HTML output, but “invisible in every renderer” is too broad. CommonMark specifies it as an HTML block, not a promise that every renderer preserves or suppresses it identically. [CommonMark HTML-block specification](https://spec.commonmark.org/spec/#html-blocks) A first-line `# roast-order` inside the `bash` fence is slightly more robust to moving or copying the block, and harmless when copied into a shell. Either form works, but use one exact, directly attached form and test it.

The decisive fixtures should assert both facts:

- The old heading selector returns `ok: true` for the reviewer’s decoy-heading and renamed-real-heading cases.
- The marked selector reads the reversed marked block and returns the expected failure.

The most likely wrong step is allowing the marker to float above arbitrary prose before “the next fence.” Bind it directly to one fence and reject ambiguity. This fixes KN-189’s selector without pretending to solve KN-190’s separate unanchored-command problem.
