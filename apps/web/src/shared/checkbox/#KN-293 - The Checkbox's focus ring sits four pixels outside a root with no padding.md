# KN-293 · The Checkbox's focus ring sits four pixels outside a root with no padding, so a host that clips flush at its edge removes it

Beside `Checkbox.tsx`, which is where the change lands.

**Why, from the board.** Someone moving through a list of checkboxes with the
keyboard needs to see which one has focus in every host the product puts them
in. Critical on the owner's order of 2026-09-10, as a finding on a built
component. CHILD OF KN-013, found while doing KN-274.

**Exit condition, from the board.** A focused Checkbox inside a host that clips
its overflow flush at the Checkbox's own box still changes at least a two-pixel
perimeter at 3:1, drawn inside that box or with the room kept by the Checkbox
itself; a story renders it in an overflow hidden host with no padding and
asserts from the rendered geometry that every pixel of the focus change lies
inside the host, a mutation back to the outline outside fails it by name, and
DESIGN.md says which.

## What is there now

The root, MUI's `ButtonBase` span, has `padding: 0`, so it is the frame's 20 by
20. Focus is an outline on the frame, two pixels of `border/focus` at an offset
of two, KN-244, so every pixel of it lies two to four outside the root. MUI's
hidden input is absolute, 100 percent of the root's padding box, so the target
is 20 by 20 too, which KN-206 already calls too small.

## What the file says, read with use_figma on 2026-09-11

Node `204:11` draws Unchecked, Checked, Indeterminate, Hover and Disabled, and
no Focus. Every Checkbox instance in the file, ten on the Components canvas and
eight on the Screens canvas, sits in a card's or a contact card's `Title Group`,
a horizontal auto layout with a gap of 8 and no padding, at its inline start:
flush with the group's edge, 2.5 from its top and bottom, 8 from the title. And
every one of those groups has `clipsContent` on, Figma's default for a frame. So
the drawn geometry leaves no room round the frame at all: the design's own host
is the flush clipping host this card describes.

## Which of the two, and why

**The ring cannot move inside the frame**, as KN-274 moved the Input's:

- A checked or indeterminate frame is `bg/brand/default`, `#2563eb`, the ring's
  own `border/focus` in light. A blue band on the blue fill changes nothing.
- A two pixel band inside 20 by 20 is at most 400 − 256 = 144 square pixels,
  short of WCAG 2.4.13's two pixel perimeter, 4W + 4H = 160, before the
  corners take their share; and it would crowd the tick, whose stroke reaches
  5.5 from each edge.
- Unchecked, a band at the edge is the Hover state, the edge turning blue, drawn
  half a pixel wider: focus and hover would read as one.

**So the room is the Checkbox's own.** The root gets `spacing/2xs`, 4, of
padding on every side: 28 by 28 round the drawn 20 by 20 frame, which does not
change. The ring, which reaches exactly four past the frame, then lies inside
the Checkbox's own box, and a host that clips flush at that box keeps all of it.
The hidden input covers the padding box, so the target becomes 28 by 28, which
is what KN-206's target clause asks for; KN-206 keeps its test of the hit area
and its accessible-name clause, and gets a note.

**What a screen pays for it.** The component's box is 28 where the file lays out
20. A screen that puts the frame where the file draws it, flush at the Title
Group's edge and 8 from the title, gives the four back with a negative margin of
the same token, and must then not clip that group, or the ring is lost there
again. KN-015 and KN-026, the two cards that build those groups, carry it.

**The area.** The ring's band, its corners concentric with the frame's radius of
4, from 24 by 24 with a radius of 6 to 28 by 28 with a radius of 8, is
(784 − 64(4 − π)) − (576 − 36(4 − π)) ≈ 184 square pixels. That clears the
frame's 4W + 4H, 160. It does not clear the root's, 224: the perimeter is
measured on the frame, the component as it is seen, since the room round it
draws nothing. DESIGN.md says so, so it can be argued with.

