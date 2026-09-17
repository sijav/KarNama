# KN-473 · A route change under an open confirmation leaves focus on the page body

Filed as "The focus fallback is skipped when the modal unmounts instead of closing". The card was retitled on
2026-09-17, along with its description and its exit, because the original title named a remedy this plan refuses and
would have carried that framing into every commit, the board and `agent/STATE.md`.

From the KN-344 roast.

**Why**, from the board: the route can change under an open confirmation, and a reader is then left with focus on
nothing at all, which is the defect KN-344 was about.

**Exit**, as the board had it when this plan began: focus is settled whether the modal closes or is unmounted while
open, and a story unmounts one mid-flight. That is the exit section 3 refuses and section 5 replaces; the board now
carries the re-scoped one.

**This plan does not build what the card asks for, and section 3 is why.** The defect is real and is measured below.
The remedy the card names cannot reach it, and that is measured too. An earlier draft of this plan accepted the card
and designed the cleanup; the review rejected it, and checking the review against the source and the running app turned
up more than the review had.

## 1. The defect is real, and it was measured rather than argued

In the running application at 1440 by 900, signed in, on `/jobs`: open a card's «Job opportunity actions» menu, choose
«Delete job opportunity», and the confirmation opens with focus on Cancel. Then press Back.

| moment          | address    | dialog | `document.activeElement` |
| --------------- | ---------- | ------ | ------------------------ |
| confirmation up | `/jobs`    | open   | `BUTTON` Cancel          |
| after Back      | `/network` | gone   | **`BODY`**               |

Nothing was deleted to get this: the confirmation was opened and navigated away from, never confirmed.

So the card's why is observed, not composed out of parts: a reader who is asked to confirm a deletion and then goes
Back is left on the page body, and their next Tab starts from the top.

## 2. The mechanism the card gives is wrong, and the correct one decides the fix

The card says the unmount "leaves focus on a detached opener and nothing catches it". **Something does catch it.**

`@mui/material/Unstable_TrapFocus/FocusTrap.js`, the effect at line 118, registers this cleanup:

```
return () => {
  // restoreLastFocus()
  if (!disableRestoreFocus && nodeToRestore.current) {
    ignoreNextEnforceFocus.current = true;
    nodeToRestore.current.focus();
    nodeToRestore.current = null;
  }
};
```

Its dependency list is `[open]`, and the effect body returns early when `open` is false, so the cleanup exists only
while the modal is open and it runs both when `open` becomes false AND when React removes the tree. `disableRestoreFocus`
defaults to `false` in `Modal.js` line 100 and is handed to the trap at line 204, and `Dialog.js` never mentions it.
`nodeToRestore` is captured from `event.relatedTarget`, so it is the opener.

**So on unmount MUI runs, and it focuses the opener.** Measured in Chromium, on the page this repository serves:

- focusing a DETACHED element does not move focus; the element that had focus keeps it
- removing the element that currently HAS focus drops focus to `body`

Put together, that is the whole defect: the screen goes, the opener goes with it, MUI's restore aims at a node that is
no longer in the document, and the call does nothing. The reader ends on `body` because the restore is inert, **not**
because no callback ran. Any remedy has to survive that, which is a different requirement from filling a vacuum.

Two further readings from the installed source, because two cards this week rested on premises that turned out half
wrong and this one deserved checking before anything was built on it:

- `react-transition-group`'s `Transition.componentWillUnmount` calls `this.cancelNextCallback()` and NOTHING else. It
  does not call `onExited`. So `onTransitionExited` genuinely cannot fire on unmount, and the card is right about that.
- `onTransitionExited` IS honoured on the close path: `Modal.js` destructures it at line 106 and declares it in
  `propTypes` at 311, and `Dialog` composes `Modal`. So KN-344's fallback is live where it was built, and this is not
  secretly a card about the close path never having worked.

## 3. Why the card's own remedy cannot deliver the card's why

The card asks the shell to "also settle focus when it unmounts while open, in a cleanup". For that to help, something
the caller can name has to still be in the document at that moment. Nothing is.

**`ConfirmModal` only ever unmounts when its host screen does.** There are four production call sites, and every one of
them is an unconditional sibling in its parent's tree, with `open` as a prop rather than a condition around the element:

