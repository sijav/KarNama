# KN-690 · The Search Bar says clearing searches at once, where the call now runs after the commit and not at all for a parent that refuses the clear

medium, 1 point, web, OKR-1. A child of KN-016, filed by the whole-task round of KN-016 with KN-314,
KN-315 and KN-380.

## The card, quoted

**Why.** "A caller reads the docs to know when their handler runs. Told it runs at once on a clear,
they may clear from their own code and expect the search before the next line, or expect an empty
search their parent will never get. A sentence that overstates a mechanism is worse than none,
because the reader trusts it instead of looking."

**Exit.** "No sentence in SearchBar.tsx or in either story-docs file says clearing searches at once,
straight away or بی‌درنگ without the condition it actually carries. Each of the three sites says what
happens: the search runs after the field has committed as empty, without the pause that typing takes,
and not at all where the parent does not take the clear. The Clearing and ClearIgnored stories are
named as the two cases, in both languages."

## What is actually true, read from the code

`SearchBar.tsx`: `clear()` sets an attempt of kind `cleared`, empties its own state, calls
`onChange('')` and focuses the field. It does **not** call `onSearch`. The single effect judges that
attempt on the next commit: if `text` still equals what the field showed before the clear, the parent
did not take it and **nothing is searched**; otherwise `search.current?.(text)` runs at once, meaning
without the `DEBOUNCE_MS` pause, but from a passive effect after the commit rather than inside the
click handler.

So two things are wrong with the current sentences, and they are different faults:

1. **"At once" now means "without the pause", not "synchronously".** The call left the handler in
   KN-380. A caller who clears from their own code and reads the next line will not see it.
2. **It is conditional, and the sentences are unconditional.** A page that refuses the clear gets no
   search at all, neither for nothing nor for the text still shown. That is deliberate and the
   `ClearIgnored` story asserts it, so the docs contradict a story in the same file.

## The sites, searched rather than taken from the card

The card names three. Searching the component's folder and both story-docs files for "at once",
"straight away", "immediately" and «درنگ» found **five false sentences across four files**, and two
true ones that must not be touched.

False, all saying the clear searches at once with no condition:

- `SearchBar.tsx` line 55, the header comment: "clearing searches at once and puts focus back in the
  field."
- `story-docs/en/Shared-SearchBar.md` line 8, the opening description: "Clearing empties the field,
  searches for nothing straight away, and puts focus back in the field to type again."
- The same file's `onSearch` entry, line 58: "Fired with the text once typing pauses, and at once when
  the field is cleared."
- `story-docs/fa/Shared-SearchBar.md` lines 7 and 58, the same two, with «بی‌درنگ» carrying "at once".
- **`SearchBar.stories.tsx` line 184, which the card does not name and which I would have missed.**
  Inside the `Clearing` story: "Clearing empties the field, searches for nothing at once, takes the
  clear control away, and gives focus back to the field."

**That last one makes the file contradict itself four lines apart.** Line 188, written by KN-380,
already says the opposite and says it correctly: "Waited for rather than asserted outright, KN-380:
the search now runs from an effect, so the field commits first and the call follows." So KN-380
corrected the assertion and left the comment above it standing.

True, and deliberately left alone:

- `story-docs/en/Shared-SearchBar.md` line 5, "What is typed is reported at once", and its Persian at
  line 5, «بی‌درنگ گزارش می‌شود». These are about `onChange`, which `change()` really does call
  synchronously in the handler. The word is right there and wrong four lines later, which is the whole
  trap.
- `SearchBar.stories.tsx` line 32, "what is typed shows at once", the same claim about `onChange`.
- The older plans beside the component, `#KN-016`, `#KN-380` and `#KN-584`, which use the phrase about
  what was true when each was written. They are dated records, not present-tense claims, which is the
  line KN-685's review drew for the e2e spec and the archived roast.

## The approach

**Correct the sentences; add no story and change no behaviour.** The stories the exit names already
exist and already assert both cases: `Clearing` presses the control and waits for the call,
`ClearIgnored` hands the bar a page that refuses the clear and finds nothing searched. This card is
about the prose being true, so the work is prose.

**The component comment is trimmed rather than expanded.** `AGENTS.md` keeps documentation prose out
of `.ts` and `.tsx`, and KN-016's first roast already had a finding dismissed on the ground that this
comment "gives the reason for a constant and the order of calls, which is the code explaining
itself". So the fix there is to say what the code does, in the code's own terms, and leave what a
caller meets to the markdown: the clear empties, focuses, and leaves the search to the effect. It
must not grow into a second copy of the documentation.

