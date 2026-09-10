1. Short names keep the same intrinsic width, 16px inline padding, and 24/28px outer height. The 4px/3px padding also centers the line box at the same point the old flex alignment did, so Vazirmatn descenders should not be clipped by `overflow: hidden`. But `vertical-align: middle` changes baseline behavior in an inline formatting context, so the chip can shift relative to adjacent text. It is harmless in a flex row, not universally equivalent to the old inline-flex baseline.

2. `dir=auto` uses the first strong character: leading digits and emoji are ignored; `Google استخدام` becomes LTR, `۱۲۳ استخدام` becomes RTL. A label containing only digits/emoji has no strong character and falls back to its surrounding direction. It does not move a sole chip in an RTL header, whose position remains controlled by the parent’s text alignment. It can affect bidi ordering among inline siblings. The ellipsis retains the logical start for labels with a resolved base direction, but “always” is too strong for neutral-only labels.

Findings:

- major — The new block padding violates the repository’s non-negotiable token rule. `paddingBlock` produces `3px` for M, but 3 is explicitly not a spacing token and the design contract says off-scale 3 was corrected to 4. This adds an un-tokenised spacing value directly in the component, even though it happens to be computed. Preserve the flex geometry and put ellipsis behavior on a truncating child, or add an approved theme role if this spacing is genuinely required. [StatusChip.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\status-chip\StatusChip.tsx:48)

- minor — The new bidi claim is only tested for Persian data in an English document. It does not exercise the opposite input that motivated `dir=auto`, such as `Google استخدام` in the Persian UI, nor a digit/emoji-led name. Consequently the story and mutation establish only that a Persian-leading label resolves RTL, not that truncation behaves as documented for the mixed-script names users can enter. [StatusChip.stories.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\status-chip\StatusChip.stories.tsx:184)

VERDICT
score: 7.4
criticals: 0
one-line: Remove the un-tokenised 3px vertical padding while retaining the truncation behavior.