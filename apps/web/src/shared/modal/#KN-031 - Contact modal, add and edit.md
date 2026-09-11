# KN-031 · Contact modal, add and edit

Beside the modals. Recorded after the build, on 2026-09-11, under the owner's
rules of that day.

**Exit condition, from the board.** Both modes match Figma, Edit is prefilled
from the record, validation errors render in the Input error state, and
cancelling discards without saving. A contact saves with a full name and
nothing else, KN-071.

## What was built

- From node 270:152, read with use_figma: Add and Edit on a new panel modal,
  the frame the Contact Modal and the Job Modal share, with its dividers edge
  to edge and its header and footer paddings; the Add/Edit job modal keeps the
  shell.
- The form in the file's order: full name, role and company, email and phone,
  the social link, and the related job opportunity as the Select. Edit fills
  from the record and offers the delete at the footer's end.
- Only the name is required: Save with none puts the Input in its error state;
  a name alone saves. Cancel, Escape, the close and the scrim discard; each
  opening starts from the record or from nothing.
- The Input folder gained its barrel.
- Stories: Add, Edit, SavesWithOnlyAName, NameIsRequired, CancelDiscards and
  InEnglish for the Contact Modal; Panel and WithAnAside for the panel modal.
