# KN-696 · The contacts docs never say the search waits

From KN-695's roast. That card made **both** screens wait for typing to pause before filtering, and updated the **board**
docs in both languages. The contacts docs were left saying only what the search does and never when.

**It is a miss against KN-695's own exit**, which says "the screen docs in both languages describe the wait as something a
reader now meets" — plural, covering both screens — rather than a new requirement invented afterwards.

**And the contacts page is not an afterthought in that card**: it has its own clocked end-to-end test in
`search-waits.spec.ts`, added by KN-695, which proves the wait a reader meets there. Its documentation contradicts that
test by omission.

## 1. What each file says now

- `story-docs/en/Screens-Network.md`: _"A search narrows the page by name, role, company, email or number."_
- `story-docs/fa/Screens-Network.md`: «جستجو صفحه را با نام، سمت، شرکت، ایمیل یا شماره محدود می‌کند.»

Both say WHAT and never WHEN.

## 2. The board's terms, which the exit says to match

- `story-docs/en/Screens-Jobs.md`: _"…and so does the search, once typing pauses for a moment. The field shows every key
  as it is typed; the cards narrow after the pause."_
- `story-docs/fa/Screens-Jobs.md`: «و جستجو هم، وقتی نوشتن لحظه‌ای مکث کند. فیلد هر کلید را همان‌طور که زده می‌شود نشان
  می‌دهد؛ کارت‌ها پس از آن مکث محدود می‌شوند.»

**The Persian is not a translation of the English**, it is its own sentence. So the contacts Persian borrows THOSE
phrases rather than being translated afresh from the English, or the two screens would describe one behaviour in two
different Persian idioms, which is the inconsistency this card exists to remove.

## 3. What each becomes

- **English**: the existing sentence gains _", once typing pauses for a moment. The field shows every key as it is typed;
  the cards narrow after the pause."_
- **Persian**: the existing sentence gains «، وقتی نوشتن لحظه‌ای مکث کند. فیلد هر کلید را همان‌طور که زده می‌شود نشان
  می‌دهد؛ کارت‌ها پس از آن مکث محدود می‌شوند.»

"The cards" is right on this page as well as the board: the contacts page draws contact cards, and the first clause
already says the search narrows the page, so the second says which part of it moves.

**Nothing else changes.** No behaviour, no component, no story. This is two sentences in two files.

## 4. Nothing will check the prose, and that is the point

`guard.test.ts` holds twelve tests and **every one of them is structural**: files found, titles unique, an entry per story
in both languages, documented props matching `react-docgen`, non-empty descriptions, the format parsing. By its own file's
admission not one of them reads what an entry SAYS, and it would pass a sentence and its exact opposite identically. That
is why KN-679 exists, for a closing evidence that cited this guard as proof a docs claim was right.

So the check here is **reading the rendered page**, which is what the exit asks for.

## 5. The proof

The exit: both files say the search narrows once typing pauses and that the field shows every key meanwhile, in the same
terms the board docs use, **confirmed by reading the Docs page in each language**.

**A fresh tab per language, with the locale pinned in the URL.** A story's globals seed at the preview iframe's FIRST
load: navigating an already-booted iframe to a URL whose globals differ changes nothing, so the second language read in
the same tab would show the first language's page and prove nothing. This is recorded from KN-565.

**And the read must reach the sentence.** `get_page_text` stops at `max_chars` and says so, and a truncated read is not a
read — I will confirm the sentence itself was in the output for each language, not merely that the page loaded.

**THE STORY CANVAS IS NOT PROOF OF THE PAGE'S LANGUAGE**, which the review added and which would have caught me out. The
Docs page reads Storybook's `userGlobals` rather than story globals, and **the primary Network story pins Persian**, so a
Docs page rendered in English still shows a Persian canvas. So the locale goes in the Docs URL as `globals=locale:en-US`
and `globals=locale:fa-IR`, in separate fresh tabs, and what is confirmed is the PROSE BLOCK holding the sentence, never
the canvas beneath it.

**The review names this, not the edit, as the most failure-prone step of the card**: a reused or wrongly addressed Docs
frame can keep Persian because of that story setup.

**Drift stays 0** on both markdown files, measured before and after.

## 6. What the review settled

**Approved, with one correction: ONLY the two `Screens-Network.md` files change.** The Jobs docs are already correct and
stay untouched; I had listed them as context and they must not appear in the diff.

**Confirmed rather than changed**: appending the timing to the existing introduction reads best in both languages, and the
English is natural as written; the borrowed Persian phrasing sits naturally after the sentence it joins and is the right
choice, because it preserves the established Persian terminology rather than inventing a second idiom for one behaviour;
and "the cards narrow after the pause" stays, because this page renders contact cards, so it is accurate and it satisfies
the exit's demand for the board's terms, where "people" or "page" would be less consistent.

**No other Network documentation needs it**, which confirms the search I ran rather than asking: `Working`,
`SelectingWhileSearching` and `ItsOwnSearch` describe scenarios, selection semantics and the field's accessible naming,
not filtering timing, and the shared Search Bar docs already document the debounce itself. **No separate finding.**

**Nothing else is needed**: no behaviour, test, component, catalog or library change. Two prose edits and two rendered
reads.
