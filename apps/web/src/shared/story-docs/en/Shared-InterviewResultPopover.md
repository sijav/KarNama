The small window that asks what came of an interview. It opens under an
interview's card after «نتیجه گرفتم», Got the result, with the question over a
row of status chips: an offer, accepted, rejected and withdrawn, and any stage
the reader made after interview. One press on a chip applies it and closes the
window; a press anywhere else, or Escape, closes it and changes nothing.

It is a white panel with a thin grey edge, rounded corners and a soft shadow,
369 wide. Under the pointer a chip shows a grey ring; reached by the keyboard,
a blue one. While it is open the keyboard stays inside it, starting on the
window itself with Tab reaching the chips, and when it closes focus goes back to
what opened it.

## Props

### anchorEl

The card it opens under, or nothing while it is closed. It hangs from the
card's inline start, 4 below it.

### choices

The statuses it offers, in the order given: what can follow an interview,
which the board works out.

### onChoose

Called with the chosen status's id when a chip is pressed, after the window
closes.

### onClose

Called when it closes: on a press outside, on Escape, and when a chip is
pressed.

## Stories

### Default

The four the design draws, measured against it: the panel, its question, and
the chips on one line from the inline start, focus on the panel.

### Choose

A press on a chip closes the window and hands the choice over.

### PressOutside

A press outside closes it, applies nothing, and gives focus back to the chip
that opened it.

### Escape

Escape closes it and applies nothing.

### Hover

The pointer over a chip: its grey ring.

### KeyboardFocus

Opened from the keyboard, focus on the panel, then Tab moving the blue ring
through the chips and round from the last to the first.

### AfterACustomStage

A stage the reader made after interview is offered too; five chips wrap, the
fifth on a second line.

### InEnglish

The same window in English, mirrored: the question and Offer at the left.

### Dark

The window in the dark scheme, in the theme's dark colours.
