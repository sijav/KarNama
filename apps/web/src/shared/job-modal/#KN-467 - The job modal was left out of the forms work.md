# KN-467 · The job modal was left out of the forms work, and it is the one with the most fields

**Why, from the board.** It is the screen a reader spends the most time in, and
the owner's instruction was that the inputs should ALWAYS be in a form.

**Exit condition, from the board.** The job modal's fields are a form whose Save
submits it, and a story presses the runner's own Enter in a single-line field and
sees what Save does.

## What is there, read 2026-09-14

- **The form half is already built, and not by this card.** Codex's commit
  2234d66 of 2026-09-12, "fix: make job entry and editing survive real input",
  made the modal's body a `form` with an id from `useId`, `noValidate`, and an
  `onSubmit` that prevents the default and calls `save`; Save became
  `type="submit" form={formId}` with no `onClick`. KN-463's roast, which filed this
  card, read the modal before that commit, so the card's "its Save is still a
  plain onClick" is no longer true.
- **What the form holds.** It wraps the `Tabs`, and `Tabs` keeps every panel
  mounted and hides the others, so every field of every tab is inside it: the
  Info tab's `JobFields` (the title, the company, the two Selects, the location,
  the experience, the two dates, the salary and the source), the posting link and
  the description, and the note on its own tab. The description and the note are
  `InputBase multiline`, so textareas.
- **Nothing else inside it submits.** The shared `Button` defaults to
  `type="button"`, and MUI's `Tab`, `IconButton` and `ButtonBase` render
  `type="button"`, so the files tab's «انتخاب فایل», the tabs, the contact cards'
  buttons and «+ افزودن مخاطب» cannot become the form's default button. Save, in
  the footer outside the form, is the only submit button whose form owner is the
  form, so it is the default button that implicit submission clicks.
- **No story presses Enter in the modal.** `JobModal.stories.tsx` clicks Save in
  `Note`, `ChangeStatus`, `SaveAndDelete` and `StartsOverForAnotherRecord`, and
  none presses a key in a field. The story that proves Enter through a footer
  button named by id is the Contact Modal's `EnterSaves`, KN-463, with the
  runner's own keyboard, since a synthetic Enter cannot, AGENTS.md section 3.

## The approach

1. **A story, `EnterSaves`, in `JobModal.stories.tsx`**, on the Info tab in
   Persian, driven as the Contact Modal's is: fields typed with Storybook's
   `userEvent`, Enter pressed with `vitest/browser`'s
   `userEvent.keyboard('{Enter}')` under the story-test flag.
   - The title cleared and Enter pressed in it: the title says «عنوان شغلی را
     بنویس» and `onSave` is not called, which is what Save does without a title,
     as `SaveAndDelete` shows by clicking.
   - A title typed and Enter pressed in it again: `onSave` is called with that
     title and the record's description, which is what Save hands over.
   - Enter pressed in the description, a textarea: the description gains a line
     break and `onSave` is not called again. The card asks that Enter stay a
     newline there, and KN-463's plan wrote that exception down.
2. **No product change**, unless the story fails on today's code, in which case
   that failure is the red of a product change.
3. **The story's docs**, in both languages, since the guard reads every story.
4. **A note on the card** saying the form came in 2234d66, so the board does not
   keep a stale account of the modal.

## The tests

- **Expected to pass on today's code**, since the form exists: like KN-465, a
  missing test, so its proof is the plants, each restored byte for byte:
  1. Save without `form={formId}`: Enter has no default button to click, so the
     refusal never shows and the story fails there.
  2. Save as it was before 2234d66, `type="button"` with `onClick={save}`: the
     same.
  3. The form's `onSubmit` handing the draft to `onSave` without the missing
     fields check: Enter saves a blank title, and the refusal step fails.
  4. The description's textarea asking its form to submit on Enter: the last
     step fails, a save where there must be none.
- The other job modal stories keep passing, which says Save still works through
  the form.

## Files

- `apps/web/src/shared/job-modal/JobModal.stories.tsx`.
- `apps/web/src/shared/story-docs/en/Shared-JobModal.md` and
  `fa/Shared-JobModal.md`.

## What I am unsure of

- **Whether the runner's Enter reaches the title after Storybook's `clear`.** The
  clear focuses the field, and the runner's keyboard presses on whatever has
  focus, so the title has to keep focus through the refusal's render, which moves
  nothing, since the tab is already Info.
