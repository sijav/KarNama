1. MUI’s disabled behavior is fine: native `disabled` removes it from tab order, and ButtonBase’s disabled pointer-events are appropriate. Pointer focus does not get `.Mui-focusVisible`; the custom ring correctly depends on that class. Resetting icon margins and using `gap` also avoids MUI’s asymmetric icon margins in RTL. The real divergence is touch: the custom unconditional `&:hover` reinstates hover on devices where MUI deliberately resets it.

2. Holding Space on a focused enabled native button does match `:active` in Chromium, so it validates the CSS pressed fill. It is not a pointer-press test, though. The destructive dark derivation is not sensible: it reverses the visual depth of the destructive states, making pressed lighter than default and hover.

Findings:

- critical — The required “75 combinations render from a single story driven by args” is not met. `Matrix` renders 30 buttons, 15 resting enabled and 15 disabled. Hover, pressed, and focus are only transient test interactions, and in ordinary Storybook the interaction block returns without running. More importantly, size, variant, and state are hard-coded rather than driven by controls/args. A reviewer opening Matrix cannot inspect the 75 drawn states, nor drive them with args. [Button.stories.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\button\Button.stories.tsx:102) [Button.stories.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\button\Button.stories.tsx:129)

- critical — The stories violate the repository’s controls contract. The canvas always renders the localized fixed label, while `children` is an empty hidden arg and excluded from Controls. Thus the displayed value is not represented by a control, and changing `children` cannot affect it. This also independently disproves the “driven by args” close condition. [Button.stories.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\button\Button.stories.tsx:15) [Button.stories.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\button\Button.stories.tsx:23) [Button.stories.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\button\Button.stories.tsx:31)

- major — On a touch device, tapping a button can leave `:hover` matched. MUI guards/resets its hover behavior under `hover: none`, but this unconditional rule applies the Figma desktop-hover fill anyway. For example, a tap on a primary button can leave it blue-hover rather than default after activation. Add the same hover-capability guard around the custom hover styles. [Button.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\button\Button.tsx:141)

- major — Derived dark destructive states invert the interaction hierarchy. The current derivation produces approximately default `#ed2c2c`, hover `#d84141`, pressed `#e34646`: pressed is brighter than default, even though the light design progresses toward the darker `red/700`. A press therefore looks like release/emphasis instead of depression in dark mode. The palette tests do not test this state relationship or its button text pairing. [darkMode.ts](D:\Kar\Gandom\KarNama\apps\web\src\theme\darkMode.ts:246) [darkMode.ts](D:\Kar\Gandom\KarNama\apps\web\src\theme\darkMode.ts:272)

`node agent/scripts/todo.mjs validate` reports the board valid. The attempted Vitest run is blocked by sandbox temp-directory permissions, not by the code.

VERDICT
score: 3.5
criticals: 2
one-line: Rebuild Matrix so all 75 visible states are genuinely rendered and driven by its args/Controls.