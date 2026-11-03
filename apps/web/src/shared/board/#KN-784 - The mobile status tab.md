# KN-784 · The mobile status tab, Tab / Status (Mobile) 1274:3275

**Why**, from the board: components before screens; the redesigned mobile
board composes it, and cannot be built to the design until it exists.

**Exit**, from the board: a story per variant of 1274:3275 renders it in fa-IR
and en-US, light and dark, with both story-docs entries; every size, gap,
radius and colour resolves through the tokens and matches `get_design_context`
on 1274:3275; `DESIGN.md` names the node, its states and its rules; lint, tsc
and its tests pass.

## What the file draws, read 2026-11-04

Tab / Status (Mobile), 1274:3275, State=Default, Active and Add, with Label,
Count and Dot as properties. Default and Active: a pill 36 tall at
`radius/full`, one pixel of edge inside and counted in the layout, 14 at the
sides, 6 between, none bound; from the inline start a dot of 8 in the status's
base, the name at 13 on Figma's automatic 20 and Medium, the count at 12 on 19
and Medium. Default is `color/bg/surface` edged in `color/border/default`, the
name `color/text/primary` and the count `color/text/secondary`; Active is
`color/bg/brand/container` edged in `color/text/brand`, both in
`color/text/brand`, the name SemiBold. Add is 38 by 36, 10 at the sides, a
dashed edge of `color/border/default`, 4 and 3, around the Icon set's plus at 16
in `color/text/secondary`. Its description: the mobile board's status tab, the
dot the status's base, Add the add-status entry. No screen places an instance.

## The approach

1. `unstyledText.statusTabCount` and `statusTabName`, the two texts.
2. `StatusTab` and `AddStatusTab` in `shared/board`: a tab, role `tab` with
   `aria-selected`, the chosen one the row's Tab stop, named by its name and
   count with the dot hidden; the add tab a button named «افزودن وضعیت».
   The row, a tablist the board names with its arrow keys, and the column it
   shows are the mobile board's, KN-826; the keyboard's ring is the three
   inside a row of chips keeps from its clipped edges.
3. Stories: Default, Active, a press, no dot, Add, the keyboard, English and
   dark.

## How it is checked

Its stories, the theme's tests, lint, tsc, and a look in both schemes.
