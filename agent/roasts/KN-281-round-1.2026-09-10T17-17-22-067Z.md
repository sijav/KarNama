1. The forced-colours mechanism is right: `box-shadow` is removed in forced-colors mode and `ButtonBorder` is an appropriate system colour for a control edge. But Playwright’s `forcedColors: 'active'` only emulates the media feature, it is not proof against real Windows high-contrast themes or user-selected palettes. [MDN system colours](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/system-color), [Playwright API](https://playwright.dev/docs/next/api/class-browser)

2. `edgeOf` is fragile across CSSOM serialisations. It assumes a functional colour appears first, single spaces, and one shadow. Alpha in Chromium’s `rgba(...)` form works, but `inset`-first serialization or spacing differences produce false failures. Multiple shadows also fail rather than silently passing because the first `inset` becomes `inset,`. It is not a reliable cross-engine parser. Use an anchored parser that explicitly rejects commas, or compare the normalized computed value produced from a known expected shadow.

3. No other shipped component currently renders a 1.5px CSS border. But `DESIGN.md` says the Filter Chip pressed state must be 1.5px, while [FilterChip.tsx](D:/Kar/Gandom/KarNama/apps/web/src/shared/filter-chip/FilterChip.tsx:61) permanently uses `borderWidth: 1`, including `:active` at line 85. That is KN-282’s outstanding defect, not a second instance of Chromium flooring an implemented 1.5px border.

Findings:

- critical — The forced-colours implementation violates the task’s no-layout-space condition. [Checkbox.tsx](D:/Kar/Gandom/KarNama/apps/web/src/shared/checkbox/Checkbox.tsx:66) adds a real 1px border. With `box-sizing: border-box` at line 55, the exterior remains 20px, but the frame’s content box shrinks from 20px to 18px. This is not an overlaid inside stroke and the verifier never measures it. Use an absolutely positioned pseudo-element or other overlay fallback, then assert the forced-colours content/layout geometry.

- major — The untracked `#KN-281...md` is documentation prose beside the component, directly prohibited by the repository agreement. Component documentation belongs in both `src/shared/story-docs/en` and `src/shared/story-docs/fa`, not in `src/shared/checkbox`. It also cannot appear in the Checkbox Docs page as required.

- minor — The verifier’s forced-colours test proves only that a pixel differs from another pixel, [KN-281.mjs](D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-281.mjs:187). It does not assert the fallback remains inside the 20px frame or that the checkbox glyph/content geometry is unchanged, so it cannot detect the critical border-layout regression above.

`node --check agent/scripts/verify/KN-281.mjs` passes. I did not run the full verifier because it deliberately rewrites `Checkbox.tsx`, while this review environment is read-only.

VERDICT
score: 5.5
criticals: 1
one-line: Replace the forced-colours real border with an overlay fallback and verify it does not consume the Checkbox frame’s content layout.