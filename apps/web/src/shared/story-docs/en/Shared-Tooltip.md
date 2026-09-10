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

**It must have an accessible name of its own.** The tip DESCRIBES the control,
through `aria-describedby`; it never names it. An icon-only button needs its own
`aria-label`, and one without a name stays unnamed with a tip beside it. That is
deliberate: a tip that named its control would replace the control's name with
a sentence about it, which is what this component did until KN-209.

**A Fragment is not supported, and neither is a wrapper that drops its props.**
The tip attaches through the child's ref and its event props, so the child
must be ONE element that spreads its props, ref included, onto a DOM element.
When no ref arrives the tip can never open; MUI is silent about that, so this
component reports it in the console instead. A child that takes the ref but
drops the other props is reported by MUI itself.

## Stories

### OnHover

The ordinary case. The tip is portalled, so it is found on the document rather
than inside the story canvas.

### WithoutCssBaseline

The same tip on a page without the app's CSS reset. The frame's 260 includes
its padding, so the tip sets its own border-box sizing rather than inheriting
it; without that it would be 284 wide anywhere the reset is missing. The story
removes the reset's box-sizing from every element and measures the tip anyway.

### KeepsTheTriggersName

An icon-only trigger labelled "Delete status". With the tip open, the button
is still announced by its own name, and the tip is reachable as its
description. Before KN-209 the tip replaced the name entirely.

### ReportsATriggerThatCannotAttach

A wrapper that drops everything the tooltip hands it, ref included. The tip
can never open, and instead of staying silent the component reports why. The
report is captured by the story, so this page shows a button with no tip.

### DescribedAtFocus

The trigger is described BEFORE the tip opens: with no interaction at all, and
again the moment it takes keyboard focus. MUI links the tip only while it is
open, about 100ms after focus, which is after a screen reader has already
announced the control; the component keeps a hidden copy of the text linked
from the first render instead.

### DescribedAtFocusInPersian

The same, in Persian, with the trigger's Persian name written out so a
missing translation cannot pass by comparing the English with itself.

### ReportsATriggerThatDropsItsProps

A wrapper that takes the tooltip's ref and drops every other prop. The tip
gets a node, so MUI sees nothing wrong outside development, and never gets
the listeners that open it. The component checks that the node it received
carries the description link too, and reports it in every build.

### AcceptsATriggerThatMountsLate

A trigger that renders nothing at first and appears a render later. That is
not a mistake: a missing trigger is given a short grace before it is
reported, and this one opens the tip like any other.

### ReportsATriggerSwappedForOneThatCannotAttach

A working trigger replaced by one that cannot take the ref. The check runs
whenever the trigger changes, not only once at mount, so the swap is reported.

### KeepsTheTriggersOwnDescription

A trigger already described by something beside it, a field hint in the
product, the page subtitle standing in for one here. The tooltip's text JOINS
that description, after it, rather than replacing it, and a trigger like
this is not reported as broken.

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
