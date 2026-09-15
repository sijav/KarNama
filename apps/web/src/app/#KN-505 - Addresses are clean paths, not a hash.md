# KN-505 - Addresses are clean paths, not a hash

## The card

**Why**, from the board: The owner, 2026-09-14: 'why in our router there's #? maybe
I am mistaken but this is not how we used to create things right?' A hash in every
address reads as a workaround in a shared link, and it is one: it exists only
because of the host.

**Exit condition**, from the board, as edited on 2026-09-15: The e2e suite loads
/jobs, /add and /network directly and after a reload, moves between them with back
and forward, and lands #/network on /network; no address the app writes contains a
#; the Pages build holds a 404.html identical to its index.html, and an index.html
under jobs/, add/ and network/, so each of the three answers 200 on a hard refresh
where any other path answers 404 with the app.

**The owner, 2026-09-15, in chat**: "Bro GitHub pages do work with normal deep
linking routing like ../daramad-name". Asked when the app should switch, the owner
answered "Right after KN-279". The card was medium from 2026-09-14 and is critical
by that instruction.

## What is there, read on 2026-09-15

- **`src/app/routes.ts`**: `destinationIn(hash)` and `addressOf(destination)`,
  `#/jobs`, `#/add` and `#/network`, under a comment saying GitHub Pages "has no
  server to rewrite a deep link, so `/KarNama/network` would be a 404". `App.tsx`
  and `App.stories.tsx` repeat it.
- **`src/app/App.tsx`**: the destination starts from `window.location.hash`,
  `hashchange` reads it back, and navigating writes the hash; `add` opens the add
  flow over the board, and closing it navigates to the board.
- **The navigation** calls `onNavigate(id)` from buttons; it writes no address.
- **`.github/workflows/pages.yml`** builds with `KARNAMA_BASE: /KarNama/`, copies
  `index.html` to `404.html`, and checks `index.html`, `404.html` and Storybook's
  are there. KN-051's verifier loaded the shell at a deep path on the live site.
- **`vite.config.ts`**: `base` from `KARNAMA_BASE`; Vite 8.2.2.
- **The e2e suite** runs `npm run build && npm run preview`, base `/`, and
  `vite preview` answers any path with `index.html`. Specs open `/#/add`
  (add-job, demo-session, posting-input, connected), `/#/network` (network,
  settings) and `/#/jobs` (connected); add-job asserts `toHaveURL(/#\/jobs$/)`.
- **`App.stories.tsx`**: `Navigating` asserts the hash follows navigation and that a
  hash written from outside opens the add flow, and puts the hash back; two
  viewport stories save the hash and put it back.
- **`routes.test.ts`**: the hash cases.

## Measured on the live site, 2026-09-15

`curl` against `https://sijav.github.io/KarNama/`:

- `/KarNama/network` answers **404**, with `404.html`, the app, which then shows
  the board.
- `/KarNama/404` answers **200** with no redirect: Pages serves an extensionless
  path from the `.html` file of that name.
- `/KarNama/storybook` answers **301** to `/KarNama/storybook/`: a directory gets a
  trailing slash.

So `network.html` beside `index.html` answers `/KarNama/network` with 200 and no
redirect, where the card's `network/index.html` would redirect to
`/KarNama/network/`. The exit's "an index.html under jobs/, add/ and network/" is
therefore met by `jobs.html`, `add.html` and `network.html` instead, which the
card's own words "so each of the three answers 200" are about; the card is
corrected with a note.

## The approach

1. **`routes.ts`**: `destinationIn(pathname, base)`, the first segment after the
   base, a trailing slash allowed, `jobs` for anything else; `addressOf(destination,
base)`, `${base}${destination}`; `destinationInHash(hash)`, the destination an
   old `#/network` names, or none. The comment says what Pages does.
2. **`App.tsx`**: the base is `import.meta.env.BASE_URL`. On the first render an old
   hash naming a destination is replaced by its path with `history.replaceState`,
   the query kept; the destination is `location.pathname`'s; `popstate` reads it
   back; navigating pushes the path with `history.pushState`. The comment corrected.
3. **The build writes what Pages needs**: a plugin in `vite.config.ts`, on
   `writeBundle`, copies `index.html` to `404.html` and to `jobs.html`, `add.html`
   and `network.html`. The ids come from a module the config can import without
   React, `src/shared/navigation/destinationIds.ts`, which `destinations.ts` builds
   `DESTINATIONS` from. `pages.yml` drops its own copy of `404.html` and checks the
   three pages are in the site.
4. **The stories**: `Navigating` asserts the path follows navigation and that a path
   pushed from outside, with its `popstate`, opens the add flow; it and the two
   viewport stories put back the whole address they started on with
   `history.replaceState`.
5. **`routes.test.ts`**: paths under `/` and under `/KarNama/`, a trailing slash, an
   unknown path, and old hashes.
6. **The e2e suite**: the specs open paths, and add-job asserts `/jobs$`. A new
   spec, `addresses.spec.ts`: `/jobs`, `/add` and `/network` directly and after a
   reload; back and forward between them; `/#/network` landing on `/network`; no
   `#` in an address the app writes; and the built `dist` served the way Pages
   serves it (a file; else the path's `.html`; else a directory's `index.html`
   behind a 301; else `404.html` with 404), where `/jobs`, `/add` and `/network`
   answer 200 and `/nowhere` 404, each with the app.
7. **`AGENTS.md` section 7**: a line on what Pages serves.

## How I will know it works

