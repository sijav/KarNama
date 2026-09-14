# KN-560 - App/Shell's SignedInInAnotherTab fails in the published Storybook: the name step never appears

## The card

**Why**, from the board: A failed interaction on the shell's page in the published
Storybook tells whoever reviews the sign-in flow there that a working flow is
broken, and KN-226's check cannot guard the story until it holds.

**Exit condition**, from the board: SignedInInAnotherTab's play passes in a
production Storybook opened in a browser, bare and inside the manager, and still
passes in the Vitest runner, with the cause named at the close.

It blocks KN-226.

## What is there, read on 2026-09-15

- **The story**, `App.stories.tsx` line 529: the meta's decorator seeds an
  `AuthProvider` with a named reader; this story's own decorator puts an unseeded
  `AuthProvider` inside it, so the shell shows the sign-in screen. The play checks
  the number field, writes another tab's first-login session to the story's own
  storage under `karnama.session`, dispatches the `storage` event another tab's
  write would deliver, and waits for the name field.
- **The providers**, `AuthProvider.tsx` lines 137 to 150 and `RecordsProvider.tsx`
  around line 161: each listens for `storage` from a `useEffect`, a passive effect.
- **KN-419's plan**, `core/records/#KN-419 ....md`, built these listeners and
  this story, and proved the app's own wiring with `e2e/two-tabs.spec.ts`.

## Measured, 2026-09-15

On a production Storybook of bb953c8, opened headless, bare at `iframe.html`:

1. **What the page shows when the play gives up**, and four seconds later: the
   number step, «شماره موبایل», and nothing else.
2. **What it holds**: the story's own storage, not the real one, with
   `karnama.session` as the play wrote it, `{"phone":"09120000000","name":"",
   "since":"2026-09-12T00:00:00.000Z"}`. Four storage listeners were on the window,
   and none had heard the play's event. **The same event dispatched again from
   outside the play** reached all four, and the name step, «اسم و فامیل», was on
   screen 1.5 seconds later. So the providers and the stored session are right.
3. **The order, timed from the page's start**, by wrapping `addEventListener`,
   `removeEventListener` and `dispatchEvent` before the page's scripts ran:
   - `SignedInInAnotherTab`: the play dispatched `karnama.session` at **330 ms with
     0 listening**; the four listeners were added at **341 ms**.
   - `SignedOutInAnotherTab`, which passes: listeners at 310 ms, its dispatches at
     319 and 365 ms with 3 listening.
   - JobsScreen's `ChangedInAnotherTab`, which passes: listeners at 320 ms, its
     dispatches at 343 and 404 ms with 3 listening.

**The cause**: the play dispatches before the providers' passive effects have
added their listeners. In the Vitest runner a story renders under React's `act`,
which runs those effects before the play starts; a production canvas renders
without it, and React runs them in a task of its own, 11 milliseconds after this
play's dispatch. The event is not repeated, so it is lost. The other two stories
pass by 9 and 23 milliseconds.

## The approach

1. **A mark that the story's own provider is listening.** The story's decorator
   wraps its unseeded `AuthProvider` in `ListeningAround`, which draws an empty
   span before its children and, in its own `useEffect`, sets that span's `hidden`
   property. React runs a parent's passive effects after its children's, so the
   wrapper's effect runs after the provider's, which adds the storage listener:
   once the play sees the span hidden, that listener is on the window. The mark
   is placed as Codex's review asked, as the provider's parent, not its child;
   the preview's own providers are ancestors and may add theirs after it, and the
   name step does not need them.
2. **The play waits for the mark** before it writes the session and dispatches the
   event, and changes nothing else.
3. **The docs**, English and Persian: the story's entry says it waits until the
   shell is listening before another tab's sign-in arrives, since an event nobody
   listens for is lost.

## How I will know it works

- Red before: the measurement above.
- **The order, timed again on a production build of the change**: the play's
  dispatch after the story's own provider has added its listener. That is the
  proof, since the race it removes could be won by chance. Taking the wait out
  and seeing the story fail again is tried as a reproduction, not relied on.
