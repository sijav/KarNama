# KN-742 · The brand mark, Logo / Mark 576:7665

**Why**, from the board: components before screens; the redesigned sidebar and
the sign-in screens compose it, and cannot be built to the design until it
exists.

**Exit**, from the board: a story per variant of 576:7665 renders it in fa-IR and
en-US, light and dark, with both story-docs entries; every size, gap, radius and
colour resolves through the tokens and matches `get_design_context` on 576:7665;
`DESIGN.md` names the node, its states and its rules; lint, tsc and its tests
pass.

## What the file draws, read 2026-11-03

`get_design_context` on 576:7665 gives one SVG asset, 32 by 32, viewBox
`0 0 32 32`, and its description: a K made of a capsule and two leaves, its
colours bound to the brand and grey tokens, used in the sidebar and on the
sign-in and sign-up screens. The asset holds three paths: `Stem` and
`Leaf Top` filled `#2563EB`, `Leaf Bottom` filled `#E5E7EB`;
`get_variable_defs` on the node names the two as `color/bg/brand/default` and
`color/gray/200`. It has one variant and one size; every instance in Screens 5:7
is 32 by 32, the auth card's Brand Row, 407:6953, drawing the name and, 8 after
it, the mark.

## The approach

1. `LogoMark` in `shared/logo-mark`: an `svg` of the asset's three paths, their
   geometry exactly as the asset gives it, each fill bound to its token through
   `theme.karnama.semantic`, so the derived dark palette reaches it as it reaches
   every other colour; the asset's baked hex would not. Decorative, hidden from
   screen readers, unless a caller names it with `aria-label`, as `Icon` does.
   Not mirrored in RTL: it is a mark, not a direction.
2. Its stories: the mark in Persian and English, light and dark, each measuring
   the 32 square, the viewBox, the three paths' geometry against the asset and
   their fills against the two tokens; and one named, announced as an image.
3. `BrandRow` draws `LogoMark` where it drew the name's first letter on a blue
   square, so the sidebar and the sign-in card take the redesign's mark; its
   story and `AuthScreen`'s brand check measure the mark instead of the letter.
4. Docs in both languages, the story title registered, and a `DESIGN.md` entry.

## Unsure, and what was found

Whether the derived dark `gray/200` keeps the lower leaf visible on a dark
sidebar. Measured headless on 2026-11-03: the leaf is 1.33 to 1 on the dark
sidebar, where the light design's own leaf is 1.24 to 1 on white, so the dark
mark keeps the quiet leaf the file draws, and a mark is exempt from the
contrast minimum. No card.
