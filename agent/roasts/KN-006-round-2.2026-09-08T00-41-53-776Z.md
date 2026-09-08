1. Yes, adding it to the placeholder shell violates the design contract. `DESIGN.md` permits only existing sidebar or Page Header chrome, explicitly saying nothing else moves. I would not have integrated it into `App` yet. Build and storybook `LanguageSwitch`, wire persistence, then leave KN-006 partial until a valid host exists, or get the owner to authorize a temporary host. The current desktop and mobile implementations are identical, so it is in neither mandated location. [App.tsx](D:/Kar/Gandom/KarNama/apps/web/src/app/App.tsx:30)

2. The reload test proves eventual persisted behavior, not the first paint. It does not prove the intended storage key, although a genuine write/read key mismatch would normally make this e2e test fail. It also cannot prove cache freshness, but `page.reload()` creates a new document and reexecutes the app even if resources are HTTP-cached. The real remaining gap is first paint: the HTML starts `fa-IR`/RTL, and `dir` and `lang` are changed only in `useEffect`, after commit. A stored English user can receive a Persian/RTL initial document before React corrects it. [index.html](D:/Kar/Gandom/KarNama/apps/web/index.html:2) [AppProviders.tsx](D:/Kar/Gandom/KarNama/apps/web/src/app/AppProviders.tsx:68)

3. Put the override behind an intermediary the grep does not inspect:

```tsx
const RootProviders = ({ children }: { children: ReactNode }) => (
  <AppProviders locale={defaultLocale}>{children}</AppProviders>
)

createRoot(container).render(<RootProviders><App /></RootProviders>)
```

`main.tsx` contains no `<AppProviders locale=`, so KN-006’s grep passes, while every mount is forced back to Persian.

4. Yes. Several stated clauses remain false, not merely unproven: the catalog guard misses valid live message forms and accepts empty translations; the required macro configuration and extracted catalogs do not exist; and the shipped switch is outside the only design-approved locations.

Findings:

- **critical** — The macro plugin is still not wired into Vite or either Vitest project. Both configs use only `react()`, no Lingui transform, and there is no `lingui.config.*` or `.po` catalog anywhere in the repository. The hand-written TS catalogs themselves say extraction is deferred. Filing KN-110 does not implement the task’s explicit requirement. [vite.config.ts](D:/Kar/Gandom/KarNama/apps/web/vite.config.ts:11) [vitest.config.ts](D:/Kar/Gandom/KarNama/apps/web/vitest.config.ts:56) [en-US.ts](D:/Kar/Gandom/KarNama/apps/web/src/i18n/locales/en-US.ts:6)

- **critical** — The “100 percent translated” test remains bypassable by valid production syntax. Add `<Trans id={'Delete this application'} />`, `<Trans otherProp={x} id="Delete this application" />`, or `i18n._(\`Delete this application\`)`; ESLint can accept these as localized, but the regex does not collect the ID. If its Persian entry is absent, users see English and the test remains green. This is the same critical from round 1, filed as KN-111 rather than fixed. [catalog.test.ts](D:/Kar/Gandom/KarNama/apps/web/src/i18n/catalog.test.ts:33)

- **critical** — The catalog test treats an empty string as translated. Change the current Persian translation to `'Language': ''`; every test still passes because it checks only key presence and rejects only a value exactly equal to the English ID. An empty value is not a Persian translation, so the required “test fails when it is not” clause is false. [catalog.test.ts](D:/Kar/Gandom/KarNama/apps/web/src/i18n/catalog.test.ts:53)

- **major** — The app ships the switch in forbidden new chrome, not at either required responsive placement. It is rendered under placeholder content with a fixed margin, and always uses the `sidebar` placement, including mobile. This is not a temporary approximation authorized by the design. [App.tsx](D:/Kar/Gandom/KarNama/apps/web/src/app/App.tsx:31) [LanguageSwitch.tsx](D:/Kar/Gandom/KarNama/apps/web/src/shared/language-switch/LanguageSwitch.tsx:27)

- **major** — The language labels are user-facing raw literals, including a Persian literal in a `.ts` file. This violates the rule that all user-facing strings go through Lingui with English IDs, and the rule is failing to enforce the requirement it was introduced to enforce. The self-naming exception explains why the rendered text should stay native, not why it may bypass the catalog. [index.ts](D:/Kar/Gandom/KarNama/apps/web/src/i18n/index.ts:18)

- **major** — Two synchronous preference changes discard the first one. `setLocale('en-US')` followed by `setColorScheme('dark')` uses the same stale closure; the second call writes `{ locale: 'fa-IR', colorScheme: 'dark' }`. KN-112 correctly describes it, but the defective code remains shipped. [PreferencesProvider.tsx](D:/Kar/Gandom/KarNama/apps/web/src/core/preferences/PreferencesProvider.tsx:62)

- **major** — The new component still carries user-facing component documentation as JSDoc, while no bilingual `shared/story-docs` directory exists. This directly violates the repository documentation contract and repeats the earlier finding. [LanguageSwitch.tsx](D:/Kar/Gandom/KarNama/apps/web/src/shared/language-switch/LanguageSwitch.tsx:12)

VERDICT
score: 2.0
criticals: 3
one-line: implement the actual Lingui macro and extracted PO-catalog pipeline, then make catalog completeness impossible to bypass rather than filing those requirements as later work