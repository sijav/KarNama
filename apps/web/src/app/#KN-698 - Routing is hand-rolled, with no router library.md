# KN-698 · Routing is hand-rolled: no router library, just pushState and path-splitting in the shell

high, 3 points, web, OKR-1. Filed 2026-09-16 on the owner's instruction.

## The card, quoted

**Why.** "The owner asked for it, and the reason stands on its own: hand-rolled routing is a solved
problem re-solved, and the next thing on top of it was going to be a hand-rolled query string for
KN-697. Every page-address behaviour a reader expects, Back and forward, a shared link, a reload
landing where it should, is behaviour a router already has and this code has to grow one case at a
time, each with its own test and its own way of being wrong."

**Exit.** "A routing library owns the addresses: the three destinations are its routes, Back and
forward are its business, and the base is given to it rather than parsed by hand. `src/app/routes.ts`
is gone or reduced to what the router cannot do, with its tests moved or deleted alongside. The
version choice is recorded with its reason, naming which of the two routes was taken and why, rather
than pinning older silently. A deep link to each destination still answers 200 from the built site,
which is what KN-505 established and what GitHub Pages needs the `.html` files for, and the existing
e2e `addresses.spec.ts` still passes unchanged, since what a reader can do with an address must not
change."

## What exists now, read from the code

- `src/app/routes.ts`: `destinationIn(pathname, base)`, the first segment under the base or `jobs`;
  `addressOf(destination, base)`, `${base}${destination}`; `pathForHash(hash, base)`, which migrates an
  address from when the page lived in the hash and **keeps any query it carried**; and
  `siteBase(configured, href)`, which resolves a relative base against the page.
- `src/app/App.tsx`: `BASE` from `siteBase`, `addressed()` replacing an old hash address once on first
  render, a `popstate` listener setting state from the path, and `navigate()` calling
  `history.pushState` unless the path is already current.
- Consumers: `App.tsx`, `routes.test.ts`, `App.stories.tsx`.

**KN-042 put the page in the hash. KN-505 moved it to paths.** Both were hand-rolled, and each cost a
card. That is the pattern the owner is objecting to.

## What the router has to live with, and neither of these is optional

- **GitHub Pages has no rewrites.** The build writes `jobs.html`, `add.html`, `network.html` and
  `404.html` beside `index.html`, so each destination answers 200 at its own path; anything else
  answers 404 with the app. Measured on the live site for KN-505. A router that assumes a rewriting
  server will look fine locally and break on Pages, which is exactly the failure KN-505 records.
- **The base is not a constant.** The app builds with `/KarNama/` or `/`, and Storybook's builder sets
  `base: './'` unless `KARNAMA_STORYBOOK_BASE` names one, so `siteBase` resolves it against the page.
  The router's basename must be given the same way, not hardcoded and not read from `import.meta.env`
  alone.
- **The stories drive the address directly.** `App.stories.tsx` calls `pushState` and `replaceState`
  itself and asserts `window.location.pathname`, and it puts the address back afterwards. Those
  stories are the shell's only proof and they must keep working, or be rewritten deliberately rather
  than by accident.
- **`addresses.spec.ts` must pass unchanged.** What a reader can do with an address is the contract;
  the implementation underneath is what this card changes.

## The version choice, which the exit says to record rather than pin silently

Checked with `npm view`, not remembered:

|              | version    | react peer | works today                        |
| ------------ | ---------- | ---------- | ---------------------------------- |
| react-router | **8.4.0**  | `>=19.2.7` | **no**, the app is on react 19.0.8 |
| react-router | **7.18.4** | `>=18`     | **yes**, nothing else changes      |

**Nothing in the toolchain blocks a react bump**: MUI 9.4.0 takes `^17 \|\| ^18 \|\| ^19`,
`@storybook/react-vite` 10.5.10 takes `^16.8 \|\| ^17 \|\| ^18 \|\| ^19`, and
`@vitejs/plugin-react-swc` constrains only vite. Latest react is 19.3.0.

## The version is 7.18.3, and it is decided by four facts rather than a preference

**Not 7.18.4, which this plan and the review both named.** Checked afterwards, and it changes the
answer:

