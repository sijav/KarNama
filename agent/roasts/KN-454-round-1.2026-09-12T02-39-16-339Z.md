1. The rAF check is pre-paint evidence, not an unconditional proof. If React had not committed when the callback ran, it would record `0`, not a coincidental `45`. But it counts the entire document, not this story’s freshly mounted canvas, so it can pass from pre-existing matching buttons. Scope it to the story canvas and make the pre-paint boundary explicit.

2. The inline ref’s `null` detach does not create a paintable gap. React detaches then reattaches during the same commit, before paint. No cleanup is needed because the callback has no subscription or retained resource.

3. `beforeEach` does run again for arg-driven rerenders. Storybook’s `onUpdateArgs` calls `rerender()`, which calls the full render path, including `applyBeforeEach`; `forcedAtFirstFrame` is reset and rescheduled. It is not stale merely because an arg changed.

Findings:

- major — The assertion is global-document state, not state of the `States` canvas. A pre-existing `button[data-state]` elsewhere in the preview, including a concurrently rendered Docs example or a future story, contributes to the exact count. The test can therefore pass without proving these 45 newly rendered cells were ready for their first paint. Query only the `canvasElement` supplied to `beforeEach`/`play`, and bind the captured count to that render. [Button.stories.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\button\Button.stories.tsx:156)

- minor — The new comments are Storybook documentation prose duplicated in the markdown files, which the repository explicitly forbids in TSX. The implementation comment can say that the ref must assign before paint; the explanation of what reviewers see and why the rAF check exists belongs only in `story-docs`. [Button.stories.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\button\Button.stories.tsx:33)

- minor — The change uses browser globals directly despite the repository rule requiring `window.*`, reducing mockability and violating the stated convention. Use `window.requestAnimationFrame`, `window.cancelAnimationFrame`, and `window.document`. [Button.stories.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\button\Button.stories.tsx:158)

`node agent/scripts/todo.mjs validate` passes.

VERDICT
score: 7.4
criticals: 0
one-line: scope the frame count to the freshly rendered States canvas so it proves this story, not arbitrary document state