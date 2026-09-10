1. Yes, a 1px edge can meet WCAG 2.2: its 3:1 requirement has no minimum thickness. Here `#2563eb` has sufficient contrast against the stated backgrounds and fill, and its 4.17:1 contrast against the unselected `#e5e7eb` edge also supports 1.4.1. W3C nevertheless calls avoiding particularly thin indicators best practice. A focused neighbor is not inherently a failure, provided the ring and selected edge remain visibly separate, but the proposed card does not require that test. [W3C 1.4.1 guidance](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html), [W3C 1.4.11 guidance](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)

2. Yes. KN-279 can pass while still producing an ambiguous pressed or focused state. It only requires a story to “prove” separation, without defining a minimum contrast between the selected-edge role and `border/focus`, a non-colour distinction, or a side-by-side focused-neighbor case.

Findings:

- major — KN-279’s exit permits a token that is nominally distinct from `border/focus` but visually indistinguishable, for example `#2563ec` beside the current `#2563eb`. It would meet every required 3:1 ratio against backgrounds and fill, and a weak story could merely assert different CSS values. A keyboard user holding Space on an unselected chip reaches `:active`; its edge is already `border/focus`, while the selected chip’s pale-fill distinction is only 1.22:1. The card must require either at least 3:1 contrast between selected and pressed indicators or a non-colour geometric distinction, plus a rendered selected/unselected-pressed and selected/focused-neighbor test. [agent/board.json:6978](D:\Kar\Gandom\KarNama\agent\board.json:6978), [FilterChip.tsx:85](D:\Kar\Gandom\KarNama\apps\web\src\shared\filter-chip\FilterChip.tsx:85), [FilterChip.tsx:86](D:\Kar\Gandom\KarNama\apps\web\src\shared\filter-chip\FilterChip.tsx:86)

The KN-276 verifier and board validation pass. The owner-decision record and the dependency on KN-272 are present.

VERDICT
score: 7.0
criticals: 0
one-line: Make KN-279 require measurable selected-versus-pressed/focused separation, not merely a story that claims it.