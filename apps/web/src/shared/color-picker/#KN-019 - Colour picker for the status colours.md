# KN-019 · Colour picker for the status colours

Beside `ColorPicker.tsx`, a new component folder.

**Why, from the board.** A user-defined status still has to read as a status,
which is why the design offers a closed set of colours instead of a colour
wheel; a free picker would let a colour collide with nothing the board knows.

**Exit condition, from the board, corrected to the file.** The card said "the
four reserved pairs". Node `257:17`, the Color Picker, and the Column Colour
screen `259:184` that uses it both draw **nine** swatches, every status pair,
five defaults and four custom, the current one marked; the Documentation frame
`376:30` says a status's colour is chosen automatically and the user can change
it, with no limit to four. "Four" was DESIGN.md's inference, and Figma wins,
so the exit condition becomes: the picker offers exactly the nine status pairs
the file draws, in its order, matches Figma, marks the current one, is keyboard
navigable, and cannot produce a colour outside the nine.

## What the file draws, read with use_figma on 2026-09-11

- A panel 232 wide, no variable bound to the width, so a component constant as
  the Tooltip's 260 is; vertical, padding `spacing/sm` 12, gap `spacing/xs` 8,
  `bg/surface`, a one pixel `border/default` edge inside, `radius/md`, the
  `Elevation/Card` style; 172 tall, hugging.
- A title «رنگ وضعیت», 14 over 22 at 600, `text/primary`: body's size and line
  height with the headings' weight, composed as the Status Chip's M is, since no
  sixth role is allowed.
- The swatches: a wrapping row 208 wide, gap 8 both ways, rows aligned to the
  inline start. Each 32 by 32, `radius/full`, filled with the status's
  `container`. The selected one, interview in both drawings, adds a two pixel
  inside edge in its `base` and the Icon set's check, 14 square, stroke 2, in
  its `base`.
- Their positions, read from the x coordinates, reading from the inline start:
  first row offer, custom-1, custom-2, custom-3, custom-4; second row new,
  applied, interview, rejected. The DOM takes that order, RTL being
  `direction: rtl` with the natural order, per DESIGN.md.
- A helper «رنگ خودکار انتخاب شده؛ اگر خواستی عوضش کن.», 12 at 400, line height
  AUTO, `text/secondary`, wrapping to two lines in the 208.

## The approach

1. **MUI's `RadioGroup` and `Radio`**, not a hand-rolled list: a native radio
   group gives one Tab stop, arrow keys that move and select, and the checked
   state announced. Each Radio's icon and checked icon are the swatch; the
   hidden input covers the 32 by 32 swatch, which is the target.
2. **Names**: each radio is named for its colour, from `376:30`: gray, indigo,
   amber, red, green, teal, purple, pink, cyan, through lingui with English
   ids. The group is labelled by the title.
3. **Props**: `value`, one of the nine status tokens, and `onChange(value)`;
   the type admits nothing else, so no colour outside the nine can come out.
4. **Focus**: the product ring, two pixels of `border/focus` at an offset of
   two, on the focused swatch; the gaps of 8 and the panel's 12 keep room for
   it, and nothing in the panel clips.
5. **Dark**: every colour from the theme, the status pairs from its derived
   `status`, as the Status Chip reads them.
6. The popover that holds it belongs to the column menu, KN-018, and choosing
   a colour automatically for a new status to KN-038; this card is the panel.

## What changes

- `src/shared/color-picker/ColorPicker.tsx` and `index.ts`: new.
- `ColorPicker.stories.tsx`: Default, interview selected as drawn; one per
  mark state is not needed, the value control drives it; the plays assert the
  nine radios in the drawn order and names, the checked one's edge and check,
  arrows moving and selecting with `onChange` called, and the panel's size.
- The catalogs: the title, the helper and nine colour names.
- `story-docs/{en,fa}/Shared-ColorPicker.md`: new.
- `DESIGN.md`: "a custom status picks one of the four reserved slots" and
  "change colour means choosing among them" corrected to the nine the file
  draws, and the picker's order recorded.
- The board: KN-019's exit condition corrected, with a note saying why.

## What I am unsure about

- Whether choosing a default status's colour for a custom one is meant to be
  allowed; the file draws it offered, so it is, and the Status Chip and the
  stripe render whichever pair a status holds.
- The helper line reads as the auto-assignment note on every opening; the file
  draws it so on the Column Colour screen too, so it is always shown.

## The check, and what changed after it

Checked with `roast.py plan` on 2026-09-11, run beside the build since the
owner asked for speed that day: proceed. Radio's own nine pixels of padding
would have made each swatch 50 across, so each Radio has none and no ripple;
the group is a wrapping row 208 wide with gaps of 8; the value MUI hands back,
a string, is matched against the nine tokens before `onChange` sees it. Offering
the nine follows the file; the API stores the colour as a free string, so its
recolour must check the same nine, a note on KN-038.

Found in the production build: two arrow keys in a row ended on the first,
because the story wrote each pick back to the args and a late render brought an
older pick over a newer one. The story's picker now writes with a revision, the
Input's way from KN-280, and the build ends on the right colour.
