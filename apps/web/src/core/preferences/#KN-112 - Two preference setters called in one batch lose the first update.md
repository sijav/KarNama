# Plan — KN-112, two preference setters called in one batch lose the first update

## The task, from the board

**What.** `PreferencesProvider` builds each setter over the `locale` and
`colorScheme` captured in that render, so `setLocale("en-US")` followed
synchronously by `setColorScheme("dark")` computes the second update from the
stale locale: the state and the stored value both end up
`{locale: "fa-IR", colorScheme: "dark"}` and the language change is gone.

**Why.** A roast rated this major and it is a plain correctness bug in new code.
It is dormant only because there is one control today; the moment the settings
surface offers both, a user changing two things at once loses one of them, and
the symptom is a preference that sometimes does not stick, which is the hardest
kind of bug to believe a report of.

**Exit condition.** A test calls both setters in the same batch and both changes
survive in the state and in what was written, and it fails against the current
closure-based implementation.

## Confirmed by reading, not assumed

`apps/web/src/core/preferences/PreferencesProvider.tsx:62-67`. Both setters are
built inside a `useMemo` over `[locale, colorScheme, update]`, and each one
passes the SIBLING field from that render:

    setLocale:      update({ locale: next, colorScheme })
    setColorScheme: update({ locale, colorScheme: next })

So two calls before the next render both read the same captured pair, and the
second one writes the first one's field back to its old value.

**The bug is currently asserted as correct.** This is the part that changes the
size of the task. `PreferencesProvider.test.tsx:50-55` calls both setters and
expects:

    { locale: 'fa-IR', colorScheme: 'dark' }     // setLocale won
    { locale: 'en-US', colorScheme: 'system' }   // locale reverted to en-US

That second line IS the defect, written down as the expectation. So the suite
does not merely miss the bug, it certifies it, and the fix must rewrite that
assertion rather than add a new test beside it.

## How dormant this actually is, checked rather than assumed

`setColorScheme` has NO production caller: `grep` finds it only in this
provider's own test. `setLocale` has exactly one, `LanguageSwitch.tsx:40`. And
DESIGN.md draws no settings surface at all, so the card's "the moment the
settings surface offers both" describes a screen that is not in the design yet.

That does not make the fix wrong, it makes the EVIDENCE claim narrower, and the
close should say so: this repairs a latent contract defect, and the probe that
proves it will be the only thing in the repository that calls both setters. A
story that exists solely to exercise a contract is honest as long as it is not
described as a user-facing surface.

## The approach

1. **Track the latest value in a ref, and update from a partial.**

   ```tsx
   const latest = useRef(stored)
   const update = useCallback((change: Partial<Preferences>) => {
     const next = { ...latest.current, ...change }
     latest.current = next
     setStored(next)
     writePreferences(next)
   }, [])
   ```

   The setters become `update({ locale: next })` and
   `update({ colorScheme: next })`. Each call composes onto the previous call's
   result rather than onto the render's snapshot, so a batch of two keeps both.

2. **Rewrite the enshrined assertion** to the merged sequence, which is what
   correct behaviour writes: `{fa-IR, dark}` then `{fa-IR, system}`.

3. **Prove the STATE half in a story**, because `renderToString` cannot re-render
   and the node project has no DOM. The browser project runs stories in real
   Chromium, and `LanguageSwitch.stories.tsx` is the existing pattern for a play
   function that drives a control and asserts what rendered.

4. **Mutation-test it**: restore the closure-based setters and require both the
   node test and the story to fail, each with its own message.

## Alternatives I am rejecting, and why

- **A functional updater that writes inside itself**,
  `setStored(prev => { const next = {...prev, ...change}; writePreferences(next); return next })`.
  This is the obvious shape and it is wrong: updaters must be pure, and React
  invokes them twice under StrictMode, so the write fires twice per action. The
  state would be right and the persistence would be doubled.
