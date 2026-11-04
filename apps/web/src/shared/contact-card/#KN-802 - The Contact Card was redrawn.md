# KN-802 · The Contact Card was redrawn, and the network page now uses rows

**Why**, from the board: the owner's instruction of 2026-11-03 is that
everything matches the redesign, and a component no screen uses is code nobody
maintains.

**Exit**, from the board: the plan lists every difference between 248:116 in
the copy EITM6CbJY33dMY8IsMFR4R and in the original; the component and its
stories then draw the original's version of every variant, each new variant with
a story of its own, in fa-IR and en-US, light and dark, with both story-docs
entries; sizes, gaps, radii and colours resolve through the tokens; `DESIGN.md`'s
section is corrected; lint, tsc and its tests pass. Where nothing in the
redesign uses it, it is removed with its stories instead.

## Every difference, read with use_figma on 2026-11-04

The six variants, Full and Compact by Default, Hover and Selected, were walked
node by node in both files, their instances opened, hashed in the copy and read
in full where they differed: every one did, by two things only.

- **Full**: its delete, a 24 square of `radius/md` round the trash at 16 in
  `color/text/secondary`, was a plain frame in the copy and is an instance of
  **Contact Delete Button** in the original, drawn the same.
- **Compact**: its mail action, the Icon Button at 32, was Tone=Neutral round the
  **trash** in the copy, a slip, and is **Tone=Primary** round the **mail** icon
  in the original. At rest the two tones draw the same; Primary's hover is
  `color/bg/brand/container` under a `color/text/brand` icon, where Neutral's
  is grey.
- The set's size, every measure, fill, stroke and text, and the description are
  the same. No instance of the set is found in the original.

## Where the redesign uses it

The handoff lists Contact Card and Contact Delete Button among the components no
screen uses: the network page draws Contact Row, 1056:2872, KN-770, and the job
modal's people tab Related Person, KN-773. The code's card is still what
`NetworkScreen` and the job modal draw, until KN-821 and KN-816 redraw them.

## The approach

1. The compact card's mail action takes the Primary tone, as the original
   draws it, so it turns brand under the pointer until the card goes; the
   Compact story reads that hover with a real pointer.
2. `DESIGN.md`'s Contact Card section records the reading and the retirement.
3. KN-844 removes the card with its stories and docs once KN-770, KN-821 and
   KN-816 have replaced it.

## How it is checked

The Contact Card's stories, the network screen's stories, lint, tsc and the unit
suites.
