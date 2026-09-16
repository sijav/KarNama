# KN-693 · The verifier still prints a sentinel on its failure paths

From KN-685's roast. KN-685 took the values out of the verifier's SUCCESS output on the argument that this loop writes
evidence, notes and commit messages out of command output as a matter of course, so a printed value is one paste from
being a second occurrence — and then left them in the two paths that print when something is **wrong**, which is exactly
when output gets quoted into a card while someone diagnoses the break.

**No value appears anywhere in this plan**, for the reason the card exists: `todo render` writes every description into
`agent/TODO_BOARD.md` and `.claude/todo.db` is committed, so naming one is what puts it in the repository.

## 1. The inventory, searched rather than taken from the card

A card's list of sites is written by someone who looked once, so I searched every path in
`agent/scripts/verify/KN-306.mjs` that could put a value on screen. **The card's two are the complete set**, which is a
clean bill rather than a correction:

| line                                   | what it prints                                        | verdict                            |
| -------------------------------------- | ----------------------------------------------------- | ---------------------------------- |
| 95                                     | `${taken[0]}` in the duplicate-locales throw          | **a value**                        |
| 203                                    | `JSON.stringify(sentinel)` in the bundle-holds report | **a value**                        |
| 91                                     | the locale and the field it is missing                | clean                              |
| 164                                    | the count and each length                             | clean, and this is KN-685's change |
| 219, 236                               | fixed strings                                         | clean                              |
| 123, 131, 150, 152, 171, 183, 194, 240 | script names, counts, file paths                      | clean                              |
| 245 to 250                             | the closing paragraph, prose                          | clean                              |

**One thing the inventory turned up that is NOT this card's business**: line 236, the third check's failure, says only
"the rebuild from the restored tree still holds a sentinel" — it leaks nothing, but names neither locale nor file, so it
is the least useful message in the file. The exit speaks of paths that print a sentinel, and this is not one.

## 2. What the two messages say instead

The rule for both: **name the locale and the place, never the value.** A reader debugging a real leak needs to know which
language leaked and into which file — neither of which is the value itself.

- **Line 95.** The collision means both locales gave the same text, so there is no "the" value to name. It names the two
  locale files and the field they are read from, `jobs[0].company`, which is where the reader must go. That is strictly
  more actionable than the value was.
- **Line 203.** Per finding: which locale's sentinel was found, and the emitted files holding it.

## 3. How the report knows the locale

`scanBundle` returns `findings: [{ sentinel, files }]`, keyed by the sentinel, so a finding carries no locale. **I first
wrote that relying on the `Map`'s iteration order surviving a `filter` was "true until it is not", and the review
corrected that**: `Map` insertion order is specified and `Array.prototype.filter` preserves the retained elements'
sequence, so there is no library risk there to guard against. The locale lookup is therefore chosen for being clearer
rather than for being safer. Hoist the locale list — `sentinels()` currently inlines `['en-US', 'fa-IR']` — use it BOTH
to read the JSON files and to map back, and leave `bundle-scan.mjs` alone, since it has no need to know about locales:

```js
const LOCALES = ['en-US', 'fa-IR']
const localeOf = (sentinel) => LOCALES[marks.indexOf(sentinel)] ?? 'an unrecognised locale'
```

`marks.indexOf` is exact, because every finding's sentinel is one of `marks` by construction. The fallback exists so a
future shape change degrades to a vague message rather than to `undefined`.

## 4. The three claims, and one the card gets wrong

The card says three claims of KN-685's are false. Two are, and the third is misattributed:

1. **TRUE that it is false.** KN-685's evidence: _"THE VALUES ARE NAMED NOWHERE: … and no longer in what the verifier
   prints"_, and its closing line, _"the verifier no longer prints the values, only their count and lengths"_. Lines 95
   and 203 print them.
2. **TRUE that it is false.** KN-685's plan line 100 calls the verifier change _"comments only, no behaviour"_, while the
   same change rewrote the normal output line and the closing paragraph. Its own evidence contradicts it by describing
   the changed output as a step taken beyond the card's clause.
