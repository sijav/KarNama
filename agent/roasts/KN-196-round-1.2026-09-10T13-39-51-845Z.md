1. A KN-061 builder still has to choose too much:

- Pointer leave/return: “500 ms … resting over it” implies continuous hover, but never explicitly says cancel and restart. A 400 ms hover, leave, then return could open after 100 ms or require a fresh 500 ms.
- Keyboard: one announced target resolves the destination, not whether focusing/choosing it expands the column, nor the keyboard move interaction.
- Failed save: the document says the drop immediately recollapses and flashes, but also that a failed save has no highlight. An optimistic mutation can fail after the flash has begun, so this needs an explicit commit point.
- Two rapid moves: it does not say whether the second move restarts, extends, or is swallowed by the existing one-second header flash.

2. There is no direct contradiction with KN-060’s collapsed prop or the terminology rule. The announcement uses the status name, which is appropriate data. But the one-second flash is underspecified against the global 300 ms state-transition rule: it could mean a one-second visible state with 300 ms transitions, or a one-second animation that overrides the rule. That needs to be stated.

Findings:

- **critical** — The failed-save rule is temporally impossible to implement deterministically as written. [DESIGN.md](D:\Kar\Gandom\KarNama\DESIGN.md:657) requires recollapse and a flash “after the card lands,” while [DESIGN.md](D:\Kar\Gandom\KarNama\DESIGN.md:661) prohibits a highlight if the save fails. With KN-061’s required optimistic update, a server rejection can arrive after the header has already flashed. The builder must decide whether to delay recollapse/highlight until mutation success, cancel an active flash on failure, or accept that failed moves briefly flash. This is exactly a common state transition, not polish.

- **critical** — Hover and feedback lifecycles remain undecided. [DESIGN.md](D:\Kar\Gandom\KarNama\DESIGN.md:651) specifies only a nominal 500 ms hover, and [DESIGN.md](D:\Kar\Gandom\KarNama\DESIGN.md:657) specifies only one header flash. It does not define cancellation/reset on leave and return, or what two accepted drops within one second do to the shared header effect. KN-061 therefore still has to invent observable behavior for ordinary pointer and rapid-move sequences, so KN-196’s exit condition is not met.

- **major** — The verifier does not protect several claimed decisions. [KN-196.mjs](D:\Kar\Gandom\KarNama\agent\scripts\verify\KN-196.mjs:41) accepts any millisecond delay in DESIGN.md, not 500 ms; [KN-196.mjs](D:\Kar\Gandom\KarNama\agent\scripts\verify\KN-196.mjs:56) checks neither the count tick nor the one-second flash duration; and [KN-196.mjs](D:\Kar\Gandom\KarNama\agent\scripts\verify\KN-196.mjs:78) does not verify that KN-061 carries those details. Changing the design to 200 ms or deleting the duration/count behavior leaves this verifier green.

VERDICT
score: 4.0
criticals: 2
one-line: Specify the full hover, optimistic-save, rollback, and repeated-drop lifecycle before calling KN-196 decided.