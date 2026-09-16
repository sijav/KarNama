# KN-691 · The Search Bar docs say placeholder follows label, which the component has never done

medium, 1 point, web, OKR-1. A child of KN-016, filed by the whole-task round of KN-016 with KN-314,
KN-315 and KN-380.

## The card, quoted

**Why.** "A page that searches something else and passes only label gets a mismatched hint and no
warning, and the docs are what told them one prop was enough. This is also a case the story-docs guard
cannot catch, since every one of its twelve tests is structural and none reads what an entry says."

**Exit.** "The placeholder entry in both story-docs files says the prop defaults to the boards and is
passed by a page that searches something else, as the contacts page does, with no claim that it
follows label; and a story renders a bar given only label and asserts the placeholder is still the
boards, so the independence is pinned rather than described."

## What is true, read from the code rather than from the card

`SearchBar.tsx` line 159 draws `placeholder ?? i18n._('Search in title, company or note')` and line 160
draws `'aria-label': label ?? i18n._('Search job opportunities')`. **Two props, two defaults, no
relationship between them.** A page passing only `label` keeps the board's hint under a box announced
as searching something else.

The two callers confirm it, and they are the two halves of the claim:

- `NetworkScreen.tsx` lines 176 to 182 passes **both**, `label={i18n._('Search contacts')}` and
  `placeholder={i18n._('Search in name, role or company')}`. So "as the contacts page does" in the
  exit means _passes its own_, not _gets it from label_.
- `JobsScreen.tsx` line 369 passes **neither** and takes both defaults.

So the false sentence is not describing unfinished work. KN-430 is `done` and did the right thing in
code; its own description said "the placeholder needs the same treatment", and the docs entry reads as
though that meant a coupling. **The coupling never existed in any version**, which is worth saying in
the card's history rather than leaving the next reader to wonder whether something regressed.

The two false sentences:

- `story-docs/en/Shared-SearchBar.md`, the `placeholder` entry: "Defaults to the board's, and follows
  `label` when a page searches something else."
- `story-docs/fa/Shared-SearchBar.md`, the same: «پیش‌فرضش مالِ برد است و وقتی صفحه‌ای چیز دیگری را
  جستجو می‌کند، همراه label عوض می‌شود.»

Nothing else in the component's folder or either story-docs file claims the coupling; the `label`
entry is accurate in both languages.

## The approach

**Correct both entries, and add one story that pins the independence.** The exit asks for the story
explicitly, and it is the half that will still be true after someone edits the prose.

**The story renders TWO bars, not one**, and this is the point of the design rather than a convenience:

- Bar one is given nothing. Bar two is given only a `label`, a real localized string through the
  `useLingui()`-in-the-render idiom that `Button.stories.tsx` and `Checkbox.stories.tsx` already use,
  since a bare English literal would fail `lingui/no-unlocalized-strings`.
- It asserts their **placeholders are identical**, and their **accessible names differ**.

A story that asserted `placeholder === i18n._('Search in title, company or note')` would derive its
expectation from the same catalog the component renders from, which proves the right locale was chosen
and nothing about the words, the trap `AGENTS.md` section 7 records from KN-589's roast. Comparing the
two bars needs no catalog value at all, and **it fails on exactly the defect the docs describe**: if
the placeholder followed the label, bar two's hint would differ from bar one's and the assertion would
break.

**It goes late in the file, not first.** The first story's controls are the Docs page's, and this one
composes two instances, so it has no single component to drive: it disables the Controls panel and
says why, which is the rule for a composed story.

## File by file

- `apps/web/src/shared/search-bar/SearchBar.stories.tsx` — one new story and its small render
  component. No change to any existing story.
- `apps/web/src/shared/story-docs/en/Shared-SearchBar.md` — the `placeholder` entry, and a `###` entry
  for the new story, which the guard requires.
- `apps/web/src/shared/story-docs/fa/Shared-SearchBar.md` — the same two.
- This plan.
- **Not changed:** `SearchBar.tsx`, since the component is already correct and this card is about the
  docs lying about it; `NetworkScreen.tsx`, which already passes both; the `label` entries, which are
  accurate.

## What I expect to be hard, and what I am unsure about

- **Two bars or one.** Two makes the assertion independent of the catalog and fails on the coupling,
  but it costs the Controls panel and a story that composes instances is a shape this repository
  treats carefully. One bar asserting the exact default string is simpler and weaker.
- **Which label to pass.** Reusing the catalog's existing `Search contacts` adds no message and no
  translation, and it is what a real page passes. A new distinctive string would read more clearly in
  the story but means a catalog entry for a component story.
- **The name.** `GivenOnlyAName` reads as what it demonstrates and runs as "Given Only A Name". I am
  not attached to it.
- **Whether the exit's "asserts the placeholder is still the boards" is satisfied by comparing two
  bars** rather than by naming the board's string. I read it as asking that the placeholder be
  unchanged by passing a label, which comparison shows more strongly, but it is a reading.

## The review approved it, and strengthened the story

Two bars are the right proof: the bare one is the board-default baseline and the labelled one tests
whether adding only `label` moves that baseline. But **the story asserts three things, not two**, and
the third is the review's and matters:

1. The baseline placeholder is **non-empty**.
2. Both placeholders are **identical**.
3. Their accessible names **differ**.

Without the first, a regression that removed both placeholders would leave two empty strings that are
still identical, and the story would pass vacuously while proving nothing. That is the same shape as
an absence passing on its first poll, which `AGENTS.md` records, and I had not seen it.

**The mutation is named exactly**, so the control cannot be a weaker one that happens to fail:

```tsx
placeholder={placeholder ?? label ?? i18n._('Search in title, company or note')}
```

It keeps the bare bar's default intact and makes only the labelled bar differ, so the story must fail
for precisely the prohibited coupling rather than for a broken default.

Reusing the localized `Search contacts` is right: it is an existing translated message and the label
`NetworkScreen` actually passes, so the story shows a real caller shape rather than coupling itself to
a screen. Controls stay disabled with the usual explanation that the story compares two fixed
instances. The review also searched the active source, docs, callers, stories and surrounding prose
independently and found no live claim of the coupling beyond the two documentation entries, and said
the historical plans need not change.

## How I will know it worked

- **The mutation, which is the real proof**: make the component default `placeholder` to `label`, run
  the new story, and see it FAIL; revert, and see it pass. A story that cannot fail on the defect it
  is named for proves nothing, and this card exists because a sentence described a coupling nobody had
  checked.
- The story-docs guard, which will refuse the new story until both languages carry an entry. It is
  structural and cannot check a sentence, so it is a floor.
- The unit project, read from its summary line and refused on "skipped" or a zero total.
- `tsc --noEmit` and `eslint --max-warnings 0` from `apps/web`, each read from its own output line.
- The Docs page read in both languages, in fresh tabs with the locale pinned in the URL, since that is
  the only thing that checks prose.
- Prettier drift unchanged on every file.

## What I am asking the review

1. Two bars or one? I lean to two because it needs no catalog value and fails on the coupling, but it
   costs the Controls panel on that story.
2. Is comparing the two placeholders a fair reading of "asserts the placeholder is still the boards",
   or does the exit want the board's string named?
3. Reusing the existing `Search contacts` message for the label in a component story: right, or should
   a component story not borrow a screen's copy?
4. Is there anywhere else, in either language or in a screen, that repeats the coupling claim? I
   searched the component folder and both story-docs files and found only these two.
