A short explanation attached to a control, shown on hover **and** on keyboard
focus.

Built on MUI's tooltip rather than from scratch. What is genuinely hard here is
collision detection, portalling and dismissal, and MUI already shows on focus,
closes on Escape, and keeps the tip on screen.

The fill is `text/primary`. That is a deliberate reuse and not a missing token:
Figma resolves this surface to the same variable as the darkest text colour, so
a tooltip is the page inverted rather than a colour of its own.

## Props

### title

The text of the tip. Passed in by the caller, so it carries whatever the calling
screen has already localised.

### icon

Drawn before the text at 16 by 16, and marked decorative: the text already says
everything, so a screen reader reading the mark as well would just be noise.
Optional, because most tips do not need one.

### children

The control the tip describes. MUI clones it to attach the hover and focus
listeners, so it has to be a single element that forwards its props.

## Stories

### OnHover

The ordinary case. The tip is portalled, so it is found on the document rather
than inside the story canvas.

### OnKeyboardFocus

The clause the card names and the one a hover-only tooltip fails: Tab, with no
pointer anywhere. A tip that only answers a mouse is invisible to whoever most
needs a label spelled out.

### DoesNotTrapThePointer

Asserts the computed `pointer-events` is `none`. This story earned its keep: the
styling alone was not enough, because MUI's tooltip is interactive by default
and sets `pointer-events: auto` itself so you can hover into it.

### WithIcon

The frame as Figma draws it, with the mark before the text.

### Dismissed

Escape closes it. A tip you cannot dismiss is a tip covering the thing you were
trying to read.
