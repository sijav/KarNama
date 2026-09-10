# KN-273 · The Input and the Checkbox are bounded by a 1.24:1 border, under the 3:1 WCAG 1.4.11 asks of a control's edge

Beside `DESIGN.md`, which is where the answer lands.

**Why, from the board.** Someone with low vision may not find the field, or see
where the checkbox is, which is the first thing a form asks of them. It cannot
be fixed without departing from the file, so the owner has to choose between
the design as drawn and the contrast rule.

**Exit condition, from the board.** The owner has answered, through the
question tool, whether the resting edge of an enabled Input and an unchecked
Checkbox stays border/default as the file draws it or is raised to at least 3:1
against the surfaces it sits on; DESIGN.md records the answer as the owner's,
with the date; and if it is raised, a card for the change exists.

## The facts the question rests on

The resting edge of both is `border/default` `#e5e7eb`, read from node 95:3 and
the Checkbox frame. Against what a control sits on:

| edge                                   | bg/surface | bg/page | bg/surface-secondary |
| -------------------------------------- | ---------- | ------- | -------------------- |
| `border/default` `#e5e7eb`, as drawn   | 1.24       | 1.16    | 1.13                 |
| `text/disabled` `#9ca3af`              | 2.54       | 2.37    | 2.31                 |
| `text/secondary` `#6b7280`             | 4.83       | 4.51    | 4.39                 |
| a new grey, `#868d9a`                  | 3.34       | 3.11    | 3.03                 |

The Input's fill is `bg/surface`, 1.07 against the page, so the edge is the only
thing drawing the field. WCAG 1.4.11 exempts a boundary only when something
else identifies the control; an empty text field and an empty checkbox have
nothing else. The Filter Chip's unselected edge is `border/default` too, but a
chip carries its own text, which is what 1.4.11 accepts, so it is not in the
question.

No token the file has clears 3:1 at rest without a collision: `text/secondary`
does, but it is already the Hover edge, so using it at rest would erase the
hover change. The smallest grey that clears all three surfaces is not in the
file.

## What gets asked

One question, through the tool, with the trade named on each option:

1. **A new edge role at 3:1** (recommended): a named palette role for a
   control's resting edge, `#868d9a`, 3.03:1 or more on all three surfaces, used
   by the Input and the Checkbox, and by the Select when it is built. Hover
   stays `text/secondary`, cards and dividers keep `border/default`. A departure
   from 95:3 and the Checkbox frame, and a colour the file does not have.
2. **Keep the file's border**: match 95:3 exactly, and DESIGN.md records that
   the design falls short of 1.4.11 here by the owner's choice.
3. **The secondary text colour at rest**: `text/secondary`, a token already in
   the file, 4.83:1. It is the Hover edge today, so hover would show no change
   unless it takes a new, darker colour; WCAG asks nothing of a hover, so that
   is a product choice, not a requirement.
4. **Take it to the designer first**: keep the file's border for now and file
   the question for the designer, since the file is version 0.2.

Recommended because it fixes the failure with the smallest departure, keeps
every drawn state distinct, and leaves every surface that is not a control
exactly as drawn.

## What changes

- `DESIGN.md`: the answer under "Settled by the owner on 2026-09-10", as the
  owner's, with what it applies to.
- `agent/board.json`: if raised, a card for the change, critical as a finding
  on built components.
- `agent/scripts/verify/KN-273.mjs`: DESIGN.md carries the decision with the
  date, and a raise has its card.

## What I am unsure about

- Whether `#868d9a` is the right grey. It is `text/secondary`'s own hue and
  saturation, walked lighter in steps of a quarter of a percent to the last
  value that still clears 3:1 on all three surfaces, the secondary surface
  being the one that binds; a designer might pick differently, which is what
  option 4 is for.
- Whether the dark theme needs saying. Its edge is derived from whatever the
  light edge is, and KN-271's check would extend to it if the answer is a raise.

## How I will know it worked

The owner's answer is in DESIGN.md in their words, the verifier passes, and a
raise has a card the board can schedule.

## The check, and what changed after it

The second model agreed the Input and the unchecked Checkbox fail 1.4.11 as
drawn, that the chip's own text exempts the Filter Chip, and that the four
options are enough; a fill change would alter more of the design than an edge.
Recommending a new colour is honest because it is labelled as a departure and
put to the owner rather than made. Two corrections, taken: `#868d9a` clears 3:1
by 0.03 on the secondary surface, so it is an example, and the card that
implements a raise picks a value with margin; and a new role gets no dark
coverage from KN-271, which checks only the focus and error borders, so that
card's exit names the derived dark row and its test. Option 3 no longer says
hover must change: WCAG does not ask it to.
