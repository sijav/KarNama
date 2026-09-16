# KN-697 · The search never reaches the address

The owner, 2026-09-16: _"When user write something on search after denounce url changes along with search results and what
not, does that make sense? I mean how hard could it be to do like this"_. Yes, it makes sense, and this is how.

**Reviewed once by Codex, and what it corrected is in section 10.** Four things in the first draft were wrong, one of them
a contradiction between two requirements I had written as though both could hold.

## 1. The card's description is stale, and this replaces it

The card was filed before KN-698 and describes `destinationIn`, `addressOf`, a hand-written `navigate()` and a `popstate`
listener. **All four are gone.** Do not build from the card's description; build from this.

## 2. What happens today, read from the code

- `App.tsx` renders `<BrowserRouter basename={BASE}>`, and `Shell` reads `useLocation()` and writes with `useNavigate()`.
  `routes.ts` exports `PATH`, the path of each destination.
- The navigation writes `PATH[destination]` **and nothing else**, and it is guarded: `if (pathname !== PATH[destination])`,
  so pressing the page already shown navigates nowhere, KN-698.
- **`onAddClose` is NOT guarded**: it calls `navigate(PATH.jobs)`, which pushes. So closing the add flow leaves `/add` in
  history and Back reopens the modal. **That is KN-579 and this card does not fix it**, section 7; this card only makes
  that line carry the query.
- Both screens keep the two values KN-695 built: `typedSearch`, following every key through `onChange`, and
  `appliedSearch`, which the bar hands over through `onSearch` once typing pauses for `DEBOUNCE_MS`, 300.
- **Each screen reads the search text in exactly TWO places**, counted rather than claimed: the filter
  (`JobsScreen.tsx:172`, `NetworkScreen.tsx:84`) and the field (`:374`, `:180`). So this is a substitution, not a sweep.
- Nothing ever writes a query. A searched board cannot be shared, bookmarked, or survive a reload.

## 3. The constraint that decides the shape

**Only `src/app/` imports react-router.** The screens render in exactly three places: `App.tsx`, inside the router, and the
two story metas, which render `<JobsScreen {...args} />` and `<NetworkScreen />` **bare**. No test renders either.

1. **Props from the shell.** Viable, and one argument I gave against it was false: I wrote that a story passing no
   `onSearch` would force an uncontrolled fallback only stories exercise. **It would not** — `JobsScreen`'s meta already
   supplies `onSelecting`, `onSignOut`, `onAddClose` and `onExtract` through story args, and `onSearch` would go the same
   way. The real cost is smaller but real: `JobsScreen.stories.tsx` sets `component: JobsScreen`, so `guard.test.ts`
   checks documented props against `react-docgen` **in both directions and in both languages**, and two new props mean
   four entries across `story-docs/en` and `story-docs/fa` that must then be kept true, plus the plumbing through `Shell`.
2. **The screens read the address themselves**, with `useSearchParams`, and the two screen metas gain a `MemoryRouter`
   decorator. No new props, no documentation to keep true. The screens already require `AppProviders` and
   `RecordsProvider` through decorators; a router is the same kind of dependency, and `MemoryRouter` is react-router's own
   answer for a routed component rendered outside a browser.

**Take 2**, for simplicity rather than for the false reason above, and because the owner's standing rule is not to
hand-roll what the ecosystem already solves.

**The decorator goes on the two screen metas, never the global one** in `.storybook/preview.tsx`: `App.stories.tsx`
renders `<App />`, which builds its own `BrowserRouter`, and react-router refuses a router nested inside a router.

**Verified by importing the module rather than grepping its barrel**, which is KN-698's lesson: `useSearchParams`,
`MemoryRouter`, `BrowserRouter`, `useLocation`, `useNavigate`, `Routes` and `Route` are all present in react-router 7.18.3.

## 4. The design

In each screen, replacing the `appliedSearch` state and nothing else:

```tsx
const [params, setParams] = useSearchParams()
const search = params.get(QUERY) ?? ''
```

- **The filter reads `search`.** That is one of the two reads; `appliedSearch` disappears.
- **The field keeps `typedSearch`**, local, because the address changes only after the pause and a field driven by the
  address would lag a pause behind every key.
- **`QUERY` is one exported constant**, not a literal at each site, for the same reason `PATH` is: an address token is not
  copy, and a literal typed as a union of string literals is what `useTsTypes` skips, KN-698 and KN-095.
- **An empty search deletes the parameter** rather than writing `?q=`, so a cleared board has a clean address.

**No loop is possible**, and the review checked this against `SearchBar.tsx` rather than taking my word: the bar marks each
attempt judged **before** comparing the text, so a `value` changed from outside cancels a pending search and starts
nothing. Only an unjudged reader attempt can create one. Writing the address from `onSearch` cannot feed itself.

