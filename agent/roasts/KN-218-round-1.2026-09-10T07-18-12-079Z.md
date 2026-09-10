1. Whole-file Lingui exemption: currently `tokens.ts` contains design values, not UI copy. But nothing prevents a future `label: 'New'`, helper text, or similar literal being added there and silently bypassing Lingui. This is an overbroad suppression.

2. Shadow comparison: it does not pass merely because the inline write occurs. JavaScript evaluates `style.boxShadow` before calling `computedShadow(...)`, so the actual drawn value is read first. The temporary inline style only normalizes the expected token.

3. Removing `card`/`modal` exemptions: source search finds no live reliance outside `tokens.ts` (which is now excluded) and tests. A future bare string assigned to a `card` or `modal` property would be linted, assuming the lint gate runs.

Findings:

- **major** — The new whole-file Lingui exclusion creates an unguarded path for untranslated shipped copy, violating the repository’s rule that every user-facing string must be localized and its rule that suppressions require a `TECH-DEBT.md` record. `tokens.ts` has no structural mechanism preventing copy fields, and the configuration explicitly excludes the entire file. [eslint.config.js](D:\Kar\Gandom\KarNama\apps\web\eslint.config.js:185) [eslint.config.js](D:\Kar\Gandom\KarNama\apps\web\eslint.config.js:192)

- **minor** — The new story accesses the browser global as bare `getComputedStyle`, contrary to the repository requirement to access browser globals through `window.*`. Use `window.getComputedStyle` in both locations. [Tooltip.stories.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\tooltip\Tooltip.stories.tsx:16) [Tooltip.stories.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\tooltip\Tooltip.stories.tsx:67)

I attempted `node agent/scripts/verify/KN-218.mjs`; it cannot complete in this read-only review sandbox because Vitest needs to create `.vite-temp` files and the verifier intentionally mutates `Tooltip.tsx`. That does not establish a product defect.

VERDICT
score: 7.5
criticals: 0
one-line: remove or narrowly constrain the whole-file Lingui exemption, and record any unavoidable suppression in TECH-DEBT.md