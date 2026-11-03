# KN-782 · The period switch, Stats / Period Switch 1236:3207

**Why**, from the board: components before screens; the redesigned Stats page's
applications chart composes it, and cannot be built to the design until it
exists.

**Exit**, from the board: a story per variant of 1236:3207 renders it in fa-IR
and en-US, light and dark, with both story-docs entries; every size, gap, radius
and colour resolves through the tokens and matches `get_design_context` on
1236:3207; `DESIGN.md` names the node, its states and its rules; lint, tsc and
its tests pass.

## What the file draws, read 2026-11-03 with use_figma

Stats / Period Switch, `1236:3207`, two variants, Value=روزانه, the default,
and Value=هفتگی, each 121 by 32: a row on `color/bg/surface-secondary`,
`spacing/2xs` of padding all round and between its options, `radius/md`. Each
option is `spacing/2xs` above and below and `spacing/sm` at the sides, round
`radius/sm`, its word in Label: the chosen one on `color/bg/surface` in
`color/text/primary`, the other with no fill in `color/text/secondary`. Daily
stands at the inline start, weekly after it. A press on the other option
changes to its variant; nothing else is drawn, no hover, no focus, no shadow.
Its description: the switch of the Stats page's applications per day or week
card; daily for the first four weeks from the first application and weekly
after, by default, and the reader can change it; no monthly, the decision of 1
Aban. DESIGN-HANDOFF.md's Stats rules say the same and what each period shows,
which is the chart's, not the switch's.

## The approach

1. `PeriodSwitch` in `shared/period-switch`, controlled: `value`, daily or
   weekly, and `onChange`. The default from the first application belongs to
   the Stats page, which knows the data.
2. A native radio group through MUI, as the Color Picker's and the Status
   Picker's are: one Tab stop, arrows that move and choose, with the theme's
   `arrowsAcross` so the left and right arrows go the way they point in a right
   to left page, KN-301. Each radio's icon is its drawn pill, hidden from
   assistive technology, and its input is named by the word; the group is named
   Period.
3. Keyboard focus draws the three pixel ring inside the pill, as the chips do,
   since the file draws none; no hover, since none is drawn.
4. Stories: Daily and Weekly, measured against the file; InEnglish and Dark;
   choosing by a press and by the arrows. Docs in both languages, the catalog's
   three words, and a `DESIGN.md` entry.

## How it is checked

The stories in the storybook project, lint, tsc, the unit project's catalog and
docs tests, and a headless look in both languages and both schemes.
