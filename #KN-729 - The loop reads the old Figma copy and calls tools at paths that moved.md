# KN-729 · The loop reads the old Figma copy and calls tools at paths that moved

Taken 2026-11-03, the first card of OKR-3, the redesign. Every other redesign card
waits on it.

**Why**, from the board: every redesign card is built by reading Figma, and
`DESIGN.md` is the first thing a builder reads: while it names the copy, each
builder reads the old drawing and builds it faithfully, the redesign undone one
card at a time. The tool paths cost a failed command at the top of every
iteration.

**Exit**, from the board: `DESIGN.md`, `agent/design-manifest.json` and the loop
prompt name `K1EP8GCOmelU8o4vPR7a9f` and none names the copy as the file to read;
`DESIGN.md` lists the original's pages with 5:7's seven sections and says what
587:7632 and 714:7632 are; `TECH-DEBT.md` item 5 is retired with the date;
`get_metadata` on 5:7 with `DESIGN.md`'s key returns the seven sections; and
`git grep` finds no `~/.claude/skills/todo` or `~/.claude/skills/roast` in
`AGENTS.md`, `agent/RALPH.md` or `agent/STATE.md` outside a dated history note.

The card's notes add two things the owner and the designer gave the same day:
the designer's handoff goes into the repository beside `DESIGN.md`, and the
owner's answer on roasts goes into the loop's rules with the tool paths.

## What is true on 2026-11-03, measured

- `get_metadata` with no node on the original lists its pages: Cover `0:1`,
  Foundations `5:3`, a divider `5:4`, Components `5:5`, a divider `5:6`,
  Screens — Redesign Test `587:7632`, Screens — آرشیو قبل از ری‌دیزاین
  `714:7632`, Screens `5:7`, Documentation `5:8`. The old quirk in `DESIGN.md`,
  that a call with no node lists only the Cover, is no longer how the tool
  behaves.
- The handoff names Screens as the final reference and the Documentation page
  as old and not to be relied on, so `DESIGN.md` section 7, its transcription,
  is superseded rather than compared.
- The board tool is `D:/Kar/Sijav-Skills/Sijav-Clauder/skills/todo/todo.mjs`
  (and `todo.py`); the old `~/.claude/skills/todo/todo.mjs` fails with Cannot
  find module. The roast is the same plugin's `skills/roast/roast.py`, which now
  takes `--item` and `--files`.
- Codex refuses `gpt-6.1-sol` on the ChatGPT account. The owner's answer: roasts
  run on Sonnet 5.5 through the claude CLI at high effort with the roast skill's
  own prompt. The same day, after two roasts had gone through Agent subagents
  while the CLI's sign-in was expired: "use claude cli not agent! agent makes it
  effort max unless you define!", so a roast goes through the CLI and nothing
  else. The owner signed the CLI in again; a headless call with the wrapper's
  flags answered, and the CLI's own report says it served `claude-sonnet-5-5`.

## The approach

