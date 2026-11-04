# KN-754 · The month calendar: Date Picker / Day 773:16113, Calendar 773:16585 and Nav Arrow 848:2238

**Why**, from the board: every date in the redesign, the card's pencil, the
modal's fields and the history's edits, is picked on it.

**Exit**, from the board: a story per variant of 773:16113, 773:16585 and
848:2238 renders it in fa-IR and en-US, light and dark, with both story-docs
entries; every size, gap, radius and colour resolves through the tokens and
matches get_design_context on 773:16113, 773:16585 and 848:2238; DESIGN.md names
the node, its states and its rules; lint, tsc and its tests pass. Unit tests
prove the grid of three named months against a reference calendar.

## What the file draws, read 2026-11-04

**Date Picker / Day**, `773:16113`: a 34 by 32 cell round a 28 circle at radius
14, the day's number 13 on Figma's automatic 20, bound to no text style. Nine
variants:

- Default, Regular in `text/primary`; Friday, in `red/500`, a Primitives
  variable the file binds directly, `#ef4444`;
- Hover, the circle `bg/surface-secondary`; Friday Hover the same, in red;
- Today, a ring of one inside in `border/focus`, Medium in `text/brand`; Today
  Hover adds the grey;
- Selected, the circle `bg/brand/default`, Medium in `text/on-accent`;
- Disabled, Regular in `text/disabled`; Empty, nothing.

Its reactions: hover changes to the hover variant over 120 ms, ease out; a
press selects over 150 ms, ease out.

**Date Picker / Nav Arrow**, `848:2238`: 28 square at radius 8, a 16
`chevron-down` in `text/secondary` turned a quarter, Next pointing to the inline
end and Prev to the inline start; Hover fills `bg/surface-secondary` over
120 ms. Its description: a press changes the month.

**Date Picker / Calendar**, `773:16585`: 244 wide, 4 between its rows. The
header, 4 below it, is Prev at the inline start, the title, «شهریور ۱۴۰۵», 14 on
22 at Medium in `text/primary`, in the middle, and Next at the inline end. Then
the weekdays, seven 34 by 24 cells of «ش ی د س چ پ ج», 12 on 19 at Regular in
`text/secondary`, Friday's in `red/500`; then the weeks, 238 wide, as many as the
month needs, five or six. Variants Shahrivar, Mehr and Aban 1405. Next's press
changes the month over a 150 ms dissolve, as the handoff's motion table says.

The screens use it inside Popover / ویرایش تاریخ with today 19 Mehr, a chosen
day, and the days before a limit off.

## The decisions

1. **The grid is computed with Intl's calendars, no library.** Node's ICU 78
   gives the official leap years, 30 Esfand 1403 on 20 March 2025, a 29 day
   Esfand through 1407, Nowruz 1408 on 20 March 2029. A day is its Gregorian
   `YYYY-MM-DD`; its year, month and day in a calendar come from
   `formatToParts` with Latin digits. The first of a month is the day less its
   day of the month less one; the next month starts after the month's length,
   counted by stepping until the month changes.
2. **An English reader sees the Gregorian calendar**, since every English date
   in the product is Intl's en-US, the card's footer, the modal and the add flow:
   a day picked in Mehr would otherwise read as October beside it. The week keeps
   the design's order in both, Saturday first and Friday red; the English letters
   are Intl's short names, "Sat", since its narrow ones repeat S and T.
3. **The title joins the month's name and the year**, since Intl's Persian
   writes the year first, «۱۴۰۵ شهریور».
4. **A press on the chosen day keeps it chosen.** The prototype toggles it back,
   but the handoff says a press only selects, and clearing is its own link,
   KN-756.
5. **The keyboard moves as the WAI-ARIA date grid does**: one day is in the Tab
   order, the arrows move a day or a week, mirrored in Persian, Home and End go
   to the week's ends, Page Up and Page Down a month, and a move past the month
   turns it. A day is named in full for a screen reader, «دوشنبه ۲۰ مهر ۱۴۰۵»;
   the days off stay in reach and take no press.

## The approach

1. `month.ts`: the calendar for a locale, a day's parts, a month's first day,
   its length, the next and the previous month, the weeks of a month, a day's
   column. Unit tests prove Shahrivar, Mehr and Aban 1405 against the frames and
   the official calendar, October 2026 in Gregorian, and the leap years.
2. `words.ts`: the title, a day's number and full name, the weekday letters and
   names, in the reader's digits.
3. Tokens: `red/500`, its dark derived as `text/error`'s is, and the calendar's
   unbound text, `calendarTitle`, `calendarWeekday`, `calendarDay` and
   `calendarDayMarked`.
4. Stories first, then `CalendarDay`, `MonthArrow` and `MonthCalendar`, with the
   catalog's «ماه قبل» and «ماه بعد».
5. Docs in both languages; DESIGN.md's section and rows.

## How it is checked

The unit tests of the grid, a story per variant of the three nodes measured
against the frames, the keyboard and the month's turn, planted wrong values, the
token and docs suites, lint, tsc, and a look in both languages and schemes.

## What was decided while building it

- Today's ring is a border of one inside the circle, not an inset shadow:
  forced colours remove a box shadow and keep a border.
- Intl's Persian names a day in full year first, «۱۴۰۵ مهر ۲۰, دوشنبه», even
  with `dateStyle: 'full'`, so a day's name is the weekday and the long date
  joined; English takes Intl's full date.
- The keyboard's move focuses the grid's one tab stop once the month it lands
  in is drawn, so no ref per day is kept; a press on an arrow turns the month and
  leaves focus on the arrow.
- `red/500` is 3.76 to one on white; the design draws it so, and the dark
  scheme walks it to 4.5 to one as `text/error`.
- The stories borrow expected colours on the canvas, since a day's colour moves
  over 150 ms and a colour read on it gives the transition's start, KN-365.