## What changes

- `Checkbox.tsx`: the root's `padding: 0` becomes `spacing['2xs']` on every
  side, the comment saying why, and `spacing` imported beside `iconSize`.
- `Checkbox.stories.tsx`: a new story, `FocusedInAClippingHost`: the Checkbox
  in a `Box` with `overflow: hidden`, no padding, no border, sized to the
  Checkbox by `display: inline-flex`, on `bg/surface` like a card, controls
  limited to `checked` and `indeterminate`, since disabled cannot take focus.
  Its play focuses the checkbox, and asserts:
  1. the host clips on both axes, has no padding and no border, and its box is
     the root's, so it clips flush at the Checkbox;
  2. the ring is solid, at least 2 wide, and at 3:1 or more against the host's
     surface;
  3. the ring's extent, the frame's box grown by its outline offset and width,
     overshoots no side of any clipping ancestor, the host among them, the
     failure naming the side and the amount;
  4. the ring's band, computed with the rounded corners from the frame's radius,
     clears the frame's 4W + 4H.
- `story-docs/{en,fa}/Shared-Checkbox.md`: the new story, and a sentence on the
  root's room under the page description.
- `DESIGN.md`: a section, "The Checkbox keeps the room for its focus ring", with
  the Figma reading, why not inside, the area, the target, and what a screen
  does; and the sentence in the Input's focus section that names KN-293 and
  KN-294 says the Checkbox keeps its room now and the Filter Chip is still
  KN-294.
- `agent/scripts/verify/KN-274.mjs`: its Checkbox row measures the perimeter on
  the frame and the outside on the root, the Checkbox's own box; it measured
  both on the root, which after this change would ask 224 of a ring the frame's
  measure asks 160 of. Its DESIGN.md pattern follows the reworded sentence.
- `agent/scripts/verify/KN-293.mjs`: new.
- The board: a note on KN-206; KN-015's and KN-026's exit conditions take the
  host contract, below.

## Focus in the story

The ring shows on `.Mui-focusVisible`, which MUI sets when the focused element
matches `:focus-visible`. Storybook's `userEvent.tab()` dispatches untrusted
events, so whether Chromium treats the focus as keyboard focus depends on what
the page did before, and the Vitest run shares a page between stories. The
Checked story already adds the class directly for that reason, KN-205, and this
story does the same after focusing: the class is what draws the ring, and the
geometry is what is asserted. The verifier presses a real Tab in a production
build, so the rendered proof comes from real keyboard focus.

## The verifier, clause by clause

1. The Checkbox stories pass, `FocusedInAClippingHost` by name.
2. The story's source renders the host with `overflow: 'hidden'` and asserts
   the extent against every clipping ancestor with the host among them.
3. **THE CASE, in the story**: `Checkbox.tsx` with the root's padding back to
   0 fails `FocusedInAClippingHost` by name, on the overshoot, four on a side.
4. **In pixels**, a production Storybook in Playwright's Chromium: the story at
   device pixel ratios 1 and 2, unchecked, checked and indeterminate, in fa-IR
   and en-US, light and dark, each shot before and after a real Tab. Inside the
   host the pixels that changed at 3:1 or more cover at least the frame's
   4W + 4H, counted in CSS pixels; outside the host nothing changes.
5. **The positive control**: a build with the padding back to 0, where the
   host is the frame's 20 by 20 and clips the ring, falls short of 4W + 4H
   inside the host in every reading.
6. DESIGN.md's section states the room, why not inside, the area and the
   measure on the frame, the target, and the screen's negative margin.
7. KN-274's verifier passes with its Checkbox row retargeted.

The other Checkbox verifiers, KN-013, 205, 207, 208, 220, 225, 229, 281, 284,
288 and 290, run afterwards as a regression pass: they measure the frame, not
the root, but they are run rather than trusted.

## What I am unsure about

