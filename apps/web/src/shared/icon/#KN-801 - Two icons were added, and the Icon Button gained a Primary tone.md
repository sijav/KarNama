# KN-801 · Two icons were added, and the Icon Button gained a Primary tone

**Why**, from the board: the owner's instruction of 2026-11-03 is that
everything matches the redesign, and the sidebar's stats entry and the unlink
buttons draw the new icons.

**Exit**, from the board: the plan lists every difference between 239:44 and
460:672 in the copy EITM6CbJY33dMY8IsMFR4R and in the original; the component
and its stories then draw the original's version of every variant, each new
variant with a story of its own, in fa-IR and en-US, light and dark, with both
story-docs entries; sizes, gaps, radii and colours resolve through the tokens;
DESIGN.md's section is corrected; lint, tsc and its tests pass.

## Every difference, read 2026-11-03 with use_figma in both files

1. **Icon `239:44` gains two names**, thirty-two where the copy has thirty:
   `chart`, `892:2461`, a baseline and three bars, and `link-off`, `1114:59196`,
   the link with a slash from corner to corner. Both are one vector stroked at
   two in `color/text/secondary`, round cap and join, like the rest; their path
   data, exported from the file as SVG, is in the 24 grid.
2. **Icon Button `460:672` gains Tone=Primary**, Default and Hover only: at rest
   it is the others' square with the icon in `color/text/secondary`; hovered it
   fills with `color/bg/brand/container` and the icon turns `color/text/brand`.
   Neutral and Danger, at rest, hovered and disabled, are the copy's.

## The approach

1. The two glyphs into `glyphs.json` from the export, their names after `note`
   and before the owner's `settings`, so the order is DESIGN.md's again: the
   file's thirty-two, then the owner's addition. The unit test and the Icon
   gallery count follow.
2. `tone="primary"` on the Icon Button, hovered in `bg/brand/container` under
   `text/brand`; disabled it fades as the others do, since the file draws no
   disabled Primary.
3. Stories: the new icons appear in the gallery; Primary at rest, and the Hover
   story with all three tones; docs in both languages; DESIGN.md's icon set and
   both table rows.

## How it is checked

The Icon and Icon Button stories, the glyph test, lint, tsc, and a look at the
two icons and the Primary hover in both schemes.
