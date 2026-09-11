1. `unicode-bidi: bidi-override` and `isolate-override` do not choose direction from content. With the input direction equal to the field’s, they still start at that same edge; `plaintext` is the relevant CSS value that changes paragraph direction from content. `dir="auto"` would also be relevant, but `InputProps` exposes neither `inputProps` nor `dir`. At runtime a passed `inputProps` is overwritten by Input’s own `inputProps` at [Input.tsx:92-94](D:\Kar\Gandom\KarNama\apps\web\src\shared\input\Input.tsx:92), so it cannot set `dir="auto"` on the native input.

2. Narrowing away from placeholder direction is sound for Chromium. The standard pseudo and Chromium’s legacy `::-webkit-input-placeholder` path do not provide an independent usable `direction`/`writing-mode` layout path here. Placeholder `text-align` can move it, and [textInsets](D:\Kar\Gandom\KarNama\apps\web\src\shared\input\Input.stories.tsx:187) already rejects it.

Findings:

- major — The change adds two long implementation memos directly beside shipped source, violating the repository’s explicit documentation-location rule. They are not Storybook docs and one is stale: [#KN-297…md:10-19](D:\Kar\Gandom\KarNama\apps\web\src\shared\input\#KN-297%20-%20The%20Input's%20text%20measurement%20takes%20its%20direction%20from%20the%20input.md:10) records the superseded exit condition and implementation. [#KN-286…md:1](D:\Kar\Gandom\KarNama\apps\web\src\shared\input\#KN-286%20-%20An%20Input's%20error%20is%20not%20announced%20when%20it%20appears%20while%20the%20field%20has%20focus.md:1) is the same prohibited pattern. Remove them; user-facing Storybook prose belongs only under `shared/story-docs/{en,fa}`.

VERDICT
score: 8.1
criticals: 0
one-line: Remove the prohibited, stale task memos from beside Input source