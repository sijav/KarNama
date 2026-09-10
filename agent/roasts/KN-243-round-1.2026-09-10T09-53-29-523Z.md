1. Yes. The empty focused field is unprotected. A focused-only pseudo-element rule such as:

```ts
'&.Mui-focused input::placeholder': { textIndent: '3px' }
```

moves the visible placeholder, but `Focus` supplies `defaultValue`, so no placeholder is rendered, and `getComputedStyle(input)` does not enumerate pseudo-element styles. Chrome text selection on Tab does not move glyph layout; scroll changes are captured. Ancestor padding/border/transform changes that reposition the input are generally caught through its bounding box, and inherited text properties are reflected in its computed style.

2. Exempting the complete outline family is correct for this specific invariant. `outline`, including negative `outline-offset`, does not participate in layout and cannot move the input’s text. It can obscure glyphs or create a bad visual focus state, but that is a separate visual-regression concern. Exempting only `outline-width` would be artificially narrow and would make valid non-layout outline changes fail.

Findings:

- critical — The exit condition is not met for an empty focused Input. [`Input.stories.tsx:113`](D:\Kar\Gandom\KarNama\apps\web\src\shared\input\Input.stories.tsx:113) only tests a filled input (`defaultValue: TYPED` at line 115), while [`Input.tsx:70`](D:\Kar\Gandom\KarNama\apps\web\src\shared\input\Input.tsx:70) establishes that the placeholder is styled through `input::placeholder`, outside the snapshot at [`Input.stories.tsx:26`](D:\Kar\Gandom\KarNama\apps\web\src\shared\input\Input.stories.tsx:26). Add an empty-focus story that snapshots `getComputedStyle(box, '::placeholder')` before and after focus, plus a verifier mutation adding focused-only placeholder `textIndent` and requiring that specific story to fail.

I ran `node agent/scripts/verify/KN-243.mjs`; it could not execute its mutation checks in this read-only sandbox because the verifier deliberately writes `Input.tsx`. Its baseline Storybook run was also blocked from creating Vite’s temporary config file. That is a sandbox limitation, not a finding against the change.

VERDICT
score: 5.0
criticals: 1
one-line: Test the empty focused placeholder pseudo-element, because the current Focus snapshot cannot see it.