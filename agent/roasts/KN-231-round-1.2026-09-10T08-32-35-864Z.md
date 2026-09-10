1. The `hidden` span is not rendered or selectable, and ordinary accessible-name computation excludes it. A parent, including a future Status Control, will not acquire its text unless it explicitly references it. Find-in-page behavior is browser-dependent, so `hidden` is not a privacy boundary.

2. It is not announced twice when open. MUI’s open popper `aria-describedby` is overwritten by this component’s prop, so only the hidden node remains referenced.

3. Yes. A child-supplied `aria-describedby` wins. MUI merges `children.props` after the Tooltip’s props, so the hidden tooltip description is silently dropped.

Findings:

- critical — Existing descriptions are destroyed rather than merged. Pass a trigger such as `<button aria-describedby="validation-help">`; its own prop overwrites `aria-describedby={descriptionId}`, leaving only `validation-help` and omitting the tooltip text before and after focus. This violates the tooltip’s required description behavior for a valid trigger state. Merge the existing IDREF list with `descriptionId`, and add a story covering both descriptions. [Tooltip.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\tooltip\Tooltip.tsx:47) and [MUI Tooltip source](D:\Kar\Gandom\KarNama\node_modules\@mui\material\Tooltip\Tooltip.mjs:484).

`node agent/scripts/todo.mjs validate` passes. The KN-231 verifier cannot run in this read-only sandbox because it intentionally rewrites `Tooltip.tsx`.

VERDICT
score: 5.0
criticals: 1
one-line: Merge a trigger's existing aria-describedby with the tooltip description ID instead of letting it replace the tooltip text