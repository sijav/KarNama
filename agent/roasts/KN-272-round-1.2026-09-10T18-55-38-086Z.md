1. No current product component reads `palette.primary.light`. The only MUI `Button` is `color="inherit"`; the custom checkbox’s visible frame uses semantic tokens directly. MUI `Alert` would read `primary.light`, but there is no Alert, Chip, or selected list item in the product yet. Navy is safe today, but the theme mapping makes future primary Alerts unsafe without an explicit override.

2. No, do not mechanically treat `bg/brand/default`, `bg/brand/hover`, or `bg/danger/*` as dark fills. `brand/default` and `hover` are solid action colors paired with `text/on-accent`; the current derivation keeps that pair readable. The danger backgrounds have no current product consumer. Add component-specific contrast tests when they acquire one.

Findings:

- minor — The new 47-line explanatory document is placed under production source, [#KN-272 - In dark, a selected Filter Chip's text is 1.34 to 1 on its fill.md](</D:/Kar/Gandom/KarNama/apps/web/src/theme/#KN-272 - In dark, a selected Filter Chip's text is 1.34 to 1 on its fill.md:1>). This violates the repository rule that user-facing/documentation prose lives in the prescribed markdown documentation locations, not beside shipped source. The board already contains the task rationale; remove this duplicate or relocate the necessary material to the proper documentation location.

The actual Filter Chip pair is correctly changed: its dark selected fill now derives as a dark fill, and the checked text and pressed-border pairs are sound. I could not complete the verifier in this read-only sandbox because it creates temporary build output and intentionally mutates `darkMode.ts`; that is not a defect in the change.

VERDICT
score: 8.8
criticals: 0
one-line: remove or relocate the task-prose markdown file from `apps/web/src/theme`