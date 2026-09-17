# KN-407 · The Docs page hook and its channel are still checked by hand

Child of KN-007, from the KN-203 roast, which rated it major.

**Why**, from the board: the path that decides the language of every Docs page is the one path no automated test touches,
and the argument for that in the config is not true of this repository.

**Exit**, from the board: `useDocsLocale` is rendered in a test against a `DocsContext` and a channel the test makes: it
reads the toolbar from the context, follows a `globalsUpdated` event, stops listening when it unmounts, and reports not
known when the context yields nothing; the file leaves the coverage exclusion list, **or the exclusion names what is
left in it and why**.

## 1. The card's premise is half right, and the half that is wrong decides the card

The premise: `AppProviders.test.tsx` and `PreferencesProvider.test.tsx` already render React in the unit project, so "a
Docs page cannot be a story" is a thinner reason than it looks. That much is true.

What it misses is WHAT those tests can reach. There are FOUR React tests in the unit project, enumerated with
`git ls-files` over every `.test.tsx` rather than sampled: `AppProviders`, `AuthProvider`, `PreferencesProvider` and
`RecordsProvider`. **All four use `renderToString` from `react-dom/server` and nothing else**: no `createRoot`, no
`hydrateRoot`, no `@testing-library/react`. An earlier draft of this plan said three and called `RecordsProvider` the
only other one, which was false; correcting it makes the conclusion FIRMER rather than weaker, since it now rests on
the complete set instead of a sample. Server rendering runs the render pass and
**never runs `useEffect`**. The unit project is `environment: 'node'`, and this repository has no `jsdom`, no
`happy-dom` and no `@testing-library/react` installed, in `apps/web` or at the root; the only DOM here is the real
Chromium the storybook project drives.

**One thing resolves that looks like a counter-example, so it is named rather than left to be found.**
`@testing-library/dom` DOES resolve from `apps/web`, transitively, declared in no `package.json` of this repository. It
does not change the answer: it supplies DOM QUERIES, not a DOM ENVIRONMENT, and a query still needs a `document` to run
against, which `environment: 'node'` does not provide. Installing an environment is a different act, and downloading
anything needs the owner's say so.

So of the exit's four clauses, the node side can reach exactly one and a half: the `useState` initialiser, both arms,
which is "reads the toolbar" and "reports not known". It cannot reach `channel.on`, the `onUpdate` callback, or the
`channel.off` cleanup, which are the other two clauses and the only lines that are actually wiring.

## 2. Three constraints, measured rather than assumed

**The threshold is 100 on all four metrics.** `vitest.config.ts` sets
`thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 }`. So taking a file out of `exclude` while
any branch of it is unreachable does not leave a gap in a report; it fails the whole run.

**KN-103 discards story coverage for a file the node project also touches.** Its own words: for a file both touch, the
unit numbers win and the browser ones are lost. It is `critical`, `backlog`, and in OKR-2. So a node test on this file
would DESTROY a story side cover rather than add to it. Today no node test imports `useDocsLocale`, checked: only
`DocsPage.tsx` does, at lines 4 and 47.

**A fake `DocsContext` is not three members, it is two large internal types.** `DocsContextProps` has 13 members and 12
are REQUIRED; the hook uses three. Nine of the rest take a throwing stub, which type checks because a throwing body
satisfies any return type, and `resolveOf` is generic but throws too. The two that cannot be stubbed are the two the
hook calls: `storyById` must return a `PreparedStory<TRenderer>` and `getStoryContext` must return an
`Omit<StoryContext<TRenderer>, 'abortSignal' | 'canvasElement' | 'step' | 'context'>`. Returning a bare
`{ userGlobals }` does not type check, and `AGENTS.md` forbids `as` to force a mismatch, `@ts-ignore` and `any`, so
there is no shortcut. The context also has no spreadable default: `blocks.js` line 4307 creates it as
`createContext(null)` on `globalThis.__DOCS_CONTEXT__`, so the declared non-nullable type is already a fiction about a
runtime `null`.

One consolation, and it is the only free clause: `localeInContext` wraps its two calls in try/catch, so a THROWING
`storyById` is exactly the "reports not known" path.

## 3. The decision, and it takes the exit's second branch

**Correct the exclusion's reason and say what is left, rather than building the fake.** The trade is a fake of two
large Storybook internals, which rots on every upgrade, against covering three lines of wiring whose every decision is
already extracted into `docs-locale.ts` and fully tested there, deliberately, by KN-203. `AGENTS.md` and
`agent/RALPH.md` both say to verify from source rather than memory, and the source here says the fake is the expensive
half of a bad bargain.

**The card's actual grievance is fixable and gets fixed.** It says the config's argument "is not true of this
repository", and it is right: the comment says a Docs page cannot be rendered as a story, which is true, but implies
the unit project cannot reach these files, which is not why they are excluded. The real reasons are the three measured
above. The comment will say them.