1. **React peer.** 8.4.0 needs react `>=19.2.7`; the app is on **19.0.8**.
2. **Node floor.** 8.4.0 needs node `>=22.22`; this repo's root `package.json` declares
   `{"node": ">=22.12.0"}`, confirmed by reading it. Taking v8 would mean raising the engine floor
   too, or shipping a package contract that is false. This machine runs node 24, which is exactly how
   such a thing goes unnoticed.
3. **`min-release-age`, and this one decides it alone.** The owner keeps seven days in their global
   npmrc, deliberate supply-chain protection, never to be overridden. **8.4.0 was published
   2026-09-15, 1.2 days ago**, so npm refuses it outright regardless of react or node.
4. **And the same rule rules out 7.18.4**, published the same day, also 1.2 days old. **7.18.3,
   published 2026-08-28 and 19.2 days old, is the newest 7.x that installs**, and its own engines say
   `node >=20`, comfortably inside our floor.

**The range is pinned exactly, not a caret.** `npm install react-router@7.18.3` records `^7.18.3` by
default, and `^7.18.3` admits **7.18.4**, the release `min-release-age` refuses today. The lockfile
holds it at 7.18.3 for us, but the declared range would resolve to a version npm then rejects on a
fresh install elsewhere, which is a package contract that is false in the same way the node floor
would have been. So the dependency is written as `7.18.3`.

So the latest stable is genuinely blocked, on three separate grounds, and this says so rather than
pinning older in silence, which is what the working agreement asks. **The react bump is a card of its
own**, and it now carries the node engine floor with it. Using the current declarative API means a
later move to v8 is a version upgrade rather than a second redesign.

## What changes

- `apps/web/package.json` — the router dependency. **This needs the owner's permission to install**,
  which the instruction to use a routing library gives.
- `src/app/App.tsx` — the shell's routes, Back and forward become the router's. `navigate()`,
  `addressed()` and the `popstate` listener go.
- `src/app/routes.ts` — gone, or reduced to what the router cannot do. `siteBase` is the likely
  survivor, since resolving Storybook's relative base is ours rather than the router's.
- `src/app/routes.test.ts` — moves or goes with what it tests.
- `src/app/App.stories.tsx` — the address-driving stories, rewritten deliberately if the router needs
  them to be.
- This plan.

## What the existing tests already REQUIRE, read rather than assumed

I had cited `addresses.spec.ts` three times without opening it. Opening it turns two of the doubts
below into settled requirements and adds a constraint the plan had missed entirely:

- **`pathForHash` is proved END TO END**, not merely unit-tested: `/#/network?from=shared` must land on
  `/network?from=shared`, query kept. So it is not a nice-to-have that might go; a passing test
  requires it, and the router has to leave room for it.
- **`/add` is a MODAL over the board, not a page.** A reload at `/add` still shows the dialog, and Back
  from `/add` returns to `/network` with the dialog gone. `DESIGN.md` says job detail and adding are
  never pages of their own, and the spec holds that to it. **A router that makes `add` an ordinary
  route would satisfy the address and break the design.** This is the constraint I was closest to
  missing.
- **Every destination serves byte-identical `index.html`.** The Pages-like server in the same spec
  asserts `/jobs`, `/add` and `/network` each answer 200 with text equal to `index.html`, and an
  unknown path answers 404 with the same document. So all routing is client-side over one document,
  and nothing may depend on per-route markup.
- **The navigation writes a path and NO hash**, polled after each click.
- **`App.stories.tsx`'s `Navigating` SPIES ON `window.history.pushState`** and asserts it was not
  called when the reader clicks the page already shown, lines 201 to 204. That is the single most
  brittle assertion in the shell under a router, because a router calls its own history
  implementation rather than the global, so the spy can go quiet for a reason that has nothing to do
  with the behaviour it is guarding. The same story dispatches a synthetic `PopStateEvent` to stand in
  for Back, and asserts the board stays the current page beneath the add dialog while the dialog holds
  the page out of the accessibility tree. **Whatever replaces that spy has to assert the BEHAVIOUR,
  that no history entry is added, rather than that a particular function went uncalled.**

