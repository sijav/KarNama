# KN-668 - The code step's mock notice draws `text/secondary` on `bg/surface-secondary`, 4.39 to one

## The card

**Why.** The notice is the one line on the sign-in card that tells the reader the truth about the
mocked provider, and it is the least readable thing on the card. It also shows the shape of the
remaining gap: a palette guard proves a token against one surface, and the product puts tokens on
several.

**Exit.** The notice's text clears 4.5 to one against the surface it is actually drawn on, in light
and in dark, read by a story; and the guard is extended from a list of tokens to a list of real
foreground and background PAIRS, or a card exists saying why it is not.

KN-591's last open child. A child of KN-477 by the board's one-level rule.

## Measured before planning, 2026-09-16

- **The notice.** `AuthScreen.tsx` lines 228 to 242: a `Box` with `role="status"`,
  `backgroundColor: bg/surface-secondary` and `color: text/secondary`, holding
  «هنوز پیامکی واقعاً ارسال نمی‌شود. کدت این است:» and the code.
- **The ratios, computed from the tokens rather than taken from the card.** `text/secondary`
  `#6b7280` is **4.3929** on `bg/surface-secondary` `#f3f4f6`, **4.5101** on `bg/page` `#f6f7f9`,
  and **4.8345** on `bg/surface` `#ffffff`. So the card's 4.39 is right, and `bg/surface-secondary`
  is the ONLY surface where this token falls short.
- **The notice is not the only site, and this is the finding that changes the card.** Searching the
  product for `bg/surface-secondary` gives nineteen uses. Eight set a background and a text colour
  in one `sx`; of those, **two are icons** — the job modal's open-link box, line 317, and its
  download button, line 521 — which fall under WCAG 1.4.11 at 3 to one rather than 1.4.3 at 4.5.
  **Six are real text at 4.3929**:
  - `AuthScreen.tsx` 238/239, the notice, this card's subject
  - `JobModal.tsx` 344/345, the skill chips, `<Box component="li">{skill}</Box>`
  - `JobModal.tsx` 547/550, the drop zone, «Drop a file here» at Body size
  - `KanbanColumn.tsx` 153, `EmptyColumn`'s message, inside the column's `frame` at 127
  - `KanbanColumn.tsx` 234 and 263, the column header's title and count, inside that same frame
- **A seventh site was checked and is NOT one of them, which is worth stating because the count is
  the claim.** `KanbanColumn.tsx` line 384 draws `text/secondary` too, but it belongs to
  `AddColumn`, a separate dashed tile with its own `border/default` and **no background declaration
  at all** — so it sits on the board's `bg/page`, where the token is 4.5101 and clears the bar. It
  was excluded by reading it, not by assuming. **It clears by 0.0101**, so it is the site the walk
  helps most in proportion, rising to 4.6485, and the first to fail if `bg/page` is ever darkened.
- **Why nothing caught them.** `darkMode.test.ts` asserts each token against `bg/surface` alone. Its
  own comment says so and names this card. A token is not readable or unreadable; a PAIR is.
- **The product's whole colour surface is small enough to enumerate**: six tokens used as text,
  seven as backgrounds, across 43 and 19 declaration sites.

## The decisions, for the review

1. ~~**Six sites, or one token?**~~ **Settled by the review, and it leaves this card.** The walk is
   the right technical shape — one edit fixes all six and stops the pairing being reintroduced — but
   it is **not** the `border/control` precedent, and that distinction is the review's, not mine:
   that card ADDED a named role the owner decided, while this CHANGES a value the Figma file defines
   and DESIGN's semantic table records, across 43 text sites, against the standing rule that it
   should look like the figma. So it needs an owner or Figma decision before `#69707d` is valid, and
   it is **KN-683**, filed. This card therefore fixes its own notice and nothing else.
2. **NEW, created by that verdict: how does the notice clear 4.5 without touching the token?** The
   review assumed the walk and so did not answer this. `text/primary` on `bg/surface-secondary` is
   16.1195, but the sentence is secondary-emphasis by design and the code beside it is already
   primary at heading size, so that flattens a deliberate hierarchy. Moving the notice to
   `bg/surface` gives 4.8345 but costs the panel its distinctness from the card it sits on. **The
   re-review's call.**
3. **What the token change disturbs**, which is now KN-683's to weigh rather than this card's.
   `text/secondary` has 43 text sites, and `darkMode.ts`
   derives the dark palette FROM the light token — `deriveDark`, then `ensureContrast` against the
   dark surface — so dark shifts too. The palette test asserts dark ≥ `MIN_CONTRAST`, so it should
   hold, but that must be run rather than assumed. KN-666's sidebar label moves 4.8345 → 4.9829.