The exclusion also cannot simply be emptied of one file: `DocsPage.tsx` imports the hook at line 4 and calls it at 47,
so whatever is said has to be true of both.

**THE UNTRUE REASON IS RECORDED IN THREE LIVE PLACES, not one, and correcting one of them would be this session's own
recurring failure.** Searched rather than assumed:

| file                                              | line  | what it says                                                    |
| ------------------------------------------------- | ----- | --------------------------------------------------------------- |
| `apps/web/vitest.config.ts`                       | 74-82 | the exclusion comment itself, and the file's only em dash at 78 |
| `apps/web/src/shared/story-docs/useDocsLocale.ts` | 32-36 | "Excluded from coverage, with `DocsPage`, because…"             |
| `apps/web/src/shared/story-docs/docs-locale.ts`   | 8     | "so the hook itself is excluded from coverage"                  |

The third is the one most easily missed and the least excusable to miss: `docs-locale.ts` is the file that IS tested,
and its own header explains the hook's exclusion in the present tense. All three get the same corrected reason, because
KN-701, KN-708 and KN-711 each shipped a fix to the named clause while an identical claim sat a few lines away.

**The KN-203 plan is NOT corrected**, and that is deliberate. `#KN-203 …md` line 49 carries the same sentence, but a
plan is the record of what a card decided when it decided it, and KN-203's reasoning was sound for what it knew. RALPH
says a plan is corrected when it reads as stale beside the code; this one reads as history, which is what it is.

## 4. What must not change

- **The LOGIC of `useDocsLocale.ts`, `docs-locale.ts` and `DocsPage.tsx`.** Not one statement is reshaped to serve a
  test. The decision logic was already extracted once, by KN-203, and extracting the effect too would be changing the
  product to suit the measurement. Their COMMENTS do change, in two of the three, which section 3 lists: an earlier
  draft of this bullet said the files themselves must not change, contradicting that list, since a comment correction
  is the entire work of this card.
- **The 100 thresholds.** Lowering them to fit is the thing `vitest.config.ts`'s own header warns about: "lowering it
  to fit code that was written without a test is how a 100 percent target quietly becomes 60."
- **KN-103 stays open and is not solved here.** This card records that it is the blocker for the story route, and
  nothing more.

## 5. The proof

Reading, since the change is three comments: the exclusion names, for each of the two excluded files, what is left in
them and why it cannot be reached, and every clause is checkable against the repository. **An earlier draft of this
section said "a comment in a config" and promised drift on `vitest.config.ts` alone**, which was written before the
search found the untrue reason in three files. The proof reads all three.

`tsc --noEmit` and `eslint --max-warnings 0` clean, Prettier drift at or below baseline on `vitest.config.ts`,
`useDocsLocale.ts` and `docs-locale.ts`, each measured 0 before the edit. The single em dash in this repository's
`vitest.config.ts`, at line 78, leaves with the sentence that held it, 1 to 0, and none is added anywhere; that file is
a `.ts` so section 4's rule never reached it, which is why it survived this long.

**Coverage is unaffected BY CONSTRUCTION, not by a run.** The exclusion list's membership does not change: the same two
files are excluded before and after, and only the comment above them differs. That is a stronger claim than "the suite
still passes", and it needs no regression batch, which the owner retired on 2026-09-11. An earlier draft of this
section said the suite still passes its thresholds, which would have meant running a full coverage pass to learn
something the diff already guarantees.

## 6. What the review ruled

**The branch is approved**, and question 2 got no fourth route, which is the answer I wanted checked rather than the
one I wanted. The ruling sets six things the replacement comment must name: both excluded files, the SSR and no effect
limitation, the Storybook story limitation, KN-103, and KN-408 as the remaining uncovered behaviour. All six are in it.

**Its sharpest point, and the card's real grievance**: do not treat manual browser verification as equivalent to
automated channel coverage. The old comment did exactly that, ending on "the wiring is checked by opening Storybook and
switching the Language toolbar, which is gate steps 5 to 7". That citation is accurate, steps 5 to 7 are actually run
it, check all four combinations and read the Docs page in both languages, so the fault was never the citation. It was
the implication. The new comment keeps the citation and says plainly that it is a LOOK rather than coverage, catching a
page that stopped following the toolbar and nothing finer.

**Question 3 answered yes, and it is done rather than noted**: this is a one point documentation correction, not a two
point testing task, so the card is re-estimated on the board rather than quietly costing less than it claimed. Severity
is left alone, because only the size was in question.

**KN-408 was checked before it was cited.** The review named it twice and I had never read it. It is real, `low` and in
the backlog, and its second half is precisely this hook's uncovered branch: once a locale has been read, `known` never
returns to false, so an event yielding no locale leaves the page in the last language with nothing said. Writing a card
id into permanent source on a reviewer's word alone would have been citing an authority I had not read.