And `routes.test.ts` settles the last doubt: `siteBase` carries four cases, two of them Storybook's,
including the preview _after_ the shell has pushed a page
(`/KarNama/storybook/network` resolves to `/KarNama/storybook/`), while `destinationIn('/iframe.html')`
must fall back to the board. **`siteBase` is ours and survives**; the question is only how its result
reaches the router.

## The review's corrections, taken

**The hash migration must happen BEFORE the router is created, and this is the trap.**
`history.replaceState` emits no `popstate`, so if `pathForHash()` runs inside a child after the router
has read its initial location, `#/network` stays routed as the root and the failure looks like nothing
at all. So **`App` is the router boundary**: resolve `siteBase`, replace a valid legacy hash, and only
then render `<BrowserRouter basename={base}>` around an inner shell. That also keeps Storybook
rendering `<App />` with no new decorator, which matters because the address stories mount the shell
directly.

**The API is the declarative one**: `BrowserRouter`, `Routes`, `Route`, `useLocation`, `useNavigate`,
from `react-router` itself rather than the removed `react-router-dom` compatibility path. Three client
routes and no router data loading is exactly what that mode is for, and using the current API now means
a later v8 move is a version upgrade rather than a second redesign.

**What survives and what goes**: keep `siteBase` and `pathForHash`; delete `destinationIn` and
`addressOf`, which the router replaces. **Keep the Vite plugin** that writes `jobs.html`, `add.html`,
`network.html` and `404.html`, because a router cannot create GitHub Pages' HTTP responses. A wildcard
route renders the existing board fallback **without redirecting** a mistyped address, which is what
keeps the 404 page behaving as it does today.

**The address stories stay conceptually as they are.** An external `pushState` followed by a dispatched
`popstate` is still how a browser-history router observes an address changed from outside, and their
restoration of the original address stays.

**The install needs no separate permission.** The owner's instruction to use a routing library
authorises this dependency change, and the earlier line claiming otherwise is withdrawn.

**The first control run is the unchanged hash end-to-end test**, because the likeliest mistake in this
whole card is putting the legacy-hash conversion after router initialisation, and that test is the one
that catches it.

## What I expect to be hard, and what I am unsure about

- **The hash migration.** `pathForHash` exists so an address shared before KN-505 still opens. A
  router does not do that for us and it is a real behaviour with a real test; it has to survive.
- **Storybook.** The shell's stories run inside a preview iframe whose base is relative and whose
  address the runner also uses. A router that takes over `window.history` may fight the preview, and
  `App.stories.tsx` already records that the preview writes each story's id onto the frame's path.
- **Whether the 404 page still works.** Pages serves `404.html` with the app for an unknown path, and
  the app currently falls back to the board. A router with its own not-found handling could change
  what a reader sees at a mistyped address.
- ~~**Whether `siteBase` survives.**~~ **Answered by its own test**, above: four cases including two
  Storybook ones. It survives; only the way its result is handed to the router is open.
- ~~**The hash migration.**~~ **Answered by `addresses.spec.ts`**, above: it is required end to end,
  so the only question is where it lives once the router owns addresses, not whether to keep it.
- **Keeping `add` a modal while the router owns `/add`.** This is now the thing I am least sure of, and
  it is the one the tests would catch only after the design was already wrong.

## How I will know it worked

- `addresses.spec.ts` passes **unchanged**, which is the exit's own measure.
- The shell's stories pass, and where one had to change, the change is deliberate and said so.
- A production build still writes the per-destination `.html` files and each answers 200, which is
  what Pages needs.
- `tsc --noEmit` and `eslint --max-warnings 0` from `apps/web`, read from their own output lines.
- The unit project, read from its summary line and refused on "skipped" or a zero total.
- Prettier drift unchanged on every file.

## What I am asking the review

1. **7.18.4 now with the react bump as its own card, or bump react and take 8.4.0 in one go?** I lean
   to the first, for one diff and one risk. Argue the other side if it is stronger.
2. Is there a router better suited here than react-router, given there is no server, no data loading
   through the router, three static destinations and a modal that must not become a page?
3. What in this plan would break GitHub Pages, where there are no rewrites and each destination is a
   real `.html` file?
4. `App.stories.tsx` drives `window.history` by hand and asserts on `window.location`. What is the
   least-rewritten way for those to keep meaning the same thing under a router?
