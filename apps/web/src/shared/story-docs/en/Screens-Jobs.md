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

### onSelecting

Said while anything is selected, so the shell can give the foot of the screen to
the Bulk Action Bar: below md the tab bar and the bar are fixed to the same
place, and node 185:19 says the tab bar gives its place, KN-356.

### onAddClose

Said when the add flow closes, so whoever owns the address can go back to the
board.

### onSignOut

Signs the reader out, from the controls a phone's page header carries.

## Stories

### DragAndDrop

Drag a desktop card to another status, including an empty or collapsed column.
Hover over Rejected for half a second to preview it; dropping saves the new status
and history. A column opened by dragging closes again afterward. Escape cancels.
On phones, use the card menu to change status. Keyboard users can select a card
and use the bulk status action.

### Board

The fixtures' own board, in Persian: all nine statuses, the design's five and
four of a reader's own, in the order the board draws them, holding their job
opportunities unevenly as a reader's board does: one column empty, one holding
several, and rejected the fullest, collapsed until it is opened.

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

### People

The people and the files kept against one job opportunity: a person added from
the job's own tab and opened again, and a file chosen and downloaded. Both are
the network's records rather than the job's, so a person added here is on the
network page too.

### BackingOut

Every way out of a change: a rename backed out of, a colour taken from the
column menu, an empty column deleted where one holding a job opportunity says
why it cannot be, a status change cancelled, and a deletion refused.

### Adding

Adding by each road the board offers: the header's action, which reads a link
and leaves the rest to be typed, takes a column of its own before saving; and a
column's own Add Card row, which opens the same flow for that column.

### AddingFromEmpty

A board with nothing on it: the empty state's own action opens the same flow.

### Selecting

Several at once: one selected, then every one of them, the selection let go
of, and two deleted together after the confirmation.

### SelectingWhileSearching

Selecting with a search active: a card chosen before the search and hidden by it
is not counted, select all takes only what the search found, and deleting after
the confirmation takes those alone, so every job opportunity the search hid is
still on the board once the search is cleared.

### OnAPhone

The board at a phone's width, where the columns give way to a row of status
chips and the chosen status's cards stand alone under them. A card there
carries its own menu, which is where changing a status and deleting live when
there is no hover to fold them behind.

### SelectingOnAPhone

The board at a phone's width starting a selection the way the design does, with a
press held on a card: the bar comes up, every card offers its checkbox, and two
chosen from two statuses are deleted together after the confirmation.

### UncheckingOnAPhone

The last card chosen on a phone, unchecked by the keyboard: the selection ends and
the bar goes, focus stays on that checkbox, which stays in view while it has the
keyboard's focus, and it folds away once focus has left the card.

### ChangedInAnotherTab

A board changed in another open tab: what that tab wrote reaches this one, and
this tab's next change keeps it rather than writing its own older copy over it,
and the other tab clearing the whole store leaves this one the fresh board. The
other tab is stood in for by the storage event its write delivers.

### RecolouringKeepsItsPlace

A colour is not a place: two statuses of the reader's own are added, the first
renamed, and the second given the job offer's colour from its column's menu, and
every column stays where it was, the reader's own in the order they were added
and rejected last.

### FocusAfterDeleting

The control that asks to delete a job opportunity is on that job opportunity, so
confirming takes it away and the browser has nowhere to put focus back. A
keyboard reader lands on the card after it in its column instead of on the page
body, and here, where deleting it leaves the column empty, on that column's Add
Card row.

### FocusWhenTheOpenerSurvives

The other half: a confirmation backed out of leaves focus exactly where it was,
so the fallback does not take over the ordinary case.

### FocusAfterDeletingInAColumn

A card deleted from the middle of a column leaves the reader on the card after
it, and the last card leaves them on the card before it, never on the first card
of the whole board, which would read as the product jumping somewhere on its own.
