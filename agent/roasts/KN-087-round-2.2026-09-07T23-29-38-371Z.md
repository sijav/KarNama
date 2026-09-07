1. Yes. A third route exists: `aria-label="delete/application"` and `title="delete/application"` both pass because the global `^[a-z-]+/[a-z0-9-/]+$` value exemption applies to every value, including accessible names and tooltips. I ran targeted ESLint probes; both exited clean. A typed indirect value also passes:

```tsx
type Label = 'Delete this application'
const label: Label = 'Delete this application'
<IconButton aria-label={label} />
```

2. The stories block applies to current `*.stories.tsx` files, after the source block. That means it re-exempts every JSX `title` prop in a story, not merely the Storybook metadata title. A probe containing `<Box title="Delete this application" />` under `src/app/App.stories.tsx` passed lint. Also, `src/foo.stories.mdx` is an explicitly supported Storybook path but matches neither Lingui block.

3. Yes. The verifier can miss a re-added exemption. It only scans the `structuralProps` declaration text and only lints fixtures under `src/gate-fixtures`. A later `src/shared/**` override can build `aria-label` dynamically, or import its pattern, and the static check plus all current fixture probes remain green. KN-093 documents this but does not fix it.

Findings:

- critical — The global “token name” value exemption still permits untranslated accessible names and tooltips. `aria-label="delete/application"` and `title="delete/application"` both pass the actual rule, despite being user-facing English text. The path-like fixture only covers capitalized `New/Applied`, not this already-configured lower-case path shape. [eslint.config.js](/D:/Kar/Gandom/KarNama/apps/web/eslint.config.js:42)

- critical — The stories-only override recreates the exact `title` hole for every JSX element in a `.stories.tsx` file. It cannot distinguish the metadata field `meta.title` from `<Box title="Delete this application" />`; the latter passes lint and produces a visible tooltip in Storybook. [eslint.config.js](/D:/Kar/Gandom/KarNama/apps/web/eslint.config.js:164)

- critical — `useTsTypes: true` provides an untested indirect-value bypass. A literal string assigned through a literal type alias passes lint and then reaches `aria-label` unchanged. This uses no `as`, `any`, suppression, or other prohibited TypeScript escape hatch. [eslint.config.js](/D:/Kar/Gandom/KarNama/apps/web/eslint.config.js:79)

- critical — Storybook explicitly accepts `src/**/*.mdx`, but neither Lingui config block covers MDX. A supported `src/foo.stories.mdx` can render `<button aria-label="Delete this application" />` with no Lingui enforcement at all. [main.ts](/D:/Kar/Gandom/KarNama/apps/web/.storybook/main.ts:4) [eslint.config.js](/D:/Kar/Gandom/KarNama/apps/web/eslint.config.js:142) [eslint.config.js](/D:/Kar/Gandom/KarNama/apps/web/eslint.config.js:164)

- major — The claimed structural config protection is still a source-text heuristic, not a resolved-config check. It only inspects one constant and fixtures outside `src/shared`; a later scoped override, including one whose pattern comes from an import or runtime construction, evades every KN-087 check. Filing KN-093 acknowledges the defect, but KN-087’s verifier currently reports success while the exemption can be restored. [KN-087.mjs](/D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-087.mjs:49) [KN-087.mjs](/D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-087.mjs:69)

VERDICT
score: 2.0
criticals: 4
one-line: Remove value- and story-wide exemptions that can reach aria-label/title, then test indirect values and resolved ESLint configuration across every source and Storybook file type.