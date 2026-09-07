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
npm run todo -- show KN-004     # a card, its roast rounds and its notes
npm run todo -- list            # everything, with blockers marked
```

---

## The task spec

Build **KarNama** (کارنما), a job application tracker, and drive it with a Ralph
loop.

A job seeker adds a posting themselves, by link or by text, the product
structures it into a record, and the record carries a status through the search.
**The value is the trail, not the listing.**

**Scope is closed.** Scenarios 1 and 2, searching boards and showing aggregated
ads, were cut by the mentor's filter 4. **Crawling job sites is permanently
out.** Two owner additions: third parties can leave comments or suggested
changes, stored for later evaluation rather than applied, and there is an admin
panel over what users submit.

Stack and standing decisions:

- Monorepo, npm workspaces: `apps/web`, `apps/api`, `packages/graphql`.
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

**Nothing of the product exists yet.** No app, no API, no components. What
exists is the machine that builds them and a design contract checked against
Figma rather than asserted.

`sijav/KarNama` is **live**: remote `origin` added, `main` pushed, public. The
repository holds the loop, the board tool, the Codex harness, `AGENTS.md`,
`DESIGN.md`, `TECH-DEBT.md`, and the verifiers.

**`agent/figma-capture/` is new and it is the point.** Raw `get_metadata`
responses for canvas `5:7` and `5:8` are committed with their sha256 in
`agent/design-manifest.json`, so the screen list, the documentation frame list,
the pending-item inventory and the copy-change counts are all **derived from a
committed artefact** rather than written by whoever wrote the document.
`.gitattributes` marks them `-text` so a clone cannot break a digest.

**What that still cannot show, and DESIGN.md now says so.** `get_metadata`
returns layer *names*, and Figma caps an auto-generated one: 64 of the 148 names
in the documentation capture sit at the cap, cut mid phrase. The inventory is a
floor, not a ceiling. **KN-079** carries the text capture that would fix it and
**KN-078** the coverage check that depends on it. Round 4 of KN-002 rated this
critical and argued the task should have stayed open; that objection is recorded
on KN-079 rather than dismissed.

## The lesson this iteration actually taught

KN-002 took four rounds, and every round found the same defect in a new place:
**an unchecked claim replaced by another unchecked claim.** "All sixteen copy
changes were applied" was false. Correcting it to "fourteen of sixteen" was
itself unverified. Stating the truncation as "63 of 148" was a guess. Each fix
was only real once the number was **derived from the capture and the document
required to match it**.

The second lesson is the loop's own rule. `agent/RALPH.md` step 5 permits fixing
in-task when the verifier fails **or when it passes dishonestly**, and the second
clause has no bound, so it was invoked three rounds running. Every roast of a
verifier can be phrased that way. **KN-080** bounds it to once per task. Until it
lands, read the trigger prompt's wording as the rule: if the verify script
passes, it is a card.

## Next step

`npm run todo -- next` picks it. Do not choose by hand.

**KN-004 is in review with its roast running.** When it lands: adjudicate, file
the survivors, record with `--filed`, close with `--evidence`. It corrected a
false statement in the contract (Card was called the only elevation, and
Elevation/Modal exists) and traced every off-board token to the frame it was
read from, which turned up `red/700` and `black/base`, neither previously
recorded.

Then **KN-003, the web scaffold**, where the first line of product code gets
written. Its card carries the dependency matrix, and that matrix is now
**proven, not resolved**: 477 packages installed clean in a scratch workspace and
esbuild, swc, tsc 6.0.3, vite 8.2.2, vitest 4.1.11, eslint 10.9.1 and playwright
1.62.1 all execute. npm blocks the swc and esbuild postinstalls under
`allowScripts`, which is harmless because both ship platform binaries, but
**Playwright will need an explicit `playwright install`**. The pins that are not
negotiable: `typescript ~6.0.x` because typescript-eslint and
eslint-plugin-lingui both refuse 7, the whole vitest line at `4.1.11`, and
`stylis` at `4.2.0` in a root `overrides` or every `::placeholder` rule crashes.

**11 points to a public deployed page**: KN-003 then KN-051.

**The gate cannot currently be run.** `npm run lint`, `lint:tsc`, `test` and
`build` all exit non-zero with "No workspaces found!", because `package.json`
declares workspaces that do not exist. Filed as **KN-084**. KN-003 will make
three of them work; the card is what makes the fourth honest.

## What to read first

`AGENTS.md`, `DESIGN.md`, `agent/RALPH.md`, `agent/TODO_BOARD.md`. In that
order, every iteration, before touching anything. Then `npm run contract`, which
is the only trustworthy answer to "do the cards still agree with the design":
that reconciliation was claimed complete twice and was wrong twice, because the
cards someone remembered were edited instead of every card being checked.
