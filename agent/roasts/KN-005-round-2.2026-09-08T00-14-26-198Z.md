1. Dark status chips now pass: `4.50–8.09:1`. Semantic primary/secondary/brand/error on `#2e2e2e` pass at `10.16`, `4.57`, `4.65`, and `4.62:1`; on-accent passes brand at `4.51:1`. Hue stays within rounding noise, so none changed family.

But on-accent is also MUI’s error `contrastText`. Against derived error main `#e74747`, it is only `3.64:1`; against error dark/hover `#e81d1d`, `4.24:1`. That use was not tested.

2. No dark fills are plausibly confusable. Closest are custom-1 `#054638` and custom-4 `#02474e`; they remain clearly green versus cyan-teal. Applied `#00155c` and custom-2 `#2e0061` are also distinguishable blue versus violet.

3. No palette pair overshoots badly. The linear walk has at most a 0.01-HSL-lightness quantization error, and the resulting ratios are just above the threshold. A direct solve or binary search would be cleaner and more stable, but it is not the current defect.

4. The light-chip assertion is correct. All nine pass, with interview the narrowest at `4.51:1`. `text/secondary` on light page is also `4.51:1`, so it passes, narrowly. It would fail if the page token became even slightly lighter without updating secondary text.

Findings:

- **critical** — Dark destructive controls are unreadable. `theme.ts` assigns the one derived `text/on-accent` value to both primary and error `contrastText`, while `darkMode.ts` derives it solely to pass on the blue brand background. The resulting `#f7f7f7` is 3.64:1 on dark error main and 4.24:1 on dark error hover. The test only checks blue, so it approves a failing destructive button. [darkMode.ts](D:\Kar\Gandom\KarNama\apps\web\src\theme\darkMode.ts:204) [theme.ts](D:\Kar\Gandom\KarNama\apps\web\src\theme\theme.ts:76)

- **critical** — The prior production colour-scheme finding is not fixed. `main.tsx` always mounts `AppProviders` without a preference, so production is permanently light. Moving the missing setting and persistence to KN-104 acknowledges the defect but does not make KN-005’s colour-scheme provider usable outside Storybook. [main.tsx](D:\Kar\Gandom\KarNama\apps\web\src\main.tsx:16)

- **major** — The literal-value guard still excludes the entire `theme` directory, including the `Swatches` component. It therefore cannot establish the required “no component file” invariant. That component presently hardcodes dimensions and radius, including `40`, `16`, and `999`, contrary to the repository’s token-only rule. Filing KN-105 did not repair it. [noLiterals.test.ts](D:\Kar\Gandom\KarNama\apps\web\src\theme\noLiterals.test.ts:18) [Tokens.stories.tsx](D:\Kar\Gandom\KarNama\apps\web\src\theme\Tokens.stories.tsx:28) [Tokens.stories.tsx](D:\Kar\Gandom\KarNama\apps\web\src\theme\Tokens.stories.tsx:43) [Tokens.stories.tsx](D:\Kar\Gandom\KarNama\apps\web\src\theme\Tokens.stories.tsx:70)

VERDICT
score: 3.0
criticals: 2
one-line: Fix dark error contrast, because the shared on-accent token makes destructive buttons fail WCAG despite the new contrast suite passing.