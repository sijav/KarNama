1. An `i18n` variable named exactly `i18n` is seen. Aliases, destructured `_`, and chained `useLingui().i18n._` are not matched by the new selector or scanner, though raw string arguments are currently rejected by the general Lingui rule. `Trans` aliases are worse: `<T id="…"/>` passes lint and is unseen.

2. A `JSXSpreadAttribute` is an attribute-list child. Because the selector requires that first child to be a `JSXAttribute`, `<Trans {...props} id="…"/>` passes. Comments are not JSX attribute nodes. Numeric and regex call arguments are `Literal` nodes, so both pass the new `arguments.0.type!='Literal'` selector.

Findings:

- critical — `i18n._(/* comment */ 'Delete this application')` passes lint but is not matched by the scanner, because [catalog.test.ts:46](D:\Kar\Gandom\KarNama\apps\web\src\i18n\catalog.test.ts:46) permits only whitespace after `(` and the selector at [eslint.config.js:320](D:\Kar\Gandom\KarNama\apps\web\eslint.config.js:320) allows its string literal argument. I ran this exact probe against the real config: exit 0. A retained comment therefore restores the silent English fallback.

- critical — `<Trans {...props} id="Delete this application" />` passes lint and the scanner misses it. The regex requires `id` immediately after `<Trans`, while [eslint.config.js:329](D:\Kar\Gandom\KarNama\apps\web\eslint.config.js:329) does not report a first-child spread. I ran this exact probe, with a plain JSX string id, and ESLint exited 0. A trailing spread is also allowed and can override an otherwise scanned static id at runtime.

- critical — An aliased import bypasses both exact-name checks: `import { Trans as T } ...; <T id={'Delete this application'} />` passed the real lint configuration in my probe. The scanner at [catalog.test.ts:46](D:\Kar\Gandom\KarNama\apps\web\src\i18n\catalog.test.ts:46) and both JSX selectors at [eslint.config.js:325](D:\Kar\Gandom\KarNama\apps\web\eslint.config.js:325) and [eslint.config.js:329](D:\Kar\Gandom\KarNama\apps\web\eslint.config.js:329) only recognize the spelling `Trans`.

- critical — The “Literal” test permits non-string literals. Both `i18n._(123)` and `i18n._(/id/)` passed ESLint in my probe and neither can be found by the catalog regex. This directly violates the promised lint condition, even if a later TypeScript build may reject the calls.

- major — `t` and `msg` remain approved by the repository rules but are neither scanned nor forbidden. “The codebase does not use them” is not construction: adding `t\`Delete this application\`` passes the localization lint while [catalog.test.ts:46](D:\Kar\Gandom\KarNama\apps\web\src\i18n\catalog.test.ts:46) never sees its id.

- major — The new fixture is ignored by ordinary lint and no verifier executes it. [KN-003.mjs:143](D:\Kar\Gandom\KarNama\agent\scripts\verify\KN-003.mjs:143) only discovers `unlocalized*.tsx`; `unscannable-ids.tsx` can start passing or be removed without any automated failure. The committed fixture is presently evidence, not a lasting gate.

VERDICT
score: 1.5
criticals: 4
one-line: Replace spelling-based selectors and regex scanning with an AST-aware, import-aware rule/scan that permits only string ids, forbids all Trans spreads and aliases, and is exercised by a verifier.