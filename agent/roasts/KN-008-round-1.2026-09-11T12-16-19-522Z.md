1. **Stroke:** Yes. `DESIGN.md:464-466` explicitly requires a fixed 2px stroke at every size, with the 14px Color Picker check as evidence. `vectorEffect="non-scaling-stroke"` is correct.

2. **RTL direction:** No automatic mirroring is warranted by this file. The source design is Persian RTL, yet its named `arrow-right`, `log-out`, `external-link`, and `sort` glyphs are drawn in their current orientations. Nothing in the captured RTL screens specifies mirrored variants. The component should remain direction-neutral; a future caller can deliberately transform an icon if a specific interaction requires it.

Findings:

- **minor** — An empty accessible label produces an unnamed image instead of a decorative icon. `<Icon name="trash" aria-label="" />` follows the `label !== undefined` branch and renders `role="img" aria-label=""`, leaving an unnamed graphic in the accessibility tree. Treat blank labels as absent, or reject them. [Icon.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\icon\Icon.tsx:28)

- **minor** — The claimed prop defaults are not actually tested. Every default story supplies `size: 'base'` and `color: 'text/secondary'` through meta args, so the story runner never exercises the default-parameter path in `Icon`. A regression changing either fallback would still leave the “Default” story’s assertions green. Add a render of `<Icon name="link" />` and assert its 24px size and secondary colour. [Icon.stories.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\icon\Icon.stories.tsx:16) [Icon.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\icon\Icon.tsx:22)

- **minor** — The new icon files violate the repository’s absolute-import convention. They import the theme through `../../theme/tokens`, despite the explicit ban on relative parent imports. Use `src/theme/tokens`. [Icon.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\icon\Icon.tsx:2) [Icon.stories.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\icon\Icon.stories.tsx:5)

`node agent/scripts/todo.mjs validate` passes. I could not run Vitest in this read-only sandbox because Vite must create `node_modules/.vite-temp`.

VERDICT
score: 8.3
criticals: 0
one-line: Test the actual omitted-prop defaults, then fix the empty aria-label path.