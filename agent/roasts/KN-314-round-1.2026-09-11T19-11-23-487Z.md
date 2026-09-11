1. A normalising parent loses searches. If `onChange` lowercases input, typing `F` makes the controlled field settle on `f`; `typed.current` is `F`, so line 56 rejects it and no debounce is started. The field displayed the accepted value, but no search runs.

2. The ref is not guaranteed current. It is updated only in a passive effect at lines 46-48. If a parent commits a new `onSearch` near the 300 ms deadline, the already-queued timer can run before that passive effect and invoke the previous callback. Unmount cleanup is otherwise correct when a timer exists. Reading `typed.current` is safe under StrictMode here: effect cleanup clears the first timer before the repeated effect can leave a second one.

Findings:

- critical — Controlled clear violates the task’s central invariant and can also leave the old debounce alive. Use a parent that accepts typed values but ignores `onChange('')`: type `foo`, then click Clear before 300 ms. `clear()` calls `onSearch('')` immediately at [SearchBar.tsx:69](D:/Kar/Gandom/KarNama/apps/web/src/shared/search-bar/SearchBar.tsx:69)-[73](D:/Kar/Gandom/KarNama/apps/web/src/shared/search-bar/SearchBar.tsx:73), while the controlled field remains `foo`; it has never displayed `''`. Since `text` remains `foo`, the effect at [SearchBar.tsx:55](D:/Kar/Gandom/KarNama/apps/web/src/shared/search-bar/SearchBar.tsx:55) does not rerun or clean up, so the pending `onSearch('foo')` also fires later. The new `IgnoredKeystrokes` story only types; it does not exercise this clear sequence.

- critical — Value normalisation silently drops a user search. A controlled parent that turns `F` into `f` leaves `typed.current !== text`, so [SearchBar.tsx:56](D:/Kar/Gandom/KarNama/apps/web/src/shared/search-bar/SearchBar.tsx:56) returns without scheduling anything. This contradicts the documented debounce behaviour in [Shared-SearchBar.md:4](D:/Kar/Gandom/KarNama/apps/web/src/shared/story-docs/en/Shared-SearchBar.md:4)-[8](D:/Kar/Gandom/KarNama/apps/web/src/shared/story-docs/en/Shared-SearchBar.md:8).

- major — An external restore can restart an obsolete search. Type `foo`, let the parent reset to `''` before the pause, then have the parent restore `foo` without another input event. `typed.current` is still `foo`, so the restored value passes [SearchBar.tsx:56](D:/Kar/Gandom/KarNama/apps/web/src/shared/search-bar/SearchBar.tsx:56) and schedules a search although the user did not type after the reset.

- major — The “latest callback” claim is not reliable because [SearchBar.tsx:46](D:/Kar/Gandom/KarNama/apps/web/src/shared/search-bar/SearchBar.tsx:46)-[48](D:/Kar/Gandom/KarNama/apps/web/src/shared/search-bar/SearchBar.tsx:48) updates the ref after commit. A timer due in the gap after a new callback prop commits can call the prior function at [SearchBar.tsx:57](D:/Kar/Gandom/KarNama/apps/web/src/shared/search-bar/SearchBar.tsx:57).

`node agent/scripts/todo.mjs validate` passes. The focused Storybook Vitest run could not start because the read-only sandbox forbids Vite from writing its temporary config file.

VERDICT
score: 3.0
criticals: 2
one-line: Make controlled clear wait for the parent-confirmed displayed value and cancel any pending timer when the clear request is rejected.