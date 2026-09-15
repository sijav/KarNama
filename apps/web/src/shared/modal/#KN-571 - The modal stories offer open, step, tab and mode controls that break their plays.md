# KN-571 - The modal stories offer open, step, tab and mode controls that break their plays

## The card

Found by KN-255's measurement, 2026-09-15, on a production Storybook of 83877dc.

**Why.** A reviewer who changes a modal's open, step, tab or mode in Controls and
presses Rerun sees the story fail when the component is not broken, so the
Interactions panel's ticks stop describing the story on screen, as in KN-247 and
KN-255.

**Exit.** Every story with a play function in the AddJobModal, JobModal,
ContactModal, ChangeStatusModal, ConfirmModal and Modal story files reads its
expectations from the active args or offers only the controls its assertions hold
for; KN-247's sweep over every story, each offered control changed by its type,
finds none of them broken; and those stories pass under Vitest.

## Measured again before planning, 2026-09-15

`node agent/scripts/storybook/controls-sweep.mjs` over the six files, on a
production Storybook of 5fba844: 54 stories, every one with a play, **39 broken**
by a control they offer, and none failing with nothing changed, since KN-494 has
closed and the stories it held are tried now. The card's list holds. What it could
not try, or what did not exist then, breaks too: AddJobModal's Review and
ReviewInEnglish under `open` and under `step` paste and error; JobModal's
ChangeStatus under `open`; Note, SaveAndDelete and KeepsAWrittenDate under `open`
and `tab`.

What breaks them, by kind:

- **`open` false**, in the 26 AddJobModal and JobModal stories that expect their
  dialog. No play about an open modal holds for a closed one.
- **AddJobModal's `step`**, in each of its 15 stories that offer it: each is about
  the step it opens on. **JobModal's `tab`**, in 9: each reads the panel of the tab
  it opens on. ChangeStatus holds for every tab, and TabFollowsItsProp's tab is its
  parent's, so the control does nothing there.
- **AddJobModal's `source`**, in Paste, where an entered link makes leaving ask; in
  PasteFilled, Loading, ExtractsToReview, LeaveWhileReading, ErrorStep and
  AnswerAfterLeaving, which need the fixture's link or read it. Review,
  ReviewInEnglish, Manual, ManualPath, LeavingAsks, InEnglish and both
  KeyboardsOnTheForm stories hold for it.
- **ContactModal's `mode`**, in all nine stories that offer it, and not at an
  assertion: the sweep reports `errored` with no exception from the play, a render
  that threw. `mode` decides which props the modal takes, a record and its id for
  Edit and neither for Add. An Add story switched to Edit has no `recordId` and no
  `initial`, so `initial?.id === recordId`, line 117, holds for two undefineds and
  `initial.values` is read from nothing. The types forbid that state.
- **ChangeStatusModal's `value`**, offered as text for a status id: `x7` or empty
  checks no radio.
- **ConfirmModal's `body` and `confirmLabel` emptied**: jest-dom's
  `toHaveTextContent('')` fails by design, and the story finds its two actions by
  their having text.
- **Modal's Shell**: it measures the panel against the literal 360, and an empty
  title leaves the header at the close's 20 rather than the title's 28. A blank
  title is KN-345's to refuse.

**Measured on the Docs pages**, in the dev Storybook: stories render inline, not in
frames, so an open modal portals over the whole page. AddJobModal's page holds 19
open dialogs, JobModal's 15 and ContactModal's 2, filed as **KN-594**. ContactModal's
page offers `mode` with its two editors today, and the installed Controls block,
`@storybook/addon-docs`'s `blocks.js`, draws the primary story's prepared arg types,
filtered only by `parameters.docs.controls`, and never reads
`parameters.controls.disable`.

## The approach

AGENTS.md section 4, KN-255: a story with a play offers only the controls its play
holds for, reads its expectations from its args, or disables the panel and says
why; and the first story's controls are the Docs page's. A control offered has to
change the canvas, not merely leave the play green.

