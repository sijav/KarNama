# Compressed head

The only memory of earlier iterations that may be relied on. Rewritten at the
end of every iteration. When this file and the repository disagree, the
repository is right and this file is stale. The board is the todo skill's
database, `.claude/todo.db`: `node
D:/Kar/Sijav-Skills/Sijav-Clauder/skills/todo/todo.mjs next`, `show <id>`,
`list`, `okr`. What keeps going wrong is `AGENTS.md` section 7.

## The task spec

Build **KarNama** (کارنما), a job application tracker, driven by a Ralph loop. A
job seeker adds a posting by link or text; the product structures it into a
record that carries a status through the search. **The value is the trail, not
the listing.** Scope is closed; crawling is permanently out.

Monorepo, npm workspaces. React 19, TypeScript, MUI 9, Storybook 10, Vitest,
Playwright. NestJS, GraphQL code first, Prisma, Postgres on **Neon**. The web at
**https://kar-nama.ir/** on GitHub Pages behind Cloudflare, Storybook at
`/storybook/`, the API on Render. lingui, **English ids**. **Components first
with their stories, then screens. Match the design exactly.**

## Where things stand, 2026-11-04, early morning

**The owner's order: the design, then the backend, then the rest.** OKR-3, the
redesign, is position 1 with 61 open and 47 done; OKR-4, the backend, position
2; OKR-1 and OKR-2 follow. Within the design every component card is
`critical`, new and redrawn alike, ahead of the record model (KN-731 to KN-741)
and the screens (KN-805 to KN-828). KN-829 reads every older card against the
redesign last. **In progress: KN-759, the column sort controls.**

**Done in OKR-3**: KN-729 the tokens' pointers, KN-742 the brand mark, KN-746,
KN-750, KN-765, KN-768, KN-777, KN-782, KN-792, KN-793, KN-795, KN-798, KN-801,
KN-837 Popover / Close, KN-791 the Search Bar, KN-730 the status colours, KN-797
the Status Control, KN-743 the company logo, KN-748, KN-755, KN-758, KN-764 the
toast, KN-766, KN-773 the related person, KN-778, KN-780 and KN-781 the stats
pieces, KN-784 the mobile status tab, KN-785 the Button's small size, KN-774 the
company match, KN-779 the stats guidance, KN-786 the picker's add chip, KN-787
and KN-794 the Input's and Select's hover, KN-799 the bulk bar, KN-802, KN-803
the colour names, KN-838 the modal's 20 pixel close, KN-763 the unsaved changes
modal, KN-788 the deletion lines, KN-761 the stage delete modal, KN-744 the
card's footer line, KN-749 the outcome strip, KN-751 the grouped status picker,
KN-752 the add modal's status trigger and KN-753 the history row.

**New pieces other cards build on**: `shared/popover`'s `popoverSurface` and
`popoverPaper` at radius 10 with `elevation.popover`; `shared/date-picker`,
which KN-754 and KN-756 join; `shared/board` with the outcome strip;
`shared/job-card/footer.ts`'s `cardFooter`, the card's dated line, for KN-745;
`shared/status-picker`'s `GroupedStatusPicker` and `StatusSelect`, for KN-789
and KN-790; `shared/modal`'s `UnsavedModal`, `DeleteStatusModal` and the
exported `ModalText`; `shared/history`'s `HistoryRow`, for KN-812 and KN-828;
`shared/quoted.ts` for a name in quotation marks; the Button's `surface` for a
coloured ground. **Adoption is the screens'**: notes on KN-805 (the board),
KN-812 (the job modal), KN-817 (the add flow) and KN-828 (mobile detail) say
what each swaps in. **Retiring what the redesign drops waits on adoption**:
KN-842 the flat Status Picker, KN-844 the Contact Card.

**Learned**: a browser does not letter-space a joined script, so the Persian
chips draw about 0.2 a letter narrower than Figma's; a button focused by script
as a popover opens is `:focus-visible` in Chromium even after a mouse press;
Chromium floors a border of 1.5 to 1, so draw it as an inset shadow; MUI's
Popover keeps 16 from the window's edge, so a wide popover's story sets the
runner's viewport to 1280 by 800 and puts back 414 by 896; after a modal closes
the page stays aria-hidden through the dissolve, so find its trigger with
`findByRole`. **The lint rule's traps**: a ternary or map holding `null` beside
a string, `i18nFor(locale)._(...)` in one expression, an unlisted class-name
constant (add it to `structuralProps` in `eslint.config.js`) and a bare style
object (wrap it as `{ sx }`).

