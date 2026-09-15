# KN-435 - Saving a rename with a blank name silently discards it

## The card

**Why.** A control that accepts a press and does nothing reads as a bug in the product, and the
pattern for refusing is already in the codebase twice.

**Exit.** A blank rename is refused with the field's own error and the modal stays open; a story
presses Save on an empty field.

## Read before planning, 2026-09-15

- **The silent close.** `JobsScreen.tsx:237`: `rename()` renames only when the trimmed name is not
  empty and closes the modal either way, so a blank Save closes with the old name kept and nothing
  said. The rename modal's one field, labelled Status, takes no error.
- **A story asserts that silence.** `BackingOut`'s KN-427 block types one space, presses Save, and
  reads the dialog gone and the name kept; both docs' entries for it say a rename saved blank keeps
  the name.
- **The pattern.** The Contact Modal refuses a missing name with the field's own error once Save
  is pressed, and the add form says «عنوان شغلی را بنویس» and «نام شرکت را بنویس»; the catalogs
  hold 'Write the full name', 'Write the job title' and 'Write the company name'.

## The approach

1. **The story first.** `BackingOut`'s blank rename presses Save on a field of one space and reads
   the dialog still open, the field marked invalid and described by «نام وضعیت را بنویس», and the
   name unchanged; then Cancel closes it. Run against today's code; it must fail on the refusal.
2. **The rename holds whether Save was tried**, `tried`, false when it opens. `rename()` on a blank
   name sets it and returns, keeping the modal open, and renames and closes otherwise.
3. **The field takes the error** 'Write the status name' while Save has been tried and the name is
   blank, as the Contact Modal does.
4. **The words.** Both catalogs carry 'Write the status name', «نام وضعیت را بنویس»; both docs'
   `BackingOut` entries say a rename saved blank is refused by the field until it is backed out of.

## What I will change

- `screens/JobsScreen.tsx`, `screens/JobsScreen.stories.tsx`
- `i18n/locales/en-US.ts`, `i18n/locales/fa-IR.ts`
- `story-docs/en/Screens-Jobs.md`, `story-docs/fa/Screens-Jobs.md`

## What I expect to be hard, and what I am unsure of

- **Typing after the refusal.** The error reads the name as it is, so it clears once the name is
  not blank, and Save then renames.
- **Enter in the field** submits the form, KN-463, so it is refused the same way as the button.
- **The guard against no rename** stays out of reach, since `rename()` runs only while a rename is
  open, as it is today.

## How I will know it works

- `BackingOut` fails against today's code on the refusal and passes after.
- The board stories, the unit project with the catalog test, lint and tsc are clean; the refused
  rename is seen in fa-IR and en-US, light and dark.

## Plan review, 2026-09-15, Codex gpt-5.6-terra

Approved. It found `tried` in the rename's state the right shape, since every way out, Cancel, the
close, Escape and the scrim, already sets the rename to nothing and the next opening starts clean;
Save and a real Enter both reach the same submit; and the Input already marks the field invalid,
describes it with the message and writes it into its live line, clearing once the name is not
blank. Its one precaution, taken: a dialog that is closing stays in the page for its 150 ms, so the
story waits for the refusal and past a close's fade, then finds the dialog again and reads the
field there, rather than reading the reference it held before pressing Save.