**Following the address into the field** — Back, or a shared link — is done by adjusting during render: keep `shownFor`
beside `typed` and, when `search !== shownFor`, set both. **KN-134 does not forbid this**, checked rather than assumed:
KN-134 was `ThemedTree` updating `I18nProvider`'s state, **another component's**, during its render, which React warns
about by name. A component setting its OWN state during its own render is the documented pattern, React retries before
committing children so there is no stale frame, and `.storybook/react-warnings.setup.ts` is a `setupFiles` entry of
**both** vitest projects, `vitest.config.ts` lines 96 and 117, so a warning would fail a test either way. The review also
rejected the alternative I asked about: a keyed, remounted bar would lose focus and the selection for nothing.

## 5. The history policy, which is the part most likely to be got wrong

**The first draft said "replace always", and that cannot meet the card's own Back requirement.** If every settled search
replaces, `/jobs` is replaced by `/jobs?q=…`, the unsearched board is no longer in history at all, and Back leaves the
board rather than returning to it. The card asks for both "Back returns the board as it was" and an address "REPLACED
while typing" — and the second says _while typing_, which is about refinements, not about the first search.

**So a step for starting a search, a step for ending one, and replacement for everything in between:**

| from      | to        | history    |
| --------- | --------- | ---------- |
| no search | searching | PUSH       |
| searching | refined   | REPLACE    |
| searching | cleared   | PUSH       |
| unchanged | unchanged | do nothing |

```tsx
const onSearch = (text: string) => {
  if (text === search) return
  const next = new URLSearchParams(params)
  if (text === '') next.delete(QUERY)
  else next.set(QUERY, text)
  setParams(next, { replace: search !== '' && text !== '' })
}
```

- **The `text === search` guard matters**: typing a letter and deleting it before the pause settles reaches `onSearch('')`
  from an unsearched board, and without the guard that pushes a duplicate entry for no change.
- **Clearing pushes rather than replaces**, which is my extension of the review's rule and the one part of this table it
  did not rule on. Replacing on clear would leave two identical adjacent `/jobs` entries, so Back would appear to do
  nothing — exactly the defect KN-698 just fixed for the navigation. Pushing makes Back undo the clear. **Round two
  confirmed it**: `/jobs → /jobs?q=first → /jobs`, where Back restores `?q=first`, which is the expected undo of clearing
  and does not conflict with refinement.

## 6. Changing page drops the search

**Already true** — the navigation writes `PATH[destination]` and nothing else — so this half is an assertion to add rather
than code to write. It must still be asserted, or the day somebody carries the query along, nothing notices.

**Pressing the page you are already on keeps your search**, because KN-698's guard navigates nowhere. That is right.

## 7. The add flow carries the query, and its close stops pushing

**The add flow is BOTH a destination and a modal over the board, and the first draft had this wrong.** Read in `DESIGN.md`
rather than carried over from STATE.md: the three destinations, owner-confirmed at lines 1020 to 1025, ARE the board,
**افزودن فرصت شغلی**, and the contacts page — so the add flow **is** a destination. What line 1017 calls "**not** a
destination and **not** a page: it opens as a modal from inside the board" is the JOB DETAIL. Separately, line 791: _"The
add flow is a modal over the board, so while it is open the board stays the current page in both."_ Both hold at once,
which is what the code draws.

**Carry `q` through the add flow, open and close.** Dropping it makes Cancel lose the reader's board, with that board
visible behind the overlay the whole time. So `/jobs?q=…` opens `/add?q=…`, and closing returns to `/jobs?q=…`.

**But the close goes on PUSHING, and round two is why.** The first draft had it replace, claiming that also fixed the
Back-reopens-the-modal behaviour of section 2. **It does not.** Replacing turns the stack `/jobs → /add` into
`/jobs → /jobs`: two identical adjacent entries, so Back lands on the earlier board and visibly does nothing — the exact
experience section 5 avoids. A correct close depends on how `/add` was reached, directly or from either page, which is a
design with four paths to prove, not a line to fold in here.

**KN-579 owns it**, verified on the board rather than taken from the review: _"Closing the add flow pushes /jobs over /add,
so Back reopens the flow it closed"_, medium, 2 points, from KN-505's roast. Its exit already asks for `addresses.spec.ts`
over Cancel, Escape and Save, opened from the navigation and opened at `/add` directly, on both viewports — which is
precisely the coverage folding it in would have needed. **This card leaves the close exactly as it is, except that it
carries the query**, so it makes nothing worse and KN-579 is unblocked rather than half-done.

**Every other destination change still discards `q`.**

## 8. Where the proof lives

**A correction made before the review answered, and the review found it independently.** This section first said
`addresses.spec.ts` cannot host a clocked test because its `beforeEach` navigates. **It does not navigate.**
`signedIn(page)` only calls `page.addInitScript`, and each test there calls its own `page.goto`. **Of the three specs that
drive a seeded board, `addresses.spec.ts` is the only one whose `beforeEach` does not navigate**: `board.spec.ts` seeds
with `prepareBoard`, which drives the real add flow, and `network.spec.ts` calls `page.goto('/network')` outright. KN-695
recorded the trap against `board.spec.ts` and I carried it to a file I had not opened — the mistake STATE.md already
records against this very file.

