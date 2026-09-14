# KN-532 · The network page's bulk delete also deletes the people a search hides

**Why, from the board.** Losing people who were never on screen is the worst
thing the network page can do, and it is the defect KN-422 and KN-431 already
found on the board.

**Exit condition, from the board.** The network page's bulk bar counts and
deletes only the selected people the search shows, and a story selects one
person, searches them out of view, selects another, deletes, and finds the first
still there once the search is cleared.

## What the network page does today, read 2026-09-14

- `NetworkScreen.tsx` line 90: `shown` is the people the search matches, through
  `contactMatches`, which reads the name, role, company, email and phone.
- Its Bulk Action Bar counts `selected`, line 205, and deletes `selected`, line
  211: the whole selection, whether the search shows it or not.
- `onSelecting` reports `selected.length > 0`, line 84, so a search that hides
  every chosen person still tells the shell the page is selecting.
- A person's own delete, from their card or their modal, deletes that one
  person, and `remove` then clears the selection whole.

So a reader who chooses a person, searches them out of view, chooses another and
presses the bar's delete loses both. The bar offers no select all for people, so
KN-431's other half does not arise here.

## The approach

1. **`chosen`**: the selection within the ids of `shown`, the network's
   counterpart of the board's `held` after KN-431. It is named apart from
   `held`, which this file already uses for a contact entry.
2. **The bar counts `chosen` and deletes `chosen`.** A chosen person the search
   hides stays chosen, is never counted or deleted while hidden, and counts
   again once the search shows them. Deleting still clears the selection whole.
   Each checkbox's state stays on `selected`.
3. **`onSelecting` reports `chosen.length > 0`**, so a search that hides every
   chosen person gives a phone's foot back to the tab bar, as the board does.
   `shown` and `chosen` move above the layout effect that reads them.

## The story

**`SelectingWhileSearching`**, in `NetworkScreen.stories.tsx`, in Persian, on
the seeded page of three fixture people. «رضایی» is in the third's name, «علی
رضایی», and in nothing the first two hold. The story:

- chooses the first person by their checkbox, and the bar counts one;
- searches «رضایی»: the first person is hidden, and the bar has gone, since
  nobody chosen is shown;
- chooses «علی رضایی», and the bar counts one;
- deletes and confirms: «علی رضایی» is gone;
- clears the search: the first and the second person are still there.

**Today's code must fail it first**: written and run before the fix, it should
fail where the bar ought to have gone, since today the bar still counts the
hidden first person.

## Proof that the story can fail, after the fix

Two plants, one at a time: the bar counting `selected` again must fail where the
bar ought to have gone; the bar deleting `selected` again, with its count still
right, must fail where the first person should still be there once the search is
cleared.

## Files

- `apps/web/src/screens/NetworkScreen.tsx`: `chosen`, the bar's count and
  delete, `onSelecting`.
- `apps/web/src/screens/NetworkScreen.stories.tsx`: the story.
- `apps/web/src/shared/story-docs/en/Screens-Network.md` and
  `apps/web/src/shared/story-docs/fa/Screens-Network.md`: its entry.

## What I am unsure of

- **`onSelecting` is not proved by the story**, which renders the page without
  the shell. What a phone does while a search hides every chosen person rests on
  the same derivation, and a phone cannot select a person at all until KN-533.
- **The search reads email and phone**, which are Latin: «رضایی» cannot match
  them, and the fixture's names, roles and companies were checked.

## How I will know it worked

The story fails on today's code and passes after the fix; each plant fails it
where it aims; the network page's other stories, `Keeping`, `Editing`,
`LettingGoOfASelection` and `FocusAfterDeletingFromTheModal`, still pass; the
same search, select and delete in the running app keeps the hidden person, in
Persian and English; lint, tsc and the unit project's docs guard pass.

## Plan review, Codex, 2026-09-14

Codex, with web search, approved the plan unchanged. `chosen`, the selection
within what the search shows, is the smallest correct fix and matches KN-431's
`held`: only the bar's count and delete and `onSelecting` go through it, while
`selected` keeps each checkbox's state and a confirmed deletion still clears the
whole selection; a card's or its modal's own delete stays a deletion of one. It
found that the story fails today where the bar ought to have gone, that each
plant fails where it aims, and that «رضایی» matches only the third seeded person
in every field the search reads. The one gap it named is the one this plan names:
the story does not observe `onSelecting`, so the close claims only that it
follows the same derivation, not that a story proves it.
