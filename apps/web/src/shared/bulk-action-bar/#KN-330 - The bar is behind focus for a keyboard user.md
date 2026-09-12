# KN-330 · The bar is behind focus for a keyboard user

Beside the component, per `agent/RALPH.md` step 2b. Written before the work.
Child of KN-025, from its roast.

## The card

**Why.** The exit asks that the bar be reachable by keyboard when it appears
rather than behind the list, and selecting by keyboard is exactly when it
appears.

**Exit condition.** A keyboard user who selects a row from inside the list
reaches the bar's actions without crossing the list, by a key the bar announces,
and a story selects by keyboard from a row and reaches the bar.

## What is actually wrong

The contract KN-025 settled is that the page renders the bar BEFORE the list, so
a forward Tab from the top of the page meets it first. That helps only somebody
who is above the list. The reader who actually raises the bar is one who tabbed
INTO the list, reached a card's checkbox and pressed Space: focus is now deep in
the list, the bar mounted before it, and every forward Tab walks the rest of the
cards, dozens of them on a full board, before reaching the bar's own actions.
`ReachedBeforeTheList` tabs from the top with nothing selected, so it proves the
DOM order and nothing about this.

## The approach

Give the bar a key that jumps to it, and say so where a screen reader hears it.

- The bar already renders a visually hidden `role="status"` that announces how
  many are selected. That line is the natural place to also say the key, so the
  reader hears it at the moment the bar appears and not before.
- The key itself: the page's own shortcut, not a Tab order trick. Reordering the
  DOM cannot solve this, because the reader is in the middle of the list and any
  order puts SOMETHING between them and the bar.
- A shortcut the product can afford and a screen reader can announce plainly.
  The candidates are a bare key like `b`, which collides with typing in a field,
  and a modifier pair. This needs the plan roast's opinion: the real risk is
  choosing a combination the browser or a screen reader already owns.

What the bar does with the key: move focus to its first action. The bar is
`role="region"` with a label already, so the reader lands in a named region.

## File by file

- `src/shared/bulk-action-bar/BulkActionBar.tsx` — a key listener while the bar
  is up, focus moved to the first action, and the announcement carrying the key.
- `src/i18n/locales/{en-US,fa-IR}.ts` — the copy that names the key.
- `src/shared/bulk-action-bar/BulkActionBar.stories.tsx` — a story that tabs
  into the list, selects a row with Space, presses the key and lands on an
  action, asserting it never crossed a card.
- `src/shared/story-docs/{en,fa}/Shared-BulkActionBar.md` — the entry and the
  prop or behaviour it adds.

## What I am unsure about

- **Which key.** Most single letters are typed into fields; most modifier pairs
  are taken by the browser. This is the question for the plan roast.
- Whether the listener belongs on the document while the bar is up, or on the
  page, and what happens when two bars could ever exist (the board and the
  network page never show both, but nothing enforces that).
- Whether moving focus without the reader asking is right when the bar appears;
  I think not, because it would trap somebody mid-selection who wants to select
  a second card. The key is an offer, not a jump.

## How I will know it worked

A story tabs into the list, selects a row, presses the key, and focus is on the
bar's first action with no card focused in between; the announcement names the
key in both languages.