- **A functional updater plus persistence in `useEffect` on `stored`.** Pure, and
  it changes behaviour: an effect on mount writes the initial value, so a
  first-time visitor who has changed nothing gets defaults persisted, and a
  Storybook story that seeds `initial` writes that seed into real storage. The
  provider currently writes only when a setter runs, and that is worth keeping.
- **Testing a extracted merge function instead of the provider.** AGENTS.md
  forbids it in as many words: test the thing in front of you, not a thing like
  it. The bug lives in what the setters close over, and a pure merge helper has
  no closures.

## Files

- `apps/web/src/core/preferences/PreferencesProvider.tsx`, the fix.
- `apps/web/src/core/preferences/PreferencesProvider.test.tsx`, rewrite the
  assertion that encodes the bug, and add the batched case.
- `apps/web/src/core/preferences/PreferencesProvider.stories.tsx`, new. The
  Storybook glob is `../src/**/*.stories.@(ts|tsx)` so the location works, and
  `vitest.config.ts` excludes `src/**/*.stories.tsx` from coverage, so the probe
  component belongs INSIDE the story file. In its own `.tsx` it would be
  production source and owe 100 percent coverage, which is a test helper
  dragging the coverage rule behind it.
  Documentation is lighter than the plan check implied: this repository has no
  `.mdx`, autodocs comes from JSDoc on `meta`, and AGENTS.md requires prose in
  code files to be English. So "both languages" means Persian and English story
  variants with `globals`, the way `App.stories.tsx` does it, not translated
  prose.
- `agent/scripts/verify/KN-112.mjs`, the verifier.

## What I expect to be hard, and what I am unsure about

- **Proving "in the state" at all.** There is no `@testing-library/react` here
  and the global npmrc has `min-release-age=7`, so adding one is not a casual
  step. The node project is `environment: node`, so `react-dom/client` has
  nothing to mount into. That leaves a story in the browser project, and I am
  not certain a provider with no visual surface belongs in the story catalog.
- **What "in the same batch" means for the proof.** React batches inside event
  handlers. The existing test calls the setters after `renderToString` has
  returned, which is not a batch at all, and yet it exhibits the bug, because the
  hazard is really "two calls before the next render". A play function clicking
  one real control cannot call two setters at once, so the story probably needs a
  probe component with a button whose handler calls both.
- **Whether the ref is the right instrument.** It is a second source of truth
  next to the state, and they can only drift if something other than `update`
  sets `stored`, which nothing does today. I asked the plan check about
  StrictMode and concurrent rendering and it did not answer, so this is my own
  reasoning and it is recorded as mine: StrictMode double-invokes render
  functions, state updaters and effects, and an event handler is none of those,
  so `update` runs once per action. Tearing between a ref and state needs a
  render that gets discarded or replayed, which happens to transitions and
  suspended trees; this is a plain synchronous update from a handler and is
  committed. `useSyncExternalStore` over `storage.ts` is the fuller answer,
  since these preferences genuinely live outside React, and it is a different
  and larger task than the one on this card.

## Corrected by the plan check

- **The setters do NOT become stable.** An earlier draft of this plan said the
  ref makes them permanently identical and worried about a consumer keying an
  effect on setter identity. That was wrong: `contextValue` is a `useMemo` over
  `[locale, colorScheme, update]`, so the whole value, closures included, is
  rebuilt whenever a preference changes, exactly as before. Nothing about
  consumer identity changes, and there is no work here.
- **A new story owes documentation in both languages.** AGENTS.md requires the
  Docs page to read correctly in fa-IR and en-US, description, Controls table
  and story headings. Adding a provider story means adding that too, so either
  it is in the budget or the probe goes somewhere already documented. Naming it
  here so it is not discovered at the gate.
- **The batch has to be a real event handler.** Two calls made after
  `renderToString` returns are not a React batch, and proving the easy case
  while describing it as the hard one is the specific failure to avoid. The
  story's probe gets ONE button whose handler calls both setters.

## How I will know it worked

`node agent/scripts/verify/KN-112.mjs` passes; the batched node test and the
story both fail when the closure-based setters are restored, each with its own
message; the full web gate stays green.
