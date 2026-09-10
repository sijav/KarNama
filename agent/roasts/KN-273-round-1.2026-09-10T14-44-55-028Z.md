1. Yes, the unselected chip’s border is exempt: its visible, adequately contrasting text identifies the button. But that does not exempt its selected state. The selected fill is explicitly the state indicator and is only 1.22:1 against white, 1.14:1 against the page, and 1.11:1 against the secondary surface.

2. KN-275’s 3.3:1 margin is a reasonable measurable guard for a one-pixel edge, though not generous. Its hover delta of roughly 1.3:1 is not itself a WCAG failure, because WCAG does not require state-to-state contrast. The exit should explicitly retain the disabled Input border treatment, rather than only testing Default and unchecked states.

3. `Owner, KN-273` is enough to meet this card’s stated closure condition, and the board evidence records the four choices. It is weak audit provenance. Preserve the exact question/options and answer in the KN-273 record, but do not invent a new closure gate for it.

Findings:

- **critical** — The Filter Chip conclusion is wrong for the selected state. `FilterChip.tsx` says selection “reads as filled” and uses `bg/brand/container` as both fill and border ([FilterChip.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\filter-chip\FilterChip.tsx:70)). That token is `#dbeafe` ([tokens.ts](D:\Kar\Gandom\KarNama\apps\web\src\theme\tokens.ts:18)), which has only 1.22:1 contrast against its white unselected-page surface. `DESIGN.md` expressly leaves the Filter Chip on `border/default` ([DESIGN.md](D:\Kar\Gandom\KarNama\DESIGN.md:711)), so KN-275 will not fix it. WCAG permits omitting a control boundary when visible text identifies the control, but visual information necessary to identify a state still needs 3:1 against adjacent colors. File a critical card for the selected Filter Chip state. [W3C’s SC 1.4.11 guidance](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast)

- **minor** — The KN-273 verifier does not establish that this decision was the one answered through the question tool. Its only check searches the whole 2026-09-10 section for `question tool` ([KN-273.mjs](D:\Kar\Gandom\KarNama\agent\scripts\verify\KN-273.mjs:52)); the section introduction already contains that phrase for the other decisions. The new decision paragraph can lose its question-tool provenance and this check still passes. Bind that assertion to the KN-273 paragraph, or accurately state that the script verifies only the written decision, not the question-tool provenance.

VERDICT
score: 6.8
criticals: 1
one-line: File and fix the selected Filter Chip’s 1.1-1.2:1 state fill, which its text-boundary exemption does not cover.