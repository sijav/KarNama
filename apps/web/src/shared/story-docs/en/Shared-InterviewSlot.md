The interview's row on a job opportunity card, in one of five states.

- No date: a quiet «+ Interview date», which plans the interview's date and
  time.
- Dated: a light blue row with the calendar and «Interview» at the start and
  when it is at the end: «Today · 14:00», «Tomorrow …», or the day and date.
  Pressed, it plans the date again.
- Waiting: a light grey row with the clock and «Result pending» at the start
  and how long at the end, «for 3 days now» or «since today».
- The question: «How did the interview on Tuesday go?» with three answers,
  «Next round», «Waiting for the result» and «Got the result», and the link
  «Its date changed».
- The next round: «+ Second round date», which plans the next round's date.

Under the pointer a row's label is underlined, fading in. Dates are written in
the reader's calendar and digits.

## Props

### state

Which of the five the slot shows: `none`, `dated`, `waiting`, `question` or
`next`.

### at

When the interview is, a day or a day and a time. A dated row or a question
with no day to name shows as the row with no date.

### today

Today's date, which today and tomorrow, and how long the wait has been, are
counted from.

### waitingSince

The day the waiting began. Without it the waiting row says no more than that
it is waiting.

### onPlan

Called when a row with no date, a dated row or the next round's row is
pressed, given the row, to open the calendar by.

### onAsk

Called when the waiting row is pressed, to ask the question again. Without it
the waiting row is not a button.

### onResult

Called when «Got the result» is pressed, given the slot, to open the status
picker by.

### onWaiting

Called when «Waiting for the result» is pressed.

### onNextRound

Called when «Next round» is pressed.

### onReschedule

Called when «Its date changed» is pressed, given the slot, to open the
calendar by.

## Stories

### NoDate

The row with no date, in Persian, measured against the design.

### NoDateHover

The same row under the pointer, its label underlined.

### Dated

The dated row with the design's day, date and time.

### DatedHover

The dated row under the pointer.

### Waiting

The waiting row, three days into the wait.

### WaitingHover

The waiting row under the pointer.

### NextRound

The next round's row.

### NextRoundHover

The next round's row under the pointer.

### Question

The question with its three answers on one line and the link under them.

### Answering

Each answer and the link pressed in turn, each calling its own act.

### Planning

The row with no date and the dated row pressed, each planning the date.

### Today

An interview today, with its time.

### WaitingSinceToday

A wait that began today.

### AskingAgain

The waiting row pressed, asking the question again.

### WaitingWithNothingToAsk

The waiting row with nothing to ask: words, not a button.

### KeyboardFocus

The rows reached with Tab, each with its focus ring.

### InEnglish

Every state in English, nothing cut.

### Dark

Every state in the dark scheme, in the theme's dark colours.
