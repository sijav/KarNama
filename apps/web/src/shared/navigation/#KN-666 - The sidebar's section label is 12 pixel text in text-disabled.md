# KN-666 - The sidebar's «فضای کار» section label is 12 pixel text in `text/disabled`, 2.54 to one

## The card

**Why.** A label most readers can barely read fails the contrast the product holds its other text
to, and this one names the space the reader is working in, on every screen behind the sign-in.

**Exit.** The sidebar's section label is drawn in a token at 4.5 to one or better against the
surface it sits on, in light and in dark, read by a story rather than only by a palette test; and
DESIGN.md records the departure from node `406:454` and the owner's decision it follows.

Found 2026-09-16 by Codex's review of KN-591's plan. A design card, not a web one.

## Measured before planning, 2026-09-16

- **The defect.** `Sidebar.tsx` line 135 records the Section Label, node `406:454`, as «فضای کار» at
  12 and Medium in `text/disabled`, and line 144 draws
  `color: theme.karnama.semantic['text/disabled']`.
- **The numbers, computed from the tokens rather than recalled.** In light, `text/disabled` `#9ca3af`
  on the sidebar's `bg/surface` `#ffffff` is **2.5388**; `text/secondary` `#6b7280` is **4.8345**.
  The card's 2.54 and KN-591's 4.83 both check out.
- **`MIN_CONTRAST` is 4.5**, and its comment says why: WCAG AA for normal text, the design being a
  reading surface.
- **The token to move to is already guarded on this surface in BOTH schemes.** `darkMode.test.ts`
  line 143 asserts `text/secondary` against `darkSemantic['bg/surface']` at `MIN_CONTRAST`, and line
  167 asserts it against the light `bg/surface`. DESIGN's own sidebar paragraph says the sidebar is
  `bg/surface`, so those are the right pairs.
- **Dark is safe by construction too, and that asymmetry is the point.** `darkMode.ts` line 309
  derives `text/secondary` through `ensureContrast(..., darkSurface)`, which walks lightness until
  the ratio clears `MIN_CONTRAST`; line 310 derives `text/disabled` with no such guarantee. So the
  colour being left is unguaranteed in dark and the colour being taken is guaranteed in both.
- **The palette test already names this card.** Its comment at line 155 leaves `text/disabled` out
  because WCAG exempts an inactive control's own label, "though one informational use of it remains,
  the sidebar's Section Label, KN-666, so that omission is provisional rather than settled".
  **Closing this card settles it, so that comment is part of the work**, not a nicety.
- **The stories.** Five: `Default`, `NetworkCurrent`, `WithoutUser`, `SwitchLanguage`, `InEnglish`.
  Four pin `colorScheme: 'light'`; `InEnglish` pins only the locale. **None pins dark.** The file
  already holds the idiom the exit wants: `computed(host, value)` at line 42 borrows the host's own
  `borderLeftColor` to read a token as the browser computes it, and `Default` compares
  `style.borderLeftColor` against it.
- **DESIGN.md** line 772 carries the sidebar paragraph naming «فضای کار» at 12 and Medium in
  `text/disabled`, and there is no Section Label entry anywhere else. The template for recording a
  departure is line 1623's KN-591 sentence, which names the file's colour, its ratio, the owner's
  decision and what the build draws instead.

## The decisions, for the review

1. **`text/secondary`, as KN-591 took for the note and the timer.** Same defect, same owner ruling of
   2026-09-16, and the token is already asserted on this very surface in both schemes. A new token
   for one label would need its own ratio argument and its own row in DESIGN's decided-token table,
   which is a lot of machinery for a label the product already has a colour for. **I lean strongly
   to secondary.**
2. **A story that pins dark, which this file has never had.** The exit asks the contrast be read in
   light AND dark, and a story proves a rendered line only where it pins the global, KN-589. So a
   new story pinning `{ locale: 'fa-IR', colorScheme: 'dark' }` is required, and a new story owes a
   docs entry in each language.
3. **Settled by the review, against my lean: the story computes and asserts the RENDERED ratio, in
   both schemes.** Token identity plus the palette test proves the chosen token and a token-level
   pair; the exit asks for the contrast "read by a story", and only a rendered reading catches a
   wrong SURFACE as well as a wrong token. It is not a second contrast implementation:
   `darkMode.ts` exports `contrast`, and four stories files — Checkbox, Filter Chip, Input and
   Tooltip — already convert a computed colour to feed it. **The trap the review names**: `contrast`
   takes hex while `getComputedStyle(...).color` returns `rgb(...)`, so passing the computed string
   straight in would compute nonsense quietly and pass. So the story reads
   `getComputedStyle(label).color` and `getComputedStyle(aside).backgroundColor`, converts both with
   a local `hexOf`, and asserts `contrast(...) >= MIN_CONTRAST`. **`hexOf` is copied from
   `Checkbox.stories.tsx`**, whose version throws on anything that is not three channels, rather
   than Tooltip's, which defaults each channel to zero: a silent default would compute the ratio
   against black and pass.

