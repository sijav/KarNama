# KN-276 · The selected Filter Chip is told apart by a 1.22:1 fill, under the 3:1 WCAG 1.4.11 asks of a state

Beside `DESIGN.md`, which is where the answer lands.

**Why, from the board.** Someone who cannot see a 1.2:1 difference cannot tell
which filters are on, and the Filter Chip doubles as the status counter above
the board. Fixing it departs from the file, so the owner has to choose.

**Exit condition, from the board.** The owner has answered, through the
question tool, whether the selected Filter Chip keeps the file's fill as its
only sign of selection or gains one that meets WCAG 1.4.11 and 1.4.1, with the
options and their trade named; DESIGN.md records the answer as the owner's,
with the date; and if it changes, a card for the change exists that also covers
KN-272's dark fill.

## The facts the question rests on

Node `159:71`, and `FilterChip.tsx` as built from it: unselected is
`bg/surface` with a `border/default` edge and `text/secondary`; selected fills
the chip and its edge with `bg/brand/container` `#dbeafe` and turns the text to
`text/brand`. The chip's own text identifies it as a control, so its edge needs
no contrast, but the selected state is shown only by that fill and a text
colour change, so 1.4.11 applies to the fill, and 1.4.1 applies because the
difference is colour alone.

| what shows the state                   | on bg/surface | bg/page | bg/surface-secondary |
| -------------------------------------- | ------------- | ------- | -------------------- |
| the file's fill `#dbeafe`              | 1.22          | 1.14    | 1.11                 |
| a blue edge `#2563eb` round that fill  | 5.17          | 4.82    | 4.70                 |
| a solid `#2563eb` fill, white text     | 5.17          | 4.82    | 4.70                 |

A check drawn in `text/brand` on the fill would be 5.49:1 against the fill itself.

In dark the same fill derives to a bright `#207df9` with its text at 1.34:1,
KN-272, so whichever option is taken, the card that builds it covers the dark
pair too.

## What gets asked

One question, with the trade named on each option:

1. **A blue edge on the selected chip** (recommended): the selected chip keeps
   the file's pale fill and its edge turns `#2563eb`, 4.70:1 or more on every
   surface. The chip already has a one pixel edge in both states, so nothing
   moves when it toggles, and the luminance step is one someone with no colour
   vision still sees. The smallest departure from `159:71`: one colour, in one
   state. The trade: that blue is already the edge of a PRESSED chip, for the
   moment the pointer is down, so pressing an unselected chip would look
   selected until it is released; the card that builds this gives the selected
   edge a role of its own, or proves the two stay apart.
2. **A check before the label when selected**, the Material 3 filter chip's
   sign, in `text/brand` at 5.49:1 on the fill: a shape, so it is not colour at
   all. The chip grows by the icon and its gap when it toggles, which shifts
   the chips after it in a row of counters.
3. **Keep the file's fill**: match `159:71` exactly; DESIGN.md records that the
   selected state falls short of 1.4.11 and 1.4.1 by the owner's choice.
4. **Take it to the designer first**: keep the fill for now and put the question
   to the designer, since the file is version 0.2.

A solid blue fill with white text also clears both, and is left out of the four
because it changes the chip's whole look rather than its edge, and the question
tool takes four; it goes into the card if the owner writes it in.

## What changes

- `DESIGN.md`: the answer under "Settled by the owner on 2026-09-10", as the
  owner's.
- `agent/board.json`: if it changes, a card for the change that also covers
  KN-272's dark fill, critical as a finding on a built component.
- `agent/scripts/verify/KN-276.mjs`: the decision in the owner's section, bound
  to its own paragraph, and the card when there is one, with in-memory
  controls.

## What I am unsure about

- Whether a blue edge next to the focus ring reads as focus. The focus ring sits
  two pixels outside the chip and only on keyboard focus; the edge is the
  chip's own border. Different places, and the same product colour.
- Whether 1.4.1 is met by a luminance step alone. WCAG's own technique for links
  accepts a 3:1 difference as a sign that does not rely on hue; the check is
  the option that needs no argument about it.

## How I will know it worked

The owner's answer is in DESIGN.md as theirs, the verifier passes, and a change
has a card the board can schedule.

## The check, and what changed after it

The second model found a one pixel `#2563eb` edge enough for both 1.4.11,
4.24:1 against the fill inside it and 4.70:1 or more outside, and 1.4.1, since
a 3:1 luminance step is a distinction that does not rest on hue; the check is a
stronger alternative, not a necessity. It caught what the plan missed: the chip
already draws that exact colour, `border/focus`, as its pressed edge and its
focus ring, so option 1 now names the pressed overlap as its trade, and the card
it creates must give the selected edge its own role or prove pressed and selected
stay apart, testing the edge against the fill and in dark beside KN-272.
