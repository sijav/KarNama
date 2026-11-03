What the add flow shows while it reads a posting: three dots, the strong one
stepping from left to right, and no text on screen, as the design decided on
1 Aban.

What the design does not draw is said out of sight. The state is a status
region whose line says it is reading the posting, and past fifteen seconds that
it is still reading and why it may be slow: a server that was asleep takes up to
a minute to wake. The line is written into the region a moment after the region
is in the page, so it reaches the region as a change, which is what a screen
reader announces from; no screen reader was run to hear it. For a reader who
has asked for less motion the dots stand still, the first one lit.

## Props

### startedAt

When the wait began, as a time. Leave it out and the wait is timed from when the
state first shows; a new time starts it again.

### lineId

An id for the line, which is out of sight, so a panel around the state can be
named by it.

### announceFirstLine

Whether the status speaks the first line. By default it does, a moment after it
appears. Pass false where focus lands on a panel named by the line, which says it
already: the status then speaks only a later line.

## Stories

### Reading

The state as it first shows, the strong dot stepping from left to right.

### Step1

The design's first step held still: the left dot lit and raised.

### Step2

The second step held still: the middle dot lit.

### Step3

The third step held still: the right dot lit.

### InEnglish

The state in English, the strong dot stepping from left to right as it does in
Persian.

### Dark

The state in the dark scheme, in the theme's dark colours.

### ReducedMotion

The state for a reader who has asked for less motion: the dots stand still on
the first step.

### PastFifteenSeconds

A wait that began more than fifteen seconds ago, so the line says why it is
slow.

### StartMovesPastFifteenSeconds

A wait whose start the button moves more than fifteen seconds back, as a host
restarting the wait would: the line says why it is slow from that moment, and
never holds the reading line on the way, even when it was saying so already.

### WritesItsFirstLineAfterMounting

Press Extract details and the state appears: its status region is in the page
empty, and the line is written into it a moment after, so it reaches the region
as a change, which is what a screen reader announces from.

### SpeaksOnlyALaterLine

A state told not to speak its first line, as the add flow tells it where focus
names its panel by that line: the status stays quiet, and speaks the slow line
once the button moves the start more than fifteen seconds back.

### SpeaksTheSlowLineAtOnce

A state told not to speak its first line whose wait began more than fifteen
seconds ago: the status speaks the slow line at once, so it is never silent.