## The review's two rounds, and where they left it

**Round one settled decision three against my lean**: the story computes the RENDERED ratio in both
schemes, because token identity proves the token and misses a wrong surface entirely. It caught the
`rgb(...)` against hex trap before it was written, and pointed at the four stories files that
already convert for exactly this. It also narrowed the DESIGN wording: the decision of 2026-09-16
named the sign-in note and the resend timer, so what is recorded is the requirement that decision
established, not a choice about this label the owner never made.

**Round two approved it.** The correction was applied properly; `getByText` is the right locator
because it returns the label ELEMENT rather than the nav container, which is what the colour is read
from; the strict converter is the right one; and `text/secondary` remains the smallest sound choice
at 12 pixels Medium, where 4.5 rather than the large-text 3 is the threshold. Its one factual note,
that the checkout already held the change although the plan says nothing is built, is an artifact of
the order here: the build ran while the re-review was out, and nothing was committed until it came
back.

## The approach

1. `Sidebar.tsx` line 144 takes `text/secondary`, and line 135's comment records the departure from
   the node and why, without restating DESIGN's prose.
2. A story pinning dark and an assertion on an existing light story, each reading the label's colour.
3. Docs entries for the new story in both languages.
4. `darkMode.test.ts`'s comment at 155: the omission becomes settled, since no informational use of
   `text/disabled` is left.
5. **`DESIGN.md` line 772 records the departure, and its wording is narrower than I had it.** The
   shape is line 1623's, but it must NOT say the owner chose `text/secondary` for this label: the
   decision of 2026-09-16 named the sign-in note and the resend timer, and nothing else. What is
   recorded is that the node's `text/disabled` is departed from to meet **4.5 to one, the
   requirement that decision established**, and that `text/secondary` is the existing token which
   satisfies it on this surface in both schemes. The review caught that before it was written, and
   it is the same overclaim shape as the rest of the day: attributing to a ruling more than the
   ruling said.

## What I will change

- `apps/web/src/shared/navigation/Sidebar.tsx`, one token and one comment
- `apps/web/src/shared/navigation/Sidebar.stories.tsx`, the new story and the assertion
- `apps/web/src/shared/story-docs/en/Shared-Sidebar.md` and `fa/Shared-Sidebar.md`
- `apps/web/src/theme/darkMode.test.ts`, the comment only
- `DESIGN.md`, the sidebar paragraph
- this plan, which stays beside the work

## What I expect to be hard, and what I am unsure of

- **The label's id is generated, so it is not a selector.** Line 45 is `const workspace = useId()`,
  set as the label's `id` and as the nav's `aria-labelledby` — which does mean the nav's accessible
  name IS the label's text, so `getByRole('navigation', { name })` reaches the nav. The label
  ELEMENT, whose colour is the thing under test, is still found by its text, «فضای کار», so the
  locator is locale-bound and the dark story must pin `fa-IR` as well as the scheme.
- **The comment at `darkMode.test.ts` line 155 is prose about coverage**, which is the exact thing I
  got wrong six times today. It must say only what the test does: that `text/disabled` is left out
  because WCAG exempts an inactive control's own label, and that no informational use remains.
- **Line 135's comment must not restate DESIGN.md's prose**, which is an AGENTS rule; it records the
  departure and points at the card.
- **The likeliest mistake is asserting the TOKENS rather than the rendered elements**, or feeding
  `rgb(...)` into `contrast`. Both would pass while proving nothing, which is this whole iteration's
  recurring failure wearing a new costume: the run goes green and the thing under test was never
  touched. The control is what separates them — the assertion must be seen to fail against the
  label as it is drawn today.

## How I will know it works

- **The new assertion fails against the component as it is** — the label drawing `text/disabled` —
  and passes after. A story for a colour that was never seen to fail proves nothing.
- The Sidebar stories pass whole, the unit project passes, `tsc` and `eslint` are clean, and no
  changed file's drift grows while this plan's is 0.
- Looked at in both languages and both schemes, since the label is drawn on every screen behind the
  sign-in.
