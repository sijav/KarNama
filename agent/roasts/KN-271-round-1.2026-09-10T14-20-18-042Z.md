1. Yes. A selected FilterChip’s pressed state puts `border/focus` directly against its own `bg/brand/container`, not one of the three tested surfaces. In dark those derive to approximately `#3670ed` on `#207df9`, only **1.14:1**. The active border is effectively invisible.

2. `ensureContrast` can return below its requested ratio: it stops at lightness 0/1 and returns without a final success assertion. Hex rounding itself is safe when it returns early, because it measures the rounded hex before returning. The new six static-token tests would catch a failure for these two current border rows, but they do not make the helper’s contract true in general.

3. No. Leaving `border/default` unchecked is not defensible for the Input and unchecked Checkbox. That border is the visual boundary used to identify an enabled UI component, which WCAG 1.4.11 requires at 3:1 against adjacent colours. The fact that the light design is already at 1.24:1 is evidence of an existing design defect, not an exemption for the derived dark palette.

Findings:

- critical — The solution misses an existing `border/focus` use on a non-surface background. When a selected FilterChip is pressed, `&:active` changes its border to `border/focus`, while selection has already set both its background and normal border to `bg/brand/container` ([FilterChip.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\filter-chip\FilterChip.tsx:75), [FilterChip.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\filter-chip\FilterChip.tsx:85)). Derived values produce about 1.14:1, not 3:1. The test deliberately enumerates only the three neutral backgrounds ([darkMode.test.ts](D:\Kar\Gandom\KarNama\apps\web\src\theme\darkMode.test.ts:229)), so it certifies a palette that still fails in a rendered component.

- major — `border/default` remains a non-text-contrast failure for enabled controls. It is the only visible boundary of an unfocused Input and unchecked Checkbox, yet it is explicitly exempted ([darkMode.ts](D:\Kar\Gandom\KarNama\apps\web\src\theme\darkMode.ts:215)). “Not a state” is the wrong standard: 1.4.11 also covers visual information required to identify UI components. Neither the task test nor verifier measures this boundary.

- minor — The untracked planning/roast transcript is placed inside shipped source, [#KN-271…md](<D:\Kar\Gandom\KarNama\apps\web\src\theme\#KN-271 - The derived dark focus colour is below the 3 to 1 a focus indicator needs.md:1>). It duplicates board evidence and contains documentation prose outside the repository’s documented locations. Remove it rather than committing internal planning material under `src/theme`.

I ran the supplied verifier. It could not execute its Vitest or mutation checks in this read-only sandbox because Vitest needs to create `.vite-temp` files and the verifier edits `darkMode.ts`; that is an environment limitation, not a finding.

VERDICT
score: 3.5
criticals: 1
one-line: Test and fix border/focus against the selected FilterChip’s derived bg/brand/container, where it is currently about 1.14:1