**The redesign** is in the original Figma file `K1EP8GCOmelU8o4vPR7a9f`,
Screens `5:7`, with the designer's handoff in `DESIGN-HANDOFF.md`. A component's
instances on the screens show its real copy: read them with use_figma's
`getInstancesAsync` before writing fixtures. Prototype motion is not exported
by `get_motion_context`: read a variant's reactions with use_figma, and
remember Figma's After delay counts from arrival.

**The backend is not done**: the live API answers every origin with
`access-control-allow-origin https://sijav.github.io`, because Render keeps the
WEB_ORIGIN it was created with. KN-836 lets the code allow `https://kar-nama.ir`
and moves an http reader to https; KN-834 verifies the whole path once the owner
sets WEB_ORIGIN and Cloudflare's Always Use HTTPS. Both wait in OKR-4.

**Roasts** run on Sonnet 5.5 through the claude CLI, `agent/scripts/roast-sonnet.py`,
with `--remote-control`, one session per kind in `.claude/claude-sessions/`,
and Luna's prefix. Each closed card is roasted in the background to
`.claude/roasts/`; **none is judged until every to-do is done**. Every card
closed through KN-752 has its record; KN-753's was running at this writing. The
launchers in the scratchpad, `roast-753.py` the latest, show how to pass the
arguments from Python.

## What fails, and which failures are known

`npm test` exits 1, and none of it is new work: `session.test.ts`'s two, KN-551;
the Input's Multiline timing out typing about 800 characters and spilling them
into the next two stories, and JobCard Pressed, KN-699; the real pointer moving
between parallel files, which fails Button Matrix and ContactCard Full On A
Phone, KN-365; `apps/api`'s database timeouts and coverage, KN-486. **The runner
draws several story files in one page at once**, so a story never asks the
browser for something page-wide, such as reduced motion: read the rule off the
style sheets instead, as LoadingState's ReducedMotion does. **Search the board
before filing a failure**: KN-839 and KN-840 were filed and dropped as
duplicates of KN-551 and KN-699 today.

## Drift, and the method

Drift is Prettier's, measured with the repository's configuration from the
file's real path: `prettier --stdin-filepath <path> < <file> | diff <file> -`.
A new file measures 0; hold each baseline: `DESIGN.md` 230 with 9 em dashes,
`AGENTS.md` 0 with 16, `agent/RALPH.md` 5 with 2, `App.stories.tsx` 13,
`JobsScreen.stories.tsx` 2. **Python's text mode on Windows writes CRLF**: pass
`newline='\n'`, or one edit becomes a whole-file diff.

## Open, and waiting

KN-473 has open children; KN-477 waits on twenty-four; KN-723's dependency
question is the owner's; KN-683 is for the owner; KN-515, KN-516, KN-517 and
KN-486 wait on the owner. Many OKR-1 and OKR-2 cards are about components the
redesign replaced, which KN-829 sorts out. The Codex log the owner pasted holds
the Groq key; never repeat that key anywhere. **KN-685's discipline binds**: the
fixtures' two sentinels are named nowhere, this file included.

## The owner's rules, most recent first

- **2026-11-03.** The design first, then the backend, then the rest; within the
  design, missing components and fixes to existing ones first. Finish every
  to-do, roast each to a file in the background, and only when all are done read
  the files, file their findings and work them. Roasts on Sonnet 5.5 through the
  claude CLI, never an Agent subagent, with `--remote-control` and one session
  per kind; Luna, through the codex runner, writes the prefix and fixes it in the
  same session when told the mistake. Build from Screens `5:7`. A company's logo
  from its own site, then LinkedIn, else a default icon.
- **2026-09-16, global.** Answer WHY with the mechanism; "I don't know" is a
  correct answer; never invent an authority; do not just agree. A wrong or
  contradictory rule is asked about through the question card.
- **2026-09-14.** The board is the todo skill's database; shared skills only
  add; a model's work is never roasted by that model. The owner reads on a
  phone: literal truth, no excuses.
- **2026-09-11.** Push after every close. No proof at the close. Do not invent
  gates. **A finding is a CHILD of its task**, one level. Plans live beside the
  work.

## What to read first

`AGENTS.md` sections 3 and 7, `agent/RALPH.md`'s rules of 2026-11-03, the head of
`DESIGN.md`, `DESIGN-HANDOFF.md`, and `todo next`. A backgrounded command's exit
code is the shell line's; a green total proves nothing about a new test; plant
the failure once and watch it fail.
