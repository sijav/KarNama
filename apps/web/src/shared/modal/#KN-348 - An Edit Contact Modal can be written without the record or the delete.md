# KN-348 - An Edit Contact Modal can be written without the record or the delete

## The card

A child of KN-031, found by its roast.

**Why.** Edit is defined by the record it edits and the delete it offers; a type that allows
neither lets the screen get it wrong silently.

**Exit.** Edit cannot be written without initial and onDelete, by its type or two components, and
the docs guard still reads every prop.

## Read before planning, 2026-09-15

- **The record half is done.** KN-386 made `ContactModalProps` a union: the edit member takes
  `recordId: string` and `initial: ContactModalRecord | undefined`, a key that must be written and
  may be undefined while the record loads, which `TheRecordArrivesAfterItsId` and
  `TheRecordArrivesAfterOpening` depend on.
- **The delete half is open.** `onDelete?: () => void` sits in the shared props, and the footer
  draws Delete only when the mode is edit and `onDelete` is given.
- **A caller already draws the Edit form without the delete.** `JobsScreen.tsx`'s edit Contact
  Modal, opened from the job modal's people, passes no `onDelete`, while the job modal's own
  `onDeleteContact` on the same screen deletes a person at once with `records.deleteContacts([id])`.
  `NetworkScreen.tsx`'s edit passes one, which asks through its Confirm modal.
- **Measured: what refuses `onDelete` required in edit and `?: never` in add.** apps/web's whole
  TypeScript program with the change served in memory gave four errors: `JobsScreen.tsx:636`, the
  edit without a delete; `ContactModal.stories.tsx:87`, the meta's `onDelete: fn()`, since the
  meta's mode is add; and `ContactModal.stories.tsx:295` and `:352`, the `Loading` and `LateRecord`
  renders writing an edit without a delete.
- **The docs guard wants every callback's `fn()` in the meta**, KN-207, so the meta cannot drop
  `onDelete`, and a story's own callback must be `fn()`, KN-230.

## The approach

1. **The type.** `onDelete` leaves the shared props: the edit member requires it as a function
   and the add member names it `onDelete?: never`, and the footer draws Delete on the edit mode
   alone.
2. **The stories, as the plan review below settled them.** The meta is a valid edit instance with
   `recordId`, `initial` and `onDelete: fn()`, and one mode render builds the add shape without
   `recordId`, `initial` or `onDelete`; every add story sets `mode: 'add'`, and `Loading` and
   `LateRecord` take `onDelete` and pass it on.
3. **JobsScreen, as the plan review below settled it.** Its edit Contact Modal's `onDelete` closes
   the editor into a Confirm modal for that person, and `records.deleteContacts` runs only on
   confirming, as the network page asks; a board screen story proves the sequence.
4. **The words.** Both story docs' `onDelete` entry says it is required when editing and refused
   when adding.

## Points

Raised from 1 to 2 on 2026-09-15: the measured refusals add a delete path on the board screen and a
change to the stories' meta.

## What I expect to be hard, and what I am unsure of

- **The meta.** With add as the meta's default mode, the type refuses the `fn()` the guard needs;
  KN-331's meta kept every callback because its default type was the member that takes them.
- **Asking before deleting.** The network page asks through a Confirm modal and the job modal's own
  people list deletes at once; the plan review settled on asking, below, since the Contact Modal's
  docs say the page asks before it deletes.

## How I will know it works

- A Contact Modal story reads Delete in an edit and none in an add, and a scratch file compiled with
  the repository's TypeScript refuses an edit without `onDelete`.
- A board screen story deletes a person from the edit form through the Confirm modal, and nothing is
  deleted when the confirmation is cancelled.
- The unit project with the docs guard, lint and tsc are clean; seen in fa-IR and en-US.

## Measured after the plan was written, 2026-09-15

With the union change and the stories' meta defaulting to the edit mode, with `recordId`,
`initial` and `onDelete: fn()`, apps/web's whole program served in memory refuses three places:
`JobsScreen.tsx:636`, and the `Loading` and `LateRecord` renders at `ContactModal.stories.tsx:295`
and `:352`, each an edit without a delete. The meta's `onDelete: fn()` is taken. The stories that
relied on add as the default would inherit edit at run time, which tsc does not see.

## Plan review, 2026-09-15, Codex gpt-5.6-terra

It found the union the right and smallest enforcement, and no Contact Modal caller beyond the two
screens and the stories. It did not approve two points.

Judged:

1. **The stories: both an edit meta and a mode render, taken.** The meta becomes a valid edit
   instance, `mode`, `recordId`, `initial` and `onDelete: fn()`, for the docs guard and the Actions
   panel, and one render builds the add shape from the args without `recordId`, `initial` or
   `onDelete` wherever a story sets `mode: 'add'`, as `barFor` does in `BulkActionBar.stories.tsx`,
   since merged meta args would otherwise hand the add canvas what its props refuse. Every add story
   sets `mode: 'add'`; `Loading` and `LateRecord` take `onDelete` and pass it. A story reads Delete
   in the edit and none in the add, and presses it.
2. **JobsScreen asks before it deletes, taken.** The Contact Modal's own docs say the page asks
   before it deletes, and the network page stages it in a Confirm modal; the job modal's direct
   delete of a person is not the precedent for a destructive action in the edit form. JobsScreen's
   edit takes `onDelete` that closes the editor and opens a Confirm modal for that person, deleting
   with `records.deleteContacts` only on confirming, and a board screen story proves the sequence.

## Points

Raised again, from 2 to 3: the board screen's confirmed delete and its story join the type, the
stories' meta and render, and the docs.

## Built, 2026-09-15

- **Story first.** `DeletingAPersonAsksFirst` on the board failed against the old screen, whose edit
  form had no Delete contact, and passes now: the edit closes into the Confirm modal, Cancel keeps
  the person, and Delete removes them from the store and from the job modal.
- **What the plan did not predict.** tsc refused `args.onDelete` in the renders of
  `TheRecordArrivesAfterItsId` and `TheRecordArrivesAfterOpening`, typed as possibly undefined since
  the args may be either mode; both renders narrow to the edit first, as
  `KeepsTypingThroughARerender` does. The add stories' `mode: 'add'` and the meta's render through
  `modalFor` were taken as written.
- **The refusal, measured.** A scratch caller served beside apps/web's program compiles against the
  committed type; against the new one an edit without `onDelete` and an add given one are refused,
  TS2322, and the edit with its delete is taken.
- **Not changed.** The job modal's own people list still deletes a person at once, as it did.