3. **THE CARD IS PARTLY WRONG, and the review narrowed my correction.** It says the account of where the old values
   remain "names the e2e spec and the archived roast but not the KN-685 plan, the rendered board or the committed
   database". Plan line 160 reads _"The old values remain in the e2e spec, the board and two plans"_, so it **does** name
   the board and the plans and the card is false about those two. But it does **not** name the committed database, so the
   card is right about that one. And the evidence's _"not in either plan"_ is plainly false, asserted while a plan held
   one — the ninth holder its own review found.

   **So the correction is narrower than I first wrote.** Fix the evidence through the database and re-render the board.
   Touch the plan's historical inventory only if it is meant to be exhaustive, and then by ADDING the database to it,
   never by removing the mention of the board and plans that it already gets right.

**Where the corrections go**: the evidence lives in `.claude/todo.db` and is corrected through the database with the board
re-rendered from it, never by editing the generated `agent/TODO_BOARD.md` — the route KN-685 itself used. The plan is a
file and is corrected in place, since a stale plan is corrected and never removed.

## 5. The proof: force both paths

The exit says forced and read, not reasoned about.

- **Line 95.** Point both locales at the same value temporarily, run the verifier, read the message, restore.
- **Line 203, and my first version of this could not have worked.** I wrote "plant a fixtures import into the ENTRY
  module". The verifier's own preflight stops that dead: lines 193 to 195 test `original.includes('story-fixtures')` on
  the entry and exit 1 before check 1 builds or scans anything, so line 203 would never print and the exit would have
  gone unproved. Confirmed by reading the preflight and the entry myself rather than on the review's word.
  **Plant DOWNSTREAM instead**: `src/main.tsx` imports `App` from `./app/App`, and the preflight inspects only the entry,
  so a temporary import and a non-droppable reference inside `App.tsx` make check 1 build the leak and print the real
  report.
- **The verifier will NOT catch a plant left behind in `App.tsx`.** Its leftover-plant guard, the `MARKER` check just
  above that preflight, covers the entry alone, because the entry is where it plants its own. Restoration here is mine to
  get right and nothing downstream will warn me.

**Restoration is proved by BYTES, not by Git.** `git diff --quiet` compares the worktree with the index, which does not
establish that a file equals the exact bytes it had before the proof: in an inherited or already-dirty worktree it can be
quiet over a difference that predates me. So snapshot each file's bytes before mutating, restore in a `finally`, and
byte-compare the restored file against its snapshot. A scoped `git diff --quiet` stays as an extra check, never as the
proof.

**Neither forced run's output may be pasted anywhere**, which is the whole point of the card: I will say that each path
named its locale and its files, and not quote the lines.

**Cover**: `agent/` is not a workspace, so nothing lints `agent/scripts`. The verifier's cover is Prettier drift at 0,
`node --check`, and the three checks passing afterwards — the middle one being the mutation that matters, a planted
import still making the scan FAIL.

## 6. What the review corrected

**Not ready as written**, and the headline would have cost a whole run:

1. **The bundle proof could not reach line 203.** Planted in the entry, the preflight exits first. Section 5 now plants
   downstream, in `App.tsx`.
2. **`git diff --quiet` is not restoration proof.** Byte snapshots are; Git state is an additional check.
3. **My `Map`-order worry was not a real risk**, section 3. `marks.indexOf` is right for this design because
   `sentinels()` rejects duplicates before any scan and `scanBundle` returns only values passed to it. The `-1` fallback
   stays, since that is what `indexOf` gives for an unrecognised value.
4. **My correction of the card was too broad**, section 4: it is false about the plan and the board, right about the
   committed database.

**Confirmed rather than changed**: naming the locale and the emitted artifact paths is enough, because it identifies the
source locale and the shipped location while the value stays recoverable from that locale's JSON without making command
output another holder of it. `bundle-scan.mjs` stays out of the change entirely. And correcting KN-685's evidence through
the database, with the board re-rendered from it, is the right route.

**Line 236** is less actionable but prints no sentinel and sits outside this card's exit. It earns a card only if
actionable restore-failure diagnostics are wanted, and nobody has asked for them, so it is recorded here rather than
filed.
