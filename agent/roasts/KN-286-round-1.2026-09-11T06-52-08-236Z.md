1. I found no authoritative interop matrix proving this exact nested structure doubles speech. There is, however, a reported NVDA double-speak case when the same error is both an `aria-describedby` target and an alert. The accessible description remains flat text, not “alert + text.” Nesting is standards-valid, but not demonstrably better than a separate pre-primed announcement region. It needs manual NVDA/Chrome, NVDA/Firefox, JAWS/Chrome, and VoiceOver/Safari listening tests before claiming the UX is settled. W3C’s error example keeps the alert as its own container. [W3C ARIA19](https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA19), [reported NVDA behavior](https://stackoverflow.com/questions/71615554/how-to-properly-handle-inline-error-messages-while-the-user-is-typing-aria)

2. No, neither the story nor the verifier exercises `error A → error B`, or `A → empty → B` in rapid commits. React may collapse updates to the final DOM state; assistive technology can coalesce or discard queued assertive updates. The current story only proves `empty → one fixed message`, and the AX snapshot only proves the resulting tree after 300 ms. The untracked note’s assertion that an alert “again” reads every replacement is unsupported. W3C’s repeated-error example explicitly clears, then delays insertion to improve detection. [W3C ARIA19](https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA19)

Findings:

- major — `apps/web/src/shared/input/#KN-286 - An Input's error is not announced when it appears while the field has focus.md:1` is documentation prose stored beside source, not under `src/shared/story-docs/{en,fa}`. It is also untracked, so it is either dead local process material or a repository-rule violation if included. Remove it or move only user-facing documentation into both required story-doc files.

- minor — The claim that a replacement error is announced again is not tested and is not guaranteed by the implementation. `Input.stories.tsx:824-870` can only generate empty/fixed-error/empty; `KN-286.mjs:129-147` takes one final AX-tree snapshot. Add a two-message validator and test `A → B` while focus remains, then state the limitation honestly: AX-tree checks cannot prove speech delivery.

I did not run `KN-286.mjs`: it deliberately overwrites `Input.tsx` for mutation testing, while this review was explicitly read-only.

VERDICT
score: 7.2
criticals: 0
one-line: Remove the misplaced untracked implementation memo, then either test error-message replacement or stop claiming it is reliably announced