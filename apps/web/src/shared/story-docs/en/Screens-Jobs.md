The board: a column for every status, the job opportunities in it, and
everything that happens to one of them.

It is the product's first page. The columns are the statuses in the order the
design settles, with rejected last and collapsed until it is opened; each card
opens the job modal, changes its status or is deleted; the sort control acts on
every column together, and so does the search, once typing pauses for a moment.
The field shows every key as it is typed; the cards narrow after the pause.

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

### onExtract

Reads the pasted link or text of a posting into what the add flow's Review step
shows. The product's shell hands it the server's reader, and a story hands it one
of its own, so the board can be shown and tested without a server.

## Stories

### DragAndDrop

A card dragged between statuses on a desktop. Held over the collapsed rejected
column for half a second, the column opens; dropped, the card takes the column's
status, the column is ringed in its colour for a second, and a column the drag
opened closes again. The story drives the board's own handlers with the browser's
drag events: a drag from the card's link is refused, a click while dragging opens
nothing, and a drop on the card's own column moves nothing. On a phone a card
changes status from its menu.

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
opportunity, and selecting one brings up the bulk bar, which moves it to another
status; its confirmation, pressed again as it closes, moves it once.

### Managing

The board being managed: a column renamed from its menu, another added, a job
opportunity deleted from its modal after a confirmation, and the rejected column
opened from its collapsed header and closed again from its open one.

### People

The people and the files kept against one job opportunity: a person added from
the job's own tab and opened again, and a file chosen and downloaded. Both are
the network's records rather than the job's, so a person added here is on the
network page too.

### BackingOut

Every way out of a change: a rename backed out of, and one saved blank, which the
field refuses with its own error until it is backed out of; a colour taken from
the column menu, an empty column deleted where
one holding a job opportunity says why it cannot be, a status change cancelled,
and a deletion refused.

### Adding

Adding by each road the board offers: the header's action, which reads a link
through the story's own reader, which gives the link back, and leaves the rest
to be typed, takes a column of its own before saving; and a column's own Add
Card row, which opens the same flow for that column.

### AddingFromEmpty

A board with nothing on it: the empty state's own action opens the same flow.

### Selecting

Several at once: one selected, then every one of them, the selection let go of,
and two deleted together after the confirmation, which, pressed again as it
closes, deletes nothing more.

### SelectingWhileSearching

Selecting with a search active: a card chosen before the search and hidden by it
is not counted, select all takes only what the search found, and deleting after
the confirmation takes those alone, so every job opportunity the search hid is
still on the board once the search is cleared.

### ActingWhileSearching

Acting with a search active: a card chosen before the search and hidden by it
stays chosen, yet deleting the shown card chosen after it does not take it
along, and neither does changing that card's status, so once the search is
cleared the hidden job opportunity is still on the board, in its own column.

### OnAPhone

The board at a phone's width, where the columns give way to a row of status chips
and the chosen status's cards stand alone under them. A card there carries its own
menu, which is where changing a status and deleting live when there is no hover to
fold them behind. A job opportunity whose status is changed from inside its modal
and then deleted there leaves focus on the board, since nothing of it is left in
the column the phone shows.

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
other tab is stood in for by the storage event its write delivers, sent only
once this tab's board provider is listening, since an event that arrives before
the listener is lost.

### RecolouringKeepsItsPlace

A colour is not a place: two statuses of the reader's own are added, the first
renamed, and the second given the job offer's colour from its column's menu, and
every column stays where it was, the reader's own in the order they were added
and rejected last.

### CollapsedByStatusNotColour

A board the reader has coloured: Rejected wearing purple and a status of their
own wearing red. Only Rejected starts folded to its count, because which status
a column is, is its id and never its colour, so the red column stands open with
its job opportunity on the board; Rejected's header opens it.

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

### PeopleInFull

A person kept against a job opportunity with everything the contact modal takes:
an add backed out of keeps no one, a person added with every field keeps each, and
edited with the role emptied, the role goes and the rest stays.

### PersonForAJobDeletedElsewhere

Another open tab deletes a job opportunity while a person is being written on it:
the job modal goes with its job, the contact modal stays, and saving keeps the
person with no job, for a person being edited and for one being added.

### DeletingAPersonAsksFirst

A person deleted from their edit form is asked about first, as on the network page:
the edit closes into the confirmation, backing out keeps the person, and confirming
deletes them from the store and from the job modal.

### WithoutSigningOut

A board given no way to sign out, at a phone's width: its header carries the
language switch and no sign out.
