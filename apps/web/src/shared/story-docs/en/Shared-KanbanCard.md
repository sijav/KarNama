The redesigned job opportunity card on the board.

From the top:

- the head: the company's logo, the title over the company, and the actions
  button at the far end, which shows under the pointer;
- the meta line: the location and the salary, a dot between;
- the interview slot, when the card has one;
- the note line;
- the prompt that asks whether the reader is still waiting;
- the footer: the source at the start and the time at the end.

The time is the deadline with its clock, red when it is near, or how long ago
the card was saved or applied for. The pencil after it edits the deadline or
the application date.

The status's colour runs down the start edge. Under the pointer the card lifts
with a shadow. While the board is selecting, a checkbox leads the head and a
press anywhere selects the card; selected, it is ticked and ringed in blue.
Otherwise a press anywhere that is not another control opens the job
opportunity. Where there is no hover, as on a phone, the actions button stays
in view.

## Props

### title

The job opportunity's title, one line, cut at the end.

### company

The company's name, under the title.

### logo

The company's logo, from its site or LinkedIn. Without it, the default
organisation icon.

### location

Where the work is and how, as «تهران · هیبرید».

### salary

The salary, or that it is negotiable.

### source

Where the job opportunity was found, at the footer's start.

### status

The status whose colour the edge takes.

### note

The reader's note, one line, cut at the end.

### footer

What the footer says and how, from `cardFooter`.

### interview

The interview slot, when the card is in the interview column.

### waiting

Whether the board says the card has waited long enough to ask: the prompt shows,
with `onNoResponse` as its link.

### selecting

Whether the board is selecting: the checkbox shows, and a press selects.

### selected

Whether the card is selected: ticked and ringed.

### dragEvents

The board's drag handlers, put on the card.

### onOpen

Called when the card is pressed anywhere that is not another control.

### onSelectedChange

Called with the card's new selection, from the checkbox or a press while
selecting.

### onMore

Called with the actions button's anchor, for the card's menu.

### onEditDate

Called with the pencil's anchor, for the calendar that edits the date.

### onNoResponse

Called when the prompt's link says the application went unanswered.

## Stories

### Default

The card at rest with a deadline five days off, measured against the design.

### Hover

Under the pointer: the shadow, the actions button and the pencil.

### SelectHover

Under the pointer while selecting: the shadow, the checkbox, and no actions
button.

### NearDeadline

Three days to go: the deadline in red.

### NearDeadlineHover

The same under the pointer.

### NearDeadlineSelectHover

The same while selecting.

### PassedDeadline

The deadline has passed: in grey, with no number.

### PassedDeadlineHover

The same under the pointer.

### PassedDeadlineSelectHover

The same while selecting.

### InProgress

A stage in progress, counting the days since applying, its pencil editing the
application date.

### Selected

Selected: the checkbox ticked and the blue ring.

### Opening

A press on the card opens the job opportunity.

### SelectingByAPress

While selecting, a press selects the card instead.

### MoreOpens

The actions button hands the board its anchor.

### StillWaiting

The prompt, and its link pressed.

### OnATouchScreen

Where there is no hover, the actions button stays in view.

### InEnglish

The card in English, three days to go and under the pointer.

### Dark

The card in the dark scheme, in the theme's dark colours.
