1. Light tooltip in dark is defensible: this component is explicitly an inverse surface, and its documented fill is `text/primary`. Figma provides no dark design. Do not copy Material’s convention solely because it is Material’s. But the dark pair must be a named, theme-derived inverse role, not a component-local computed colour.

2. No. The result is `#616161` on `#d8dfee` (4.63:1), an arbitrary generated grey. It is not a Figma token or a named theme role. That violates the theme contract even though it passes contrast.

3. A direct source inventory found no other `backgroundColor` assignment from a `text/*` role. A custom lint rule can catch direct accesses such as `backgroundColor: theme.karnama.semantic['text/primary']`, but it will not catch indirect helpers or spreads. It needs an AST rule plus an explicit allowlist for a named inverse-surface role, not an exception for Tooltip.

Findings:

- major — [Tooltip.tsx:32](D:/Kar/Gandom/KarNama/apps/web/src/shared/tooltip/Tooltip.tsx:32) computes a new unowned colour inside the component via `ensureContrast`. In dark this emits `#616161`, which is neither a Figma token nor a named semantic/theme role. The repository rule requires a needed role to be added to the palette. Move this pair into the theme as named derived inverse-surface roles, then have Tooltip consume those roles.

- minor — [Tooltip.tsx:19](D:/Kar/Gandom/KarNama/apps/web/src/shared/tooltip/Tooltip.tsx:19) adds a JSDoc documentation block to a `.tsx` file. The project explicitly forbids Storybook/user-facing documentation prose in code; it belongs in `shared/story-docs`.

- minor — [#KN-398 - The dark tooltip is white on light grey.md:1](</D:/Kar/Gandom/KarNama/apps/web/src/shared/tooltip/#KN-398 - The dark tooltip is white on light grey.md:1>) is untracked documentation placed beside the component. Documentation is required under `shared/story-docs/{en,fa}`, not component directories.

`node agent/scripts/todo.mjs validate` reports the board valid. Changed-file ESLint and TypeScript checks pass; the focused Vitest run cannot start because the read-only sandbox prevents Vite from writing its temporary config.

VERDICT
score: 6.5
criticals: 0
one-line: Make the tooltip’s dark foreground a named theme role instead of generating an unowned #616161 inside the component.