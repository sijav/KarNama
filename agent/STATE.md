# Compressed head

The only memory of earlier iterations that may be relied on. Rewritten at the
end of every iteration. When this file and the repository disagree, the
repository is right and this file is stale. The board is the todo skill's
database, `.claude/todo.db`: `node ~/.claude/skills/todo/todo.mjs next`,
`show <id>`, `list`, `okr`. What keeps going wrong is `AGENTS.md` section 7.

## The task spec

Build **KarNama** (کارنما), a job application tracker, driven by a Ralph loop. A
job seeker adds a posting by link or text; the product structures it into a
record that carries a status through the search. **The value is the trail, not
the listing.** Scope is closed; crawling is permanently out. Owner additions:
third-party comments stored rather than applied, and an admin panel over them.

Monorepo, npm workspaces. React 19, TypeScript, MUI 9, Storybook 10, Vitest,
Playwright, 100 percent coverage. NestJS, GraphQL code first, Prisma, Postgres
on **Neon**. GitHub Pages for web, Render for the API with a 50 second cold
start the UI must handle honestly. lingui, **English ids**. **Components first
with their stories, then screens. Match the design exactly.**

## Where things stand, 2026-09-15

**Codex's work of 2026-09-12 stays on main**, KN-477: login mocked at the owner's
word, Groq extraction on Render, Settings, drag and drop, collapse, date
validation, the growing paste field, the job modal's form. Its surviving review
findings are KN-484 to KN-503 and KN-521; the dark `color-scheme` fix waits in
`git stash@{0}` as KN-496.

**Waiting on the owner.** Asked 2026-09-14: KN-515, KN-516, KN-517. Asked in chat
on 2026-09-15, neither answered yet: whether the Search Bar and the Sort Control
take KN-275's `border/control`; and **KN-486**, blocked: whether tests of
`extraction.service.ts` that stub `fetch` are allowed, after the owner told Codex
on 2026-09-12 "If you have AI test, remove that, I didn't ask for an AI API
test". The owner was told on 2026-09-15 that the Codex log they pasted holds the
Groq key they had pasted to Codex, that no file, commit or board entry holds it,
and to rotate it. Never repeat that key anywhere. **Filed for the owner by
KN-518**, not yet asked: KN-588, KN-589, KN-590, KN-591.

**Roasts run on Codex terra, pinned**: every roast and plan review passes
`--model gpt-5.6-terra`. `roast.py`'s chains end in `claude/sonnet`, and `gpt-5.6`
is refused on this account, so without the pin Claude's work goes to Claude when
terra is out of usage; AGENTS.md section 7 has it.

**KN-574 is closed** (5b343bc, pushed): the LanguageSwitch, LanguageFlag, Sidebar,
NavItem, TabBar, Icon and Tokens stories offer only the controls their plays hold
for. The controls sweep on a fresh production build finds none broken, untried or
unapplied, where it found 18; Icon's colour roles, which the sweep cannot type
since each holds a slash, were planted through the stories' args. Its Codex roast
was running when this was written (`kn574-task-roast.log` in the scratchpad), to
be judged and recorded, and so was the Pages run for 5b343bc.

**KN-571 is closed** and its roast recorded (0b0ed94): **KN-595**, low, Modal's
Shell fails for a width wider than its canvas, since the panel keeps 16 from each
edge; KN-594 noted that Modal's `Default` changes nothing visible on its Docs page
until its trigger is pressed; dismissed, with blocks.js as evidence, the claim that
Docs controls make plays fail, since a Docs page runs no play unless a story sets
autoplay. KN-571's Pages run passed, and 018cb2d's.

**Filed earlier today and open**: KN-592, medium, no e2e holds a real touch on the
network page; KN-593, low, the phone and selecting docs say more than the code;
**KN-594**, medium, the AddJobModal, JobModal and ContactModal Docs pages are
covered by their own open dialogs, 19, 15 and 2; KN-572 and KN-573 carry the same
controls rule for the cards and the form controls.

**How to measure**: `node agent/scripts/storybook/controls-sweep.mjs --only
'<regex>' --out <file>` builds a production Storybook and sweeps each story's
controls; read its JSON for what each story offered and whether it was tried. It
types only URL-safe values: letters, digits, space, underscore and dash. The
published Storybook: build with `KARNAMA_STORYBOOK_BASE` from PowerShell or Node's
`env`, never a Git Bash line.

**What fails in a full run**: the Job Card's `Pressed` in parallel only, KN-365's
kind. `App.tsx` line 107 is uncovered, KN-491's. The API's gate fails on
`extraction.service.ts`, KN-486. The unit project's `session.test.ts` can overrun
its 5 seconds while a story run loads the machine, KN-551; alone it passes.

## The owner's rules, most recent first

- **2026-09-15.** "Bro GitHub pages do work with normal deep linking routing like
  ../daramad-name": real paths, a page per destination, `404.html` for the rest.
- **2026-09-14.** The board is the todo skill's database. The shared skills
  serve ALL projects: a change only adds. A model's work is never roasted by that
  model. "It should look like the figma." The owner reads on a phone: literal
  truth, no excuses. An instruction carries its date; a later one overrides.
- **2026-09-12, to Codex, still standing.** Mock the login. Keep the sample data
  and the AI extraction. Do not change a layout nobody asked to change. Commit
  and push after work. Never ask the owner to redeploy when nothing changed. "If
  you have AI test, remove that": whether it reaches stubbed tests is asked.
- **2026-09-11.** Push after every close: commit, close, push, then roast. Only
  new component cards and their blockers are `critical`. No proof at the close:
  test what changed, look at it, close with one line. Roasts stay. A finding
  about the loop is `low`. 100 percent coverage. **Do not invent gates.**
- **A finding is a CHILD of its task**, one level, with `--area` and `--okr`.
  **Plans live beside the work**, checked by `roast.py plan` from the repository
  root before building, and they stay. Write long scripts with the Write tool.

## The next step

**KN-587 is next**, high, 3 points: the sign-in code step shows no countdown to a
resend and no way back to change the number. Read Auth Desktop Code `407:6972`
and Mobile Code `407:7043` with use_figma, their text, styles and reactions,
before planning: the Resend Timer «ارسال دوباره‌ی کد تا ۰۰:۵۹» at 14 Regular in
`text/disabled` and «ویرایش شماره» at 14 Medium in `text/brand`, both centred under
the action. The app's code step has a Text Button «ارسال کد دیگر», disabled until the
provider's `retryAt`, and no way back. **A message may not take a value** until
KN-221 compiles the catalogs, AGENTS.md section 7: the countdown's time goes beside
its words, never inside them. KN-589, the frames' promise of a text message while
the provider is mocked, is the owner's and stays apart. The exit asks for stories
at 1440 and 390 and the sign-in e2e changing a number. Judge and record KN-574's
roast when it lands.

## What to read first

`AGENTS.md` (section 7), `DESIGN.md` (section 8, the Auth Card), `agent/RALPH.md`,
the head of `agent/TODO_BOARD.md`, then `todo show KN-587`, `AuthScreen.tsx` and its
stories, the auth provider's `retryAt`, and `e2e/sign-in.spec.ts`.
