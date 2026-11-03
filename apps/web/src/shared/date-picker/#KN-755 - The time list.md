# KN-755 · The time list, Date Picker / Time List 774:16897 and Time Item 786:1753

**Why**, from the board: components before screens; the redesigned date and
time popover composes it, and cannot be built to the design until it exists.

**Exit**, from the board: a story per variant of 774:16897 and 786:1753 renders
it in fa-IR and en-US, light and dark, with both story-docs entries; every size,
gap, radius and colour resolves through the tokens and matches
`get_design_context` on 774:16897 and 786:1753; `DESIGN.md` names the node, its
states and its rules; lint, tsc and its tests pass.

## What the file draws, read 2026-11-03

- **Time Item**, 786:1753, State=Default, Hover and Selected: a row 32 tall
  with 10 at its sides and a radius of 6, none of them bound, its time at the
  inline start in 13 on Figma's automatic 20, no letter spacing. Default has
  no fill and `color/text/primary`, at Regular, and hovers into Hover, the same
  on `color/bg/surface-secondary`. Selected is `color/bg/brand/container` with
  the time in `color/text/brand` at Medium.
- **Time List**, 774:16897: 244 wide, hugging six items, 216: the redesign's
  popover surface, `color/bg/surface`, one pixel of `color/border/default`
  inside and counted in the layout, a radius of 10 and `elevation.popover`,
  with 6 of padding and 2 between the items, neither bound. It shows ۰۹:۰۰ to
  ۱۱:۳۰ with ۱۰:۰۰ Selected, the third row.
- In the calendar popover's Time List=Open, 780:44558, it hangs 4 under the
  time field and takes the field's width, 242, over the popover's lower edge.
- The handoff: the time is only in the interview's calendar, from a
  half-hour list. No screen places either, and neither has a description.

## The approach

1. `formatTimeOfDay`, the time in the reader's digits, two of each, as
   `formatClock` writes a count; `unstyledText.timeItem`, 13 on 20.
2. The popover's surface split out of `popoverPaper` as `popoverSurface`, so
   the list takes the fill, edge, radius and shadow without the paper's 16 and 12.
3. `TimeList` in a new `shared/date-picker`, the family the calendar's pieces
   join: the 48 half-hours of a day on MUI's MenuList as a listbox, each
   MenuItem an option, so the arrows, Home and End move through them and
   Enter chooses. A window of six rows that scrolls with no bar, as the file
   draws none, opening with the chosen time third, as the file shows it, or
   ۰۹:۰۰ first when none is chosen. The keyboard's row takes the Hover fill
   and the three pixel ring the Select's rows take. The width is the
   caller's, 244 by default.
4. Stories: the file's window, nothing chosen, a press, hover, the keyboard,
   English and dark.

## How it is checked

Its stories, the formatter's test, the theme's tests, lint, tsc, and a look in
both schemes.