| call site               | passes `opener` and `fallback`?  | rendered              |
| ----------------------- | -------------------------------- | --------------------- |
| `JobsScreen.tsx` 784    | yes                              | unconditional sibling |
| `JobsScreen.tsx` 806    | no, so `onClosed` is never wired | unconditional sibling |
| `NetworkScreen.tsx` 302 | yes                              | unconditional sibling |
| `AddJobModal.tsx` 353   | no, so `onClosed` is never wired | unconditional sibling |

An earlier draft of this plan said "exactly two callers", which is true only of the pair and was written as though it
were the whole list. `AddJobModal`'s nested unsaved-changes confirmation is the one I did not know about, and it was
worth finding: had it been rendered conditionally it would have been a real unmount-while-open path with a surviving
fallback, and section 3 would collapse. It is not, and `AddJobModal` itself is `open={addingTo !== null}` on an
unconditional sibling, so it does not.

**And when the screen goes, the fallback goes with it.** Both callers end their fallback at the screen's own root:

- `JobsScreen.tsx` 367 is `<Stack ref={board} tabIndex={LOOSE} …>`, the root of everything `JobsScreen` returns
- `NetworkScreen.tsx` 169 is `<Stack ref={page} tabIndex={LOOSE} …>`, the same for `NetworkScreen`

Measured across board to network in the running app, holding references over the navigation: the screen root went from
`isConnected` true to **false**, a card's own button went from true to **false**, and the shell's `<main>` was the same
node throughout. The earlier of those two readings I took on `<main>` and nearly reported as "the fallback survives";
`<main>` belongs to the shell, not to the screen, so it was the wrong element and the reading was void. The corrected
one is above.

So at the moment the cleanup would run, `landings.current` is empty of connected elements and `board.current` is
detached, which is exactly why the caller's `?? board.current` is the branch taken. Focusing it is inert. **A cleanup
in `ConfirmModal` would do nothing, in every production path this application has.** It could be made to pass only by
a story that keeps a fallback alive outside the modal, which no caller does, and a green story of that shape would
report success for a fix that changes nothing for a reader.

## 4. The review's findings, judged one at a time

The review rejected the earlier draft. Its output file held only the TAIL of what it said, opening mid-list, and an
earlier version of this section judged that tail alone and admitted the gap. The whole of it was then recovered from
the reviewer's own session transcript, and the head carried two findings the tail did not. Both are answered below.
Worth recording where it is NOT, since I looked there first: `roast.py` line 478 writes the answer to a scratch file
and line 516 unlinks it in the same breath, and `agent/roasts/` keeps task roasts only, never plan reviews.

- **"Make the cleanup resilient to the StrictMode probe."** An earlier version of this section said it did not apply.
  That was too broad, and the recovered head is why. StrictMode is real here, `main.tsx` line 24. It does not reach
  the four production callers, since every one of them mounts `ConfirmModal` with `open` false and toggles the prop,
  so the probe sees nothing open. It DOES reach any caller that mounts ALREADY open, which is precisely what a story
  does: the review spells out the setup then cleanup then setup probe running once for an initially open modal, where
  `open === true` at that cleanup is indistinguishable from a real unmount, and notes that a ref does not prevent it.
  So the guard was right about these callers and wrong as a general dismissal.
- **"A latest-value ref should be committed from an effect, not mutated during render."** Also from the recovered
  head, and it corrects the earlier draft directly, which specified a ref updated on every render: an abandoned
  concurrent render could then publish values that never committed. Checked rather than taken on trust: `react` is
  `19.0.8` in `apps/web/package.json` and installed at `19.0.8`, and the installed package exports no
  `useEffectEvent`, so the newer API the review names is genuinely unavailable here and a ref is what is left.
- **"Run after MUI's restoration, rather than assuming effect-cleanup order."** Retired, not answered. `settle` acts
  only when the opener is detached, and in that case MUI's restore is inert by the measurement in section 2, so the two
  cannot fight in either order. KN-344 had already recorded the close path: its trap "restores as `open` becomes false,
  BEFORE `onTransitionExited`". I do not need to know React's deletion order, which is the honest position; I tried to
  measure it, my first attempt imported `@testing-library/react`, which this repository does not depend on at all, and
  that run produced no result.
- **"It checks `opener.isConnected`, but not the returned fallback."** A real omission in the code, with no
  behavioural consequence, because focusing a detached element is inert. It would matter only if there were a third
  choice to fall through to. The review also says the callers "return `board.current`/`page.current` unchecked,
  precisely the targets that are disconnected"; the first half is right, the description is not, since the landings
  ahead of that `??` ARE checked with `isConnected`.