1. **Read the args where the play can.**
   - ConfirmModal's DeleteAJobOpportunity compares the body's own text with
     `args.body`, whatever it is, and takes the dialog's last two buttons as Cancel
     and the action, so an empty label still finds them.
   - Modal's Shell measures the panel against `args.width`.
   - ChangeStatusModal's `value` becomes a select of the story's nine status ids,
     the only values the prop takes; both stories already read `args.value`.
2. **Offer only what holds and shows**, story by story, with the Input stories'
   `offers(names)` helper in the two large files, and `controls: { disable: true }`
   with its reason where nothing does:
   - AddJobModal: `source` where it is drawn, the paste field of InEnglish and
     ManualPath, and the posting link a pasted link fills on the manual form of
     Manual and both KeyboardsOnTheForm stories. Nothing on Review, ReviewInEnglish,
     LeavingAsks and Phone, whose draft's own link wins over it, nor on Paste,
     PasteFilled, ExtractsToReview, Loading, LeaveWhileReading, ErrorStep and
     AnswerAfterLeaving. StepFromItsArgs and RestartWhileReading offer none already.
   - JobModal: `tab` on ChangeStatus; on Phone, whose assertions run only in the
     runner and hold for any tab; and on OpensFromCard, whose `open` is its card's
     to say, so that control does nothing. Nothing on Info, History, Note, Contacts,
     Files, SaveAndDelete, EnterSaves, InEnglish, KeepsAWrittenDate and
     TabFollowsItsProp.
   - Modal: Shell offers `width` alone; its other three stories hold for both.
   - ContactModal: `mode` gets `control: false` on the meta, so its row stays on the
     Docs page with no editor there or in the panel, as the Tooltip's `children` do
     since KN-255. Nothing else is a control.
3. **The Docs pages.**
   - Modal gains a `Default` with no play at its head, since Shell cannot keep
     `title`. In its own canvas it opens the modal from the start, from its
     trigger's own state, so a change to title or width shows at once. On a Docs
     page, which draws stories inline, it waits behind its trigger, since an open
     modal would cover the page as KN-594's do. It is pinned to fa-IR, the language
     its title arg is written in, as the file's other stories are. Its entry goes in
     both languages' docs.
   - AddJobModal's and JobModal's first stories, Paste and Info, disable their panel.
     The Docs page's table is the primary story's arg types, which Storybook trims to
     its `include` and not by `disable`, so those pages keep their controls; that is
     checked on the page, and if a table empties, a `Default` with no play goes
     first, as the Checkbox's did.
   - ChangeStatusModal's and ConfirmModal's first stories keep theirs after step 1.

**File by file**: the six story files, and `story-docs/{en,fa}/Shared-Modal.md` for
`Default`.

## How I will know it works

- The sweep over the six files finds none broken and none failing with nothing
  changed, and its JSON shows each control a story still offers was tried: `source`
  on AddJobModal's five, `tab` on JobModal's ChangeStatus and OpensFromCard, `width`
  on Shell, the eight other statuses on both ChangeStatusModal stories, and title,
  body and confirmLabel on ConfirmModal's three; `mode` offered by none. The same
  sweep found 39 before, so it is not a check that finds nothing.
- The six files' stories pass under Vitest; the unit project, whose docs guard reads
  the new story, passes; lint and tsc are clean.
- The Docs pages: Modal's in fa-IR and en-US, light and dark, `Default` first and
  its page uncovered; ContactModal's `mode` row with no editor; AddJobModal's and
  JobModal's tables still holding their rows.

## What I expect to be hard, and what I am unsure of

- **Branches only the runner takes.** The sweep reads a production Storybook, where
  both Phone stories return before their assertions and JobModal's EnterSaves after
  its first query. Phone's controls are chosen by reading its runner branch.
- **Whether a disabled first story keeps its Docs table**, read from the blocks and
  not yet seen; the fallback is named above.
- **Shell without `title`.** An empty title is a state KN-345 will refuse, so the
  play is not bent to hold for it; the title stays a control on the other three and
  on `Default`.

## Plan review, Codex gpt-5.6-terra, 2026-09-15

