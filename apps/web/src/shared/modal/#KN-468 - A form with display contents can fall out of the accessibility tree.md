# KN-468 · A form with `display: contents` can fall out of the accessibility tree

From the KN-463 roast, 2026-09-12.

**Why**, from the board: the form was added for readers, and a form a screen reader cannot see is only half the change.

**Exit**, from the board: each modal's form is in the accessibility tree with a name, or the reason it does not need to
be is written down.

## 1. The premise, and what it says when measured rather than reasoned about

The card says some browser and screen reader combinations drop a `display: contents` element from the accessibility
tree, so these forms may not be exposed, and that being unnamed they would not be reliable landmarks even where kept.

The original roast is more careful than the card's paraphrase, and the difference matters. It says `display: contents`
**does preserve** submission and ownership, that **some** combinations remove such elements so the forms **may** not be
exposed, and it prescribes: "Use a layout that retains the form in the accessibility tree, **and give it an accessible
name if it is intended to be announced as a form**." The card dropped that last clause, which is the one that decides
this.

**Measured in the browser this repository tests and ships against**, the running Storybook in Chromium, by reading the
accessibility tree of the real components:

| form                       | shape           | in the tree? | named? |
| -------------------------- | --------------- | ------------ | ------ |
| `ContactModal.tsx` 159     | six text fields | YES          | no     |
| `ChangeStatusModal.tsx` 62 | a radiogroup    | YES          | no     |
| `AddJobModal.tsx` 313      | the review step | YES          | no     |
| `JobsScreen.tsx` 745       | a status name   | YES          | no     |

All four show a `form` node inside the `dialog`, with their fields nested under it. `ContactModal` renders exactly one
`component="form"`, so that node is unambiguously the `display: contents` one, and `ChangeStatusModal` likewise.
`AddJobModal` renders TWO, so it was disambiguated rather than assumed: the story was opened at `args=step:review`, and
the tree carries «عنوان شغلی» and a `url` field for «لینک آگهی», which only the review step draws. The paste step's
form, line 233, is `display: flex` and is not this card's subject.

**The fourth site was measured too, and it took a correction worth recording.** The board's rename form at
`JobsScreen.tsx` 745 is reached only by driving a column menu, so the screen story was opened and the menu and its
«تغییر نام» item clicked by script. The first attempt found no column menu at all and no form, which was NOT evidence
about `display: contents`: the pane was 635 wide, which is the PHONE layout, where `DESIGN.md` says the column is its
cards alone with no header and no menu. At 1440 by 900 the menu appears, its items are «تغییر نام», «تغییر رنگ» and
«حذف وضعیت», and after the rename opens there is a `form` node in the tree. `JobsScreen` renders exactly one
`component="form"`, line 745, and it is the `display: contents` one, so the attribution is unambiguous.

So it is FOUR of four, on four shapes: six text fields, a radiogroup, the add flow's review step, and the board's
single field for a status name. Every one is in the tree; every one is unnamed.

**So the card's first worry DID NOT REPRODUCE in the measured Chromium build.** That is the strongest thing four
readings in one engine can say, and an earlier draft of this line said the worry "does not hold here", which implied
more. The review was right to narrow it: the CSS Display Level 3 specification still warns that major browsers do not
implement `display: contents` accessibility semantics correctly, so a passing reading in one engine is not evidence of
cross-browser safety. The node is retained where it was measured. What holds everywhere is the second half: the forms
are unnamed.

**And naming works, which was worth measuring rather than assuming.** Setting `aria-label` on the live form by script,
with `display` confirmed still `contents`, turned `form` into `form "Probe name"` in the tree. So the styling is not an
obstacle to naming either. Both of the card's fears are answered by measurement, in opposite directions: the node
survives, and a name would attach if we wanted one.

## 2. The real question is not whether we CAN name them, it is whether we SHOULD

A `<form>` becomes a landmark only when it has an accessible name. These forms sit inside a dialog that is already
named by its own heading: «افزودن مخاطب» for the contact modal, «تغییر وضعیت» for the change-status modal. Naming the
form would announce essentially the same thing twice, one landmark inside another, for a group whose boundary a reader
already has from the dialog.

