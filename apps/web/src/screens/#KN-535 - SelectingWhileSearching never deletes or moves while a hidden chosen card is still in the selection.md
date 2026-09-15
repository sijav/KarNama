# KN-535 - SelectingWhileSearching never deletes or moves while a hidden chosen card is still in the selection

## The card

**Why.** The delete and the status change are the two things the bulk bar does to records a reader
may not see, and KN-431 was filed because the same mistake had already lost data once.

**Exit.** A story chooses a card, searches it out of view, chooses a shown card and deletes it, then
does the same with a status change; the hidden cards are neither deleted nor moved; and with the
bar's delete, then its status change, put back on `selected`, the story fails each time.

A child of KN-431, from its roast.

## Measured before planning, 2026-09-16

- **The code is right today.** In `JobsScreen.tsx`, `held` is the selection within `shown`, what the
  search shows across every column, line 180. The bar counts `held`, line 521, deletes it after
  `remember(held)`, lines 526 and 527, moves it, line 530, and its select all sets the selection to
  `shown`, line 534. A confirmed delete or move clears the whole selection, in `remove` and `move`.
- **Nothing proves it stays so.** `SelectingWhileSearching`, run alone in the storybook project,
  passed three times: as committed, with the bar's delete planted back on `selected`, and with its
  status change planted back on `selected`, each file put back and its hash checked after. Its
  select all replaces the selection with the two shown ids before it deletes, so `held` and
  `selected` are the same set there, and it changes no status under a search.
- **The seeded board.** `seeded()` gives the first five fixture job opportunities a status each in
  the board's order: the first saved, the second applied, the third interview, the fourth offer and
  the fifth rejected, which opens collapsed. «آسمان» is in the companies of the second and the
  fourth alone, so searching for it hides the first, the third and the fifth.
- **How the stories drive the bar.** A card's checkbox is folded away until focus is inside the
  card, so a story focuses it and clicks it; the bar is the region «کارهای گروهی»; «حذف» asks in a
  dialog, and «تغییر وضعیت» opens the Change Status dialog, whose radios are named by status and
  whose «تأیید» confirms, as `Working` does.

## The approach

1. **A new story, `ActingWhileSearching`**, after `SelectingWhileSearching`, in Persian on the
   seeded desktop board. It never presses select all, which would replace the selection and hide
   the difference between `held` and `selected`.
   - It chooses the first card, searches «آسمان» so the first is hidden, chooses the second, and the
     bar counts one; it deletes and confirms; with the search cleared, the first is still in the
     saved column and the second is gone.
   - The delete cleared the whole selection, so once the search is cleared and the first card is
     found in the saved column again, it chooses the first again, searches, chooses the fourth, and
     the bar counts one; it changes the status to interview and confirms; with the search cleared,
     the fourth is in the interview column, and the first is still in the saved column and not in
     interview.
2. **Proved by the plants the card names.** The story passes on today's code, then fails with the
   bar's delete on `selected`, where the first card is gone, and again with its status change on
   `selected`, where the first is in interview, each plant alone, the file put back and its hash
   checked.
3. **The docs**: both `Screens-Jobs.md` pages gain the story's entry.
4. **A look**, AGENTS.md section 5: the Screens/Jobs Docs page read in fa-IR and in en-US, the new
   entry's heading and prose following the Language toolbar; and the story in the dev Storybook in
   light and in dark, its Persian pinned as its neighbours pin it.

## What I will change

- `apps/web/src/screens/JobsScreen.stories.tsx`
- `apps/web/src/shared/story-docs/en/Screens-Jobs.md`, `apps/web/src/shared/story-docs/fa/Screens-Jobs.md`

No product code: `JobsScreen.tsx` already does what the card asks, and the story is what keeps it so.

## What I expect to be hard, and what I am unsure of

- **A story of its own, rather than more steps in `SelectingWhileSearching`.** That story proves
  select all takes what the search found; this one proves the bar leaves a hidden choice alone. Both
  in one play would be long, and a failure would say less about which broke.
