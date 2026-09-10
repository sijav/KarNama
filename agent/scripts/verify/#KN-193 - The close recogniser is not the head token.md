# Plan — KN-193, the close is not the head token, and KN-197, the checker parses shell badly

**Revision 2.** Revision 1 was checked and came back "not yet": the direction was
right and the grammar still let text report a safe order the shell would not
execute. What changed is at the bottom.

## Two cards, one redesign

KN-193 and KN-197 are both critical, both children of KN-184, both entirely
inside `agent/scripts/verify/lib/prompt-order.mjs`, and both are symptoms of one
sentence from the round-1 reviewer:

> Stop treating shell text as tokenizable by two ad-hoc parsers, reject shell
> expansion and escaped-quote syntax unless a real shell parser or a
> deliberately narrow grammar can establish the order.

KN-193's exit condition already contains "the two places that interpret quotes
agree, or there is one place", which is KN-197's first clause. **One change, two
exit conditions, and a verifier each with its own fixtures and its own
mutations.** The plan check was explicit that this is only legitimate on that
condition: KN-197 may not close because KN-193's verifier is green.

## The confirmed false passes, every one reproduced by running it

| line | reads as | actually |
| --- | --- | --- |
| `grep todo move <id> done` | a close | greps |
| `env echo todo move <id> done` | a close | echoes, past the printer list |
| `todo move <id> done "$(python <p>/roast.py task)"` | a plain close | roasts FIRST |
| `sh -c 'python /x/roast.py task' \"; todo move <id> done \" # x` | nothing | roasts, then closes |
| `grep "/tmp/roast.py" task` | a roast | greps |
| `grep /tmp/roast.py task` | a roast | greps, and quoting is not why |
| a `cat <<'EOF'` heredoc whose body is a close | a close on the body line | prints |
| `todo move <id> done &` then a roast | ordered close-then-roast | no guarantee the close finished |

## The design: an ALLOWLIST grammar, not a longer denylist

Revision 1 proposed adding `$(`, backtick, `${`, `<<` and `\"` to the refused
list. The plan check's objection is the one that matters: **that is a list of
things I happened to think of**, and it had already missed process substitution,
`<(` and `>(`. A boundary rule replaces it.

**1. One lexer, and it refuses before anything is classified.** `lex(line)`
walks the line once and returns either a word list or a refusal. It accepts only:

- **bare words** of a safe character set: letters, digits, and `_ - . / : ~ = + @ ,`
- **`<placeholder>`** as one bare word. A deliberate, narrow exception: `<` and
  `>` are redirection in a real shell, and `todo move <id> done` is what the
  loop prompt actually writes. A bare `<` or `>` NOT forming a placeholder is
  refused.
- **single-quoted literals**, which cannot expand.
- **double-quoted literals containing no `$`, no backtick and no backslash.**
  Bash expands `$(...)`, `${...}` and backticks *before* quote removal, so
  quoted text is not categorically inert. That was the false premise under
  KN-190 and it is why the reproducer above works.
- **one trailing `&`**, recorded as a flag rather than a word.

Anything else — every other metacharacter, any backslash, an unterminated
quote — is a refusal naming what it saw. `&&`, `||`, `|`, `;`, `<<`, `<(`, `>(`
and a trailing `\` all fall out of this rather than being enumerated.

The operator check stops being a second parser over
`line.replace(/"[^"]*"|'[^']*'/g, '')`. There is one place that decides what is
quoted, so the two cannot disagree.

**2. The close is an exact command shape**, not `todo` plus the right words
somewhere:

- `todo move <arg> done` followed by any number of allowed trailing options
- `npm run todo -- move <arg> done` likewise

**and NOT backgrounded.** `todo move <id> done &` is refused with its own
reason: backgrounding the close does not guarantee it completed before the next
line runs, so the block's textual order is not its real order. This is the case
I would never have thought of.

**3. The roast is an exact executor shape too.** Revision 1 said "unquoted
tokens", which the plan check killed in one example: `grep /tmp/roast.py task`
is entirely unquoted. So:

- `python <path ending in roast.py> task …`
- `node <path ending in roast.mjs> task …`
- `npm run roast -- …`

with the trailing `&` allowed here, because backgrounding the roast is exactly
what the real prompt does. The head must be the interpreter; `roast.py` staying
an argument is why this cannot be anchored to column one.

**4. `PRINTERS` becomes genuinely dead, and I will prove it rather than say it.**
The plan check was right that revision 1 could not delete it: under an
unquoted-token roast rule, dropping the printer skip reopens
`echo /tmp/roast.py task`. Under a head-constrained roast grammar, `echo` is not
`python`, so it cannot. The evidence is a mutation that must SURVIVE: delete
`PRINTERS` and every fixture still behaves. If any changes, it was not dead and
it stays.

## What must NOT break

`todo move <id> done`, `todo move <id> "done"`,
`todo move <id> done --evidence "ran a; b; c"`,
`npm run todo -- move <id> done`,
`python ~/.claude/skills/roast/roast.py task --title ... &` including the `&`,
and a `#` comment line. Positive fixtures, because every negative case in this
file can pass by finding nothing and they all look identical when they do.

## What I am least sure of

**The placeholder exception.** Allowing `<id>` means the lexer accepts a
character that is redirection in every real shell. I think it is right, because
the documents being checked are prompts full of placeholders and refusing them
would refuse the file this exists for. But it is the one place the grammar
knowingly diverges from shell, and if there is a way to build a redirection that
looks like a placeholder, this is where it lives.

**Whether an allowlist can be too strict to be useful.** A marked block that
does something ordinary but unanticipated now gets refused rather than checked.
Refusing loudly beats deciding wrongly in silence, but the cost is real and I
would rather name it than discover it.

## How I will know it worked

Every row of the table is a named case: refused, or read correctly, and failing
before. Every "must not break" line is a passing fixture. Mutations, each tied
to one clause: the close relaxed to `words.includes('todo')`; the close allowed
to be backgrounded; the roast relaxed to any command with `roast.py` among its
arguments; double quotes allowed to contain `$`; the placeholder exception
widened to bare `<`; and the mutation that must SURVIVE, deleting `PRINTERS`.
Per RALPH.md step 3, a clause with no fixture and no mutation is a clause I have
not tested, and I will say so rather than let green checks stand in for it.

## What the check changed

- **The close became an exact shape.** Revision 1 said "`todo` head plus `move`
  and `done` among the rest", which the check named as the most likely wrong
  step: loose "remaining tokens" is how `grep todo move <id> done` got in.
- **The roast became an exact shape.** "Unquoted tokens" was insufficient, shown
  with `grep /tmp/roast.py task`, which quoting has nothing to do with.
- **`PRINTERS` is not dead yet.** My own question asked whether deleting it was
  safe; the answer was no under revision 1's roast rule, and yes only once the
  roast is head-constrained. Deleting it is now conditional on a surviving
  mutation rather than on my reasoning.
- **A denylist became an allowlist.** My refused list had already missed process
  substitution, which is the argument against enumerating.
- **The backgrounded close.** `todo move <id> done &` is textually ordered and
  guarantees nothing. Entirely from the check.
- **Quoted text is not inert**, because expansion happens before quote removal.
  Revision 1 still half-believed the KN-190 premise.