**What the forms were built for is recorded.** KN-463's why is entirely behavioural: Enter finishing a form, a phone's
keyboard offering Go, and a password manager or autofill finding a form to fill. The owner's instruction quoted there
is "the inputs should always be in a form, onsubmit needs to be the one responsible for next button". Nothing about
announcement. And the card itself concedes submission and ownership are unaffected by the styling, which the
measurement confirms.

So the roast's own condition, "if it is intended to be announced as a form", is not met: it was never intended to be,
and the dialog already provides the grouping a reader needs.

## 3. The decision: the exit's second branch, with the measurement as the reason

Write down that these forms do not need to be named landmarks, and record WHY with the measurement rather than with an
opinion: the node is in the tree, the styling does not remove it here, the dialog already names the group, and the
forms exist for submission rather than announcement.

**What this does not do.** It does not claim every browser and screen reader behaves as Chromium does. The roast said
"some combinations", and I can measure only what is here. The record will say exactly that, and say that naming remains
one `aria-label` away if a reader ever reports the grouping is lost.

## 4. What must not change

- **`display: contents` stays.** It is why the modal's own layout is unchanged, KN-463, and the measurement shows it
  costs nothing in the tree here.
- **Submission, ownership and the footer buttons' `form` id association.** Untouched; that is KN-463's work.
- **The dialog's own name.** The heading is what names the group.

## 5. Where the reason gets written

`DESIGN.md`, beside the modal, since that is where a reader meets the component and where this repository settles
questions of what is announced. Not in a card, which nobody reads while building.

## 6. The proof

Reading, plus the measurements above recorded so the premise is not re-filed. A story could assert the form is in the
tree, and the honest note is that `getByRole('form')` will NOT find an unnamed one, since a form is exposed as a
landmark only when named; so an assertion would have to reach for the element rather than the role, which proves the
DOM and not the tree. The tree measurement is the browser reading, recorded here with what it showed.

**The scope is two files**, `DESIGN.md` and this plan, and an earlier draft of this paragraph listed six, naming the
four components and both catalogs as touched. They are READ, not edited: the decision is that nothing in code changes.
That is the same contradiction between a plan's own scope and its file list that the review caught on KN-426, written
by me a second time, so the close now refuses a commit in which any component appears in the diff at all.

No `tsc` or `eslint` run is claimed, because nothing they check changed; the owner's rule of 2026-09-11 is to test what
was changed. Prettier drift at or below baseline on both files, `DESIGN.md` measured 236 before the edit and this plan
new, and `DESIGN.md` keeps its nine em dashes with none added.

## 7. Questions for the review

1. **Answered: branch two stands.** The review did not argue for naming. Its ruling is that with the fourth inspection
   and the narrower wording, this is the minimum work meeting the documentation branch of the exit, and that no code
   change and no new automated test are needed.

   **It also confirmed a claim of mine from the installed packages rather than from memory**, which is worth recording
   because I asserted it: `@testing-library/dom` 10.4.1 with `aria-query` 5.3.0 exposes a native `form` as role `form`
   ONLY when it carries `aria-label`, `aria-labelledby` or `name`. So `getByRole('form')` genuinely cannot prove the
   unnamed case, and an assertion would have to reach for the element, which proves the DOM and not the tree.

   **And it corrected an overclaim**, which section 1 now carries: a reading in one engine is not cross-browser safety,
   because the CSS Display Level 3 specification still warns that major browsers get these semantics wrong. The rule
   written into `DESIGN.md` says the measured thing, not the general one.

2. **Answered by me rather than asked**, since driving the menu turned out to be cheap: all FOUR sites are measured,
   and all four are in the tree. An earlier draft of this plan asked whether three was enough. What I would still like
   told is whether a fourth reading on a fourth shape adds anything, or whether two would have settled it and the rest
   was me proving a point.
3. The record will say Chromium retains the node and that other combinations are unmeasured. Is that the honest limit,
   or does writing it down at all overstate what two readings establish?