- **Which box WCAG 2.4.13 measures.** The frame is what is seen; the root is
  what takes focus, through the hidden input, and is now 28 by 28. I measure on
  the frame and say so in DESIGN.md. If the root is the component, a ring of
  two at an offset of two cannot clear 224 and the ring would need a third
  pixel, a change to KN-244's one ring for the product.
- **Whether a 28 by 28 root will make the screens drift from the file.** The
  negative margin gives the four back, but a screen builder has to know to do
  it, and not to clip where it does; KN-015's and KN-026's exit conditions and
  the DESIGN.md section are how they will.
- **Anti-aliasing in the pixel count.** At a ratio of one the ring's corners
  blend, and a pixel blended below 3:1 is not counted; with the Checkbox on
  whole pixels, as Storybook's padded layout puts it, the straight runs count
  in full and the estimate is about 170 against 160. The ratio of two reading
  is the closer one.
- **Forced colours.** An outline is kept under forced colours, so the ring
  should stay inside the host there too; this card does not ask for it and the
  verifier does not read it.

## The check, and what changed after it

Checked with `roast.py plan` on 2026-09-11, two models with web search. It said
not to proceed unchanged, for one reason, and it was right: **the screens'
negative margin puts the room back outside the Title Group, and the file's
Title Group clips**, so a screen that followed the note literally would lose
the ring exactly where the file draws the Checkbox. A note on KN-015 and KN-026
is not enough. Taken:

- **DESIGN.md states the host contract**, not only the recipe: the four pixels
  of room are the Checkbox's to keep unclipped, so a screen that gives them
  back with a negative margin, on a wrapper since the Checkbox takes no `sx`,
  must not clip that group or anything within four pixels of the frame, the
  title truncating on its own element.
- **KN-015 and KN-026 carry it in their exit conditions**, not in a note: the
  Checkbox placed where the file draws it, and a story focusing it by keyboard
  in the composed Title Group asserting every clipping ancestor holds the whole
  ring, with a mutation clipping the group failing it. Those groups do not
  exist yet, so the composed test belongs to the cards that build them.

Confirmed, and kept: **WCAG 2.4.13 measures the component as it is seen**, the
20 by 20 frame, not the transparent root or the hidden input, per the Focus
Appearance understanding's note on visual presentation. And **the frame's own
perimeter is smaller than 160**: a two pixel band centred on a 20 by 20 edge
rounded to 4 is about 146 square pixels, so 4W + 4H is the rectangle's,
conservative, bar; the story keeps it. The outline follows the rounded corners
with the offset added, so the 184 estimate stands as an estimate, and the
pixel readings at ratios one and two stay the proof; WCAG allows the
anti-aliased pixels to be left out. MUI adds nothing that moves or clips the
ring: the component's `sx` overrides SwitchBase's padding, `disableRipple`
removes the ripple that clips, and the theme sets no `focusVisible` style.

**What the first verifier run found, 2026-09-11.** Counting only the pixels
that changed at 3:1 on their own, the ring cleared 160 in light, 169 at a ratio
of one and 177 at two, and fell short in dark, 136 and 158. The derived dark
`border/focus` clears the dark surface by 3.04 to one, so any pixel
anti-aliasing blends at the ring's corners drops under 3:1 and counted for
nothing. WCAG 2.4.13's understanding says, under the change of contrast, that
pixels modified by anti-aliasing can be ignored, and gives the rounded
rectangle's perimeter exactly, 4W + 4H - (16 - 4π)r. So the check was measuring
something the criterion does not ask: it now requires the ring's own colour to
change at 3:1 and counts the ring's area by each pixel's coverage, and DESIGN.md
records the dark margin.

The inside-edge alternative, a state-aware ring inside the frame, was weighed
again with the rounded numbers: a two pixel band inside the frame is about 134
square pixels against the frame's 146, and a three pixel one, about 191, leaves
the tick two and a half pixels and needs a second focus colour on a checked
frame, where the product has one ring. Rejected, as before.