- **The story passes before it proves anything.** The code is already right, so the failure that
  usually comes first comes from the plants instead, which is what the exit asks for.
- **Interview as the target.** It is neither the first card's column nor the fourth's, so a move of
  either shows.
- **Timing.** The confirmation and the Change Status dialog dissolve over 150 ms; the story waits
  for each dialog to leave before it clears the search, as `SelectingWhileSearching` does, and waits
  for the first card to be back before it chooses it a second time.

## How I will know it works

- `ActingWhileSearching` passes, with the Jobs screen's other stories, `SelectingWhileSearching`,
  `Selecting` and `Working` among them.
- Each plant fails it at the step it aims at, and `JobsScreen.tsx` is put back by its hash.
- tsc, lint and the unit project with the docs guard pass; no changed file's Prettier drift grows,
  and this plan's is 0.
- The Docs page shows the entry in both languages, and the story's board after its play reads the
  same in light and in dark.

## Plan review, 2026-09-16, Codex gpt-5.6-terra

Sound, and it meets the exit condition, with one correction taken above. A story of its own isolates
the case better than more steps in `SelectingWhileSearching`: it keeps a hidden id selected, acts
only through the bulk bar, and proves both actions leave that record alone. Both plants are honest:
the delete on `selected` removes the hidden first card and the status change moves it to interview,
each failing at the assertion it aims at. A phone shares `shown`, `held` and the bar's handlers with
the desktop, and a card's own menu acts on its named card rather than the selection, so neither is
a path this card must cover. The correction: the Docs page read in both languages and the looks
AGENTS.md asks for, step 4, since the task changes a story and its documentation. Its caution, to
clear the search and wait for the first card before choosing it again, is in step 1 and the timing
note. The amended plan goes back to it before building.

## Second plan review, 2026-09-16, Codex gpt-5.6-terra

Approved as amended. The story resets its state between the two actions, waits for the hidden card
to come back before choosing it again, and proves the two paths of the bar apart from each other,
with the plants still failing exactly where they are claimed to. The Docs reads and the dev
Storybook look cover the repository's completion rules proportionately for a change of a story and
its documentation, and no phone, collapsed column or card menu scenario is needed, since none of
them is another bulk selection path.

## Built, 2026-09-16

- **The story.** `ActingWhileSearching`, in Persian on the seeded desktop board, pressing select all
  nowhere: it chooses the first card, searches «آسمان» so the first is out of view, chooses the
  second, and the bar counts one; it deletes and confirms; with the search cleared the first is back
  in the saved column and the second is gone. Then it chooses the first again, searches, chooses the
  fourth, changes the status to interview and confirms; with the search cleared the fourth is in
  interview, and the first is in the saved column and not in interview.
- **The plants prove it.** Run alone, the story passes as committed; with the bar's delete on
  `selected` it fails at the wait for the first card in the saved column,
  `JobsScreen.stories.tsx` line 940, that card's title nowhere on the board; and with its status
  change on `selected` it fails at the same card's column read after the move, line 960.
  `JobsScreen.tsx` was put back after each run and its hash checked.
- **The docs**: both `Screens-Jobs.md` pages gain the entry.
- **Checks.** The story passes alone, 1 with 25 skipped; tsc and lint pass; the unit project passed
  1522 of 1524, its two failures `session.test.ts` under load, KN-551, with the timeout and the spy
  counted twice that the card now records, and the file passed alone, 2 of 2. No drift grew: the
  stories file 4 as before, both docs pages 0, and this plan 0.
- **The look**, in the dev Storybook. The Docs page draws the entry's heading and its own prose in
  fa-IR and in en-US. The story's board after its play, in light and in dark: `html` computes the
  scheme, no dialog is left open, the first card is in «ذخیره‌شده» and not in «مصاحبه», and the
  second is nowhere; «مصاحبه» holds the third and the fourth, «درخواست‌شده» and «پیشنهاد کار» are
  empty, and «رد شده» stays collapsed with its one. No page or console errors.
