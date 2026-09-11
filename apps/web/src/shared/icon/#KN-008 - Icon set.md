# KN-008 · Icon set, 30 icons at 24 by 24

Beside the icons. Recorded after the build, on 2026-09-11, the owner having
asked for speed.

**Exit condition, from the board.** Every one of the 30 named icons renders, a
story shows the full grid, each is 24 by 24 with 2px round strokes, colour
follows the prop and falls back to text/secondary, and a test asserts the
exported set matches the list in DESIGN.md.

## What was built

- `glyphs.json`: the geometry of the 30 variants of node 239:44, exported from
  the file as SVG with use_figma on 2026-09-11; JSON because path data is
  drawing, not copy, and the lingui rule reads every string in a `.ts`.
- `glyphs.ts`: the names as a union and as a list in DESIGN.md's order, and the
  glyphs typed against them.
- `Icon.tsx`: the 24 grid at `sm` 16, `md` 20 or `base` 24, a colour role or
  `inherit`, `text/secondary` by default; strokes two pixels, round, and
  non-scaling, since the file's instances resize the drawing and keep the
  stroke, as the Color Picker's 14 pixel check shows; `more` filled; decorative
  unless named, then an image with its name.
- `glyphs.test.ts`: the set is exactly DESIGN.md's thirty in its order, every
  glyph draws inside the grid, and only `more` is filled.
- Stories: Default, AllIcons, Sizes, Coloured, Named. The Color Picker's check
  now takes its path from the set, which is half a pixel lower than the one it
  drew before.

## Left for later

- Directional icons, arrow-right, log-out, external-link, sort, are not turned
  in RTL; a caller chooses, and no card asks for mirroring yet.
