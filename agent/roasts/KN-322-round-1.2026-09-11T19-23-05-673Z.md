1. Yes, `beforeEach` is awaited before each normal Storybook story and each inline Docs story. The static CSS import is Vite-managed, so its font URLs honor the configured Storybook base path. A failed font request rejects and prevents rendering, which is preferable to measuring fallback text; there is no timeout, so an indefinitely pending request leaves the story pending.

2. No. The Type story proves matching `FontFace` entries are loaded, not that its rendered glyphs use them. It also measures fixed CSS line-height, which is unchanged under fallback. KN-351 is a real counterexample: ButtonBase text still uses the browser button font.

Findings:

- **major** — The change does not establish, and the repository disproves, its claim that stories draw text in Vazirmatn. `Tokens.Type` only checks `document.fonts` and fixed line-box heights, so it remains green if a rendered component selects a fallback family. `ContactCard`’s name ButtonBase has no `fontFamily: 'inherit'` at [ContactCard.tsx](D:/Kar/Gandom/KarNama/apps/web/src/shared/contact-card/ContactCard.tsx:98), and StatusPicker’s “New status” ButtonBase has the same omission at [StatusPicker.tsx](D:/Kar/Gandom/KarNama/apps/web/src/shared/status-picker/StatusPicker.tsx:113). Both therefore render system button text despite the font being loaded. The asserted proof is inadequate at [Tokens.stories.tsx](D:/Kar/Gandom/KarNama/apps/web/src/theme/Tokens.stories.tsx:126).

- **major** — Extended Latin is still allowed to race. [preview.tsx](D:/Kar/Gandom/KarNama/apps/web/.storybook/preview.tsx:36) requests only Arabic and ASCII `a`; the package defines a separate `latin-ext` face. A story or Controls value containing `Škoda`, `Łódź`, or `İstanbul` triggers that unloaded face during render and can initially measure fallback metrics. The Type check only asserts the basic `U+0000-00FF` face at [Tokens.stories.tsx](D:/Kar/Gandom/KarNama/apps/web/src/theme/Tokens.stories.tsx:128). Load and assert a representative latin-ext glyph too.

I could not execute the browser story test: Vitest’s config bundling attempts to write `apps/web/node_modules/.vite-temp`, which this read-only sandbox denies. Board validation passed.

VERDICT
score: 5.0
criticals: 0
one-line: Make the proof assert rendered font use and load latin-ext, because loaded FontFace entries do not prevent real ButtonBase and extended-Latin fallback.