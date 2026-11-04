# KN-783 · The mobile tab bar, Nav / Tab Bar v2 1273:103863

**Why**, from the board: components before screens: the redesigned mobile
screens compose it, and cannot be built to the design until it exists.

**Exit**, from the board: a story per variant of 1273:103863 renders it in
fa-IR and en-US, light and dark, with both story-docs entries; every size, gap,
radius and colour resolves through the tokens and matches get_design_context on
1273:103863; DESIGN.md names the node, its states and its rules; lint, tsc and
its tests pass.

## What the file draws, read 2026-11-04

**Nav / Tab Bar v2**, `1273:103863`, is a set of three variants:
`Active=فرصت‌ها` `1273:103821`, `Active=آمار` `1273:103835` and `Active=شبکه`
`1273:103849`. Each keeps the copy's `185:19` exactly:

- 390 by 72, `bg/surface`, one pixel of `border/default` on the top edge, and
  `spacing/xs` above and below;
- three tabs of 130, each `spacing/2xs` above and below and `spacing/2xs`
  between, holding a 24 icon over its label at 12 on 16 and Medium;
- `text/brand` for the current tab and `text/secondary` for the others.

The tabs are «فرصت‌های شغلی من» with `file` at the inline start, then «آمار من»
with `chart`, then «شبکه من» with `user`. The description: add-job moved out of
the bar into the page header.

## The approach

1. The tab bar draws `DESTINATIONS`, the sidebar's three since KN-796, and
   `TAB_DESTINATIONS` goes. Adding is the board's header button on a phone
   since KN-850, and `/add` keeps its address without a place in either
   navigation.
2. `routes.test.ts` says the navigation draws every page but adding.
3. The shell's navigate no longer special-cases adding, which nothing sends it.
4. Stories: Default, StatsCurrent and NetworkCurrent, one per variant, measured
   and with their glyphs, then InEnglish and Dark.
5. The App's add-flow stories and the address specs open the flow from the
   board's header in both projects, so they lose their phone viewports and
   project branches.

## How it is checked

The tab bar's and the navigation's stories, the App's, the routes test and the
docs guard. Also the e2e address, add-job and shell specs in both projects,
lint, tsc, and a look at each variant against the frame.
