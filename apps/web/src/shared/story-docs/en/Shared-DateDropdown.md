The calendar a form's date field opens.

It hangs under the field from its start, in the same white panel as the other
popovers, and fades in. From the top:

- the shortcuts, «Today», «Yesterday» and «Two days ago», for the posted date
  only; one is hidden when the field does not allow its day;
- the month, opening on the field's date or today;
- the footer: «Clear» at the start when the field has a date, then «Cancel» and
  «Confirm» at the end.

A press on a day or a shortcut only chooses it, and the calendar stays open.
«Confirm» puts the chosen day in the field and closes. «Cancel», Escape or a
press outside closes with no change. «Clear» empties the field and closes. The
form's own save records the change.

## Props

### anchorEl

The field it hangs from. Nothing closes it.

### label

The field's name, which names the dropdown for a screen reader.

### value

The field's date, which the dropdown starts on, or nothing.

### today

Today's date, which is ringed, and which the shortcuts count back from.

### min

The first day the field allows; the days before it are off.

### max

The last day the field allows; the days after it are off.

### shortcuts

Shows the posted date's three shortcuts.

### onConfirm

Called with the chosen day when «Confirm» is pressed.

### onClear

Called when «Clear» is pressed.

### onClose

Called when it closes with no change: «Cancel», Escape, a press outside, or
«Confirm» with no day chosen.

## Stories

### PostedDate

The posted date's dropdown, with its shortcuts and «Clear», measured against
the design.

### Deadline

A deadline's dropdown, with no shortcuts.

### NoDateYet

An empty field's dropdown, with nothing to clear, opening on today's month.

### ChoosingAndConfirming

A day chosen, with the calendar staying open, then confirmed into the field.

### AShortcut

«Yesterday» on the first of a month, turning the month back to it.

### ShortcutsTheFieldDoesNotAllow

A field that starts yesterday, so the day before is not offered.

### Cancelling

«Cancel» and then Escape, each closing with no change.

### Clearing

«Clear» emptying the field.

### InEnglish

The dropdown in English, in the Gregorian month.

### Dark

The dropdown in the dark scheme, in the theme's dark colours.
