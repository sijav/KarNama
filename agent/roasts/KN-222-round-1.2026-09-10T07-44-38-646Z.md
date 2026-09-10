1. No. `WithoutCssBaseline` still mounts `AppProviders`, which unconditionally renders `<CssBaseline />`; it only overrides two inherited `box-sizing` values. CssBaseline’s `body` typography remains active. In particular, Tooltip does not set `fontFamily`, so CssBaseline’s body font family can change glyph metrics, wrapping, and therefore tooltip height. This is not a render without CssBaseline.

2. A later Storybook story does not run before the returned cleanup: Storybook runs accumulated cleanups before the next story. If cleanup throws, the next story aborts and the failure is visible, although the mutated document styles can remain for that browser session. This is not silent leakage, but the test does not independently prove restoration.

3. The named exemption is acceptable here. This is a single internal CSS identifier, and the template-literal selector needs no extra exemption. It is narrowly named, consistent with `STORAGE_KEY`; avoid widening it into a class-name pattern.

Findings:

- critical — The exit condition requires a story that renders the tooltip without CssBaseline. This one explicitly renders under it through the global preview decorator, then counteracts only `box-sizing` on `html` and `body`. It therefore does not prove standalone behavior against the actual no-reset configuration required by the task. The active CssBaseline typography can still alter the tooltip’s rendered height because Tooltip leaves `fontFamily` inherited. Use a story-level provider path that omits CssBaseline entirely, while retaining only the needed theme/i18n setup. [Tooltip.stories.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\tooltip\Tooltip.stories.tsx:85) [preview.tsx](D:\Kar\Gandom\KarNama\apps\web\.storybook\preview.tsx:21) [AppProviders.tsx](D:\Kar\Gandom\KarNama\apps\web\src\app\AppProviders.tsx:81) [Tooltip.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\tooltip\Tooltip.tsx:83)

`node agent/scripts/todo.mjs validate` reports the board valid. `node agent/scripts/verify/KN-222.mjs` could not complete in this read-only sandbox: Vitest cannot create its Vite temp config and the verifier’s deliberate source mutations are denied. That is an environment limitation, not a finding.

VERDICT
score: 4.0
criticals: 1
one-line: Render WithoutCssBaseline under providers that genuinely omit CssBaseline, rather than overriding two of its CSS effects.