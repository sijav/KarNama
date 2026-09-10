1. No. KN-287 does not require the case where a field already has helper text and then receives an error. An implementation can keep rendering the helper, never render the error message, still remain 90px, and satisfy every listed KN-287 condition. Require a story where helper text is replaced by the error and `aria-describedby` resolves to the error.

2. Yes. Beyond the two named stories, the old decision remains asserted by the component comment and reserved `minHeight` in [Input.tsx](D:/Kar/Gandom/KarNama/apps/web/src/shared/input/Input.tsx:24), both story-doc files, the completed KN-011 board exit in [agent/board.json](D:/Kar/Gandom/KarNama/agent/board.json:556), and KN-011’s verifier in [KN-011.mjs](D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-011.mjs:54). KN-287’s exit requires neither the docs nor KN-011’s verifier/exit to change, so it can land while those assertions contradict the owner.

Findings:

- major — KN-287 does not cover error precedence over existing helper text. Its only error-appearance requirement is “without a helper,” [agent/board.json](D:/Kar/Gandom/KarNama/agent/board.json:7198). That leaves `helperText ?? error` compliant with the card but contrary to the owner’s “error … with its message” decision in [DESIGN.md](D:/Kar/Gandom/KarNama/DESIGN.md:755). Add the helper-then-error state, its accessible description, and a mutation-proofed story.

- major — KN-287 does not require updating all existing contracts it reverses. KN-011’s verifier explicitly requires the reserved line and `ErrorDoesNotMoveTheField` [KN-011.mjs](D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-011.mjs:46), while the English docs promise that an error never pushes a form [Shared-Input.md](D:/Kar/Gandom/KarNama/apps/web/src/shared/story-docs/en/Shared-Input.md:5). The new card only names its two stories and the component comment. It must explicitly replace the legacy verifier assertion, KN-011’s board exit, and both language docs.

VERDICT
score: 6.8
criticals: 0
one-line: Make KN-287 prove that an error replaces existing helper text, then require it to retire every KN-011 reserved-line assertion.