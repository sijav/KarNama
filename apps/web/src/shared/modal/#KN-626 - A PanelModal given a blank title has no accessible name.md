# KN-626 - A PanelModal given a blank title has no accessible name

## The card

**Why.** ARIA requires a dialog to have an accessible name, and the panel modal is reusable, so it
should refuse what cannot name it as the Modal now does.

**Exit.** A blank title given to PanelModal is reported at the console as the product's own
diagnostic and PanelModal renders nothing, and a story shows both.

A child of KN-028, from its roast. Found while planning KN-345, 2026-09-15.

## The precedent this copies, and the reasoning already settled

KN-345 did exactly this for `Modal`, and its evidence ends with the sentence that produced this
card: "PanelModal's same gap is KN-626". So the approach is not mine to re-decide, and **the value
of this plan is in the differences, not in the design.**

`Modal.tsx` lines 107 to 120: `const unnamed = title.trim() === ''`, a `useEffect` that calls
`report(...)` when it is, and `if (unnamed) return null` before the `Dialog`. Its story
`ReportsABlankTitle`: `args: { title: ' ' }`, controls disabled, `beforeEach: captureConsoleErrors`,
a `waitFor` on `console.error` matching `/title is blank/`, then a click on the trigger and an
assertion that no dialog opened.

KN-345's exit was itself rewritten after its plan review, and that reasoning stands without being
re-argued here: **no type can see a title the catalog hands over at run time**; a report alone would
leave the unnamed dialog in front of a reader; and a development-only throw would need an error
boundary to show, would stop the development screen, and would leave production drawing the dialog.

## Measured before planning, 2026-09-16

- **The defect.** `PanelModal.tsx` line 10 takes `title: string`, line 63 makes `titleId` with
  `useId()`, line 70 labels the `Dialog` with `aria-labelledby={titleId}`, and the title is drawn at
  106 and 115. A blank one leaves the dialog unnamed, exactly as `Modal`'s did.
- **Where the check may go.** The component runs four hooks before its return: `useLingui`,
  `useId`, and `useSyncExternalStore` twice. **The early return must follow all of them**, with the
  report in a `useEffect` of its own, or the hook order would differ between renders.
- **console-guard is a FILE**, `shared/console-guard.ts`, not a directory: `report(message)` writes
  `` `${MARK} ${message}` `` to `console.error`, `isOurs` recognises that mark, and
  `passOnUnmarked(through)` hands unmarked calls onward.
- **What this stories file lacks that the template uses.** `PanelModal.stories.tsx` imports
  `expect, fn, userEvent, waitFor, within` — **no `spyOn`** — and neither `passOnUnmarked` nor a
  `body()` helper. `Modal.stories.tsx` imports both, and defines its `body` helper at line 88 as a
  one-liner returning `within` of the canvas element's owner document body.
- **`DISSOLVE_MS` is exported from `Modal.tsx` line 22 and is NOT exported from `PanelModal.tsx`**,
  where line 19 is a bare `const`. The template's `setTimeout(DISSOLVE_MS * 2)` wait therefore
  cannot be imported as things stand. This is the one real decision in the card.
- **Five stories and five docs entries per language**, plus seven props: `Panel`, `WithAnAside`,
  `FooterInAPhoneView`, `FooterAboveTheKeyboard`, `WithoutAVisualViewport`. A new story needs an
  entry in each language or the docs guard fails.
- **Drift baselines**: all four files 0.

## The approach

1. **PanelModal refuses a blank title, as Modal does.** `const unnamed = title.trim() === ''`, a
   `useEffect` reporting it through `report(...)`, and `if (unnamed) return null` — placed after all
   four hooks so the hook order cannot change between renders.
2. **The message names this component**, as Modal's names Modal, so a reader of the console knows
   which shell refused.
3. **A story `ReportsABlankTitle`** with a title of one space, controls disabled, the console
   captured with `passOnUnmarked`, and the marked report read. It hands the panel `open: true`
   directly instead of pressing the trigger, which is round two's correction and is right: a dialog
   absent after a press is also what an unpressed trigger leaves behind, so the press could pass for
   the wrong reason, and no `waitFor` repairs it because an absence passes on its first poll.
   `open: true` is the contract itself — the shell is asked to draw and draws nothing — and it fails
   against the old component, which hands MUI an open Dialog and gets an unnamed one. The ordinary
   stories already prove the trigger opens a real panel, so nothing is lost.
4. **Nothing is exported and nothing is slept**, which is the review's call and against my lean.
   `PanelModal` returns `null` before MUI's `Dialog` is constructed, so there is no transition to
   wait through, and the template's own fixed wait is waiting for something that cannot happen. The
   story presses the trigger and asserts the dialog is absent, under a `waitFor` only if the runner
   needs one. Copying the template here would copy a weak assertion rather than a shell contract.
5. **The docs gain the story entry AND the `### title` prop entry, in both languages.** The review
   caught the omission: `Modal`'s docs already say a blank title is reported and no dialog is drawn,
   so a prop entry describing only the valid case hides a material runtime behaviour.

## What I will change

- `apps/web/src/shared/modal/PanelModal.tsx`, the check alone; no export changes
- `apps/web/src/shared/modal/PanelModal.stories.tsx`, the new story and its imports
- `apps/web/src/shared/story-docs/en/Shared-PanelModal.md` and `fa/Shared-PanelModal.md`, the story
  entry and the `### title` entry in each

## What I expect to be hard, and what I am unsure of

- **The hook-order rule is the one way to get this wrong quietly.** Modal returns early after a
  single `useId`; PanelModal has four hooks, two of them `useSyncExternalStore`. An early return
  placed above any of them would change the hook count between renders, which React reports as its
  own error rather than as this card's.
- **PanelModal draws its own header and takes an `aside`**, which Modal does not. Neither touches
  the check, but `Panel`'s play asserts the dialog has five parts, so nothing may change the
  header's structure.
- ~~**Whether exporting `DISSOLVE_MS` is right**~~ — settled by the review, against my lean: neither,
  because nothing is drawn to dissolve. Recorded in the approach.
- **The story must render through `WithTrigger`**, as the others do, since the trigger is what
  proves no dialog opens.

## How I will know it works

- **The new story fails against the component as it is** and passes after — the same control KN-345
  used, whose evidence records that its story "failed alone against the shell as it was". A story
  for a refusal that was never seen to fail is a story that proves nothing. **The run is read from
  its summary line, never from its exit code.** The first attempt at this control filtered the run
  with `-t ReportsABlankTitle`, matched no test name at all, reported `Tests 6 skipped (6)`, exited
  0, and was read as a pass: an absence in a pass's clothes, and the same error as reading a
  backgrounded shell line's status. The control script now refuses any run that skipped or ran none.
- The PanelModal stories pass whole, `Panel`'s structure assertions included.
- The unit project passes, the docs guard among it; `tsc` and eslint pass; no changed file's drift
  grows and this plan's is 0.
- A look at the panel in both languages and both schemes, to see the ordinary case is untouched.
