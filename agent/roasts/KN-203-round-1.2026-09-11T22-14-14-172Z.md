1. No-CSF/MDX: `localeInContext` catches `storyById()`/`getStoryContext()` errors and returns `null`, but the page then calls `useOf('meta', ['meta'])` unguarded. Storybook throws “No CSF file attached” there, before the warning can render. A primary-story failure is likewise only caught for locale resolution, not generally protected in the page.

2. The catalog scanner does see the note’s `i18n._('…')` call, and the ID exists in both catalogs. Targeted ESLint and TypeScript checks pass. The `Markdown` and direction wrappers are structurally valid; I found no layout-specific defect from them alone.

Findings:

- major — The promised visible fallback is unreachable for a docs page without an attached CSF file. `useOf('meta')` throws before `{known ? null : <UnreadLanguage />}` is reached. This is precisely the “no attached CSF/MDX” case the change claims to handle. [DocsPage.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\story-docs\DocsPage.tsx:48)

- major — A later unreadable or unknown `GLOBALS_UPDATED` payload silently retains the prior language and `known: true`. Sequence: mount in English, then receive `{ userGlobals: { locale: 'de-DE' } }` or a future event shape without `userGlobals`; `localeInEvent()` returns null and the handler does nothing. The page remains English with no warning, despite no longer being able to determine the toolbar locale. The tests cover the parser returning null, not this state transition. [useDocsLocale.ts](D:\Kar\Gandom\KarNama\apps\web\src\shared\story-docs\useDocsLocale.ts:47)

- major — The critical DocsContext/channel integration is still excluded from coverage and has no focused mock integration test. `docs-locale.test.ts` proves only hand-built functions, so it cannot detect a wrong context object, a subscription that never fires, cleanup failure, or the unreachable fallback above. Manual clicking is not an automated test of the claimed behavior. [vitest.config.ts](D:\Kar\Gandom\KarNama\apps\web\vitest.config.ts:83)

- major — This work puts end-user/developer documentation prose in JSDoc inside `.tsx` and `.ts`, directly violating the repository rule that such prose belongs in `shared/story-docs/{en,fa}` markdown. The explanatory blocks are extensive, not short code comments. [DocsPage.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\story-docs\DocsPage.tsx:28) [docs-locale.ts](D:\Kar\Gandom\KarNama\apps\web\src\shared\story-docs\docs-locale.ts:26)

VERDICT
score: 4.2
criticals: 0
one-line: Make unreadable initial and update states render the warning reliably, including pages without an attached CSF file, then cover the actual DocsContext integration.