- **Whether the refusal step belongs.** The exit condition asks only that Enter
  does what Save does. Refusing a blank title is half of what Save does, and an
  Enter that skipped the check and saved a blank title would pass a story that
  only typed a title.
- **Whether one single-line field is enough.** The date fields and the posting
  link are single-line too, and implicit submission treats them the same as text,
  so one field proves the form's default button; the plants, not more fields, are
  what show the story can fail.

## Plan review, Codex, 2026-09-14

Codex found the plan sound. The form and Save are in one iframe document whatever
the portal; `ButtonBase`, and so everything MUI renders in the form, defaults to
`type="button"`; nothing in `JobModal`, `JobFields` or `Input` handles Enter
first; and `vitest/browser`'s keyboard goes through Playwright to Chromium, so the
browser performs the implicit submission. It kept the refusal step, which proves
Enter reaches Save's check and not only `onSave`, the textarea step as a guard
beside it, one field as enough, and the four plants. Taken from it:

- **The title's focus is asserted after the refusal**, before the valid title is
  typed, so a later loss of focus fails there rather than leaving the second
  Enter to land somewhere unknown.

## Found before building, 2026-09-14

**Four of the modal's stories fail today, and an Enter story on their record would
too.** Run as they are, `Note`, `ChangeStatus`, `SaveAndDelete` and
`StartsOverForAnotherRecord` fail where they expect `onSave`. The record's draft
takes the fixture's extraction, whose dates are written as a reader would write
them, «۱۰ شهریور ۱۴۰۵» and «۱۳ شهریور ۱۴۰۵», and `missingFields` accepts only
`yyyy-MM-dd`, so Save refuses every save, clicked or not. That is KN-494, which
carries those stories.

It does not block this card: what is to be seen is Enter doing what Save does, and
a record that cannot be saved cannot show a save. So `EnterSaves` takes the same
record with its dates as the days the fixture means, `2026-09-01` and
`2026-09-04`, the English fixture's 1 and 4 September 2026, and says why beside
it. KN-494's four stories keep failing and keep carrying it, and a note on KN-494
says this story does not use the written dates, so that override can go when the
fixtures move to days.

## Found while building, 2026-09-14

**The first run failed at the textarea step, and not because of the product.**
The refusal and the save by Enter passed on today's code, as expected. Enter in
the description added no line: `linesIn` read 1 where 2 was expected. Two
throwaway looks, the story file restored by hash after each, measured why. After
testing-library's click the description had focus and its caret sat at 0, and
neither a real `x` nor a real Enter from the runner changed its value. After the
runner's own click, `vitest/browser`'s `userEvent.click`, the caret sat where the
pointer landed, and each real Enter added a line, 2 and then 3. So the story
clicks the description with the runner's pointer. The title keeps
testing-library's typing: the real Enter pressed there after it did submit the
form, since both of those steps passed. AGENTS.md section 7 records it.

## Result, 2026-09-14

No product code changed: the form and Save's submission came in 2234d66, and this
card adds what proves them.

- **`EnterSaves`** clears the title and presses the runner's own Enter: the title
  says «عنوان شغلی را بنویس», nothing is saved, and the title keeps the focus. A
  typed title and a real Enter save the edits. The description, clicked by the
  runner's pointer, takes a real Enter as a new line, and nothing more is saved.
- **Its record** is the fixture's with its dates as days, 2026-09-01 and
  2026-09-04, since the written dates make every save refuse, KN-494; a note on
  KN-494 says so.
- **Its docs**, in both languages.

Red first: the story as planned passed its title steps on today's code, a missing
test, and failed at its textarea step, which was the story's own click, above.

Plants on `JobModal.tsx`, each restored byte for byte and checked by hash, each
run against `EnterSaves` alone:

- **Save not associated with the form** fails at the refusal, the title's
  description never set, line 317.
- **Save as a plain click, as before 2234d66**, the same, line 317.
- **A submit that hands the draft over without the check**, the same, line 317,
  since the blank title is saved rather than refused.
- **A textarea that submits its form on Enter** fails at the one save, line 342.

Passing at the commit: `EnterSaves`; the other job modal stories as before, 10 of
14 passing, the four stories KN-494 carries failing where they expect a save; the
docs guard, 75; eslint and tsc clean; the stories file formatted. The web unit
project failed once, straight after the plants, on the two cases of
`core/api/session.test.ts`, "keeps demo authentication separate from a stored
server token" at 13.3 seconds and its live twin, with the message not kept, and
passed whole, 1382, in the two runs after it. Nothing a reader sees changed.
