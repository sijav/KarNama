1. No. `LatinLedInPersian` proves LTR resolution and overflow, not that the visible ellipsis removes the logical end. It would still pass if the label used `text-overflow: clip`.

2. Yes. `DigitLedResolvesRtl` runs under an LTR page yet observes RTL, so inherited direction cannot explain the result.

3. No. `NoLettersFollowsThePage` only renders English/LTR, does not assert the document direction, and has no Persian counterpart. Removing `dir="auto"` would still pass that story.

4. No. The new design claim is not exact. `dir=auto` uses the first strong bidi character, not the first letter. For example, an LRM followed by digits has no letter but resolves LTR in an RTL page; RLM followed by digits resolves RTL in an LTR page. The HTML standard defines this in terms of the first `L`, `AL`, or `R` character, and otherwise falls back to the parent direction. [HTML Standard, `dir` attribute](https://html.spec.whatwg.org/multipage/dom.html#the-dir-attribute)

Findings:

- **critical** — The required “cut at its end” assertion does not exist. The Latin-led story checks only `scrollWidth > clientWidth`; it neither checks `textOverflow` nor observes which logical edge remains visible. A regression to clipping, or an RTL-start ellipsis, still passes. [StatusChip.stories.tsx:225](/D:/Kar/Gandom/KarNama/apps/web/src/shared/status-chip/StatusChip.stories.tsx:225)

- **critical** — `DESIGN.md` replaces one overstatement with another: “first letter decides” and “no letter … follows the page” are false for directional controls. `\u200E۱۲۳` is letterless but resolves LTR; `\u200F123` resolves RTL. The production comment also still says the ellipsis “always” cuts the end. [DESIGN.md:222](/D:/Kar/Gandom/KarNama/DESIGN.md:222) [StatusChip.tsx:34](/D:/Kar/Gandom/KarNama/apps/web/src/shared/status-chip/StatusChip.tsx:34)

- **major** — The claimed page fallback is proved in only the context where inheritance already produces the expected result. Add an RTL-page case for the digit-only fixture and an emoji-only fixture if documentation claims emoji behavior. [StatusChip.stories.tsx:253](/D:/Kar/Gandom/KarNama/apps/web/src/shared/status-chip/StatusChip.stories.tsx:253) [Shared-StatusChip.md:83](/D:/Kar/Gandom/KarNama/apps/web/src/shared/story-docs/en/Shared-StatusChip.md:83)

- **major** — The task rationale is documentation prose beside production component code, directly violating the repository’s documentation-location rule. [#KN-264…md:1](/D:/Kar/Gandom/KarNama/apps/web/src/shared/status-chip/%23KN-264%20-%20The%20Status%20Chip%27s%20dir%3Dauto%20is%20proved%20in%20one%20direction.md:1)

`todo validate` passes. The targeted Vitest command could not start in this read-only sandbox because Vitest cannot create its temporary SSR directory, so that is not a product finding.

VERDICT
score: 2.5
criticals: 2
one-line: Correct the bidi contract to first strong character and add real endpoint and both-page-direction evidence before closing KN-264