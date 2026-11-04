What a list shows when there is nothing in it: a round mark, a title, a line
that says what to do, and the button that does it.

The screens use it three times, each with its own copy: the job list before the
first job opportunity is added, the contacts before the first person, and a
search that finds nothing, which keeps the button that adds a job opportunity.
The title is a heading for screen readers. The body keeps a fixed width and
wraps; the title keeps to one line, so a long one widens the state.

## Props

### title

The heading, already in the reader's language.

### body

The line under it that says what to do, already in the reader's language.

### actionLabel

The button's label, already in the reader's language.

### onAction

Called when the button is pressed. On the job list it starts the add flow.

### picture

`jobs` or `network`: the board's or the network's own picture, drawn in the
mark's place, as their empty states have.

## Stories

### JobList

The empty job list, whose button adds the first job opportunity.

### Contacts

The contacts before anyone is added. The title is wider than the body, so the
state is wider too.

### NoSearchResults

A search that finds nothing. The button that adds a job opportunity stays, as
the design draws it.

### InEnglish

The empty job list in English.

### Jobs

The board's own empty state, with its picture of stacked cards in the mark's
place.

### Network

The network page's own, with its copy and its picture of two people's cards.

### NetworkInEnglish

The network's in English; the picture is a drawing and is not mirrored.

### JobsInTheDark

The board's in the dark scheme, the picture in the theme's dark colours.
