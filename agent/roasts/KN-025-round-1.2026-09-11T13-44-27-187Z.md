1. The pre-mounted `role="status"` pattern is sound. It produces one polite announcement for 0→1 and 1→2; the visible count is hidden from AT, so it is not duplicated. 2→0 clears silently, which is normally fine. The stories do not actually exercise those transitions.

2. RTL/LTR ordering and locale formatting are implemented correctly in principle, including English singular. But it does not match Figma on narrow phones: it wraps instead of retaining the drawn 60px, overflowing layout.

3. No. Rendering before the list only works when Tab starts before the list. If a keyboard user selects a row while focus is already in the list, the bar is inserted before the current focus, so Tab continues through the list. The selection-owning host must move focus to a bar action, or provide an equivalent immediate keyboard path. The component need not autonomously steal focus, but the stated host contract is insufficient.

4. Yes, optional Jobs callbacks are a trap. A valid `type="jobs"` call can silently omit the two actions Figma requires.

Findings:

- critical — The Jobs variant deliberately diverges from the mobile Figma layout. At 390/320px, `maxWidth` and `flexWrap` create a multi-row bar, while the design is a fixed 358×60 bar whose contents overflow. This is explicitly acknowledged as unresolved KN-328, but KN-025 was marked done despite its “match Figma” exit condition. [BulkActionBar.tsx](D:/Kar/Gandom/KarNama/apps/web/src/shared/bulk-action-bar/BulkActionBar.tsx:86) [DESIGN.md](D:/Kar/Gandom/KarNama/DESIGN.md:426)

- critical — Jobs can render without Select all and/or Change status. For example, `<BulkActionBar type="jobs" count={2} onClear={…} onDelete={…} />` displays only Delete and close, not the Jobs bar required by Figma. Make the props a discriminated union, with both actions required for `jobs`, or render disabled/defined actions consistently. [BulkActionBar.tsx](D:/Kar/Gandom/KarNama/apps/web/src/shared/bulk-action-bar/BulkActionBar.tsx:12) [BulkActionBar.tsx](D:/Kar/Gandom/KarNama/apps/web/src/shared/bulk-action-bar/BulkActionBar.tsx:128)

- critical — The keyboard proof tests the wrong sequence. It starts with no focused row, then tabs from the document top, so it proves only static DOM order. Select a row by keyboard, leaving focus on that row, and the newly mounted bar is behind focus; a forward Tab does not reach it. There is also no product host using this component yet. [BulkActionBar.stories.tsx](D:/Kar/Gandom/KarNama/apps/web/src/shared/bulk-action-bar/BulkActionBar.stories.tsx:205) [Shared-BulkActionBar.md](D:/Kar/Gandom/KarNama/apps/web/src/shared/story-docs/en/Shared-BulkActionBar.md:7)

- minor — New component-facing documentation is embedded throughout the implementation rather than kept in the existing story-docs markdown, contrary to the repository rule. [BulkActionBar.tsx](D:/Kar/Gandom/KarNama/apps/web/src/shared/bulk-action-bar/BulkActionBar.tsx:45)

`node agent/scripts/todo.mjs validate`, lint, typecheck, and the focused Storybook test command pass.

VERDICT
score: 4.0
criticals: 3
one-line: Do not mark KN-025 done until keyboard selection moves focus or otherwise reaches the newly mounted bar, and the Jobs/mobile contracts are made consistent with Figma.