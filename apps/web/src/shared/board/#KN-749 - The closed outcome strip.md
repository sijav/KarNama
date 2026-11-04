# KN-749 · The closed outcome strip, Board / Outcome Strip 638:7928

**Why**, from the board: components before screens; the redesigned board
composes it, and cannot be built to the design until it exists.

**Exit**, from the board: a story per variant of 638:7928 renders it in fa-IR
and en-US, light and dark, with both story-docs entries; every size, gap,
radius and colour resolves through the tokens and matches `get_design_context`
on 638:7928; `DESIGN.md` names the node, its states and its rules; lint, tsc and
its tests pass.

## What the file draws, read 2026-11-04

- **Board / Outcome Strip**, 638:7928, one component with no variants and no
  description, drawn as «بی‌پاسخ»: a column 88 wide that fills the board's
  height, `color/bg/surface-secondary` at radius 16, 18 above, 14 below and 8 at
  the sides, its items centred from the top 6 apart: the Icon set's `clock` at
  20 stroked `color/text/secondary`; the name, «بی‌پاسخ», 13 on 20 at SemiBold
  in `color/text/secondary`, filling the 72 between the sides; and the count,
  «۱۴», 12 on Figma's automatic 19 at Medium in `color/text/secondary`, in a pill
  of `color/bg/surface`, 1 above and below and 8 at the sides.
- Its 427 instances, on the board frames after the stages, `Columns` 16 apart,
  give the four outcomes: **accepted**, «پذیرفته‌شده», the `check` and every
  colour in the custom-1 pair, the name, the icon and the count in its base and
  the pill in its container; **rejected**, «رد شده», the `x` in the rejected
  pair; **no response**, the component's own greys and `clock`; **withdrawn**,
  «انصراف», `log-out` in the same greys.
- The card: it opens into a full column with a close, 1223:97610, the board's
  to draw, KN-805.

## The approach

1. `OutcomeStrip` in `shared/board`: the outcome, which sets the icon and the
   colours, the name the reader's board gives it, the count, and `onOpen`. A
   button named by its name and count, its keyboard ring three inside its edge,
   as the status tabs draw theirs.
2. The name's 13 on 20 at SemiBold and the count's 12 on 19 at Medium are the
   unstyled text tokens `outcomeStripName` and `outcomeStripCount`, `DESIGN.md`
   saying so.
3. Story fixtures name the four outcomes in both languages, until the records
   have them, KN-750.
4. Stories: each outcome measured, the press, the keyboard, English and dark.

## How it is checked

Its stories, the tokens test, lint, tsc, the unit suites and a look.
