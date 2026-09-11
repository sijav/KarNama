# KN-062 · Shared story fixtures

Beside the fixtures. Written after the build, on 2026-09-11, when the owner had
asked for speed; the approach was small enough to record rather than check.

**Exit condition, from the board.** Every component story that needs data uses
the shared fixtures, a Docs page rendering many stories at once seeds without
error, the fixtures never appear in the production bundle and a test asserts
that, and each fixture set has a long value that exercises truncation in both
languages.

## What was built

- `fa-IR.json` and `en-US.json`: the nine statuses with sample names and
  counts, a renamed status, a long status name, six job opportunities, three
  contacts, one with neither email nor phone as KN-071 allows, and two notes,
  in parallel in both languages, every set holding a long value. JSON because
  the Persian record data may not be a literal in a `.ts` file, per AGENTS.md;
  companies are fictional and links use `example.com`.
- `index.ts`: each locale parsed once into typed records, every status token
  checked against the nine and every one of the nine named, frozen all the way
  down; `fixtures(locale)` and `statusName(locale, token)`.
- **No seed step.** There is no store for stories to write, so a Docs page
  rendering every story reads the same frozen objects from each and nothing
  can interleave, which is what "seeds without error" asks. When screens bring
  Apollo, a seeding layer builds on these records.
- `story-fixtures.test.ts`: nothing that ships imports the folder, scanned
  over every source file with a planted import as the positive control; both
  languages hold the same records; every set holds a long value in both; the
  records are frozen and the same on every read; a bad token and a missing
  status are refused. The module is fully covered.
- The Status Chip, Filter Chip and Input stories take their sample names and
  the typed job title from the fixtures instead of literals; KN-239's verifier
  follows the Status Chip's changed args line.
