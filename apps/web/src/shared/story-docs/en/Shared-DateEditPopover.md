The calendar a card's date or a history row opens, to change the day, or the
day and the time of an interview.

It hangs under the card from its start, or beside it when there is no room
below, and beside the row in the history; it fades in. From the top:

- the head: the field's name, and the close button at the end;
- the shortcuts: for a past date «Today», «Yesterday» and «Two days ago», for an
  interview «Today», «Tomorrow» and «In two days»; one is hidden when the field
  does not allow its day;
- the month;
- for an interview, the time: a box with the time and a clock, which opens the
  list of half-hours under it, and a dash while it has none;
- a helper line, when the field has one;
- the actions: «Clear» at the start when the field may be emptied and has a
  date, then «Cancel» and «Save» at the end.

A press on a day, a shortcut or a time only chooses it. «Save» hands the day, or
the day at its time, over and closes; the close button, «Cancel», Escape and a
press outside close with no change.

## Props

### anchorEl

The card or the row it hangs from. Nothing closes it.

### title

The field's name, which titles the panel and names it for a screen reader.

### helper

A line under the month about what the date does, or nothing.

### value

The date it starts on, a day or a day and a time, or nothing.

### withTime

Adds the time, for an interview.

### today

Today's date, which is ringed, and which the shortcuts count from.

### min

The first day the field allows; the days before it are off.

### max

The last day the field allows; the days after it are off.

### shortcuts

Which shortcuts it offers: `past`, `future`, or none.

### beside

Opens it beside its anchor even when there is room below, as the history's row
asks.

### onSave

Called with the chosen day, or the day at its time, when «Save» is pressed.

### clearable

Shows «Clear» when the field has a date, for a field that may be emptied.

### onClear

Called when «Clear» is pressed.

### onClose

Called when it closes with no change.

## Stories

### DateOnly

An application date, with the past shortcuts and its helper, measured against
the design.

### DateAndTime

An interview, with the future shortcuts, its time and its helper.

### TimeListOpen

The time pressed, opening the list of half-hours under it, then Escape closing
the list alone.

### TimeFieldHover

The time under the pointer, its edge darker.

### ChoosingATime

A time and a day chosen, then saved together.

### NoTimeYet

An interview with a day and no time, saved as a day alone.

### DeadlineWithClear

A deadline, with no shortcuts and «Clear», which empties it.

### Closing

The close button, «Cancel» and Escape, each closing with no change.

### Beside

Opened beside the card.

### InEnglish

An interview in English, in the Gregorian month.

### Dark

An interview in the dark scheme, in the theme's dark colours.