4. **The guard, the exit's second half — settled: no scanner, and the card is the right answer.**
   My instinct was that this repository reads the repository, as `catalog.test.ts` scans for ids and
   `guard.test.ts` defers to Storybook's indexer. The review showed why that does not transfer:
   MUI's `sx` takes theme callbacks, nested selectors, responsive values and theme or global
   overrides, so what a declaration renders as is not decidable from its source; and CSS `color`
   INHERITS while `background-color` does not, so a pair is an element's colour against its nearest
   painted ancestor, which no static pass can follow through a React tree. It would invent pairs and
   miss pairs, and be trusted anyway. **KN-684**, filed, records that and what to do instead.

## The review's two rounds, and where they left it

**Round one took the token walk out of this card.** The walk is the right technical shape, but it
changes a Figma-defined value rather than adding an owner-decided role, so it is KN-683's and the
owner's. It also ruled out the `sx` scanner outright, making KN-684 the exit's correct second half
rather than a weaker compromise, and told me to drop the claim that an unbuilt pair guard would fail
first — proof of work that is not being done.

**Round two answered the question round one left, with a third option I had not seen: `bg/page`.**
It keeps `text/secondary`, keeps the panel visibly distinct from the white card, changes no
Figma-defined token, and gives the already-measured 4.5101. Its ground is checkable and matches what
I found searching DESIGN.md: the design contract specifies the card surface and the code row, but
there is no paragraph specifying this notice's fill, because the notice is the build's own, existing
only while the provider is mocked, KN-459. `bg/surface` would also clear but costs the panel its
distinctness; `text/primary` would clear by far more but flattens a hierarchy the card means to
have.

## The approach

1. **The notice's own text clears 4.5 without touching the global token**, whichever way decision 2
   above is answered.
2. A story reads the notice's RENDERED pair, light AND dark, with the `hexOf` and `contrast` idiom
   KN-666 established. **The dark assertion stays even though dark is safe today by construction** —
   `darkMode.ts` derives `text/secondary` through `ensureContrast` against the LIGHTEST dark surface
   and the dark surfaces are ordered darker than it, so a light foreground has at least as much
   contrast on each. That is a present-day inference, and the review is right that future
   surface-ordering or styling could invalidate it, which is exactly what a rendered assertion is
   for.
3. **KN-684 is the exit's second half**, already filed: the guard stays a token list and records why
   a source scan cannot replace it.
4. **KN-683 carries the other five sites and the token question to the owner**, already filed, so
   this card neither fixes them quietly nor pretends they are not there.

## What I will change

- `apps/web/src/screens/AuthScreen.tsx`, the notice's own colours
- `apps/web/src/screens/AuthScreen.stories.tsx`, the story that reads the rendered pair
- `apps/web/src/shared/story-docs/en/Screens-SignIn.md` and `fa/Screens-SignIn.md`, if a new story
  is added. The names were read rather than recalled: the meta's title is `Screens/SignIn`, not the
  `App/SignIn` I had been carrying, and a wrong path guess has cost a round twice today
- ~~`DESIGN.md`~~ — **checked, and NOT changed.** The design file mentions this notice exactly once,
  at line 1667, and only to say that it puts the code on the screen; it specifies no fill and no
  colour for it, so there is nothing to record a departure FROM, and inventing a departure record
  would be a claim about the design file that is not true. Verified by searching DESIGN.md rather
  than taken from the review, which is what KN-663 cost a card for earlier today
- this plan

**No longer in scope, and that is the point:** `tokens.ts` is untouched, because walking the token
is KN-683's and the owner's; `darkMode.test.ts`'s guard is untouched, because KN-684 records why it
stays a token list.

## What I expect to be hard, and what I am unsure of

- **`bg/page` is a subtler panel against the white card than `bg/surface-secondary` was**, and that
  is this card's real risk. The repair is as much a visual judgement as a numeric one, so it is
  looked at in all four locale and scheme combinations rather than trusted to a ratio.
- **The likeliest implementation mistake is reading the wrong pair.** The code beside the sentence
  is `text/primary` at heading size — a different and much stronger pair. The failing one is the
  status container's own inherited `text/secondary` against its own background, so the story reads
  the container itself, `getByRole('status')`, and that element's computed `backgroundColor`.
- **`bg/page` at 4.5101 clears by 0.0101**, and that is the entire margin this repair buys. Nothing
  in the palette guard watches this pair — KN-684 records why it cannot — so the rendered story IS
  the guard here, and KN-683's walk, which would raise it to 4.6485, is still worth having.

## How I will know it works

- **The notice's story fails against the tokens as they are** and passes after, the same control
  KN-666 used, read from the summary line and refusing any run that skipped or ran none.
- ~~The extended guard fails on the pairs as they are today.~~ Dropped on the review's instruction:
  the chosen outcome is KN-684's card, so there is no extended guard to fail, and claiming one would
  be proof of work that is not being done.
- The unit and storybook projects pass, `tsc` and `eslint` are clean, no changed file's drift grows,
  and the sign-in card and the board are looked at in both languages and both schemes.