- **"It would meet only a narrow, artificial test, and a passing story would mask it."** Upheld, and section 3 is the
  measured version of it. This is the finding that changes the plan.

## 5. What should happen instead

The remedy has to live in something that outlives the route change, and that is the shell.

An earlier version of this section said the parts were already there, because both screen roots carry
`tabIndex={LOOSE}`. **That is wrong, and the review caught it.** `board` and `page` are refs PRIVATE to `JobsScreen`
and `NetworkScreen`; nothing outside either screen can reach the element, and a landing nobody can address is not a
landing. What actually survives is the shell's own `<Box component="main">` in `App.tsx`, which has neither a ref nor
a `tabIndex` today, and which my own reading watched stay the same node while the screen inside it was replaced.

So the design is the review's, written out. **Name the screen once**, because this is the one place it goes wrong.
`Shell` computes `const current: Destination = network ? 'network' : add ? 'add' : 'jobs'`, and `current` is `'add'` on
the add route; only the value handed to `Navigation` collapses it, with `current === 'add' ? 'jobs' : current`. An
earlier version of this section pointed at that expression and called it the key, which is not the same as naming it.
Keying on `current`, or on `pathname`, would fire as the Add Job dialog opens and fight its focus trap, since `/jobs`
and `/add` are one screen, `board(true)` and `board(false)`. So a separate `screen` of `'jobs' | 'network'` is derived,
and the effect keys on THAT.

The parts:

- `const main = useRef<HTMLElement | null>(null)`, and `<Box component="main" ref={main} tabIndex={-1}>`
- a `previousScreen` ref that starts unset, which is the first-run sentinel
- an UNCONDITIONAL `useLayoutEffect` that returns early when nobody is signed in, skips its first run, focuses
  `main.current` only when `screen` differs from `previousScreen.current`, and then records `screen`

**A layout effect rather than a passive one.** React runs it after the new route has committed to the DOM and before
paint, so the main and the arriving screen both exist and no frame is ever painted with focus on the body. MUI's trap
cleanup can then only aim at the detached opener, which section 2 measured as inert.

**The sentinel is not reset in cleanup**, which is what makes StrictMode's extra cycle harmless here.

**The hook stays ABOVE the auth early return**, with its own `if (!session || signingUp) return` inside it. A null ref
would already stop a crash on signing out, but the guard says what is meant, and it keeps a rule about route focus from
quietly becoming a rule about the sign-in screen later.

**And the main is the right target** rather than the arriving screen's heading: it is durable, it names the region that
was replaced, and the shell owns it. Focusing a heading would need a screen-to-shell registration contract, or route
specific knowledge in the shell, for nothing this exit asks for.

That is route-change focus management. It is not `ConfirmModal`'s to do: the modal cannot name the screen that is about
to arrive, and the screen that is leaving has nothing left to offer.

**It does not follow that every navigation should be swept in**, and an earlier version of this section said it did.
What was measured is Back while focus sits inside an outgoing modal. Clicking the navigation is a different path, and
the control clicked belongs to the shell and survives, so focus may be perfectly fine there. I have no reading either
way: the one I took moved between screens with a programmatic click, which focuses nothing, so it says nothing about a
reader's click. A general policy for every route change is a separate card with its own measurement.

**So KN-473 IS re-scoped to the defect it measured**, and its remedy moves from the modal to the shell. The board's
card was changed on 2026-09-17, before any of this was built, because the original exit asks for a story that unmounts
`ConfirmModal` mid-flight, which is exactly the artificial proof section 3 refuses. The review was explicit that the
board exit had to be changed formally before this card could close, rather than quietly missed.

**The proof has to be the real reproducer**, not a wrapper: history holding the network page and then the board, the
confirmation opened from a card's own menu, Back invoked, and `document.activeElement` asserted to be the shell's
persistent main. With it goes the negative control, `/jobs` to `/add`, asserting focus stays inside the Add Job dialog,
which is what proves the screen collapse rather than assuming it.

## 6. What must not change

- **The close path.** `onTransitionExited` still fires `settle` as KN-344 built it. Nothing here touches it.
- **`Modal`'s `onClosed`.** It keeps meaning what its comment says, after the dissolve and after the trap has restored.
- **The conditional wiring.** A caller that passes no `fallback` still gets no settling.
- **MUI's restoration.** KN-344 decided to keep it rather than take focus over with `disableRestoreFocus`, and nothing
  measured here argues with that.

