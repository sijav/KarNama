# KN-470 - The bulk bar's key listener fires while a modal owns the page

## The card

**Why.** Moving focus out of a modal is the one thing a modal is supposed to prevent, and a reader
who lands behind the scrim cannot see where they are.

**Exit.** The key does nothing while a dialog has focus, and a story opens one with a selection live
and presses it.

## Measured before planning, 2026-09-15

- **The listener.** While anything is selected, `BulkActionBar.tsx` listens for `keydown` on the
  document, and on F6 with no modifier it prevents the key's default and focuses the bar's first
  button, KN-330 and KN-469. Nothing asks whether a modal is up.
- **What a modal is here.** Every modal is the shared shell on MUI's Dialog, which puts
  `role="dialog"` and `aria-modal="true"` on its paper and `role="presentation"` on the container
  round it, read in `Dialog.js` of MUI 9.4.0; its focus trap may focus that container, outside the
  element marked modal, when nothing inside takes focus. The Confirm modal focuses its Cancel as it
  opens, and its `opener` and `fallback` are optional.
- **The screens** open the Change Status and delete Confirm modals from the bar itself, with the
  selection still live.
- **The pattern for the story is in the same file.** `ReachedFromInsideTheList` presses the runner's
  own F6 and records, on the window, whether each F6's default was prevented.

## The approach

1. **The story first.** `QuietWhileAModalIsOpen` renders the bar with a selection and the Confirm
   modal open over it, as a screen does when Delete is pressed, and, in the runner, presses F6 with
   focus on the modal's Cancel. It reads that focus stays on Cancel, that nothing inside the bar
   took focus, recorded by a `focusin` listener on the bar, and that the key's default was not
   prevented. Against today's listener it should fail on the prevented default and the bar's focus.
2. **The listener leaves the key alone while a modal is open**: it returns before anything else when
   the document holds an element marked `aria-modal="true"`. Not the focused element's own dialog,
   as the card words it, because the trap can hold focus on the container outside the marked paper;
   a modal owns the page wherever inside it the focus sits. The selector is a typed constant, as the
   key's name is, and the comment says why.
3. **The docs**: both BulkActionBar pages gain the story's entry.

## What I will change

- `apps/web/src/shared/bulk-action-bar/BulkActionBar.stories.tsx`
- `apps/web/src/shared/bulk-action-bar/BulkActionBar.tsx`
- `apps/web/src/shared/story-docs/en/Shared-BulkActionBar.md`, `apps/web/src/shared/story-docs/fa/Shared-BulkActionBar.md`

## What I expect to be hard, and what I am unsure of

- **A modal on its way out.** For the 150 ms a modal dissolves its paper is still marked, so F6 stays
  quiet until it is gone; I take that as right, the modal still being on the page, but it is a
  question for the review.
- **The focus trap before the change.** MUI may pull focus straight back into the modal after the
  bar takes it, so the story reads the bar's `focusin` and the prevented default rather than where
  focus ends alone.
- **The published Storybook** has no keyboard of the runner's, so the story's key press runs in the
  runner only, as `ReachedFromInsideTheList`'s does.

## How I will know it works

- The story fails before the change, and passes after it.
- The bar's other stories pass, `ReachedFromInsideTheList` among them, so F6 still reaches the bar
  when no modal is open; tsc, lint and the unit project pass, the docs guard among them; and no
  file's Prettier drift grows.

## Plan review, 2026-09-15, Codex gpt-5.6-terra

Approved, as the smallest sound fix. The document-level guard is the right boundary: MUI's Dialog
marks itself modal by default and its focus trap keeps focus in the modal's content, so asking only
whether the focused node is in a dialog is weaker than asking whether a modal owns the page, and F6
staying quiet while a modal dissolves is right, since it still blocks the page then. The story's
two reads suffice: `focusin` bubbles, so the bar's listener catches a jump even when MUI puts focus
straight back, and `defaultPrevented` read on the window shows the key was not taken. Its warning
is kept: the guard goes before `preventDefault` and before the button is chosen, and
`ReachedFromInsideTheList` stays the proof that F6 still reaches the bar with no modal open.

## Built, 2026-09-15

- **The story came first.** `QuietWhileAModalIsOpen` renders the bar with a selection and the
  Confirm modal open over it, finds the bar by CSS, since the open modal hides the page from roles,
  and in the runner presses F6 with focus on the modal's Cancel. It reads that the key's default was
  not prevented, that nothing inside the bar took focus, and that Cancel keeps it. Against the
  listener as it was it failed on the first read, the default prevented, while the bar's seven other
  stories passed.
- **The guard.** `jump` returns right after its key check, before it prevents anything or chooses a
  button, while the document holds `[aria-modal="true"]`, a typed constant beside the key's name,
  with the comment saying why the document is read and not the focused element. All eight stories
  pass.
- **The mutations**, each written into `BulkActionBar.tsx` and the file put back by hash. With the
  guard moved after `preventDefault`, the mistake the review warned of, the story fails on the
  prevented default. With neither the guard nor `preventDefault`, it fails on the bar's `focusin`,
  which recorded the button the key had focused, so each read catches what the other would miss;
  `ReachedFromInsideTheList` fails there too, on its own prevented default.
- **The docs.** Both BulkActionBar pages describe the story.
- **Checks.** tsc and lint pass, and so does the whole unit project, 1506 tests, the docs guard
  among them. Prettier drift is 0 in the four files and in this plan.
- **No look.** Nothing a reader sees changed: the bar and the modal draw as they did, and only a key
  press behaves differently.
