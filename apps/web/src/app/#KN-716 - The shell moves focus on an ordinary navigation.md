# KN-716 · The shell moves focus on an ordinary navigation, which DESIGN.md says is not settled

From KN-473's roast. **This is my own overreach from that card, handed back by the board at `high`.**

**Why**, from the board: a reader who clicks My network has focus on the control they clicked, and that control belongs
to the shell and survives the route change. Moving focus off it is a decision nobody made, and the code and the rule
written beside it currently disagree.

**Exit**, from the board: either the shell moves focus only on the paths KN-473 measured, with a story showing that an
ordinary navigation click leaves focus on the control that was clicked, or KN-715 has settled the policy and
`DESIGN.md`'s navigation section no longer calls it unsettled; whichever holds, the code and the written rule say the
same thing.

## 1. The contradiction, quoted from both sides

`App.tsx`, the layout effect KN-473 shipped:

```
const before = shown.current
shown.current = screen
if (before === undefined || before === screen) return
main.current?.focus()
```

Nothing there asks HOW the screen changed. `DESIGN.md` line 842, written in the same commit:

> "What an ordinary navigation should do, where the reader clicked the control themselves and it survives the change,
> is not settled here and is KN-715."

So the code decides a question the rule beside it declares open. The plan review had said the same before any of it
existed, and I recorded that answer in KN-473's plan as "Answered: no" and then built the broad version anyway.

## 2. Measured, not argued

In the running application, driving the navigation the way a keyboard reader does, focusing the control and activating
it, in both directions:

| step                                  | address    | `document.activeElement`              |
| ------------------------------------- | ---------- | ------------------------------------- |
| focused, before activating            | `/jobs`    | `BUTTON` My network, in nav           |
| after activating                      | `/network` | **`MAIN`**                            |
| focused, before activating the second | `/network` | `BUTTON` My job opportunities, in nav |
| after activating                      | `/jobs`    | **`MAIN`**                            |

**The effect takes focus off the control the reader activated**, in both directions, and that control survives the
route change. That is the defect, and these are two of the four readings KN-715 asks for.

This had to be driven with a real focus and activation rather than a programmatic click: a bare `.click()` focuses
nothing, which is why the reading taken during KN-473 was void for this question and recorded as such.

## 3. Which of the exit's two routes is actually open

The exit offers narrowing the effect, or letting KN-715 settle the policy first. **They are not equally available.**
KN-715 is in **OKR-2** while this card is in OKR-1, and the selection law works through the current objective before
it offers anything from a later one. Taking KN-715 first would mean pulling a later objective forward, which is the
one thing the law is there to prevent. So the route is to narrow the effect, and KN-715 keeps its own measurements
and its own decision for later.

## 4. The signal: a one-shot latch, from the board only

**The premise held and no longer needs measuring.** `document.activeElement` IS `document.body` at layout-effect time
on the KN-473 path: React runs the shell's layout effect after the arriving route commits and before paint, while MUI
restores focus in a PASSIVE effect, so the outgoing dialog is gone and its detached opener cannot reclaim focus.

**But `body` is a symptom, not the cause**, and building on it would repeat this card's own mistake one level down.
Focus also lands on `body` during an ordinary navigation when focus was inside the outgoing screen. So `body` stays as
a SAFETY CONDITION and the policy is the signal.

**The board only, not both screens.** KN-473 measured the board's job-delete confirmation and `DESIGN.md` names that
case. Signalling from `NetworkScreen` as well would extend focus movement to a network confirmation nobody has
measured, which misses the exit's own words, "only the paths KN-473 measured". An earlier draft of this plan had both.
That is the third time on this card I reached wider than the evidence, in the same direction as the overreach the card
exists to undo.

**A one-shot latch, not a mirrored value**, and the order is the whole of it:

- `JobsScreen` gets `onJobDeleteConfirmationOpenChange`, named for the one confirmation it is about.
- `Shell` holds `jobDeleteConfirmationWasOpen` in a ref.
- SET true when that confirmation opens.
- CLEAR on an ordinary close, and CLEAR immediately after the shell consumes a screen change.
- **Never clear it from an unmount cleanup.**

**Why the precedent must not be copied.** `onSelecting` is the house way a screen tells this shell something, and both
screens implement it as a layout effect that clears itself on the way out, "so leaving with a selection live does not
leave the shell thinking the next page is selecting". React runs a deleted screen's layout-effect cleanup BEFORE
removing its DOM and then runs the surviving shell's layout effect, so a mirrored signal would be false by the time
the shell reads it, in exactly the case it exists for. KN-473's own sentinel is never cleared in a cleanup, which I
checked against the committed code rather than against memory, and that is the precedent to follow.

## 5. Scope

