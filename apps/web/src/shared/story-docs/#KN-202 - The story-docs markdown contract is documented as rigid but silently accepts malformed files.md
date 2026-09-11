# KN-202 · The story-docs markdown contract is documented as rigid but silently accepts malformed files

Beside the parser. Recorded after the fix, on 2026-09-11, under the owner's
rules of that day.

**Exit condition, from the board.** parseStoryDoc reports a malformed file
rather than absorbing it: an unknown level-two heading and a duplicate
level-three name are each errors with their own message naming the file and
the heading. The guard surfaces them. Both are unit tests, and a mutation
removing either rejection makes its test fail. The existing eight docs files
still parse unchanged, proved by the guard still passing.

## What was found

Worse than the card said for the unknown section: after `## Stories`, the
lines under `## Accessibility` were folded into the last story's prose, and a
`###` under it became a story of its own that no file exports. Two more shapes
vanished the same way: text under `## Props` or `## Stories` before their first
`###` was dropped, and a `###` before the first section went into the
description.

## What was done

- `parseStoryDoc` returns `problems`, one Error per line at fault, naming the
  line and the heading as written: an unknown `##` section, whose lines and
  entries are then kept out of every entry; a second `###` of one name in a
  section, whose prose is dropped and the first kept; text under a section
  before its first `###`; and a `###` outside both sections. Errors because
  whoever wrote the file reads them, never a job seeker, which is also why the
  lingui rule's existing `Error` exemption covers their text. A Docs page
  renders the rest, as before.
- The guard reads every markdown file in both languages and fails on any
  problem, naming the file; it also checks it read more files than there are
  story files. All the docs files in the repository fit, so none changed.
  Planting an `## Accessibility` section in one fails the guard with
  `en/Core-PreferencesProvider.md does not fit the story-docs format` and the
  line.
- Six parser tests cover the four problems, the kept first entry, and one
  name under both sections not counting as a second entry.
- AGENTS.md describes the format and what fails it.

## What is not claimed

- No mutation run: the owner's rule of 2026-09-11 dropped mutation proofs at
  the close. Each rejection has its own test asserting its message.
