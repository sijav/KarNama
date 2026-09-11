# KN-009 · Button, 3 sizes by 5 styles by 5 states

Beside the button. Recorded after the build, on 2026-09-11, the owner having
asked for speed.

**Exit condition, from the board.** All 75 combinations render from a single
story driven by args, each matches the Figma node for that combination, Focus
shows the border/focus ring on keyboard focus only, and Disabled is not
reachable by keyboard.

## What was built

- From the 75 variants under node 31:4, read with use_figma: S 36 tall with
  12 at the sides and 4 between, M 44 with 16 and 8, L 52 with 24 and 8;
  body text on S and M, the title role on L; icons 16, 20 and 24; radius md.
  The five styles' fills and text in each state, as `LOOKS` in Button.tsx:
  Primary brand, its hover, `accent/700` pressed; Secondary outlined in
  `border/default`, the brand container on hover, `accent/200` pressed; Text
  the same without the edge; Destructive the danger fill, its hover, `red/700`
  pressed; Ghost grey text, the secondary surface on hover and at 0.9 pressed;
  every disabled one in `text/disabled`, filled `gray/200` where it had a fill.
- Focus as the file draws it: two pixels of `border/focus` outside at no
  offset, and on Secondary inside, in place of its edge. MUI shows it on
  keyboard focus only.
- `red/700`, a Figma variable DESIGN.md already recorded, joins the tokens and
  the derived dark palette, for Destructive's pressed fill.
- Stories: Playground driven by args; Matrix, every style in every size,
  enabled and disabled, its play hovering each with the browser's pointer and
  pressing each by holding Space, all 75 read against the file; KeyboardFocus;
  WithIcons.