So the split is a choice, not a constraint, and the reason is that one file should own held time:

- **`search-waits.spec.ts`** takes anything needing the pause: after the last key the address is UNCHANGED, still unchanged
  a tick before the pause completes, and carries `?q=` on the tick that completes it.
- **`addresses.spec.ts`** takes everything reachable by navigating: opening `/jobs?q=…` restores the field and the narrowed
  board; Back after a search returns the unsearched board; opening another destination leaves the search behind; the add
  flow keeps it and its close adds no entry.

**The history assertion measures the DELTA from the pre-search length, never an absolute**, on the review's direction: one
new entry for beginning a search, none for the refinements after it.

**Both must fail against the current wiring, proved by running them**, not asserted.

## 9. What could go wrong

- **The 39 screen stories**, 27 on the board and 12 on the contacts page, every one rendering a screen bare. The decorator
  must land before the hook, or the whole file fails at once. Add it first, run the two files, then change the screens.
- **Coverage is 100 percent.** The `delete`-versus-`set` arms, the `text === search` guard and the restore path each need
  a story, or the e2e alone leaves arms uncovered; the unit project is what measures it.
- **The unit project is already red**, 1953 of 1958 over 96 files: two are KN-551's `session.test.ts` pair and three are
  KN-699's storybook failures, which move between identical runs. Measured twice on this tree before this card starts, so
  the evidence compares like with like rather than inheriting somebody else's noise.
- **KN-700 is open and adjacent**: `Shell` still splits `pathname` by hand to decide which destination is current, and
  disagrees with the router at `/network/anything`. This card does not depend on it, but both touch the same few lines.
- **Cover the new arms inside EXISTING documented stories, not new exports.** A new story export needs an entry in both
  `story-docs/en` and `story-docs/fa` or `guard.test.ts` fails. Both screens already drive the search, so there are
  stories to extend rather than add: the board at `JobsScreen.stories.tsx` lines 274, 833 and 922
  (`SelectingWhileSearching`, `ActingWhileSearching`), the contacts page at `NetworkScreen.stories.tsx` lines 103, 310,
  364 and 375 (`ItsOwnSearch`, `ItsOwnSearchInEnglish`).
- **The thresholds are all four at 100**, `statements`, `branches`, `functions`, `lines`, and the screens are not among
  the exclusions — only `*.stories.tsx`, `main.tsx`, `*.d.ts`, `gate-fixtures`, and the two docs-page files. **Branches is
  what bites**: `text === search`, `delete` versus `set`, both arms of `replace: search !== '' && text !== ''`,
  `search !== shownFor`, and the `?? ''` on `params.get` are each an arm to reach.
- **The `onAddClose` change needs story coverage of its own**, since e2e proves behaviour but does not feed source
  coverage. `App.stories.tsx`'s `Navigating` already opens the add flow and clicks «انصراف», so it is where the query
  assertion goes.
- **The decorator throws rather than warning if it lands late**, checked in the installed package: react-router carries
  the invariant _"may be used only in the context of a `<Router>` component"_. So a missing decorator fails loudly, which
  is why it goes first.

## 10. What the review corrected

1. **The history contradiction**, section 5. All-`replace` and "Back returns the board" cannot both hold.
2. **My props argument was false**, section 3: stories supply callbacks through args, so no story-only fallback is forced.
3. **`signedIn` does not navigate**, section 8 — which I had already found, and it agreed.
4. **Carry `q` through `/add`**, section 7, plus the close-pushes defect it noticed while answering.

**Confirmed rather than changed**: the `useSearchParams` and `MemoryRouter` shape; the render-time field sync, with the
keyed alternative rejected; the no-loop claim, checked against `SearchBar.tsx`; one shared `q`, because the screens are
never mounted together; and that copying `params` before changing it is right, since the returned object is stable but
mutable.

### Round two

1. **`replace` on the add flow's close does NOT fix the close**, section 7. It trades Back-reopens-the-modal for
   Back-does-nothing, and the close-history design belongs to KN-579 with its four paths.
2. **A new story export costs an entry in both documentation languages**, section 9, so the new arms are covered inside
   existing documented stories.
3. **`onAddClose` needs story coverage**, section 9: e2e does not feed source coverage.

**Confirmed in round two**: section 5's table meets both requirements, the `text === search` guard stops the stray push,
**clearing pushes** is right, `useSearchParams` takes a copied `URLSearchParams` and its setter takes `NavigateOptions`,
`MemoryRouter` suits the bare stories, and the render-time sync stands. In its words, that part "is not overbuilt".

## 11. What is still open

**Nothing is open.** Both rounds are judged and folded in; the one question I carried into round two, whether clearing
pushes, came back confirmed. **No third round**: round two named two options for the add flow and this takes the first
one it listed, which is executing its instruction rather than making a new design — and the board already records the
owner's correction about spending three rounds on a three-point card.
