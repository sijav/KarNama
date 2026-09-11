1. No bypass among the listed cousins: parentheses and interpolated templates still match the selector; `satisfies` and angle assertions do not trigger Lingui’s `TSAsExpression` early return; a conditional `as const` is not a valid const assertion. I found no listed form that passes today.

2. The rule shares Lingui’s source block exactly. It does overreach: `Literal` also includes numbers and booleans, so `0 as const` is prohibited despite KN-217 being about copy.

3. Manual `--no-ignore` linting produces exactly the three intended `no-restricted-syntax` failures, and the object line produces none. But these fixtures are not part of the automated gate.

Findings:

- critical — The two KN-217 fixtures are completely unverified in CI. Normal lint ignores all `src/gate-fixtures/**`; the only verifier that re-lints fixtures discovers and requires only filenames beginning `unlocalized`. Both new files begin `as-const`, so deleting the restriction or changing its selector to miss these cases leaves every normal check and `KN-003` verifier green. This fails the exit condition’s requirement that the committed fixtures prove the rule. [KN-003.mjs](D:\Kar\Gandom\KarNama\agent\scripts\verify\KN-003.mjs:143), [as-const-copy.tsx](D:\Kar\Gandom\KarNama\apps\web\src\gate-fixtures\as-const-copy.tsx:8)

- minor — The selector bans all ESTree `Literal` values, not merely string copy. Therefore numeric and boolean const assertions are rejected, contrary to the stated intent and documentation saying it handles “a string or template literal.” [eslint.config.js](D:\Kar\Gandom\KarNama\apps\web\eslint.config.js:308)

VERDICT
score: 5.0
criticals: 1
one-line: Add the KN-217 fixtures to an automated no-ignore verifier that requires their specific no-restricted-syntax failures.