- `routes.test.ts` and the unit project; the App stories under Vitest; eslint; tsc.
- The e2e suite, desktop and mobile, the new spec among it.
- `dist` holds `404.html`, `jobs.html`, `add.html` and `network.html`, each identical
  to `index.html`.
- After the push deploys: `/KarNama/jobs`, `/add` and `/network` answer 200 on the
  live site and open their pages, and `/KarNama/#/network` lands on
  `/KarNama/network`, in both languages.

## What I am unsure of

- **`vite.config.ts` importing from `src`**: the config is bundled by Vite, and the
  repository's import rules may object.
- **Stories pushing a path into the runner's and the published Storybook's frame**:
  put back in a `finally`, but a reload mid-play lands on a path Storybook does not
  serve.
- **`vite preview` answers every path with `index.html`**, so the e2e server cannot
  show 200 against 404; the spec's own server is a model of Pages, checked against
  the live site only after the deploy.
- **An unsigned reader at `/network`** sees the sign-in screen; after signing in,
  the destination is still the path's.

## Plan review, Codex, 2026-09-15

Sound, with one correction and two details, all taken. The approach holds: the
path under `BASE_URL`, the state set right after `pushState`, which fires no
`popstate`, `popstate` for Back, and `replaceState` for an old hash. `writeBundle`
is a supported hook in Vite 8, and a TypeScript config is bundled, so it can import
a module with no React in it.

**The correction**: the exit named an `index.html` under `jobs/`, `add/` and
`network/`, and this plan writes `jobs.html` and its kind. Codex asked for both, or
for the exit to change before the work. A directory answered 301 to a trailing
slash on the live site, and which of the two Pages prefers when both exist is not
documented, so writing both risks the redirect this change is against. The exit
is corrected on the board with a note, its wording having been this session's own,
and the owner is told.

**The details**: an old `#/network?from=x` keeps its query, which lives in the hash
and not in `location.search`; and the stories put back the path, the query and the
hash, and dispatch a `PopStateEvent` after a path they push from outside.

The config imports the ids module directly, since the navigation's barrel carries
React; the app imports it through the barrel. GitHub documents static files and a
custom `404.html`, not the extensionless rule, so the live measurement is the
evidence and the check after the deploy stays. The spec's Pages-like server is the
exit's own clause. Found while planning the plugin: Storybook's Vite build takes
the app's config and its plugins, so the plugin writes only when the bundle holds
an `index.html`; the preview's page is `iframe.html`.

## Result, 2026-09-15

Built as planned, with five differences.

- **`pathForHash(hash, base)`** rather than `destinationInHash(hash)`: it returns
  the path with the query the hash carried, which `App.tsx` writes with
  `replaceState`.
- **`siteBase(configured, href)`**, found while checking Storybook:
  `@storybook/builder-vite` sets `base: './'` (its `dist/index.js`, line 1457),
  `.storybook/main.ts` replaces it only when `KARNAMA_STORYBOOK_BASE` is set, and a
  `storybook build` without it compiled the shell's base as `./`, read in
  `storybook-static/assets/App.stories-*.js`. Under `./` no path starts with the
  base, so the shell would never have found its page. The base is read against the
  page now.
- **The meta `beforeEach` in `App.stories.tsx`**: the preview writes each selected
  story's id onto the frame's current pathname (`setPath` in
  `storybook/dist/preview/runtime.js`). On the Storybook dev server, «شبکه من» in
  App/Shell Persian and then English in the sidebar left the frame at
  `/iframe.html?id=app-shell--english&viewMode=story`, the English shell on My job
  opportunities. With the `beforeEach` taken out, the frame was at
  `/network?id=app-shell--english&viewMode=story` and the shell opened on My
  network, where the English story's play fails.
- **`destinationIds.ts`** declares the union and a list typed by it, since the lint
  rule flags the strings of an `as const` array.
- **More tests than planned**: coverage showed `App.tsx`'s two new branches
  uncovered, so `Navigating` also clicks the page already shown and asserts
  `pushState` is not called, and a new story, `FromAnOldAddress`, gives the frame
  `#/network` before the shell renders and asserts the network page at its path
  with no hash. The e2e Back and Forward case also opens the add flow and closes it
  with Back. The Navigating docs said, in both languages, that the navigation
  writes the hash; they are rewritten, and `FromAnOldAddress` has its entries.

The checks:

- `routes.test.ts` 27 cases, and the unit project 1422 tests in 39 files.
- App/Shell 14 stories of 14 under Vitest. `App.tsx` covers every statement and
  every branch this change adds, `routes.ts` everything. The one branch left,
  `App.tsx` line 107, the provider's error drawn above the page, was not covered
  before this change either, and the line is KN-491's.
- eslint and tsc clean; prettier drift as at HEAD in every file touched.
- `dist` after `npm run build`: `404.html`, `jobs.html`, `add.html` and
  `network.html`, each identical to `index.html`. A `storybook build` wrote none of
  them.
- The e2e suite on desktop and mobile: 85 passed and 9 skipped, the skips in specs
  this change does not touch. After the Back and Forward case grew,
  `addresses.spec.ts` 12 of 12.
- Seen: `/network` loaded directly on the dev server in English dark and in Persian
  dark; `/#/add` became `/add` with the add flow open over the board; App/Shell in
  Persian light and English light on the Storybook dev server, as above.

Left for after the deploy: `/KarNama/jobs`, `/add` and `/network`, and an old
`/KarNama/#/network`, on the live site.
