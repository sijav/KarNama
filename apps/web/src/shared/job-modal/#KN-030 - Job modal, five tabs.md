# KN-030 · Job modal, five tabs

Beside the modal. Recorded after the build, on 2026-09-11, under the owner's
rules of that day.

**Exit condition, from the board.** All FIVE tabs match Figma, the fifth being
سابقه which the frame does not draw and which sits second, the modal opens from
a card on the board, status history renders in its OWN tab in reverse
chronological order rather than in the Info tab, and switching tabs does not
lose unsaved note text.

## What was built

- From node 210:276, read with use_figma: the header with the title, company,
  Status Control and close; the Tabs of KN-023 edge to edge; the body scrolling
  in 24; the footer with Cancel, Save and the delete.
- Info reuses the add modal's fields, now `JobFields`, with the posting's link
  and its open button, the description and the skills. History is its own tab,
  second, sorted newest first by the modal whatever order the record keeps.
  Note, Related people and Files follow 210:145, 210:208 and 210:275.
- The fields, the description and the note live in the modal, so a switch of
  tabs keeps what was typed; each opening starts from the record, and the tab
  follows the one asked for while open. The Status Control changes the status
  at once, and Save keeps the record's status.
- `format.ts` writes days on the reader's calendar and file sizes, unit
  tested. The story fixtures gained the record's description, skills, files
  and history in both languages.
- Stories: Info, History, Note, Contacts, Files, ChangeStatus, SaveAndDelete,
  OpensFromCard, TabFollowsItsProp, Phone and InEnglish; seen headless in a
  production build at 1000 and 390. The compact Contact Card's name still draws
  in the button font, KN-351.
