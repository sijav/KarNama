1. `useTsTypes` is global at [eslint.config.js:119](/D:/Kar/Gandom/KarNama/apps/web/eslint.config.js:119), so the generic literal-union escape already existed. I found no existing shipped UI copy assigned to such a union: the current unions are protocol/configuration values. `StoryMeta` adds a closed union of paths, not an arbitrary-copy union, so it does not worsen that pre-existing hole. It still permits the KN-096 construction anywhere: a literal type alias containing user copy, passed to a `string` prop, is skipped.

2. `../src/!(gate-fixtures)/**/*.stories.@(ts|tsx)` silently excludes a valid root story location: `apps/web/src/App.stories.tsx`. It also excludes names beginning `gate-fixtures`, such as `src/gate-fixtures2/Foo.stories.tsx`. No current real story is lost, but a normal future one will be. The addon-vitest plugin reads and normalizes Storybook’s `stories` configuration, so it inherits the same exclusion; it does not independently discover the omitted stories.

3. A plain literal cannot satisfy `StoryMeta` unless it is one of the seven registered paths. But type enforcement is trivially bypassed while lint still passes:

```ts
const meta = {
  title: 'Delete this application' as const,
  component: TitledBox,
} satisfies Meta<typeof TitledBox>
```

The Lingui rule explicitly skips `as const` literals before its type check. Storybook will index that copy as a sidebar title.

Findings:

- major — The Storybook glob drops valid stories at the source root, while the docs guard uses a different exclusion model. Adding `src/App.stories.tsx` will make it absent from Storybook and addon-vitest, yet the guard will still inspect it. The verifier only compares current files, so it cannot catch this future regression. [main.ts:8](/D:/Kar/Gandom/KarNama/apps/web/.storybook/main.ts:8) [guard.test.ts:52](/D:/Kar/Gandom/KarNama/apps/web/src/shared/story-docs/guard.test.ts:52) [KN-095.mjs:183](/D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-095.mjs:183)

- major — The claimed type-only meta exemption is bypassable without violating TypeScript. `as const` on either a JSX tooltip or a `Meta` title suppresses Lingui before `useTsTypes` runs, so `<Box title={'Delete this application' as const} />` passes lint and renders the untranslated tooltip. The fixture tests only the unasserted form. [no-unlocalized-strings.js:518](/D:/Kar/Gandom/KarNama/node_modules/eslint-plugin-lingui/lib/rules/no-unlocalized-strings.js:518) [story-meta.ts:32](/D:/Kar/Gandom/KarNama/apps/web/src/shared/story-docs/story-meta.ts:32)

- major — The verifier mutates tracked ESLint configuration and fixtures in the shared checkout. If the process is killed after it writes the reintroduced `title` exemption, `finally` does not run and the lint hole remains. This is especially bad because ordinary lint ignores the fixture directory that exposes the hole. [KN-095.mjs:20](/D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-095.mjs:20) [KN-095.mjs:48](/D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-095.mjs:48) [eslint.config.js:128](/D:/Kar/Gandom/KarNama/apps/web/eslint.config.js:128)

VERDICT
score: 4.0
criticals: 0
one-line: Replace the prefix-negative Storybook glob and close the `as const` Lingui bypass, which still permits untranslated JSX tooltips.