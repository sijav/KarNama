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

### lineId

An id for the line on screen, so a panel around the state can be named by it.

### announceFirstLine

Whether the status speaks the first line. By default it does, a moment after it
appears. Pass false where focus lands on a panel named by the line, which says it
already: the status then speaks only a later line.

## Stories

### Reading

The state as it first shows, the dots taking their turns.

### PastFifteenSeconds

A wait that began more than fifteen seconds ago, so the line says why it is
slow.

### StartMovesPastFifteenSeconds

A wait whose start the button moves more than fifteen seconds back, as a host
restarting the wait would: the line says why it is slow from that moment, and
never shows the reading line on the way, even when it was saying so already.

### WritesItsFirstLineAfterMounting

Press Extract details and the state appears: its status region is in the page
empty, and the line is written into it a moment after, so a screen reader reads
the first line out as a change. The line on screen shows from the first frame.

### SpeaksOnlyALaterLine

A state told not to speak its first line, as the add flow tells it where focus
names its panel by that line: the status stays quiet, and speaks the slow line
once the button moves the start more than fifteen seconds back.

### SpeaksTheSlowLineAtOnce

A state told not to speak its first line whose wait began more than fifteen
seconds ago: the status speaks the slow line at once, so it is never silent.

### InEnglish

The state in English, the lit dot moving from left to right.