1. **The handoff into the repository.** Copy the owner's file, `کارنما — سند
   تحویل به برنامه‌نویس.md`, to `DESIGN-HANDOFF.md` at the root, as the designer
   wrote it. It is the designer's document, so the prose rules of `AGENTS.md`,
   commas for em dashes among them, do not apply to it, and `AGENTS.md` says so
   in one line rather than the file being edited.
2. **`DESIGN.md`, the file section.** The key becomes the original's; the
   paragraph about the copy goes; the page table gains the pages above with what
   each is for; the quirk about `get_metadata` with no node is corrected; the
   handoff is named as the written spec beside the file, with the order of
   authority it states (the Screens page, then the handoff, and the designer
   when they disagree). Section 7 gets one line at its head saying the
   Documentation canvas is superseded by the handoff and is kept as history.
   Nothing else in `DESIGN.md` changes here: the tokens are KN-730's, the
   components and screens are their own cards'.
3. **`agent/design-manifest.json`.** Its `source` becomes the original with the
   new pages; its note stops saying the original is unreadable.
4. **`TECH-DEBT.md` item 5.** Deleted, as items 15 and 20 were, since its own
   retiring check is met: the MCP reads the original and `DESIGN.md` points at
   it. The commit message carries the date.
5. **`agent/scripts/verify/KN-001.mjs`.** Nothing runs it (`package.json`'s
   scripts run `contract.mjs` and `KN-306.mjs`, the workflow runs neither), but
   it is the one verifier whose check is "DESIGN.md names the file", so its
   needle becomes the new key and it stays truthful if anyone runs it.
6. **The tool paths.** `AGENTS.md`, `agent/RALPH.md`, `agent/STATE.md` and the
   gitignored loop prompt name the plugin's paths. The two refusal stubs,
   `agent/scripts/todo.mjs` and `agent/scripts/roast.mjs`, print the plugin's
   paths too, since their whole job is to send a caller to the real tool. The
   retired verifiers that quote the old command (KN-184, KN-190) and the
   SkipBureau patch are history and stay as they are.
7. **The owner's roast rule.** `agent/RALPH.md`'s roast commands become
   `python -X utf8 agent/scripts/roast-sonnet.py plan|task ...`, a wrapper that
   imports the skill and swaps only the function that calls codex for the
   claude CLI on `claude-sonnet-5-5` at `high`, so the framing, jev's answers,
   the reading and the record stay the skill's. The reviewer runs from a scratch
   folder with the repository added, read-only tools, `.env` files denied and
   every hook off, because the Ralph Stop hook would otherwise hand a reviewer
   in this repository the loop's prompt. It asks the CLI for its JSON report
   and writes the model the CLI says it served into the record, so the record
   proves the reviewer rather than repeating what was asked for. When the CLI
   is signed out, roasts wait for the owner to sign it in; they never reroute
   to a subagent. Three more of the owner's rules of the same day: every claude
   call runs with `--remote-control`, so the owner watches the review among the
   remote sessions in the Claude app; one claude conversation per kind of roast
   is kept and resumed across roasts, as codex's `roast-<mode>` sessions are,
   recorded in `.claude/claude-sessions/<purpose>.json` behind a lock; and the
   instructions put in front of the skill's prompts are written by `gpt-6-luna`
   through the codex runner, purpose `roast-prompts`, never by the builder.
   Luna's words live exactly in `agent/scripts/roast-sonnet-prefix.txt`, and a
   mistake in them goes back to Luna in that session, told what it is. The
   rules, dated and quoted, go into `RALPH.md` beside the 2026-09-14 rule they
   keep.
8. **What the plugin's roast leaves in `.claude/`.** Its runs write
   `.claude/roasts/*.md`, `.claude/roast-result.md`, `.claude/codex-sessions/`
   and, through the wrapper, `.claude/claude-sessions/`. The sessions are this
   machine's; the records quote
   whatever the reviewer read, which can be a gitignored file, so they stay
   local too. `.gitignore` says both, and the card's `todo roast` round keeps
   the record's path and the adjudication.
9. **The loop prompt** gets the key, the paths and the roast command, and is
   then moved back to `.claude/ralph-loop.local.md`, which engages the loop as
   the owner asked.

## Files

`DESIGN-HANDOFF.md` (new), `DESIGN.md`, `AGENTS.md`, `agent/RALPH.md`,
`agent/STATE.md`, `agent/design-manifest.json`, `TECH-DEBT.md`,
`agent/scripts/verify/KN-001.mjs`, `agent/scripts/todo.mjs`,
`agent/scripts/roast.mjs`, `agent/scripts/roast-sonnet.py` and
`agent/scripts/roast-sonnet-prefix.txt` (both new), `.gitignore`, and
`.claude/ralph-loop.paused`, which is gitignored, as `.claude/claude-sessions/`
will be.

## What I expect to be hard, and what I am unsure of

- **Drift.** `DESIGN.md` holds a baseline of 236 with 9 em dashes and must not
  get worse; `AGENTS.md` measured 0 with 16 em dashes after 082e768. Each edit is
  measured with the repository's own Prettier, from the file's real path.
- **`DESIGN-HANDOFF.md` and Prettier.** A new file must measure 0, and the
  designer's tables may not be what Prettier would write. If it does not measure
  0, the choice is Prettier's formatting of the designer's tables, which changes
  no word, or an ignore entry with its `TECH-DEBT.md` record; formatting is the
  smaller change, and a table's alignment is not the designer's content.
- **The repository is public.** Committing the handoff publishes it. The owner
  handed it over to be added, and it holds product decisions and no personal
  data beyond the designer's handle; the reply to the owner says it is public
  now.
- **Whether the wrapper's flags hold on a real roast.** One headless call with
  them answered once the CLI was signed in; this plan's second review and
  KN-728's second roast are the first runs end to end.

## The review, 2026-11-03

An Agent subagent asked for Sonnet 5.5 at high effort reviewed this plan first,
record `.claude/roasts/20261103T152842Z-plan-KN-729-6762bf.md`, served model never
verified, and found nothing critical; the owner then ruled roasts go through the
CLI only, so this plan goes back through the CLI with the changes below in it.
What that first review changed:

- `get_metadata` on the whole of 5:7 is about 1.19 million characters and lands
  in a saved file rather than answering, so the check is on each section id,
  and `DESIGN.md`'s quirks say so for builders.
- `DESIGN.md` gets a dated notice at its head: its tokens, component and screen
  sections still transcribe the copy and the old Documentation page, and each
  redesign card rewrites the section it touches. Without it, "everything here
  was read from Figma" would be false the moment the key changes.
- The manifest keeps its captures labelled as the copy's snapshot rather than
  letting the new key imply a fresh read.
- `.gitignore`'s "Roast replies ARE committed" is corrected beside the new
  entries; the board keeps a round's path and its adjudication, and never opens
  the record.
- The wrapper's record line drops codex's session name, and its git is
  `git -C <repo> log` and `show` only: from the scratch folder a bare `git log`
  cannot run, and `diff` or `grep` with `--no-index` would read a `.env` around
  the deny rule.
- `agent/RALPH.md` says the owner's rule of 2026-11-03 supersedes, for now, its
  lines sending a roast of Claude's work to Codex, and that "the same model"
  means the same model id.
- The commit retiring debt item 5 says it is retired because the original can
  be read; its own check asked for edit access, which nothing here measured.

Not taken: moving the handoff, the wrapper and the ignore entries into cards of
their own. Every redesign card's notes point builders at `DESIGN-HANDOFF.md`, so
it has to land before them, and the wrapper is already what runs the loop's
roasts; the card's exit was widened to the whole scope instead.

## How I will know it worked

- `get_metadata` on each of 5:7's seven section ids answers with that
  section.
- `git grep` for the old paths and for the copy's key in the files above finds
  only dated history.
- `node agent/scripts/verify/contract.mjs` still passes, and `todo validate` too.
- Drift on `DESIGN.md` and `AGENTS.md` holds its baseline; the new files measure
  0, or the plan's choice above is recorded.
- The roast of this plan runs through `roast-sonnet.py steps` and writes a record
  naming Sonnet.
