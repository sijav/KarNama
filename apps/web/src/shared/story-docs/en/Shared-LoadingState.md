What the add flow shows while it reads a posting: three dots that take turns,
and a line that says what is happening.

If the wait runs past fifteen seconds, the line changes to say it is still
reading and why it may be slow: a server that was asleep takes up to a minute
to wake, and three dots alone for that long would look stuck. The state is a
status region, so a screen reader reads the change out. For a reader who has
asked for less motion the dots stand still, the middle one lit.

## Props

### startedAt

When the wait began, as a time. Leave it out and the wait is timed from when the
state first shows; a new time starts it again.

## Stories

### Reading

The state as it first shows, the dots taking their turns.

### PastFifteenSeconds

A wait that began more than fifteen seconds ago, so the line says why it is
slow.

### InEnglish

The state in English, the dots taking their turns from the left.