Sound, with two corrections, both taken, and one endorsement not taken. The first
attempt at this review ran on no reviewer at all: `gpt-5.6` is refused on the
account, so the review was pinned to terra.

1. **Modal's `Default` must render the modal open**, or its title and width sit
   behind a closed trigger and change nothing on screen. Taken where the Controls
   panel is, the story's own canvas. On the Docs page it waits behind its trigger:
   the review did not know the page draws stories inline, and a frame of its own,
   tried first, followed neither toolbar, below.
2. **No `source` where it changes nothing**: `draftFrom()` keeps the fixture draft's
   link on Review, so the control there is inert. Taken, and the same holds for
   ReviewInEnglish, LeavingAsks and Phone, which open on that draft; `source` stays
   where it is drawn.
3. **Not taken: ContactModal's panel disabled on the meta**, which the review called
   the simplest correct reading. The Docs page would still offer `mode`'s editors,
   since its Controls block never reads `parameters.controls.disable`, and switching
   it there throws; `control: false` removes the editor everywhere.

It confirmed that a story's `include` replaces the meta's, that a meta's `disable`
holds unless a story sets it false, that `value`'s nine ids are all in the story's
statuses, and that the sweep and Vitest together cover what each can see.

## Result, 2026-09-15

Built as planned after the review, with one change found while looking.

- ConfirmModal's DeleteAJobOpportunity reads the body's paragraph and the dialog's
  last two buttons; Modal's Shell reads `args.width` and offers `width` alone;
  ChangeStatusModal's `value` is a select of the nine status ids.
- AddJobModal offers `source` on InEnglish, ManualPath, Manual and both
  KeyboardsOnTheForm stories and nothing on its other thirteen; JobModal offers
  `tab` on ChangeStatus, OpensFromCard and Phone and nothing on its other twelve,
  each through `offers` or `FIXED` with its reason beside it.
- ContactModal's `mode` has `control: false`: its Docs page keeps the row, with no
  editor, where it offered two before.
- **Modal's `Default`, changed on the way.** First drawn in a frame of its own on the
  Docs page, `parameters.docs.story.inline` false, it followed neither the Language
  nor the Theme toolbar, and the page's prose turned Persian under the English
  toolbar, where ConfirmModal's page, with no frame, stayed English. So `Default`
  opens from the start only where the render's `viewMode` is not `docs`, waits
  behind its trigger on the page, and is pinned to fa-IR, since its title arg is
  Persian copy and its body and buttons had followed the toolbar beside it. On the
  way the literal guard refused the frame's `'360px'`, before the frame went.
- AGENTS.md section 7 learns both: how a Docs page treats an open modal, and that its
  Controls block trims by `include` and never by `disable`.

**Checks.**

- The sweep over the six files on a fresh production build of the final tree: 55
  stories, 54 with a play, none broken, none untried or unapplied, no JSON control for
  an element, none failing with nothing changed. What each still offers was tried:
  `source` on AddJobModal's five, `tab` on JobModal's three, `value` and its nine
  options on both ChangeStatusModal stories, title, body and confirmLabel on
  ConfirmModal's three, title and width on Modal's three with a play, and width on
  Shell. Before the change the same sweep found 39.
- The six files under Vitest, 55 of 55, and Modal's again after each of its later
  changes, 5 of 5.
- The unit project, 1459 of 1459; the docs guards and the literal guard again after
  Modal's last change. A first run failed `session.test.ts` on its 5 second budget
  while the story run loaded the machine, KN-551's kind, and it passed alone.
- `eslint .` and tsc clean; the formatter at HEAD's drift, 7 lines in ContactModal's
  stories, none elsewhere.
- The Docs pages in the dev Storybook: Modal's in fa-IR and en-US, light and dark, its
  prose in the toolbar's language, no dialog over it, `Default` first with title and
  width; ContactModal's `mode` with no editor; AddJobModal's open, step and source and
  JobModal's open and tab still in their tables, with Paste's and Info's panels
  disabled. `Default` in its own canvas under the English toolbar opens the modal, in
  Persian, right to left.