- App/Shell's stories under Vitest, the unit project, eslint, tsc, the docs guard.
- A production Storybook of the change: `app-shell--signed-in-in-another-tab`
  opened headless, bare and inside the manager, with no failure event and no
  console error, and the order timed again: the dispatch after the listeners.
- A look at the story in both languages and both schemes.

## What I am unsure of

- **The order of effects.** React documents that effects run after the commit, not
  an order between components; its implementation runs a parent's after its
  children's, which the mark relies on as the provider's parent rather than
  relying on a whole commit's effects running in one pass.
- **The two stories that pass by 9 and 23 milliseconds.** They race the same way
  and a slower machine could lose it. They are not this card's exit, so they
  become a card of their own, which can reuse the mark.
- **A mark drawn in the story's DOM.** An empty span beside the shell, hidden once
  the effects have run; it takes no room and no one reads it.
- **Other ways considered.** Dispatching again inside a `waitFor` until the name
  step appears works, since the providers take the same session in more than once
  harmlessly, but it repeats an event another tab sends once, a side effect in a
  retry loop. Waiting a frame or a timeout guesses at when React runs its effects.
  `act` exists only in React's development builds.

## Plan review, Codex, 2026-09-15

Written to `%TEMP%/claude-roast/2b1874631dd1/20260914T225149-plan-kn-560-app-shell-s-signedininanothertab-fails-in-89de21.md`.
Judged against the code:

- **A span inside the provider marks too early. Taken.** A child's passive effect
  runs before its parent's in React 19's production traversal, so the plan leaned
  on a whole commit's effects running before any other task, which React does not
  promise. The mark moved to the provider's parent, above.
- **The mark means the story's own provider, not all four listeners. Taken**, and
  said in the approach: the preview's providers are ancestors, their effects may
  come after the mark, and the name step is this provider's.
- **No Storybook API proves a subscription, timing guesses are timing guesses, a
  readiness API on the provider is surface the product does not need, and
  dispatching inside `waitFor` repeats an event another tab sends once.** Agreed,
  as the plan had it.
- **The production Storybook has no Suspense and no StrictMode**, whose extra
  effect cycle is development only. Agreed.
- **Removing the wait is not a dependable plant**, since the race can be won.
  Taken: the timed order on the fixed build is the proof.

## Result, 2026-09-15

- **`App.stories.tsx`**: `ListeningAround` draws an empty span,
  `data-testid="listening"`, before its children and hides it in its own
  `useEffect`; `SignedInInAnotherTab`'s decorator puts it round the story's own
  `AuthProvider`, and the play waits for the span to be hidden before it writes
  another tab's session and dispatches the event. Nothing else in the play
  changed.
- **The docs**, English and Persian: the entry says the story sends the other
  tab's sign-in only once its own provider is listening, since an event that
  arrives before the listener is lost. The Persian line was appended by a script
  matching the file's own spelling.

**Red before**: the measurement above, the play's dispatch at 330 ms with no
listener, the listeners at 341 ms, and the name step never on screen.

**On a production Storybook of the change**, opened headless: the four storage
listeners were added at 355 ms and the play dispatched at 356 ms with four
listening; at 367 ms three listeners went and came back, the preview's providers
remounting as the reader arrived, as KN-419's plan describes; and the story ended
with no failure event and no console error, bare and inside the manager. **With
the wait taken out**, on a build of its own and the story restored byte for byte,
the play dispatched at 370 ms with none listening, the listeners came at 383 ms,
and the play threw on the name field again. That reproduction is not the proof,
since the race can be won by chance; the timed order is.

**Passing**: App/Shell's stories under Vitest, 13 of 13; the web unit project,
1383, run before any browser run; eslint and tsc clean. `App.stories.tsx` was not
formatted at HEAD, 14 lines of drift, and keeps 14; both docs files keep 0.
**Looked at** in the dev Storybook: the story ends on the board, «فرصت‌های شغلی
من», with the name saved, in light and dark; it pins Persian, so it has no English
view.

**Seen on the way**: the empty board's title says «هنوز آگهی‌ای اضافه نکردی»,
calling the reader's records «آگهی» against the terminology rule, from the id
`You have not added a job posting yet`; filed on the board as a card of its own.
