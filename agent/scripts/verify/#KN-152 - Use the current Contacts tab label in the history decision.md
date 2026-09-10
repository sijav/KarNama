# Plan — KN-152, the settled tab list names a label that was renamed away

## The contradiction, exactly

DESIGN.md line 368 states a terminology rename **"without exception"**: the nav
item «مخاطبین» became «شبکه من», and the contacts tab inside the job modal
became «افراد مرتبط». They are different things — one is a page for the user's
whole network, the other is the people attached to one فرصت شغلی.

But the settled five-tab decision, which is what a builder reads, still says
مخاطبین: section 3 line 333 and section 6 line 560. Worse,
`agent/scripts/verify/KN-072.mjs` hardcodes `مخاطبین` in `TABS` and **requires**
it, so the verifier actively tells a builder the obsolete label is correct.
`apps/api/prisma/schema.prisma` line 165 already says the tab is "Related
People", so the repository contradicts itself across three files.

## What changes

1. **DESIGN.md section 3** (the FIVE-tab list) and **section 6** (the settled
   decision and the sentence about what a three-tab sketch would drop) name
   **افراد مرتبط**.
2. **DESIGN.md line 330**, which describes what the FRAME draws, is the one
   place the old word is legitimate — Figma really does draw مخاطبین. It stays,
   and says so explicitly, so the rejection check below has exactly one
   sanctioned occurrence to allow rather than a judgement to make.
3. **`KN-072.mjs`**: `TABS` uses افراد مرتبط, and a NEW check REJECTS مخاطبین
   as a modal tab label.
4. **KN-030 and KN-045** cards use افراد مرتبط.

## The judgement call the card does not name

**DESIGN.md line 456**, `` `contacts` مخاطبین `` in the optional-field list, is
a field label rather than a tab list, so the card's exit condition does not
cover it. I am changing it anyway: that relation is what the tab displays, so
leaving it as مخاطبین recreates the same contradiction one list over, which is
the precise failure KN-152 exists to fix. Flagging it rather than doing it
silently.

## The part that needs care

The rejection check is the shape this repository keeps getting wrong: a search
for a string, in a file that legitimately contains that string. مخاطبین must
still appear twice — in the rename sentence that RECORDS the rename, and in the
frame description. So the check cannot be "DESIGN.md does not contain مخاطبین".

It has to be scoped: **within the modal tab lists**, مخاطبین must not appear.
The tab lists are identifiable by containing the other four labels, so the check
finds the sentences that enumerate tabs and asserts the old word is absent from
those, while leaving the rest of the document alone.

## How I will know it worked

`node agent/scripts/verify/KN-072.mjs` passes. Mutations, each of which must
fail it: restoring مخاطبین to the section 3 list, restoring it to the section 6
list, and reverting `TABS` itself. And the mutation that must SURVIVE: the frame
description at line 330 keeping مخاطبین must NOT fail, because that is the one
place it is true, and a check that cannot tell them apart is the check this
repository has shipped by accident three times.
