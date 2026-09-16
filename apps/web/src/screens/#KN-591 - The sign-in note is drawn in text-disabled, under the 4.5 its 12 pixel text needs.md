# KN-591 - The sign-in note is drawn in text/disabled, under the 4.5 its 12 pixel text needs

## The card

**Why.** A note most readers can barely read, about what they accept by signing in, fails the
contrast the product holds its other text to.

**Exit.** The owner has chosen: the note takes a colour at 4.5 to one or more on `bg/surface` in
both schemes, which a story reads, or DESIGN.md records the owner's acceptance of 2.54 with the
reason.

Found by KN-518's reading of Auth Login `407:6951` and `407:7022` with use_figma, 2026-09-15.

## What the owner decided, 2026-09-16

Asked through the question tool, they chose **raise both to 4.5**: the sign-in note and the code
step's resend timer take a colour at 4.5 to one or better on `bg/surface` in light and in dark, read
by a test so it cannot drift back. The file's 2.54 is not followed here. The decision reaches the
timer because KN-587 drew that line in the same token, which this card's own note records.

## Measured before planning, 2026-09-16

- **The two places that change, and a third that must not.** The Terms Note at `AuthScreen.tsx` line
  360, 12 Regular on the normal line, centred; the Resend Timer at line 124, 14 Regular on 22,
  centred; both `text/disabled`. Line 83 is `&.Mui-disabled` on the Footer Link's `ButtonBase` — a
  genuinely disabled control, which is what that token is for, and it stays.
- **The ratios, computed rather than recalled**, with the WCAG formula checked against the same two
  values the repository's own test uses, 21.00 for black on white and 1.00 for a colour against
  itself. On `bg/surface` `#ffffff`: `text/disabled` `#9ca3af` is **2.54**, exactly the figure the
  card carries, so the computation agrees with whoever measured it first; `text/secondary` `#6b7280`
  is **4.83**; `text/primary` is 17.74. On `bg/page` `#f6f7f9`, `text/secondary` is **4.51**, which
  the sign-in card does not sit on but which is worth knowing before leaning on that token.
- **The dark side needs nothing new.** `theme/darkMode.test.ts` already asserts that `text/primary`,
  `text/secondary`, `text/brand` and `text/error` each clear `MIN_CONTRAST`, which is 4.5, on the
  dark surface. `text/disabled` is absent from that list, which is exactly why nothing caught this.
- **The light palette's text tokens are never contrast-checked at all.** That block measures the
  dark palette's text on the dark surface, and in light it checks only the status chips. So the same
  defect could be reintroduced in the light palette and no test would say a word. **That is the gap
  this card should close, not merely step around.**
- **What pins the old token in tests**: `AuthScreen.stories.tsx` line 435 asserts the note's colour
  and line 481 the timer's, with comments at 429 and 464 naming `text/disabled` in prose.
- **DESIGN.md says it twice**: line 1623, the note "in `text/disabled`, 2.54 to one on the card,
  which is the owner's to settle, KN-591", and line 1636, "The timer's `text/disabled` is 2.54 to
  one, as the Terms Note's is, KN-591." Both become the decision, with its date, as KN-396's
  sentence records the owner's ruling on the Destructive button.
- **Drift baselines**: `AuthScreen.tsx` 0, `AuthScreen.stories.tsx` 0, `theme/darkMode.test.ts` 20,
  `DESIGN.md` 236.
- **No card covers this already**: KN-396 is the Destructive button's own pair and owner-decided,
  KN-273 and KN-276 are non-text control edges at the 3 to one bar, KN-108 is dark destructive.

## The approach

1. **The note and the timer take `text/secondary`.** 4.83 on the card in light, and above 4.5 in
   dark by the assertion that already exists. It is the token the product already uses for secondary
   information — the heading's own body line is drawn in it — so this adds no role the design does
   not have.
2. **`&.Mui-disabled` keeps `text/disabled`**, that being a real disabled control rather than
   information wearing the disabled colour.
3. **The two story assertions follow**, and so do the four comments that name the token in prose,
   in `AuthScreen.tsx` at 93 and 350 and in the stories at 429 and 464.
4. **The guard closes the gap that let this through**: `darkMode.test.ts`'s readable-palette block
   gains the LIGHT palette against the light surface, mirroring exactly the list it already checks
   in dark — `text/primary`, `text/secondary`, `text/brand` and `text/error` on `bg/surface` at 4.5.
   **Not** `text/disabled`, which is deliberately exempt because WCAG exempts inactive controls, and
   **not** `text/on-accent`, which is already checked against the accent fills it actually sits on.
5. **Two dark stories read these lines, which is what the exit asks.** Threading a scheme through
   the helpers would NOT run them in dark: Storybook runs a story at its declared globals, and all
   four frame stories pin `colorScheme: 'light'`. So two exports are added, one reaching the Login
   note and one the code step's timer, each pinning `{ locale: 'fa-IR', colorScheme: 'dark' }` and
   asserting two things — that the form's background is computed from `darkSemantic['bg/surface']`,
   and that the line's own colour is computed from `darkSemantic['text/secondary']`. The surface is
   asserted because a claim about a colour's contrast on a surface means nothing if the surface is
   not the one assumed. They carry no geometry: the light frame stories keep the design
   measurements, and repeating those at both widths in dark would buy nothing.
