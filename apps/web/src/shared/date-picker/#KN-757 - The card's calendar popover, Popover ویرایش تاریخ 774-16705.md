# KN-757 · The card's calendar popover, Popover / ویرایش تاریخ (تقویم) 774:16705, with Popover / Close 848:2247

**Why**, from the board: components before screens; the redesigned board's date
editing and the history tab compose it, and cannot be built to the design until
it exists.

**Exit**, from the board: a story per variant of 774:16705 renders it in fa-IR
and en-US, light and dark, with both story-docs entries; every size, gap, radius
and colour resolves through the tokens and matches get_design_context on
774:16705; DESIGN.md names the node, its states and its rules; lint, tsc and its
tests pass.

## What the file draws, read 2026-11-04

Four variants, Type تاریخ or تاریخ و ساعت by Time List Closed, Open and Hover,
with Title, Helper, Show Helper, Clear, Show Shortcuts and Time. The panel is
the date dropdown's: `popoverPaper` at 276, 16 round and 12 between. From the
top:

- the head: the title, 14 on 22 at Medium in `text/primary`, at the inline
  start, and Popover / Close at 22 at the inline end;
- the shortcuts: a past date's «امروز، دیروز، پریروز», an interview's «امروز،
  فردا، پس‌فردا»;
- the month calendar, filling 242;
- with a time, the time field: «ساعت» 12 on 19 at Regular in `text/secondary`,
  6 above a box 38 high, 8 and 10 in, 8 between, `bg/surface` inside one of
  `border/default` at radius 6, the time 13 on 20 in `text/primary` at the
  inline start and the 16 clock at the inline end; its edge `text/secondary`
  under the pointer; a press opens the time list 4 under it at its width over
  150 ms, and closes it over 120;
- the helper, 12 on 19 at Regular in `text/secondary`, wrapping;
- the actions: the clear link at the inline start when Clear, then Button S
  Text «انصراف» and Primary «ذخیره» at the inline end.

The screens' copy: the deadline «مهلت درخواست» with «۳ روز مونده به مهلت، روی
کارت قرمز میشه.» and the clear link; the application date «تاریخ درخواست» with
«عدد پاورقی و ترتیب ستون از همین تاریخ حساب میشن.» and the past shortcuts; the
interview «تاریخ مصاحبه» with a time, «—» while it has none, and the future
shortcuts. The handoff: it opens under the card, or beside it when there is no
room, and beside the row in the history.

## The decisions

1. The shortcuts' row and the footer are the date dropdown's, shared from one
   file, so the two cannot drift.
2. The time field is a button that opens the time list in a popover of its own,
   whose focus MUI's nesting gives back to the field.
3. It opens below its anchor, and beside it at the inline end when the room
   below is shorter than what it holds; `beside` asks for that always, for the
   history.
4. Save with no day chosen closes, as the dropdown's Confirm does; a time with
   no day is not saved.

## The approach

1. `month.ts`: a day and a time read from `YYYY-MM-DDTHH:mm` and written back.
2. Stories, then the shared row and footer in `parts.tsx`, `TimeField` and
   `DateEditPopover`, with «پس‌فردا» in the catalog.
3. Docs in both languages; DESIGN.md's section and row.

## How it is checked

A story per variant measured against the frames, the time list's open and close
and a time chosen, the shortcuts of both kinds, the side it opens on, planted
wrong values, the docs and catalog suites, lint, tsc and a look.
