1. Buttons are acceptable only while these are in-place state controls with no URLs. The landmark is sound because only one labelled `nav` renders at a time. But `aria-current="page"` is misleading in the actual shell: clicking “Add” or “My network” only changes the highlighted button, not the page content ([App.tsx:24](/D:/Kar/Gandom/KarNama/apps/web/src/app/App.tsx:24)). It also necessarily has no middle-click/new-tab behavior. Convert to links once routes exist.

2. The RTL mechanics are right: logical border placement mirrors, the brand derives from the localized name, and the phone is explicitly LTR and locale-formatted. I found no contrary defect in those parts.

3. `noSsr: true` should avoid the media-query double-render flash, and 900px is correctly `md`-up. Regular shell content gets sufficient bottom padding. But the tab bar does not yield to the Bulk Action Bar, see critical finding below.

4. The sidebar switch relies on MUI `Menu`, so Escape and trigger-focus restoration should work; its custom focus ring is present. The mobile header placement exists in `PageHeader`, but the mounted mobile shell renders no `PageHeader`, so users cannot reach the switch at all.

Findings:

- **critical** — Mobile has no language switch, so the locale cannot be changed or persisted from the actual mobile app. Below 900px `Navigation` renders only `TabBar` ([Navigation.tsx:21](/D:/Kar/Gandom/KarNama/apps/web/src/shared/navigation/Navigation.tsx:21)), and `App` renders only a heading in `main` ([App.tsx:26](/D:/Kar/Gandom/KarNama/apps/web/src/app/App.tsx:26)). The switch is correctly conditional inside `PageHeader` ([PageHeader.tsx:63](/D:/Kar/Gandom/KarNama/apps/web/src/shared/page-header/PageHeader.tsx:63)), but that component is absent. At 390px, there is therefore no language control.

- **critical** — On mobile selection, the tab bar and Bulk Action Bar occupy the same bottom region instead of the tab bar giving way. `Navigation` has no selection/bulk state and always renders its fixed, app-bar-z-index tab bar ([Navigation.tsx:12](/D:/Kar/Gandom/KarNama/apps/web/src/shared/navigation/Navigation.tsx:12)). The selected Bulk Action Bar is independently fixed at the same z-index and only 24px from the bottom ([BulkActionBar.tsx:76](/D:/Kar/Gandom/KarNama/apps/web/src/shared/bulk-action-bar/BulkActionBar.tsx:76)). Select a card on a phone and the bars overlap; merely stacking one above the other is not replacement.

- **major** — The claimed destinations do not navigate anywhere in the mounted app. `onNavigate` only updates `current` ([App.tsx:24](/D:/Kar/Gandom/KarNama/apps/web/src/app/App.tsx:24)); the main region always says “KarNama” ([App.tsx:30](/D:/Kar/Gandom/KarNama/apps/web/src/app/App.tsx:30)). This makes `aria-current="page"` on the buttons inaccurate and means “network” is not a standalone destination in practice.

- **minor** — The new navigation source violates the repository’s explicit no-type-assertion rule with `as const` ([Sidebar.tsx:27](/D:/Kar/Gandom/KarNama/apps/web/src/shared/navigation/Sidebar.tsx:27)). It also puts component documentation prose in source comments rather than the required story-doc markdown, for example [destinations.ts:5](/D:/Kar/Gandom/KarNama/apps/web/src/shared/navigation/destinations.ts:5).

`node agent/scripts/todo.mjs validate` passes. The targeted Vitest run could not start because this read-only sandbox prevents Vite from creating its temporary config file, not because of a test failure.

VERDICT
score: 4.5
criticals: 2
one-line: Make the mobile shell expose the required language switch and explicitly replace, rather than overlap, the tab bar during bulk selection.