# KN-294 · The Filter Chip's focus ring sits four pixels outside the chip, so a scrolling row of chips clips it at its edges

Beside `FilterChip.tsx`, which is where the change lands.

**Why, from the board.** The status counter is a row of chips, the kind of row
that scrolls on a narrow screen, and the person moving along it with the
keyboard needs to see which chip has focus. Critical on the owner's order of
2026-09-10, as a finding on a built component. CHILD OF KN-017, found while
doing KN-274.

**Exit condition, from the board.** A focused Filter Chip inside a host that
clips its overflow flush at the chip's box still changes at least a two-pixel
perimeter at 3:1, drawn inside the chip or with the room kept by the chip
itself, selected and not; a story renders it in an overflow hidden host with no
padding and asserts from the rendered geometry that every pixel of the focus
change lies inside the host, a mutation back to the outline outside fails it by
name, and DESIGN.md says which.

## What is there now

Focus is `:focus-visible` on the button itself: an outline, two pixels of
`border/focus` at an offset of two, KN-244, so every pixel of it lies two to
four outside the chip. The chip is 32 tall, a pill, its text 12 from each side
with the 22 line centred, 5 free above and below it; its edge is a one pixel
border on a `::before`, none when selected until KN-279; pressed adds an inset
shadow of 1.5 in `border/focus`, KN-282.

## What the file says, read with use_figma on 2026-09-11

Node `159:71` draws Default, Hover, Pressed and Selected, and no Focus. All 65
Filter Chip instances on the Screens canvas sit in a frame named `Chips`, a
horizontal auto layout with a gap of 8, no padding, and `clipsContent` on: the
chips are flush with its top and bottom, 0 room, and the first is flush with
its inline start. It is the mobile boards' status row, the row that scrolls. So
the file's own host clips at the chip's top and bottom.

## Which of the two, and why

**The room cannot be the chip's own.** Room above and below would make the chip
taller than its 32, and the `Chips` row with it, which the file draws at 32; a
negative margin to give it back lands the room outside a row that, scrolling
sideways, clips on both axes in CSS. So the ring goes **inside the chip**.

**Three pixels, not two.** WCAG 2.4.13's measure is the area of a two pixel
perimeter of the component as it is seen, for a rounded rectangle
4W + 4H - (16 - 4π)r, which for the 32 tall pill, r 16, is 4W + 73.1. A band
inside a pill is always shorter than that perimeter, whatever the width:

| band, from the edge in | area            | against 4W + 73.1   |
| ---------------------- | --------------- | ------------------- |
| 2 wide, from 2 to 4    | 4W + 35.4       | short by 37.7       |
| 2 wide, from 1 to 3    | 4W + 47.9       | short by 25.2       |
| 2 wide, from 0 to 2    | 4W + 60.5       | short by 12.6       |
| **3 wide, from 1 to 4** | **6W + 62.5**  | clears for W of 5.3 or more |

A two pixel ring could clear it only with a second band, the edge turning
`border/focus` on focus, 2W + 33.4 more. That works until KN-279, and then a
selected chip's edge is already the owner's blue, `#2563eb`, the same value, so
on a selected chip the edge changes nothing and the ring alone falls short. A
ring that clears the measure on its own holds in every state, now and after
KN-279.

**Just inside the edge, from 1 to 4.** Its inner edge is then 1 from the 22
line's box, which starts at 5, and 8 from the text at the sides; its ends are
concentric with the chip's, `border-radius: inherit` on a pill. A ring from 2
to 5 would keep a pixel of the fill between the edge and the ring, but it would
touch the line's box and clear less, 6W + 43.6.

**The colour clears 3:1 on every fill the chip has**, measured from the tokens
on 2026-09-11: `border/focus` on `bg/surface` 5.17 in light and 3.04 in the
derived dark, on `bg/surface-secondary`, the hover fill, 4.70 and 3.57, and on
`bg/brand/container`, the selected fill, 4.24 and 3.33.

**Against the other blue edges.** Pressed is 1.5 of `border/focus` from the
edge in, so a chip pressed while focused shows one band from 0 to 4; KN-279's
selected edge is one pixel, so a focused selected chip shows 0 to 4 and an
unfocused one 0 to 1. Focus is told from both by its width, three and four
against one and one and a half.

## What changes

- `FilterChip.tsx`: the outline goes; on `:focus-visible` the outline is
  `none`, since the browser's own would come back, and an `::after` draws the
  ring: `inset` the edge's width, `border-radius: inherit`, a solid border of
  `FOCUS_RING`, 3, in `border/focus`, no pointer events. `EDGE`, 1, names the
  edge's width, used by the `::before` and by the ring's inset.