6. **Persian dark is enough automated colour coverage.** A locale changes the copy and the
   direction, not the token path those two `sx` declarations take, so an English dark story would
   catch no colour regression the Persian one misses. The English light stories keep the copy and
   layout coverage they already have, and the look below still covers all four combinations by eye,
   which is this repository's own done rule rather than something the stories replace.
7. **DESIGN.md records the decision** on both sentences: the owner's, dated 2026-09-16, that the
   file's 2.54 is not followed and both lines take a token at 4.5 or better.

## What I will change

- `apps/web/src/screens/AuthScreen.tsx`, the note's colour, the timer's, and two comments
- `apps/web/src/screens/AuthScreen.stories.tsx`, two assertions, two comments, and the two dark
  stories that read the note and the timer against `darkSemantic`
- `apps/web/src/shared/story-docs/en/Screens-SignIn.md` and `fa/Screens-SignIn.md`, an entry each
  for the two new stories, in both languages, which the docs guard requires
- `apps/web/src/theme/darkMode.test.ts`, the light palette's four text tokens asserted
- `DESIGN.md`, the two sentences

## What I expect to be hard, and what I am unsure of

- **Whether `text/secondary` is the right answer rather than a new token.** It clears the bar, it is
  already the role for secondary information, and inventing a token for one note would add a role
  the design file does not have. But it is the owner's design being departed from either way, so the
  record has to say plainly that the file draws `text/disabled` and the build does not.
- **4.51 on `bg/page` is thin**, and I claimed the new guard would catch the note moving there. That
  was false, and the plan's review said so: a palette-pair test compares two colours and cannot know
  where a component is rendered. What guards the surface is the stories asserting the card really
  draws `bg/surface`, which is why that assertion is in the approach.
- **The dark values are derived, not literals**, so the dark half of "both schemes" rests on the
  existing assertion rather than on a number I can read out of the tokens file. That is why the new
  guard is written beside it rather than somewhere of its own.
- **Neither KN-518 nor KN-587 is reopened.** They drew these lines as the file draws them and said
  so; this card is the departure the owner has now authorised.
- **Where this stops.** The plan's review found a third informational line in the same colour, the
  sidebar's Section Label «فضای کار», node `406:454`, 12 Medium in `text/disabled` on the sidebar's
  surface. I read it before believing it, and it is real. The owner's decision of 2026-09-16 named
  the sign-in note and the resend timer, so that one is **KN-666** and is not folded in here. A
  sweep found no fourth: every other `text/disabled` in the product is a genuinely disabled thing,
  the Input's disabled text, the Menu's blocked item, the Select's disabled option and the sign-in
  Footer Link's `&.Mui-disabled`.

## How I will know it works

- **The new light guard fails before the change and passes after.** A guard that would have passed
  on the broken palette proves nothing, so it is run against `text/disabled` first, by asserting the
  token that fails, and only then against what ships.
- The sign-in stories pass, their two colour assertions now reading `text/secondary`.
- The theme and token tests pass, the unit project with them; `tsc` and eslint pass; no changed
  file's drift grows and this plan's is 0.
- A look at the sign-in note and the resend timer in light and in dark, at both widths, to see the
  words are legible rather than merely measured.

## Plan review, 2026-09-16, Codex gpt-5.6-terra

**The token choice endorsed**, with the reason I had reached: `text/secondary` is the product's
readable secondary-information role, clears 4.5 on the card, and does not justify a token of its
own; WCAG exempts inactive controls, not informational copy, so keeping `text/disabled` for the
genuinely disabled Footer Link is right. **Extending `darkMode.test.ts` is the right place and
scope**, mirroring its existing list exactly — `text/primary`, `text/secondary`, `text/brand`,
`text/error` — and excluding `text/disabled`, deliberately exempt, and `text/on-accent`, already
checked against the fills it sits on. It found a **third informational use** of the token, the
sidebar's Section Label, which I read before believing and filed as KN-666 rather than folding in.

**One claim of mine was false and is withdrawn**: a palette-pair test cannot know where a component
is rendered, so the guard would not catch the note moving onto `bg/page`. What supplies that fact is
a DOM assertion that the card really draws `bg/surface`.

## Second plan review, 2026-09-16, Codex gpt-5.6-terra

**The required correction, taken.** Threading a scheme through the helpers would not have run them
in dark at all: Storybook runs a story at its DECLARED globals, and all four frame stories pin
light. My step 5 would have looked like a dark proof and produced none. Two dark story exports are
added instead, one per line, each asserting the form's background against `darkSemantic['bg/surface']`
and the line's colour against `darkSemantic['text/secondary']`, with their entries in both docs
languages.

**Its scoping is taken too**: Persian dark is sufficient automated colour coverage, since a locale
changes copy and direction and not the token path of those two `sx` declarations, so an English dark
story would catch nothing the Persian one misses. English light keeps its copy and layout coverage,
and the look by eye still covers all four combinations because the repository's done rule asks for
it, not because the stories need it.
