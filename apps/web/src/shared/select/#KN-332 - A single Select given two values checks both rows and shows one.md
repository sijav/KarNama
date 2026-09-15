# KN-332 - A single Select given two values checks both rows and shows one

## The card

A child of KN-012, found by its roast.

**Why.** A caller's stale or merged value makes the list contradict the field, and a single
select must never show two choices.

**Exit.** A single Select reads only the first value everywhere, its field and its checks, and a
story gives it two and sees one checked.

## Read before planning, 2026-09-15

- **The code.** `Select.tsx` hands MUI the whole list when `multiple` is set and `value[0] ?? ''`
  otherwise. MUI's `SelectInput`, read in `node_modules`, marks a row `aria-selected`, and so
  gives it the Selected fill, when the row's value equals that single value, and `renderValue`
  receives the same single value, so the field and the fill already read the first entry alone.
  The check does not: each row's `OptionLabel` is given `chosen={value.includes(option.value)}`,
  the whole list. A single select given `full-time` and `remote` shows full-time's name, fills
  full-time's row, and checks both rows.
- **The callers.** No caller hands a single select more than one value today: `JobLevelSelect`
  passes `[value]` or `[]`, the contact modal `[shown.jobId]` or `[]`, and Settings `[locale]`;
  `EmploymentTypeSelect` is multiple.
- **The type.** `value` is `readonly string[]` whether or not the select is multiple, so nothing
  refuses a longer list for a single select, and the exit asks that it be read, not refused.

## The approach

1. **The story first.** `TwoValuesWithoutMultiple` gives the meta's single select `full-time` and
   `remote`, in fa-IR with the scheme left free. Its play reads the field showing full-time's name
   alone, not the two names listed; opens the list; and reads that the listbox is not
   multiselectable, that one row is `aria-selected`, full-time's, and that one row draws the
   check, the same row. Escape closes it. Its Controls are off: its play needs both values and a
   single select, and a control that changed either would draw what the play does not describe.
2. **Before the fix**, the Select stories run against the component as it is, and the new story
   must fail alone, at the rows that draw the check, two of them.
3. **The fix.** `Select.tsx` names what the select holds once, `held`: the list when `multiple`,
   and its first entry alone otherwise. MUI's value is taken from `held`, and each row's check
   reads `held.includes(option.value)`. The field, the fill and the check then read one list.
4. **The words.** Both story docs: the `value` entry says a select that is not multiple reads only
   the first value, in its field and in its list, and the new story gets its entry. DESIGN.md's
   "More than one" says so in a sentence, KN-332.

## File by file

- `apps/web/src/shared/select/Select.stories.tsx`
- `apps/web/src/shared/select/Select.tsx`
- `apps/web/src/shared/story-docs/en/Shared-Select.md` and `fa/Shared-Select.md`
- `DESIGN.md`

## What I expect to be hard, and what I am unsure of

- **Which row draws a check.** The specimen's options lead with nothing, so a row's only svg is
  its check; the play counts the rows holding an svg and says why, rather than naming an icon.
- **Reading, not refusing.** The exit asks a single select to read the first value. A caller's
  longer list is taken and its tail left unread, with no warning; refusing it by type would be a
  second change to every caller's props, which the card does not ask for.
- **A choice replaces the list.** MUI hands a single select's change back as one string, which
  the Select sends as a list of one, so choosing drops the unread tail. That is unchanged, and
  the story does not choose.

## How I will know it works

- The new story fails alone against the component as it is, at the rows that draw the check, and
  passes after the fix with the other nine Select stories.
- The unit project, the docs guard among it, lint and tsc are clean.
- Seen with the list open, one check each time: the new story in fa-IR light and dark, and the
  InEnglish story in en-US light given two values, remote first.

## Plan review, 2026-09-15, Codex gpt-5.6-terra

It read the installed MUI the same way. Handed `value[0]`, the single Select's display,
`aria-selected`, the row focused on opening, type-ahead while closed, its hidden input and its
change all follow the first value. An empty list selects nothing, and a first value that no option
has selects no row, with MUI's out-of-range warning in development; neither shows the second
value. It called `held`, taken once and passed to both, the smallest honest change, and the count
of rows holding an svg a sound read of the check where the options lead with nothing, keeping the
`aria-selected` read, naming the chosen row and reading the listbox as not multiselectable.

Judged:

1. **Turn the new story's Controls off: taken**, in step 1. A Controls change runs no play,
   AGENTS.md section 7, but Remount runs it against the args a control set, and this play needs
   both values and a single select.
2. **Take `held` once and use it for both: already the plan**, step 3.

## Result, 2026-09-15

Built as planned after the review.

- Against the component as it was, the new story failed alone, at its read of the rows holding an
  svg: two of them, full-time's and remote's, where one was expected.
- After the fix the Select stories pass, ten of ten, and the unit project, the docs guard among it,
  lint and tsc are clean.
- Seen with the list open: the new story in fa-IR light and dark, and InEnglish in en-US light
  handed remote then full-time, each field showing the first value and one row selected and
  checked, with no console error or warning. The URL's args did not reach the list, measured, the
  English field keeping Full-time, so that case was given its values through Storybook's preview,
  `onUpdateArgs`, the call a Controls change ends in.
