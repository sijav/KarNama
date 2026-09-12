A square button holding one icon, for actions that need no words beside them:
a card's delete, a window's close, a row's menu.

It is 32 by 32 around a 16 icon, in a neutral tone or a danger tone. At rest
both look the same, the icon in the secondary text colour; on hover the
neutral one takes a light grey fill and darker icon, and the danger one a pale
red fill and a red icon, so a destructive action shows itself before it is
pressed. Disabled, it fades and leaves the tab order. It always needs a name,
because an icon alone says nothing to a screen reader, and a blank name is
refused: the button is left out and the mistake reported in the console, while
the rest of the screen renders. The focus ring is drawn inside the button.

## Props

### icon

Which icon from the set it shows.

### aria-label

The button's name, read by screen readers and required: say what pressing it
does.

### tone

`neutral`, the default, or `danger` for an action that removes something.

### iconSize

`sm`, the default, a 16 icon, or `md`, a 20 icon, which the Bulk Action
Bar's close uses. The button stays 32 square either way.

### disabled

Fades the button and takes it out of the tab order.

### href

Where it goes, for a control that goes somewhere. An icon-only control that
opens an address is a link rather than a button: it can be opened in a new tab,
its address copied, and a screen reader says link instead of announcing a
button that turns out to leave the page. With this it renders as an anchor and
needs no click of its own.

A control that goes somewhere cannot also be turned off, and the type refuses
the pair, KN-433: an anchor takes no `disabled` attribute, so it would say it
was off and still navigate.

### ref

The element itself, handed back to whoever asks. A button that can be turned
off gives back a `button`; one with an `href` gives back an `a`, and each is
typed for what it renders, KN-447, so a caller never casts.

### onClick

Fired when the button is pressed, by pointer or by keyboard.

## Stories

### Default

The neutral tone at rest, named.

### Danger

The danger tone at rest, which looks as the neutral one does.

### Hover

Both tones hovered side by side. The story moves a real pointer when it runs
as a test; in Storybook itself, hover a button yourself.

### Disabled

Both tones disabled, faded and out of the tab order.

### KeyboardOnly

Tab reaches the button, and Enter and Space both press it, with no pointer
anywhere.

### BlankName

A button given a blank name beside one given a real name: the blank one is left
out and reported in the console, and the named one renders.

### InATooltip

The button as a Tooltip's trigger: it takes the tooltip's ref and the props it
injects, so the tip opens on hover and on focus, describes the button rather
than renaming it, and is its description from the first render. A disabled
button cannot do this, KN-426: the browser fires no pointer events on one.

### HandsBackItsElement

A button and a link side by side, each handed a ref, each giving back the
element it actually renders: a BUTTON for the one that can be turned off, an A
for the one that goes somewhere. The two refs are typed for those elements, so
a caller never has to cast.

### ALinkInATooltip

The combination the product ships: a tip on a control that goes somewhere. The
contact card's mail control is a link, and this asserts the anchor keeps its
address and its own name, is described from the first render, and opens the tip
on hover and on the keyboard alone.

The tip explains and the label names, and they say different things on purpose:
with one string in both, a tip that RENAMED the link would read exactly like one
that described it. The name is read again while the tip is open, which is the
only moment the difference shows.
