1. The elevation rows exactly match the values quoted in the task, including shadow order and negative spreads. I could not independently read Figma’s variable API from this environment, so that is a document-to-claim comparison, not source verification.

2. The sweep is not exhaustive. To falsify it, sample every omitted component family, especially `460:672` Icon Button, `204:11` Checkbox, `181:22` Menu Item, `183:26` Select, `150:92` Confirm Modal, `166:82` Add/Edit Modal, and `491:751` Mobile Card. More fundamentally, an unused effect style or variable will not appear on any sampled component frame. A file-level style/variable inventory is required.

3. Yes. This present-tense false claim passes:

   “Elevation/Card is the only elevation in the Figma file, as it used to be the only elevation documented.”

   It contains `only elevation` and `used to`, so the exemption accepts it.

4. No token-table row is presently untraceable under the document’s own section-level sourcing: colour/status point to `7:2`, off-board rows name frames, elevation rows name frames, and type points to `416:21`. However, the letter-spacing values, `Body` 0 and `Label` 0.2, name no component frame at all. They are prose, not table rows, but still violate the claimed traceability standard if “every value” is meant literally.

Findings:

- critical — The claimed complete sweep is not supported, so KN-004’s exit condition is not met. [DESIGN.md:140](D:\Kar\Gandom\KarNama\DESIGN.md:140) says thirteen frames were sampled, but the component inventory contains many independent, unsampled families, including Icon Button, Checkbox, Select, and both additional modal families at [DESIGN.md:191](D:\Kar\Gandom\KarNama\DESIGN.md:191). A third effect used only by `460:672`, for example, would be absent from `DESIGN.md` and all checks would still pass. Worse, an unused style cannot be discovered by sampling use-sites at all. The work needs a complete style/variable inventory from Figma, then evidence that every entry is represented or deliberately excluded.

- major — The verifier does not check shadow order despite claiming it checks each elevation row “whole.” [KN-004.mjs:105](D:\Kar\Gandom\KarNama\agent\scripts\verify\KN-004.mjs:105)-[114](D:\Kar\Gandom\KarNama\agent\scripts\verify\KN-004.mjs:114) only tests whether every fragment occurs somewhere in the row. Swap Card’s Shadow 1 and Shadow 2 columns, or Modal’s two columns, and the verifier remains green. Shadow stack order affects rendering.

- major — The “only elevation” regression check can be bypassed by attaching historical language to a current false assertion. [KN-004.mjs:121](D:\Kar\Gandom\KarNama\agent\scripts\verify\KN-004.mjs:121)-[126](D:\Kar\Gandom\KarNama\agent\scripts\verify\KN-004.mjs:126) exempts an entire sentence if it contains `used to`, `no longer`, `earlier version`, or `was false`, without requiring those words to modify the assertion being checked.

- minor — The verifier’s green message omits elevation entirely, even though elevation is the change under review: [KN-004.mjs:174](D:\Kar\Gandom\KarNama\agent\scripts\verify\KN-004.mjs:174). This makes a successful run misleading during review.

`node agent/scripts/verify/KN-004.mjs .` and board validation currently pass, but neither establishes the missing exhaustive Figma inventory.

VERDICT
score: 4.0
criticals: 1
one-line: replace the selective component-frame sample with a complete Figma style and variable inventory, including unused styles