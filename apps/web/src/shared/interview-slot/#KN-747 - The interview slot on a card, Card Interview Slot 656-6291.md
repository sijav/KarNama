# KN-747 · The interview slot on a card, Card / Interview Slot 656:6291

**Why**, from the board: components before screens; the redesigned interview
column composes it, and cannot be built to the design until it exists.

**Exit**, from the board: a story per variant of 656:6291 renders it in fa-IR
and en-US, light and dark, with both story-docs entries; every size, gap, radius
and colour resolves through the tokens and matches get_design_context on
656:6291; DESIGN.md names the node, its states and its rules; lint, tsc and its
tests pass.

## What the file draws, read 2026-11-04

**Card / Interview Slot**, `656:6291`, the interview row on a card in the
interview column, 242 wide inside the card. It has nine variants, five states
and four of them hovered.

- **بدون تاریخ**, no date: a plus at 14 and «تاریخ مصاحبه» at 12 on 19,
  Regular, `text/secondary`; 4 above and below, 4 between. It opens the calendar
  with a time.
- **دور بعدی**, the next round: the same with «تاریخ دور دوم».
- **تاریخ‌دار**, dated: `bg/brand/container` at radius 6, 6 and 8 in, 6 between:
  the calendar and «مصاحبه» at Medium in `text/brand` at the inline start, and
  the date at the inline end, «امروز · ۱۴:۰۰», «فردا …» or the day and date,
  «دوشنبه ۲۰ مهر · ۱۱:۰۰».
- **منتظر نتیجه**, waiting: `bg/surface-secondary` the same way, the clock and
  «منتظر نتیجهٔ مصاحبه» at Medium in `text/secondary`, and «از ۳ روز پیش» or
  «از امروز» at Regular at the inline end.
- **پرسش**, the question: `bg/surface-secondary` at radius 6, 8 in and 8
  between. It holds «مصاحبهٔ سه‌شنبه چی شد؟» at Medium in `text/primary`, then
  three Chip / Action, «دور بعدی», «منتظر نتیجه» and «نتیجه گرفتم», 6 apart, then
  the Link / Inline «تاریخش عوض شد».
- **Hover**, of the four rows: the label underlined, over a 120 ms dissolve.

The handoff says when each state shows:

- the question 2 hours after the interview's time, or when its day ends;
- «نتیجه گرفتم» offers only the closing statuses and offer;
- the waiting row's press is drawn as a hover with no action. Here it asks the
  question again, when the board says so.

## The approach

1. Tokens: the slot's unbound text, `interviewSlotText` 12/19/400 and
   `interviewSlotLabel` 12/19/500.
2. `interviewWhen` and `waitingFor` in `shared/interview-slot/words.ts` word the
   dates from the interview's `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm`, today and the
   day the waiting began, in the reader's calendar and digits; unit tests prove
   each boundary.
3. `InterviewSlot` takes the state, the dates and a callback for each act:
   - plan the date;
   - ask again;
   - the result, waiting and the next round;
   - reschedule.
     The rows are buttons that underline their labels under the pointer.
4. Catalog: the slot's new words.
5. Stories: one per variant, the question's three chips and its link pressed,
   English and dark; the Kanban Card gains a story holding the slot.

## How it is checked

The slot's and the card's stories, the words' unit tests, planted wrong sizes
and words, the token and docs suites, lint, tsc, and a look.

## What was decided while building it

- The day and date take Intl's short names. Persian writes them as the long
  ones, «دوشنبه ۲۰ مهر», and they keep the English row, "Mon, Oct 12 · 11:00",
  on its one line inside the card. The question names the day in full.
- The English waiting label is "Result pending". "Waiting for the interview
  result" measured 165 where 115 was left beside "for 3 days now".
- `onPlan`, `onResult` and `onReschedule` are given an element to open their
  picker by: the row pressed, or the question's group. `onAsk` is optional,
  and without it the waiting row is words, not a button, since the file gives
  its press no action.
- In English the three answers wrap; in Persian they fit on one line, as the
  frame draws them, which the Question story proves.
- Every slot instance on the screens is 242 because Card / Kanban's edge takes
  layout space; the code's card leaves 244. Filed as KN-853 against KN-745.
