1. A pointer reaches either control by entering the card, which activates `:hover` and unfolds them. Before that hover, neither control receives pointer events. A screen reader’s browse/virtual cursor can still encounter and activate both opacity-zero controls, because neither `opacity: 0` nor `pointer-events: none` removes them from the accessibility tree. Their labels are normal, but they are announced before they are visually revealed.

2. The CSS does keep both controls unfolded while the checkbox retains focus, including after deselection, because `:focus-within` remains true. Once focus leaves delete, folding is safe because focus has already moved; hover also prevents folding under the pointer. The implementation is sound here, but its test does not exercise either transition.

Findings:

- major — At rest, screen-reader browse mode exposes actionable but completely invisible controls. A virtual cursor will announce “Select [name], checkbox” and “Delete contact” while neither has visual presence; it can invoke delete without first causing the card to reveal its controls. This is a real accessibility mismatch, not fixed by `pointer-events`, which applies only to pointing devices. [ContactCard.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\contact-card\ContactCard.tsx:282) [ContactCard.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\contact-card\ContactCard.tsx:321)

- minor — The new story proves only forward Tab order. It never models the controlled parent updating `selected` to false while the checkbox still has focus, nor tabs away from delete and verifies folding. Therefore the author’s claims about those two state transitions are untested. [ContactCard.stories.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\contact-card\ContactCard.stories.tsx:144)

Lint and TypeScript completed cleanly. The browser story suite could not start because the read-only sandbox denies Vitest’s temporary config write.

VERDICT
score: 7.0
criticals: 0
one-line: Do not expose the folded destructive control to screen-reader browse mode before it has a visible counterpart.