**The markdown says the condition, in both languages, and names the two stories.** Where the
description explains the clear, it says the search runs without the pause once the field shows empty,
and that a page which does not take the clear is not searched at all, pointing at `Clearing` and
`ClearIgnored` as the two cases. The `onSearch` entry says the same in one sentence.

**The Persian is a translation of the corrected English, not a paraphrase**, and «بی‌درنگ» goes
wherever it stood alone as the whole claim.

## File by file

- `apps/web/src/shared/search-bar/SearchBar.tsx` — the header comment only. No code changes.
- `apps/web/src/shared/story-docs/en/Shared-SearchBar.md` — the opening description and the `onSearch`
  entry.
- `apps/web/src/shared/story-docs/fa/Shared-SearchBar.md` — the same two.
- `apps/web/src/shared/search-bar/SearchBar.stories.tsx` — **the comment at line 184 only**, which the
  exit does not name. Correcting three sites and leaving a fourth to contradict them is the defect
  this card exists to prevent, and this one contradicts a correct comment in its own file. The play
  itself is untouched.
- This plan.
- **Not changed:** any behaviour, any assertion, the `Clearing` or `ClearIgnored` entries under
  `## Stories`, which are already accurate, and the two true `onChange` sentences above.

## What I expect to be hard, and what I am unsure about

- **Saying it without writing a paragraph.** The true statement has three clauses, after the commit,
  without the pause, and not at all if the page refuses, and the entry it replaces is one line. The
  risk is trading an overstatement for something so hedged nobody reads it, which is its own way of
  failing the why.
- **Where the line falls between the comment and the markdown.** I am trimming the comment on
  `AGENTS.md`'s rule and on the KN-016 round's own reasoning. If the reviewer reads the comment as
  code explanation that should keep its account of call order, I would rather hear it now.
- **Whether the Persian needs the same three clauses or reads better split.** Persian prose here runs
  longer than the English, and the opening description is already a dense paragraph.
- The exit says the two stories are "named as the two cases". I read that as naming them in the prose
  that explains the clear, not as a new `## Stories` entry, since both already have one.

## The review approved it, and settled the wording

Round one approved the plan as matching the implementation and meeting the exit condition, and
confirmed from React's own contract that an effect runs after React has updated the screen, so "after
the field shows empty" is the accurate phrase and "at once" is not. Three things it settled:

- **Trimming the component header is right**, and it should stay a code-level summary. The effect's
  own comments already explain why `clear()` does not call `onSearch`, and repeating caller-facing
  timing there would break the markdown-docs rule.
- **The sentence**, for both the description and the `onSearch` entry: "Clearing searches for empty
  only after the field shows empty, without the typing pause; if the page keeps the previous text, it
  does not search. See `Clearing` and `ClearIgnored`." It carries all three clauses, names both
  stories as the accepted and the refused case, and implies no synchronous call.
- **The Persian translates those conditions** rather than keeping «بی‌درنگ» as a claim standing alone.

It also searched independently, across the active code, the story docs, the composition sites and the
current stories, and found the five false live sentences to be exactly the ones listed above, with the
two `onChange` statements and the dated plan records legitimate. So there is no sixth site.

## How I will know it worked

- **The story-docs guard**, `guard.test.ts`, which checks that both languages carry the same prop and
  story keys and that every file parses in the story-docs format. It is STRUCTURAL and cannot check a
  sentence, so it is a floor and not the proof, which `AGENTS.md` section 7 records after KN-679 and
  KN-680 both got that wrong.
- **The proof is reading**: the Docs page opened in both languages, description, Controls table and
  the two story headings, which is the only thing that checks prose.
- The unit project, read from its summary line and refused on "skipped" or a zero total, since the
  guards live there and read every story file.
- `tsc --noEmit` and `eslint --max-warnings 0` from `apps/web`, each read from its own output line.
- Prettier drift at 0 on all four files, which is what `markdown` formatting is checked by here.

## What I am asking the review

1. Is trimming the component comment right, or does the code lose an explanation it should keep?
2. Does the corrected wording state all three clauses without becoming something nobody reads?
3. The exit asks the two stories be "named as the two cases". Is naming them in the description the
   right reading, given both already have `## Stories` entries?
4. I searched rather than trusting the card, and found a fourth file it does not name: the `Clearing`
   story's own comment, contradicting a correct comment four lines below it. I am fixing it, which
   goes beyond the exit's wording. Is that right, or does a card's exit define its edges? And is
   leaving the phrase in the three older plans beside the component the right call, on the ground that
   a dated plan records what was true when it was written?
