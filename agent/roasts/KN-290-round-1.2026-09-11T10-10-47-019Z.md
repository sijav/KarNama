1. Yes, the SVG stroke should survive: `preserve-parent-color` behaves like `none` when it has an explicit, non-inherited colour, and an explicit system colour is used rather than overwritten. The probe proves rendered RGB equality with that keyword in this browser, while the custom property proves the intended keyword. It does not prove that a real Windows theme maps the keyword differently. [CSS Color Adjustment](https://www.w3.org/TR/css-color-adjust-1/)

2. Checked and indeterminate remain distinguishable by shape. Enabled versus disabled is not guaranteed visually distinguishable: a legitimate user palette may map `ButtonText` and `GrayText` to the same value. The unchecked hover loses its only hover treatment because forced colours remove `box-shadow`; its edge remains `ButtonBorder` on `ButtonFace`, which is a valid pair. Focus output is not tested here.

Findings:

- **critical** — The verifier rejects a valid forced-colours palette. [KN-290.mjs:163-165](D:\Kar\Gandom\KarNama\agent\scripts\verify\KN-290.mjs:163) fails whenever `ButtonText` equals `GrayText`, despite the task requiring that the keyword be readable “whatever the palette.” CSS explicitly permits user colour choices to take precedence and does not guarantee those two system colours differ. The verifier must assert the selected keywords and each mark’s match to its probe, without requiring the probes to differ. This is the same error KN-288’s prose already documents. [CSS Color 4](https://www.w3.org/TR/css-color-4/)

I could not run the production verifier in this read-only sandbox because its required temporary build directory cannot be created.

VERDICT
score: 6.0
criticals: 1
one-line: Remove the verifier’s invalid requirement that ButtonText and GrayText resolve to different pixels.