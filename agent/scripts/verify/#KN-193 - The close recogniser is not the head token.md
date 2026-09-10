# Plan — KN-193, the close is not the head token, and KN-197, the checker parses shell badly

## Two cards, one redesign, and I intend to say so rather than do it twice

KN-193 and KN-197 are both critical, both children of KN-184, both entirely
inside `agent/scripts/verify/lib/prompt-order.mjs`, and both are symptoms the
round-1 reviewer summed up in one line:

> Stop treating shell text as tokenizable by two ad-hoc parsers, reject shell
> expansion and escaped-quote syntax unless a real shell parser or a
> deliberately narrow grammar can establish the order.

KN-193's exit condition already contains "the two places that interpret quotes
agree, or there is one place", which is KN-197's first clause. Building them
separately means writing the same function twice. **So: one change, two exit
conditions, a verifier each.** KN-197 closes on its own checks straight after,
with evidence saying the change landed under KN-193. That is two contracts over
one piece of work, not one card quietly eating another.

## The confirmed false passes, every one reproduced by running it

| line | reads as | actually |
| --- | --- | --- |
| `grep todo move <id> done` | a close | greps |
| `env echo todo move <id> done` | a close | echoes, past the printer list |
| `todo move <id> done "$(python <p>/roast.py task)"` | a plain close | roasts FIRST, then closes |
| `sh -c 'python /x/roast.py task' \"; todo move <id> done \" # x` | nothing | roasts, then closes |
| `grep "/tmp/roast.py" task` | a roast | greps |
| a `cat <<'EOF'` heredoc whose body is a close | a close on the body line | prints |

Each puts a phantom close ahead of a real roast, so `closesBeforeRoasting`
returns `ok: true` for a block whose real order is roast-then-close. That is the
exact defect KN-190 was opened for and did not fix.

## The design: a narrow grammar, and REFUSE the rest

The mechanism already in this file that works is the `UNSUPPORTED` list. It does
not try to understand `&&`; it says it cannot order that line and stops. Every
defect above comes from the opposite instinct, parsing something almost right.

**1. One place decides what is quoted.** `tokenise()` walks the line once and
returns, besides the tokens, the text it saw OUTSIDE quotes. The operator check
then runs against that, instead of against
`line.replace(/"[^"]*"|'[^']*'/g, '')`, which is a second parser and disagrees
with the first on escapes. Two parsers guarantee a disagreement exists; the only
question is which input finds it. This deletes that question.

**2. Refuse expansion and escapes by name**, alongside `&&`, `||`, `|`, `;` and
a trailing `\`: `$(`, a backtick, `${`, `<<`, and a backslash immediately before
a quote. Each becomes a reported reason, not a guess. `<<` covers the heredoc,
whose body lines are currently parsed as commands.

**3. The close is the HEAD token.** `todo` with `move` and `done` among the rest,
or `npm` with `todo`, `move` and `done` among the rest, which is
`npm run todo -- move <id> done`. Nothing else is a close, so `grep`, `env` and
every other command stop mattering, and **the `PRINTERS` list becomes dead**:
`echo` is not `todo`. I intend to delete it rather than leave a list that no
longer decides anything, since a comment claiming a protection that is not there
is the thing KN-194 is about.

**4. The roast is matched only from UNQUOTED tokens.** It stays an argument
match, because the real line is `python <path>/roast.py task` and anchoring it to
the head finds nothing in the file this exists for. Quoted tokens stop
participating, which kills `grep "/tmp/roast.py" task`.

Note the asymmetry, deliberately: the CLOSE still accepts a quoted token in its
arguments, because `todo move <id> "done"` is a legitimate command someone may
write, and its head is `todo` so no mention can reach it. The ROAST cannot,
because its head is `python` and an argument is all it has to go on.

## What must NOT break

`todo move <id> done`, `todo move <id> "done"`, `npm run todo -- move <id> done`,
`python ~/.claude/skills/roast/roast.py task --title ... &` including the
trailing `&`, and a `#` comment line. These go in the verifier as positive
fixtures, because every negative case in this file can pass by finding nothing
and they all look identical when they do.

## What I am least sure of

**Refusing `<<` and `$(` may be too blunt.** A prompt that legitimately shows a
heredoc anywhere in its marked block will now be reported as unorderable rather
than checked. I think that is right, because the alternative is the current
behaviour, which parses the heredoc body as commands and gets the answer wrong
silently. But it is a real cost and the check now refuses documents it used to
accept.

**The escaped-quote refusal is a guess about how far to go.** `\"` is refused,
but a lone `\` mid-line is not, and I have not convinced myself there is no third
escape shape that makes the single tokeniser disagree with itself.

## How I will know it worked

Every row of the table above is a named failing case before and refused or
correctly read after. Every "must not break" line is a passing fixture.
Mutations, each of which must make a specific fixture fail: the head-token check
reverted to the `words.includes('todo')` disjunct; the roast allowed to read
quoted tokens; each new `UNSUPPORTED` entry removed one at a time; and the
operator check pointed back at its own regex instead of the tokeniser's bare
text. Per RALPH.md step 3, a clause of the exit condition with no fixture and no
mutation is a clause I have not tested, and I will say so rather than let 13
green checks stand in for it again.
