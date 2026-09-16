# KN-700 · The shell still parses the path itself, and it disagrees with the router

From KN-698's roast. The card that took a routing library left one piece of hand-rolled routing behind, in the one place
the card did not look, and it contradicts the library beside it.

## 1. What is wrong, exactly

`App.tsx` lines 79 and 80:

```tsx
const asked = pathname.replace(/^\//, '').split('/')[0] ?? ''
const current: Destination = asked === 'add' || asked === 'network' ? asked : 'jobs'
```

A react-router `<Route path="/network">` matches the **whole remaining pathname**, not a prefix, unless its path ends in a
wildcard. So at `/network/anything`:

- the hand-split says `network`, so the navigation marks **Network** current;
- the router matches no destination route, so `<Route path="*">` renders the **board**.

The reader sees the jobs board with the network tab lit. **It is reachable**: GitHub Pages answers an unknown path with
`404.html`, which is the app, and the app then draws exactly that state — `addresses.spec.ts` already proves the 404 half
for `/nowhere`.

**There is a SECOND disagreement, in the opposite direction**, found by probing the installed matcher rather than by
reading about it: `matchPath('/network', '/NETWORK')` **matches**. React-router's matching is case-insensitive and
`asked === 'network'` is not, so at `/NETWORK` the router renders the **network page** while the split says jobs and lights
the **jobs** tab — the mirror image of the case this card was filed for. Reachable the same way, since Pages finds no
`NETWORK.html` and serves `404.html`, which is the app. **Taking `current` from the router fixes both at once**, which is
the whole point of asking the same source the page comes from.

**Nothing tests it.** The only deep path in the suite is `/nowhere`, and only at the HTTP level, never inside the app.

## 2. What the product should show there, and why

**The board, with the jobs tab.** Not a network page. There is no page under `/network`: `DESIGN.md` names three
destinations and no sub-pages, and an unknown address already falls back to the board by the wildcard route. So the fix is
**not** to teach `/network/anything` to be the network page; it is to stop the tab disagreeing with the page.

This is a small decision and it is recorded here rather than put to the owner: it changes nothing a reader can reach today
except the lit tab on an address that already shows the wrong thing.

## 3. The fix

Delete `asked`, and take `current` from the router's own match, against the same `PATH` values the `<Route>`s use:

```tsx
const current: Destination = useMatch(PATH.network) ? 'network' : useMatch(PATH.add) ? 'add' : 'jobs'
```

Three unconditional hook calls, so no rule of hooks problem, and **the tab cannot disagree with the page by construction**:
both sides now ask react-router the same question about the same paths.

`useMatch`, `useMatches`, `matchPath` and `useResolvedPath` are all present in react-router 7.18.3, checked by importing
the module rather than grepping its barrel.

**A second gain, measured**: line 79's `?? ''` is one of `App.tsx`'s two remaining uncovered branches, 79 and 146, and it
goes away with `asked`.

## 4. What must not change

- **Line 110's add→jobs mapping.** The add flow is a modal over the board and the board stays the current page beneath it,
  KN-481, and `App.stories.tsx`'s `Navigating` asserts exactly that while the dialog is open. A router-derived `current` of
  `add` still maps to `jobs` there, so the assertion holds.
- **Line 140's `overflowY: current === 'network' ? 'auto' : 'hidden'`.**
- **KN-697's guard**, `if (pathname !== PATH[destination])`, which compares the PATH rather than `current`, so it is
  untouched by this and still canonicalises a mistyped address when the nearest page is pressed.
- **`SidebarProps.current` is a required `Destination`**, so whatever produces it must still produce that union.

## 5. The proof, and the control

A test in `apps/web/e2e/addresses.spec.ts`, both projects: open `/network/anything` and assert that the heading is the
board's **and** the navigation's `aria-current` is on the board's item — the two agreeing is the whole claim, so the test
asserts them together rather than either alone.

`NavItem.tsx` draws `aria-current={active ? CURRENT : undefined}`, so the lit tab is readable from the accessibility tree,
which is how `Navigating` already reads it.

**Cover `/NETWORK` in the same test**, since it is the same class in the opposite direction: there the router draws the
network page and the split lights jobs, so asserting heading and tab together catches it too.

**The control, in the order the review insisted on**: run the new assertion against the **unmodified** split FIRST, keep
the failing output, and only then apply the replacement and run both Playwright projects. That proves the control rather
than proving the fix and assuming the control. The review named this the most failure-prone step of the card.

## 6. What the review settled

**Approved, with one correction to the rationale, and it checked the cases against the installed matcher rather than the
prose.**

**`useMatches` is not an alternative at all**, which is the correction: it is documented as data-router-only, and this app
uses declarative `<BrowserRouter>` with `<Routes>`. So the choice is not "three `useMatch` calls versus one `useMatches`";
`useMatch` is the supported active-state API here. The three calls are unconditional and do not cause three renders —
`Shell` re-renders once when the router's location changes.

**The cases agree**, confirmed against react-router 7.18.3: `/network` and `/network/` give the network route and network
current; `/network/anything`, `/` and `//network` give the wildcard board with jobs current; `/add?q=x` gives the add
route with the intentional add→jobs mapping beneath its modal. **Query strings do not affect `useMatch`**, so
`/network/anything?q=x` becomes the board with its existing `q` search applied and the jobs tab selected, and **no KN-697
behaviour changes**.

**The consumers are exactly two**, as section 4 says: the navigation prop, through which the desktop Sidebar and the
mobile TabBar both read it, and the main content's `overflowY`. There is no third.

**The fallback decision is right.** `DESIGN.md` specifies three destinations and calls Network a standalone page, and
`App.tsx` already sends every unrecognised path to the board deliberately. **Do not add `/network/*`** unless the product
later gains network sub-pages — and if it ever does, the `<Route>` and the match condition must change **together**, or
this class of disagreement comes straight back.

**`routes.ts` needs no functional change**: it already owns the `PATH` values, and it belongs in this card's diff only if
its explanatory text needs correcting.