## 7. The proof

**The readings are what establish the defect and the refusal**: the end-to-end reading in section 1, the two Chromium
focus readings in section 2, and the three `isConnected` readings in section 3, plus the source quoted from
`FocusTrap.js`, `Modal.js`, `Dialog.js` and `Transition.js`.

**The proof of the remedy is the pair of stories in section 5.** An earlier version of this section said "no code
changes here, so no `tsc` or `eslint` run is claimed", which was true of a plan that refused to build anything and
stopped being true the moment the card was re-scoped. It is corrected rather than left, because this paragraph is what
the close reads its scope from.

So the scope is:

| file                                               | what changes                                                                                                            |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `apps/web/src/app/App.tsx`                         | the `main` ref and `tabIndex`, the derived `screen`, the layout effect                                                  |
| `apps/web/src/app/App.stories.tsx`                 | the reproducer and the negative control                                                                                 |
| `DESIGN.md`                                        | the rule, since where focus goes on a screen change is a design decision and belongs where this repository settles them |
| `AGENTS.md`                                        | one lesson, the drift measurement below, recorded before the commit as step 7 asks                                      |
| `story-docs/en/App-Shell.md` and `fa/App-Shell.md` | an entry for each new story, in both languages, which the story-docs guard requires                                     |
| this plan                                          | the record                                                                                                              |

`tsc --noEmit` and `eslint --max-warnings 0` ARE claimed this time, because code changes.

Drift, measured against each file's own baseline rather than asserted:

| file              | baseline | after | em dashes     |
| ----------------- | -------- | ----- | ------------- |
| `App.tsx`         | 0        | 0     | none added    |
| `App.stories.tsx` | 13       | 13    | none added    |
| `DESIGN.md`       | 236      | 236   | 9, unchanged  |
| `AGENTS.md`       | 0        | 0     | 16, unchanged |
| `en/App-Shell.md` | 0        | 0     | none added    |
| `fa/App-Shell.md` | 0        | 0     | none added    |
| this plan         | 0        | 0     | 0             |

**The two docs entries were not in the first plan and they are not an afterthought either: the story-docs guard caught
them.** Adding two exported stories without entries failed `guard.test.ts` twice in the full suite, which reads the
repository rather than a fixture so that "adding a story with no markdown fails here without anyone having to register
it anywhere". With the four entries written, in both languages, that guard is back to 12 of 12.

**The way those were first measured was wrong, and it nearly cost a correct change.** Copying a file to a temporary
directory and formatting it THERE loses the repository's Prettier configuration: the formatter falls back to its own
defaults, double quotes, semicolons and an eighty column wrap, and then reports most of the file as drift. That method
said `App.tsx` had gone from a baseline of 120 to 142, and I was about to start cutting comments out of a correct
change to bring a phantom overrun down. Formatting through `--stdin-filepath`, so the configuration resolves from the
file's real path, says 0 and 0. What made it hard to see is that `DESIGN.md` measured 236 under BOTH methods, matching
the baseline KN-468 recorded, so the first numbers looked corroborated.

**Both stories were checked against a planted failure**, which `AGENTS.md` asks for in as many words: a check that
finds nothing has not proved anything, so confirm it can find a case you plant by hand. Each was run once and reverted.
Neither is a script and neither is a gate: the owner retired per-task verifiers on 2026-09-11, and these are one-off
readings, not something the next card has to satisfy.

| what was planted                                   | which story must fail | what it printed                                       |
| -------------------------------------------------- | --------------------- | ----------------------------------------------------- |
| the focus move taken out of the layout effect      | the reproducer        | `expect(element).toHaveFocus()` against the `main`    |
| the effect keyed on `current` rather than `screen` | the negative control  | `expect(element).not.toHaveFocus()`, the main focused |

The second is the one worth having. Keying on `current` is the mistake the review named twice as the most likely one,
and until it was planted the control had never been shown to catch anything at all.

**And it was looked at in the running application, not only in the runner.** On the dev server, changing screen from
the board to the network page leaves `document.activeElement` as the shell's `main`, carrying `tabIndex` `-1`, where it
was the page body before. The navigation was driven by a programmatic click, which focuses nothing of its own, so the
move is the effect's doing and nothing else's. The computed `outline-style` is `none` and `box-shadow` is `none`, so
the new `tabIndex` DRAWS NOTHING. That is what answers the done gate's four language and scheme combinations here:
there is no appearance for them to differ over, and the two stories follow this file's own practice, where the language
pairs are kept for the stories that are about how the shell LOOKS.

