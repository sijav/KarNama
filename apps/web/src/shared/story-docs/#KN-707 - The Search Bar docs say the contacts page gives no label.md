# KN-707 · The Search Bar docs say the contacts page gives no accessible label

From the parent round on KN-695 with KN-696, and the stronger of the two things that round found: this sentence is
**false**, not merely incomplete, and it lives in a shared component's documentation rather than one screen's.

## 1. The sentence, and its correct neighbour three lines below

`en/Shared-SearchBar.md`, under `### label`:

> The board's is the default, and a page that searches something else passes its own, **the contacts page did not, and its
> readers were told it searched job opportunities**, KN-430.

`en/Shared-SearchBar.md`, under `### placeholder`, three lines further down:

> Defaults to the board's, and a page that searches something else passes its own, **as the contacts page does**.

**The two entries contradict each other about the same page**, and the second one is right. The Persian mirrors both
exactly, with «این کار را نمی‌کرد» in `label` and «همان‌طور که صفحهٔ شبکهٔ ارتباطی می‌دهد» in `placeholder`.

## 2. What the page actually does, quoted rather than remembered

`NetworkScreen.tsx` lines 198 to 205:

```tsx
<SearchBar
  value={typedSearch}
  onChange={setTypedSearch}
  onSearch={searchFor}
  layout={wide ? DESKTOP : MOBILE}
  label={i18n._('Search contacts')}
  placeholder={i18n._('Search in name, role or company')}
/>
```

And two stories hold it there: `ItsOwnSearchInEnglish` expects the accessible name `Search contacts` and that placeholder,
and `ItsOwnSearch` expects the Persian pair and that the board's name is **absent**, its comment citing KN-430 as the
defect it exists to prevent returning.

So the code has been right since KN-430 and only the documentation is stale.

## 3. What it becomes

**The sentence was making a real point and that point survives.** The label defaults to the board's, so a page searching
something else must pass its own, and a page that forgets leaves a screen reader saying the wrong thing. Only the tense is
wrong: it describes the defect as present when it was fixed.

Borrow the neighbour's phrasing, and keep KN-430 as **history** rather than as a present claim:

> a page that searches something else passes its own, as the contacts page does, which it did not until KN-430, when its
> readers were told it searched job opportunities.

The Persian borrows «همان‌طور که صفحهٔ شبکهٔ ارتباطی می‌دهد» from its own `placeholder` entry rather than being translated
afresh from the English, which is the rule KN-696 established: the two languages are not translations of each other, so
one behaviour must not acquire two idioms.

## 4. Nothing will check the prose

`guard.test.ts` is twelve structural tests and, by its own file's admission, not one reads what an entry **says**. It would
pass this sentence and its exact opposite identically, which is what KN-679 exists for. So the proof is a rendered read of
the Docs page in each language, with the locale pinned in the preview URL at first load, confirming the prose block and
never the story canvas, exactly as KN-696 was proved.

## 5. Constraints

- **No em dash.** Both files hold zero today, and AGENTS.md section 4 forbids them in every `.md` and `.mdx`, with Persian
  taking the Persian comma. KN-709 carries the wider violation, 240 files of 574.
- **Drift 0** on both files, measured before and after.
- **No behaviour change**: no component, story, test or catalog is touched.

**There is no third site, searched rather than asked about.** A card's list is written by someone who looked once, so I
searched both documentation trees for any other claim that the contacts page lacks a label. There are exactly two, one per
language, and they are the ones this card names: `en/Shared-SearchBar.md` lines 46 to 47 and `fa/Shared-SearchBar.md`
lines 45 to 46. Every other hit is unrelated: the Bulk Action Bar's F6 focus, the Confirm Modal's opener, and
`Shared-SearchBar.md` line 16, which is about a page that does not show a value, the controlled bar's contract rather than
its name. The only other mentions of the contacts page are the correct `placeholder` sentence in each language and a
toolbar sizing line.

## 6. Questions for the review

1. Keep KN-430 in the sentence as history, or drop the reference and simply say what is true? The history is why the rule
   exists, which argues for keeping it, but it is also what made the sentence read as present tense.
2. Does `### label` need the contacts example at all, given `### placeholder` carries it three lines below? Dropping it
   would remove the contradiction by deletion rather than by correction.
3. The Persian `label` entry runs across two lines and its English twin now runs long. Should either be rewrapped while
   it is being edited, given Prettier leaves prose alone here and drift is measured against HEAD?