| file                                               | what changes                                                              |
| -------------------------------------------------- | ------------------------------------------------------------------------- |
| `app/App.tsx`                                      | the latch, and the effect settling only when it is set and focus was lost |
| `screens/JobsScreen.tsx`                           | tells the shell when the delete confirmation opens and closes             |
| `app/App.stories.tsx`                              | the ordinary-navigation stories, keyboard and a real pointer              |
| `screens/JobsScreen.stories.tsx`                   | the new callback as fn() in the meta args, which the guard requires       |
| `story-docs/en/Screens-Jobs.md` and `fa/…`         | the new prop documented, in both languages                                |
| `story-docs/en/App-Shell.md` and `fa/App-Shell.md` | an entry for each new story, in both languages, which the guard requires  |
| `DESIGN.md`                                        | the navigation rule says what the code now does                           |
| `AGENTS.md`                                        | one lesson: two guards in sequence can make each other untestable         |
| this plan                                          | the record                                                                |

**`NetworkScreen` is deliberately NOT in scope**, per section 4. Baselines taken before any edit: `App.tsx` 0,
`App.stories.tsx` 13, `DESIGN.md` 236, `JobsScreen.tsx` 0.

## 6. What must not change

- **The Back-under-a-confirmation path.** `BackFromAConfirmation` passes untouched or the narrowing is wrong.
- **The add flow.** `/jobs` to `/add` is one screen and still moves nothing; the negative control stays.
- **The first run and the signed-out reset.** Neither is about how the screen changed.
- **KN-715's question stays open**, by any route, including a `body` test dressed as an implementation detail.
- **`DESIGN.md` needs no new "known gap" sentence.** Its existing paragraph already leaves ordinary navigation open,
  which the review confirmed is the correct state.

## 7. The proof

1. `BackFromAConfirmation` unchanged and still passing, and `OpeningTheAddFlowKeepsFocus` with it.
2. **`NavigatingKeepsFocus`**: the nav control focused and activated, in BOTH directions, keeping focus, with the page
   region asserted not to have it.
3. **`NavigatingWithAPointer`**: the same navigation driven by the runner's locator, asserting only what this card
   claims, that the shell did not take focus, and RECORDING where a pointer leaves it rather than deciding that here.
4. **`NavigatingAwayFromAFocusedCardKeepsTheShellOut`**: an ordinary navigation where focus IS lost, because the
   reader had focused something inside the outgoing screen. Focus ends on the body with the latch unset, and the shell
   must still leave it alone. **It is driven by Back, not by clicking the navigation**, and the first version
   of it failed for exactly the reason section 7 already records about `userEvent`: a simulated click FOCUSES what it
   clicks, so activating a nav control hands focus to that control and the reader never loses it. The story failed on
   its own premise, `expected <button> to be <body>`, which is the assertion that exists to stop it passing for the
   wrong reason doing its job on me. Back is an ordinary navigation with no control to receive focus, so it is the
   only route to the case this story needs.

**Story 4 exists because working out the planted failure showed the first three cannot prove the boundary.** In
`NavigatingKeepsFocus` the latch is false AND focus is on the control, so EITHER guard alone returns early: removing
`if (!underAConfirmation) return` still stops at the body check, and removing the body check still stops at the latch.
Neither removal fails anything, and only removing both does, which would prove a narrowing exists without proving the
LATCH is what draws it. That is the same gap the review found in the first design, surviving into the proof of the
second one. Story 4 is the case that separates them: with focus lost and no confirmation, only the latch is holding
the shell back.

**What the gate said, as each piece landed.** `tsc --noEmit` 0 and `eslint --max-warnings 0` 0. The story-docs guard
12 of 12, after it had failed twice on the new prop rather than on the new stories. Drift against each baseline taken
before the edits:

| file                         | baseline | now |
| ---------------------------- | -------- | --- |
| `App.tsx`                    | 0        | 0   |
| `JobsScreen.tsx`             | 0        | 0   |
| `app/App.stories.tsx`        | 13       | 13  |
| `JobsScreen.stories.tsx`     | 4        | 2   |
| `en/App-Shell.md`, `fa/…`    | 0        | 0   |
| `en/Screens-Jobs.md`, `fa/…` | 0        | 0   |
| `DESIGN.md`                  | 236      | 236 |
| `AGENTS.md`                  | 0        | 0   |

`JobsScreen.stories.tsx` came in BELOW its baseline, at 2 against 4, which is worth saying rather than quietly
banking: adding the new callback meant breaking a cramped one-line `args` object into a block, and prettier had been
disagreeing with that line. The rule is `now <= baseline`, so this passes, but it passes because the file got closer
to the formatter rather than because I left it alone. `DESIGN.md` keeps its nine em dashes and `AGENTS.md` its
sixteen, none added to either.

**So the planted failure is removing the latch check**, `if (!underAConfirmation) return`, which must fail story 4 by
name. Removing the `body` test instead proves only that lost focus gets repaired, which is not the policy.

