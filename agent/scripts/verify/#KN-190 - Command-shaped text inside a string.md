# Plan — KN-190, a mention of a command is not the command

## The task, from the board

`lib/prompt-order.mjs` finds the close and the roast with unanchored regexes
over each line, so any line CONTAINING the text counts. The KN-184 reviewer ran
a block whose first line is `echo "todo move <id> done"`, followed by the real
roast command and then the real close, and got `ok: true`: the `echo` was read
as the close, so the order looked right while the actual commands ran the wrong
way round.

**Exit condition.** The recognisers match a command in command POSITION and not
text embedded in a string or an argument; the reviewer's `echo` fixture fails
before the fix and passes after; and a line that genuinely runs the command in a
pipeline or after a semicolon is decided deliberately rather than by accident.

## The obvious fix is wrong, and that is the whole difficulty

"Anchor to the start of the line" is the first thing that comes to mind and it
breaks the real file. The roast line in both prompts is:

    python ~/.claude/skills/roast/roast.py task --title ... &

The command in command position is `python`. `roast.py` is an ARGUMENT. So a
rule that demands the roast invocation start the line finds nothing in the file
it is written for, and reports a correct prompt as having no roast command.

The close line is the opposite: `todo move <id> done` really does start its
line. Two different shapes, and one anchor cannot serve both.

## What I intend instead: strip the quotes, then look

A quoted string is DATA, not a command. So:

1. Drop lines that are blank or start with `#`, as now.
2. Remove every single- and double-quoted substring from the line.
3. Look for the two invocations in what is left.

`echo "todo move <id> done"` becomes `echo ` and matches nothing. The real roast
line has no quotes and still matches. It handles the reviewer's case without
breaking the case the file actually contains, which anchoring does not.

**Belt and braces**: a line whose first word is a printer, `echo`, `printf`,
`cat`, is not running anything, so it is skipped outright. That covers the
unquoted `echo todo move x done`, which stripping alone would still match. It is
a small blacklist and I would rather name it than pretend it is general.

## The clause I am least sure of

The exit condition says a command "in a pipeline or after a semicolon" should be
**decided deliberately rather than by accident**. My decision: `todo move x done
&& roast ...` on ONE line is REPORTED, not accepted, because the order within a
line is a different question from the order between lines and reading it as
either would be a guess. That is already what the current code does when both
land on one line, and I intend to keep it and say so explicitly rather than
leave it as a side effect.

## How I will know it worked

The reviewer's `echo` fixture is a named case that fails before and passes
after, the real prompt shape still resolves both commands, and a mutation
removing the quote-stripping is caught.
