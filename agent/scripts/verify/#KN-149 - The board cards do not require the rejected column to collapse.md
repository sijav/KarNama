# Plan — KN-149, the board cards do not require رد شده to collapse

**Revision 2.** Revision 1 was checked before building and came back "not as
written". What changed and why is at the bottom, because the reasoning is worth
more than the conclusion.

## The task, from the board

KN-070 settled that رد شده sits last and is **collapsed to a count by default**,
expanding on click. DESIGN.md section 6 records it. The cards that build the
board do not mention it, so KN-043 and KN-060 can both be satisfied completely
while rendering رد شده as an ordinary always-open column.

**Exit condition.** The cards that build the board name the collapsed-by-default
count, the expand interaction, and رد شده's position after پیشنهاد کار in their
exit conditions, and a check derives that from `board.json` rather than from a
person having remembered.

## Why the obvious check is wrong, and why a literal one is right anyway

The obvious check greps each card's `exit` for words meaning "collapsed" and
"count". `agent/scripts/lib/contract.mjs` says in its own header why that fails:

> Regexes over prose cannot express "the sidebar is on the right", only "nobody
> wrote the words that mean it is on the left".

All ten of its rules are therefore **negative**, a `forbidden` pattern with
`allowed` escapes. KN-149 needs a **positive** requirement, and a positive
pattern over free prose is defeated by any rewording of the sentence it checks.
KN-184, KN-189 and KN-190 were three consecutive cards about that.

**The distinction I had wrong**: what fails is INFERRING meaning from prose
somebody is free to reword. Requiring an exact, agreed sentence is not that. It
is a textual contract, and the card either contains the contracted clause or it
does not. Nobody has to guess whether a rewording still means the same thing,
because a rewording is a change to the contract and shows up as one.

So: one canonical clause, required verbatim, in the cards named. Not in
`contract.mjs`, whose shape is negative and whose header promises it holds no
positive prose match.

## What I intend

1. **A registry local to this check**, in `agent/scripts/verify/KN-149.mjs`, one
   entry:
   - `cards`: `['KN-043', 'KN-060']`, the board screen and the full-height
     column component;
   - `clause`: the canonical sentence each card's `exit` must contain, naming
     all four things the exit condition asks for — رد شده last, after
     پیشنهاد کار, collapsed to a count by default, expanding on click;
   - `design`: the canonical DESIGN.md sentence the clause is derived from.

2. **Edit KN-043's and KN-060's exit conditions** to contain the clause. This is
   the actual work; the check only holds it in place.

3. **The verifier asserts**, reading `board.json`:
   - every named card still exists, so a renamed or removed card fails loudly
     instead of passing by absence;
   - each named card's `exit` contains the clause, compared with whitespace
     collapsed, because the board stores one string and renders it wrapped;
   - the canonical DESIGN.md sentence is still present. If it is not, the check
     fails as **STALE**, saying the decision this clause came from has moved and
     the registry needs a human. It does **not** claim to detect that the owner
     reversed KN-070.
   - **positive control**: the same comparison run against a card that must NOT
     carry the clause returns false, so an empty or trivially-true clause cannot
     pass by matching everything.

## What the plan check changed, and what it stopped

**It killed a generic `requires` field plus registry.** My revision 1 added a
machine-readable key to the task schema. The objection is the one that matters:
a key proves the card carries a key. KN-149's exit condition asks that the
cards' **exit conditions name** the requirement, because the exit condition is
what a person builds from. The key would have satisfied a metadata version of
the card and left the real hole open. It also duplicates one relationship in two
places, and is only worth it if several decisions need it, which is not the case
for one.

**It stopped me widening scope to KN-061.** I intended to add drag-and-drop,
reasoning that dropping onto a collapsed column is a different interaction. The
objection: KN-070 decided position and collapse, it did **not** decide hover,
drop or keyboard behaviour for a collapsed target. Adding it to KN-061 would
create a NEW design requirement while pretending to propagate an existing one.
That is right, and it is the better shape: the interaction needs a DECISION
first. **File a card for it** rather than smuggle it in here.

**It corrected what I would have claimed about reversal detection.** I planned
to reuse `contract.mjs`'s anchor helper and describe it as noticing if the owner
reverses KN-070. It is a negative-regression mechanism, presence plus a negation
scan inside an ASCII-period-delimited "sentence", and a rewritten decision can
evade it. So the check reports STALE and asks for a human, and says so in those
words instead of overclaiming.

**It confirmed the gap I had already written down.** There is no structural
`buildsBoard` property, and KN-043's parent list is dependency data, not a
derivation. A short explicit list verified against `board.json` is the honest
limit, and the check must not pretend it discovers future board work.

## How I will know it worked

`node agent/scripts/verify/KN-149.mjs` passes. Mutations that must be caught:
the clause removed from KN-043, the clause removed from KN-060, a named card id
changed to one that does not exist, the canonical sentence deleted from
DESIGN.md, the clause emptied to a string that matches everything, and the
loop over cards reduced to checking only the first. If any cannot be caught I
will say so on the card rather than let the silence read as coverage.