- `FilterChip.stories.tsx`: `FocusedInAClippingHost`, two hosts, each a `Box`
  with `overflow: hidden`, no padding, no border, sized to its chip by
  `display: inline-flex`, the first holding the chip unselected and the second
  selected. Both chips take the story's args, `selected` set on each, so the
  controls offered are `label` and `count`, which change the width the ring
  must cover. For each chip the play tabs to it, and asserts:
  1. it matches `:focus-visible`, so the state measured is the focused one;
  2. the host clips on both axes, has no padding and no border, and its box is
     the chip's;
  3. everything the focus can paint, the chip's box grown by its outline and
     any shadow cast outside it, and its two pseudo-elements grown the same
     way, overshoots no side of any clipping ancestor, the host among them;
  4. the ring is solid, at least 2 wide, and at 3:1 or more against the chip's
     own fill;
  5. the ring's band, a rounded pill from its inset to its inset plus its
     width, clears WCAG's rounded perimeter of the chip, 4W + 4H - (16 - 4π)r.
- `story-docs/{en,fa}/Shared-FilterChip.md`: the story.
- `DESIGN.md`: a section, "The Filter Chip draws its focus ring inside", with
  the Figma reading, why not the room, why three, the colours, and the other
  blue edges; the Input section's sentence that names KN-294 says so, and
  KN-274's verifier's pattern for it follows.
- `agent/scripts/verify/KN-294.mjs`: new.

## The verifier, clause by clause

1. The Filter Chip stories pass, `FocusedInAClippingHost` by name.
2. The story's source has the clipping hosts and the extent against every
   clipping ancestor.
3. **THE CASE, in the story**: `FilterChip.tsx` with the outline back and the
   ring gone fails `FocusedInAClippingHost` by name, on the overshoot, four on a
   side.
4. **In pixels**, a production Storybook: the story at device pixel ratios 1
   and 2, in fa-IR and en-US, light and dark, each chip shot before and after a
   real Tab. Inside each host the ring's own colour changes the chip's fill at
   3:1 or more, and the ring's area, counted by each pixel's coverage, as
   KN-293 settled from WCAG's note on anti-aliasing, covers the chip's rounded
   perimeter; outside the host nothing changes.
5. **The positive control**: a build with the outline back, where the host
   clips the ring, covers nothing inside the host.
6. DESIGN.md's section states where the ring is, why not the room, why three,
   and the colours.
7. KN-274's verifier passes, its Filter Chip row now inside its box.

The other Filter Chip verifiers, KN-017, KN-272 and KN-282, run afterwards as
a regression pass.

## What I am unsure about

- **Three pixels against the product's one ring.** The Input's and the
  Checkbox's rings are two wide. The chip's is three because a two pixel band
  inside a pill cannot meet the measure, and DESIGN.md says so; the sign is
  still one blue ring, concentric with the thing focused.
- **`:focus-visible` in the story.** A probe on 2026-09-11 showed Storybook's
  dispatched Tab matching `:focus-visible` in this story file's test page, and
  the outline drawn; it depends on the page's input modality, so the story
  asserts the match first and fails loudly rather than measuring the unfocused
  state. The verifier presses a real Tab.
- **The glyphs.** The ring's inner edge is 1 from the line's box; Persian dots
  sit inside the box, but only the screenshots show how close they come.
- **Forced colours.** A pseudo-element's border is kept there, so the ring
  should show as a line inside the edge, as the Input's does; not read here.

## The check, and what changed after it

Checked with `roast.py plan` on 2026-09-11: proceed. It confirmed the
arithmetic, 4W + 73.1 against 6W + 62.5, that the ring holds after KN-279
because it proves focus without the selected edge, and that nothing in the
mechanism fights it: the chip is a native button through `Box`, not MUI's
`ButtonBase`, so there is no library padding, ripple, overflow or focus style;
`outline: none` removes Chromium's ring; the `::after`'s interior is
transparent and takes no pointer events; the pressed inset shadow paints below
it. Taken:

- **Pressed is not a three pixel change.** The pressed shadow already covers
  the ring's outer half pixel, 1 to 1.5, so pressing a focused chip changes 2.5
  wide, 1.5 to 4, about 5W + 48.1, which still clears 4W + 73.1 for any chip 25
  or more wide; the claim for pressed says that, not three.
- **The glyphs, measured rather than argued.** In a production build on
  2026-09-11, Persian and English labels with dots above and below and
  parentheses, «ژیگ‌ی» and «پیشنهاد کار» among them, put ink between 8.25 and
  24.75 in the 32 chip, so a ring from 1 to 4 leaves 4.25 above the ink and
  3.25 below it. The production screenshots in both languages are still looked
  at before closing.
- **Forced colours are not claimed.**
- **The area in pixels** is counted in CSS pixels, divided by the ratio
  squared, by each pixel's coverage with the ring's own colour at 3:1, KN-293's
  method, which that roast accepted as corroborating the declared geometry; the
  pixels at 3:1 on their own are printed beside it.
