# KN-744 · The wording of a card's footer, from its dates and today

**Why**, from the board: the wording is the card's main information and has the
most edge cases, and as a function it can be proved at every boundary before a
card draws it.

**Exit**, from the board: unit tests prove every wording at its boundary, four
days, three days, the last day, passed, today, yesterday and the large-number
phrasing, in both locales with Persian digits in fa-IR; lint, tsc and the
catalog tests pass.

## What the file says, read 2026-11-04

Card / Kanban, 793:1820's description, and the handoff's پاورقی کارت:

- **Saved, with a deadline**, the clock and the words: more than three days left,
  «N روز مهلت» in grey; three or fewer, the same in red; the last day, «امروز
  آخرین روزه», red; after it, «مهلتش تموم شد», grey with no number. A large
  number is said more simply, as «۱ ماه و نیم مهلت».
- **Saved, without one**: «امروز ذخیره شد» or «N روز پیش ذخیره شد», grey, no
  icon and no pencil.
- **Applied, interview and offer**: «N روز از درخواست», with the pencil.
- **A closed status**: «بعد از N روز بسته شد», the day it was closed less the day
  it was applied, or saved when it never was.
- The pencil sits beside the dates that can be edited, the deadline and the
  application, never beside «ذخیره شد». Every number is Persian.

## The approach

1. `cardFooter` in `shared/job-card/footer.ts`: given the catalog, the locale,
   the card's column, saved, in progress or closed, its dates as calendar days
   and today, it returns the words, whether they are red, whether the clock
   leads them and which date the pencil edits.
2. Days are counted between calendar days read as UTC midnights, so no change
   of clocks adds or loses one. From 30 days a span is said in months and half
   months, rounded down, so time left is never overstated: 45 days is «۱ ماه و
   نیم».
3. Each sentence is the amount in the reader's digits and plural and a catalog
   half; the English halves are worded so the number leads, as in Persian, and
   the file says nothing of applying or closing on the same day, so those take
   «امروز درخواست شد» and «همون روز بسته شد».
4. The red line, three days, and the months' threshold, thirty, are named
   constants.

## How it is checked

`footer.test.ts` at every boundary in both languages, lint, tsc and the catalog
tests.