**It was planted and it failed for the right reason.** With `if (!underAConfirmation) return` taken out,
`NavigatingAwayFromAFocusedCardKeepsTheShellOut` fails on `expected <main …> to be <body>`: the shell took focus on an
ordinary navigation, which is the behaviour this card exists to remove. The other four stories were unaffected, which
is the point of the pairing: they cannot see this difference, and that is why the third one had to exist. The mutation
was reverted in the same command rather than across a turn, and `App.tsx` carries the check again at line 141.

All five stories pass unmutated, `tsc --noEmit` and `eslint --max-warnings 0` are 0, and the story-docs guard is 12 of
12 after failing twice on the new prop.

**A new PROP costs more than a new story**, which the guard taught me here rather than in the abstract: adding
`onJobDeleteConfirmationOpenChange` to `JobsScreenProps` failed two of its checks at once, "every real prop is
documented" and "every callback is storybook/test's fn() in the meta args". So a callback prop needs an entry in
`Screens-Jobs.md` in BOTH languages and an `fn()` in that screen's meta args, or the Actions panel never records it.

**Every new story needs two docs entries before the close**, `en` and `fa`. The story-docs guard reads the repository
rather than a fixture, so an exported story with no markdown fails it without anyone registering anything, and it is
what caught KN-473 with two entries missing. This plan's scope table omitted those files until late, which is the
third time running that a scope table of mine has lagged the real footprint.

**Item 3 would have been worthless as first planned**, and the mechanism is read from the installed source rather
than taken from anyone, including a reviewer who was right about the conclusion. `@testing-library/user-event` is
14.6.6 here, and the focus happens in the POINTER SYSTEM, not in the click behaviour:

```
down(instance, keyDef, isPrevented) {
  const disabled = isDisabled(target)
  if (!isPrevented && (disabled || instance.dispatchUIEvent(target, 'mousedown', init))) {
    this.startSelecting(instance, init.detail)
    focusElement(target)
  }
```

`system/pointer/mouse.js`, whose own parameter comment reads "Whether `preventDefault()` has been called on the
`pointerdown` event". So a simulated click focuses its target on mouse-down unless `pointerdown` was default
prevented. An earlier version of this section cited `event/behavior/click.js` lines 15 and 27 and said it ALWAYS
focuses; both were wrong. Those two branches are for a LABEL whose control is a different element, and for an
`input[type=file]`, so neither could ever fire for a navigation button, and there is no mousedown module in
`behavior/` at all. The conclusion survives: a simulated click cannot measure what a pointer does here, because it
arranges the focus itself.

**What a real pointer costs here, and a correction I owe the review.** The story project runs under real Playwright
Chromium, headless at 1440 by 900, so the mechanism exists. The review suggested `page.elementLocator(element).click()`
and an earlier version of this section said that member "is declared `protected abstract` and cannot be called".
**That was wrong.** `@vitest/browser/context.d.ts` line 812 declares `export interface BrowserPage extends
LocatorSelectors`, and line 849 gives it a PUBLIC `elementLocator(element): Locator`, documented as "Wrap an HTML
element in a `Locator`". The `protected abstract elementLocator` I had found is on the `Locator` class in
`locators.d.ts`, a different type. So the review's route is correct, and `page.getByRole(role, options)` is available
too, since `BrowserPage` extends `LocatorSelectors`. Either gives a native Playwright click rather than a simulation.

**Why I got that wrong is worth keeping**, because it is the same mistake three times over on this card. I searched
`dist/*.d.ts` and a `vitest/context.d.ts` that does not exist, with `2>/dev/null` on every grep, so a missing path
returned empty and I read three empty results as evidence about the API. `AGENTS.md` already says a tool that finds
nothing has not proved anything; suppressing the error is how that rule gets broken without noticing.

**Nothing in this repository uses a locator yet**, so this card would be the first, and the story sits behind the
`__KARNAMA_STORY_TEST__` guard the repo already uses, which means it proves nothing in the published Storybook,
exactly as `Selecting` already accepts for its viewport work.

**If the pointer reading shows focus on `body`**, that is an unresolved ordinary-navigation result belonging to
KN-715, recorded rather than converted into policy.

## 8. Questions, and where each landed

1. **Answered: a callback, not a context**, and the review agreed the carrier was right while correcting its shape to
   a one-shot latch.
2. **Answered: name it for the one confirmation**, `onJobDeleteConfirmationOpenChange`, so it cannot quietly become a
   general "a modal is open" signal.
3. **Answered: no new sentence in `DESIGN.md`.** Its paragraph already leaves ordinary navigation open, and a recorded
   pointer result belongs to KN-715.
4. **Answered by the review before I asked it properly**: the precedent clears itself and this latch must not, and the
   set, clear and consume order is written out in section 4.
