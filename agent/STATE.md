# Compressed head

The only memory of earlier iterations that may be relied on. Rewritten at the
end of every iteration. When this file and the repository disagree, the
repository is right and this file is stale.

**This file does not restate anything the board already knows.** It went stale
twice by carrying round counts and task statuses that had moved on, at exactly
the point a context reset trusts it. Numbers that live in `board.json` are read
from there:

```bash
npm run todo -- next            # what to work on
npm run todo -- show KN-003     # a card, its roast rounds and its notes
npm run todo -- list            # everything, with blockers marked
```

---

## The task spec

Build **KarNama** (کارنما), a job application tracker, and drive it with a Ralph
loop.

A job seeker adds a posting themselves, by link or by text, the product
structures it into a record, and the record carries a status through the search.
**The value is the trail, not the listing.**

**Scope is closed.** Searching boards and showing aggregated ads were cut by the
mentor's filter 4. **Crawling job sites is permanently out.** Two owner
additions: third parties can leave comments or suggested changes, stored for
later evaluation rather than applied, and there is an admin panel over what
users submit.

Stack and standing decisions:

- Monorepo, npm workspaces. `apps/web` exists; `apps/api` and
  `packages/graphql` do not yet.
- React 19, TypeScript, MUI, Storybook, Playwright, Vitest, 100 percent
  coverage. **Components first with their stories, then screens.**
- GraphQL with NestJS. Render free tier, Supabase Postgres, cold start about 50
  seconds which the UI must handle honestly.
- GitHub Pages for the web app.
- lingui, **English is the source**, Persian is the translation.
- **Match the design exactly**, not approximately.
- **Auth is phone OTP**, mobile number then a five digit code, email as a
  fallback behind the same interface, **provider mocked for the MVP**.
- **The Documentation canvas beats the Components canvas**: a kanban board, not
  a list, and three nav destinations, not two.

## Where things stand

`sijav/KarNama` is live and pushed. **`apps/web` exists and its gate is real.**

Green and checked by running, not by inference: lint with `--max-warnings 0`,
`tsc`, 63 tests across 5 files at 100 percent on all four coverage metrics, the
vite build, the Storybook build, and 6 Playwright tests on desktop 1440x900 and
mobile 390x844, which are the viewports the Screens canvas draws. Seen in a
browser at `localhost:6006` in both languages.

What exists in the app: the token set as typed constants, the MUI theme built
from it, the RTL emotion cache, lingui with English ids and a Persian catalog,
`AppProviders`, a nearly empty shell, and a Foundations/Tokens story.

**`src/gate-fixtures/` is the part worth knowing about.** Five green commands
prove five commands ran, not that any can go red. So a component with a bare
English sentence, one with a bare `aria-label`, one with a bare `title` and a
test asserting 1 + 1 is 3 are all committed, kept out of the ordinary run, and
driven by `agent/scripts/verify/KN-003.mjs` through the real tools, which
requires each to fail **for the right reason**. Every verifier in this repo has
also been mutation tested: KN-002 twelve breaks, KN-003 six, KN-004 twelve,
KN-087 four, all caught.

`agent/figma-capture/` holds raw `get_metadata` for canvases `5:7` and `5:8`
with their sha256 in `agent/design-manifest.json`, so the screen list, the frame
list, the pending-item inventory and the copy-change counts are **derived from a
committed artefact**. What that cannot show is written into `DESIGN.md`: the
capture is metadata, so 64 of its 148 layer names sit at Figma's truncation cap.
**KN-079** carries the text capture, **KN-078** the coverage check.

## What this iteration taught, in one line each

**An unchecked claim replaced by another unchecked claim is not a fix.** KN-002
took four rounds on that alone: "all sixteen copy changes were applied" was
false, "fourteen of sixteen" was unverified, "63 of 148 truncated" was a guess.
Each only became real when the number was **derived from the capture and the
document required to match it**.

**Do not mutate the worktree while a roast is reading it.** KN-003's round
reported a critical that was simply my mutation test caught mid-run. The finding
was true of what it saw and false of the repository, and adjudicating it cost
more than waiting would have.

**Test the notice, do not believe it.** Storybook says `setProjectAnnotations`
can be removed from the vitest setup. Removing it fails seven tests, because
every story then renders with no theme, no direction and no catalog.

**The loop's own carve-out has no bound.** `RALPH.md` step 5 allows fixing
in-task when the verifier "passes dishonestly", and every roast of a verifier
can be phrased that way, so it ran three rounds straight on KN-002. **KN-080**
bounds it to once per task. Until it lands, use the trigger prompt's wording:
**if the verify script passes, it is a card.**

## Next step

`npm run todo -- next` picks it. Do not choose by hand.

**KN-087 is in review with its roast running.** When it lands: adjudicate, file
the survivors, record with `--filed`, close with `--evidence`.

Then the board hands back the rest of KN-003's roast: **KN-088** (the planted
broken test is proved through a separate vitest config, not the one `npm test`
uses), **KN-089** (a clean clone cannot run the suite without
`npx playwright install chromium`), **KN-090** (`AppProviders` mutates the lingui
singleton during render), **KN-091** (story prose sits in the TSX while
`AGENTS.md` requires `src/shared/story-docs/{en,fa}` plus a guard test).

**KN-005 and KN-006 were reconciled against the code this iteration**, not from
memory, and both shrank to 3 points. What is left of KN-005 is dark mode and the
no-raw-hex test; what is left of KN-006 is the macro plugin, a persisted runtime
locale switch, and a real catalog-completeness test.

Then the component queue, then screens. **KN-051** is the Pages deploy and it is
no longer blocked by the API.

## What to read first

`AGENTS.md`, `DESIGN.md`, `agent/RALPH.md`, `agent/TODO_BOARD.md`. In that
order, every iteration, before touching anything. Then `npm run contract`, which
is the only trustworthy answer to "do the cards still agree with the design":
that reconciliation was claimed complete twice and was wrong twice, because the
cards someone remembered were edited instead of every card being checked.
