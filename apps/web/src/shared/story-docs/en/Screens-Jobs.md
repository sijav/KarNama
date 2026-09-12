The board: a column for every status, the job opportunities in it, and
everything that happens to one of them.

It is the product's first page. The columns are the statuses in the order the
design settles, with rejected last and collapsed until it is opened; each card
opens the job modal, changes its status or is deleted; the search and the sort
control act on every column at once.

What it holds is kept in the browser for now and read back on the next visit.
The API cards wire it to the server; nothing a reader does here is lost in the
meantime.

## Props

### addOpen

Opens the add flow with the screen. The add destination is this flow rather
than a page of its own, so the address opens it and closing it puts the address
back on the board.

### onAddClose

Said when the add flow closes, so whoever owns the address can go back to the
board.

## Stories

### Board

A board seeded with the fixtures' job opportunities, one per status, in
Persian.

### InEnglish

The same board with the language switched, where the direction flips and the
columns read from the left.

### Empty

Nothing added yet: the board gives way to the empty state, which offers the one
thing there is to do.

### AddingFromTheAddress

The add destination, which opens the flow over the board; closing it says so.

### Working

A board being used: searching narrows every column, a card opens the job
opportunity, and selecting one brings up the bulk bar, which moves it to
another status.

### Managing

The board being managed: a column renamed from its menu, another added, a job
opportunity deleted from its modal after a confirmation, and the rejected
column opened from its collapsed header.