**The Back is real, not simulated.** Nothing in this repository calls `history.back()` today, so there is no pattern to
follow: `Navigating` drives routes with `pushState` and a synthetic `PopStateEvent`, which is a push and would prove
nothing here. The reproducer pushes the network page and then the board so the application owns both entries, and then
calls `window.history.back()`, which fires a real `popstate` the router reacts to on its own.

**What the gate actually said**, rather than what I hoped it would:

| check               | result                                                                        |
| ------------------- | ----------------------------------------------------------------------------- |
| `npm run lint`      | 0, across all three workspaces                                                |
| `tsc --noEmit`      | 0, re-run unpiped after the first reading turned out to be `head`'s exit code |
| `npm run build`     | 0, including the API's `schema:check`                                         |
| coverage thresholds | no failure anywhere, so the new branches did not break the 100 percent bars   |
| story-docs guard    | 12 of 12, after the four entries; it failed twice before them                 |
| the two new stories | both pass, and each fails when its own mutation is planted                    |

**The full suite is NOT green, and none of what remains is this card's.** It reported 11 failures in `apps/web` and 8
in `apps/api`. Taken one at a time rather than as a total:

- **2 were mine**, the story-docs guard, and they are fixed. That is what the full run was for.
- **2 are KN-551's** `session.test.ts` pair, which `agent/STATE.md` already records.
- **7 are pointer driven and pass in isolation.** I re-ran the two `JobsScreen` ones alone and they passed, 2 of 2,
  which is KN-365's signature: stories that drive the real pointer collide when story files run in parallel. The other
  five, `Button` Matrix, three in the `Input` family and `JobCard` Pressed and `NavItem` Hover, I am attributing to the
  moving set `STATE.md` names rather than re-running each, and that distinction is the honest one: two were measured,
  five are attributed.
- **The 8 in `apps/api`** are all `Test timed out in 5000ms` on database backed tests, in a workspace this change does
  not reach and shares no file with.

## 8. Questions for the review

1. **Answered: the refusal stands, and the shell is right, but not the way this plan first had it.** The review's own
   words are that the refusal is correct, that no `ConfirmModal` cleanup can fix the measured production route-change
   path, and that the diagnosis of MUI restoring into a detached opener and ending at `body` is sound. Its correction
   is the private refs, and section 5 now carries it.
2. **Answered: no.** Ordinary navigation is not to be folded into this card. The evidence covers Back from an open
   modal and nothing else, and a general policy would change behaviour beyond what was measured. It becomes its own
   card, with its own reading.
3. **No review answered it, so the judgement is mine and here it is: no card.** `LOOSE = -1` is declared once in
   `JobsScreen.tsx` and once in `NetworkScreen.tsx`, and each is local to the screen that uses it. A shared constant
   for the number minus one would be indirection bought with an import, and the reader of either file would then have
   to leave it to learn what `LOOSE` means. If a third screen wants it, that is the moment to reconsider. Filing a card
   to keep the question open would be filing noise.
4. **Answered: ready to build, with one precision I had got wrong.** The review's words are that the shell target, the
   named `screen`, the layout effect, the unreset first-run sentinel, the auth guard and the revised board exit line up
   with the real failure. What it corrected: derive a separate `screen` of `'jobs' | 'network'` and key on THAT, because
   `current` is `'add'` on the add route and only the value handed to `Navigation` collapses it. What it settled for me:

   - the layout effect is right and needs no extra wait, since the arriving route has committed before it runs and it
     runs before paint, so not one frame is painted with focus on the body
   - `main` is the right target rather than an arriving heading, which would need a screen-to-shell registration
     contract or route specific knowledge in the shell, for nothing this exit asks for
   - the Back is safe inside the preview frame PROVIDED the story pushes both entries first and calls Back exactly
     once, since the entry immediately behind is then the story's own network page and it cannot escape to an unrelated
     one; and because `history.back()` is ASYNCHRONOUS the story must wait for the real arrival rather than assert on
     the next line, which is why both assertions sit in `waitFor`
   - the teardown stays `replaceState` and must NOT call a compensating `history.back()`, which would start a second
     asynchronous route change after the story has finished, with nobody watching it
