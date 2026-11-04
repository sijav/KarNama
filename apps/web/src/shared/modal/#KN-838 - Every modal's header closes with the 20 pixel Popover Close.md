# KN-838 · Every modal's header closes with the 20 pixel Popover / Close

**Why**, from the board: every modal in the product draws the old close until
the shell changes, and the Unsaved modal, KN-763, cannot match its frame before
it does.

**Exit**, from the board: ModalHeader draws Popover / Close at 20 in a 28 header
in every modal; the Modal, ConfirmModal, ChangeStatusModal, ContactModal and
PanelModal stories measure it and pass in fa-IR and en-US, light and dark;
`DESIGN.md`'s modal section says so; lint, tsc and the tests pass.

## What the file draws, read 2026-11-04

`150:92`, Modal / Confirm, and `150:93`, Modal / Change Status, in the original:
a Header 28 tall that fills the modal, its two children spread apart and
centred, the title at 20 on 28 at SemiBold at the inline start and an instance
of **Popover / Close** at 20 at the inline end, no other gap. The board's card
read the same close at 20 in `270:152`, `919:2804`, `865:33825`, `919:2885`,
`210:276` and `166:82`.

## The approach

1. `ModalHeader`, which `Modal` and the add flow's modal draw, and
   `PanelModal`'s own header take the shared `PopoverClose` at 20, whose x is
   16, in place of the 32 Icon Button round a 20 x pulled back by a negative
   margin; the header keeps the title's 28 with no overhang. The 12 between the
   title and the close stays as the least room a long title leaves.
2. One story check, `closeIsTheFiles`, reads the close's 20 and its 16 x, the
   title's 28, the close centred on the title at the header's inline end and
   the title at its start, and the x's `text/secondary`; the Modal, Confirm,
   Change Status, Contact and Panel modals' stories run it in Persian and
   English, and the Modal's in the dark scheme too.
3. The job modal's own header is KN-800's to redraw, and takes the same close
   there.

## How it is checked

The five modals' stories, the add flow's, lint, tsc and the unit suites.
