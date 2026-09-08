1. Yes. `<Trans id={'Delete this application'} />` is valid JSX but misses the scanner in [catalog.test.ts](D:/Kar/Gandom/KarNama/apps/web/src/i18n/catalog.test.ts:33). So does `i18n._(\`Delete this application\`)`, an identifier argument, or reordered/extra JSX props. If the id is omitted from `fa-IR`, Lingui renders the English id at runtime; the catalog test stays green because it never sees the use.

2. A direct `setLocale` does not remount this provider, because its key is based on `AppProviders` props, not preference state. But any future parent-driven locale prop change unmounts the entire subtree below `PreferencesProvider` at [AppProviders.tsx](D:/Kar/Gandom/KarNama/apps/web/src/app/AppProviders.tsx:39). That destroys component-local state: an open job modal, unsaved form fields, selection, focus, and pending UI state. It is dormant only because the real app currently pins the prop.

3. The current reader safely ignores unknown fields and falls back field-by-field, so an old stored shape produces defaults for renamed/removed values and preserves still-valid values. No stored JSON accepted by this parser renders worse than its defaults. However, returning users are currently forced back to Persian regardless of their valid stored locale because the application passes `locale={defaultLocale}`.

4. MUI 9’s `Menu` does use RTL context to choose right-side origins, so the portal itself is not a demonstrated RTL bug. But the stories prove only menu existence, text, accessible name, and eventual document direction. They do not prove the RTL menu’s physical anchor/alignment or computed direction.

Findings:

- **critical** — The application never renders `LanguageSwitch`. [App.tsx](D:/Kar/Gandom/KarNama/apps/web/src/app/App.tsx:21) renders only two headings, so an actual user has no runtime control to switch language. Storybook proves an isolated component, not the app’s required behavior.

- **critical** — Persisted language selection is overridden on every application mount. [main.tsx](D:/Kar/Gandom/KarNama/apps/web/src/main.tsx:16) always passes `locale={defaultLocale}`; [PreferencesProvider.tsx](D:/Kar/Gandom/KarNama/apps/web/src/core/preferences/PreferencesProvider.tsx:45) merges that initial locale over `readPreferences()`. Sequence: persist `en-US`, reload, get `fa-IR`. The persistence exit condition is not met.

- **critical** — The “100 percent translated” gate can silently miss live ids. Its regex only accepts `<Trans` immediately followed by `id="..."` and literal single/double-quoted `i18n._(...)` calls at [catalog.test.ts](D:/Kar/Gandom/KarNama/apps/web/src/i18n/catalog.test.ts:33). Add `<Trans id={'New application'} />` without catalog entries: lint can accept it as localized, the test does not detect it, and Persian users receive English fallback text.

- **critical** — The declared Lingui macro work is not implemented. [vite.config.ts](D:/Kar/Gandom/KarNama/apps/web/vite.config.ts:11) and both Vitest projects at [vitest.config.ts](D:/Kar/Gandom/KarNama/apps/web/vitest.config.ts:56) configure only `react()`, not the Lingui SWC transform. The repository explicitly records hand-written runtime catalogs as unfinished in [TECH-DEBT.md](D:/Kar/Gandom/KarNama/TECH-DEBT.md:190). Creating KN-110 does not make KN-006’s stated tooling requirement complete.

- **major** — Preference setters lose updates issued in the same React batch. `setLocale('en-US')` followed synchronously by `setColorScheme('dark')` calculates both updates from the old closure at [PreferencesProvider.tsx](D:/Kar/Gandom/KarNama/apps/web/src/core/preferences/PreferencesProvider.tsx:62). The second write restores the old locale, leaving and persisting `{ locale: 'fa-IR', colorScheme: 'dark' }`. Use a functional state update and persist that computed next value.

- **major** — The new component has no required bilingual Storybook documentation, and instead puts user-facing documentation prose in code. `apps/web/src/shared/story-docs/` does not exist, while [LanguageSwitch.tsx](D:/Kar/Gandom/KarNama/apps/web/src/shared/language-switch/LanguageSwitch.tsx:12) contains the component documentation JSDoc. This directly violates the repository’s documentation contract.

- **minor** — The RTL portal story does not test alignment. [LanguageSwitch.stories.tsx](D:/Kar/Gandom/KarNama/apps/web/src/shared/language-switch/LanguageSwitch.stories.tsx:31) checks item text and the menu label only. It never asserts right anchoring, geometry, or computed RTL direction, despite exact RTL layout being part of the design contract.

VERDICT
score: 1.5
criticals: 4
one-line: remove the forced `locale={defaultLocale}` and integrate the switch into the real application, because stored English currently cannot survive a reload or be selected by a user