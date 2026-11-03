# KN-791 · The Search Bar gained a Hover state

**Why**, from the board: the owner's instruction of 2026-11-03 is that
everything matches the redesign, and the board and the network page both lead
with it.

**Exit**, from the board: the plan lists every difference between 155:92 in the
copy EITM6CbJY33dMY8IsMFR4R and in the original; the component and its stories
then draw the original's version of every variant, each new variant with a story
of its own, in fa-IR and en-US, light and dark, with both story-docs entries;
sizes, gaps, radii and colours resolve through the tokens; DESIGN.md's section
is corrected; lint, tsc and its tests pass.

## Every difference, read 2026-11-03 with use_figma in both files

Default, Focus and Filled are the same in both: 320 by 44 on
`color/bg/surface`, `spacing/md` at the sides and `spacing/xs` between its
parts, `radius/md`, an edge of one inside in `color/border/default`, two in
`color/border/focus` while focused; the 20 search icon at the inline start and
the text in Body, the hint in `color/text/secondary` and what is typed in
`color/text/primary`. What differs:

1. **A fourth state, Hover**: the Default with its edge in
   `color/text/secondary`, into which Default's prototype now hovers.
2. **Filled's clear** is an instance of Popover / Close at 16 in the 20 frame
   at the inline end, where the copy drew the x alone; so it is the close's
   square of radius 6 with its own grey hover, KN-837.

## The approach

1. On hover, under `@media (hover: hover)`, the edge takes `text/secondary`
   while the field does not have focus; focus keeps its two of `border/focus`.
2. The clear is the 20 frame holding `PopoverClose` at 16, so it takes the
   close's look, its outline on keyboard focus and its name label.
3. Stories: Hover and HoverInDark by the runner's real pointer, focus winning
   over hover; Filled reads the 20 frame and the 16 close; docs in both
   languages; a DESIGN.md entry and the table row.

## How it is checked

The Search Bar's stories, lint, tsc, and a look at the hover and the clear.
