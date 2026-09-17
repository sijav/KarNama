# KN-710 · The comments only proof would erase a code change hidden in a literal

Child of KN-698 by the one level rule, filed out of KN-708's own roast on 2026-09-17.

**Why**, from the board: the next card that changes only comments will reach for this proof, because recording it on the
board is exactly what evidence is for, and will run it on a file that does have a string or a regex carrying a comment
marker. Then a real code change ships inside a commit whose message says comments only, and the check that was supposed
to catch it reported clean.

**Exit AS FIRST FILED**, which section 2 withdraws and section 3 replaces. It is quoted here because the argument of
this plan is about it: a comments only change is proved by a check that either refuses when either version holds a
comment marker inside a string, template literal or regex literal, naming the file and the literal, or reads the commit
diff and asserts every changed line is a comment line. Shown by running it twice: on `routes.ts`, which passes, and on a
fixture whose string contains a comment marker and whose code differs, which the stripping proof passes wrongly and the
new one refuses.

**Exit as it now stands on the board**, rewritten 2026-09-17: the rule is recorded in `AGENTS.md` section 7, that a
regex comment stripper cannot establish a comments only change and that `git diff` does not establish it either, being
line based, so what settles it is reading the changed lines and judging them; NO gate is built; KN-708 stays closed
with its evidence as written; and it is checked by reading the bullet beside its neighbours.

## 1. The defect is real, and it lives in a claim rather than in code

KN-708 changed only comments in `routes.ts` and proved it by stripping comments from the file as it stood before the
edit and as it stood after, with a regex stripper, then comparing the remaining bytes. Its evidence states that method
as SOUND, on the argument that the same stripper runs on both sides so whatever it mangles it mangles twice.

That argument fails on one case. A regex stripper is not a TypeScript tokenizer, so it also deletes text inside a
string, a template literal or a regex literal that happens to contain `/*` or `//`. A real code change made INSIDE such
a literal is deleted from both copies and the two compare equal, so the check reports comments only about a commit that
changed code.

It happens to hold for `routes.ts`, whose only regex literal is the hash stripper and which carries no string with a
comment marker in it. So KN-708's conclusion stands, and nothing here reopens it. What is wrong is the general claim.

## 2. The exit I wrote asks for a GATE, and two rules forbid building one

I filed this card an hour after the roast, and its exit asks for a check that refuses, plus a fixture the old proof
passes wrongly. Both rules below say not to build that.

**`agent/RALPH.md` rule zero.** "Never invent a gate the owner did not ask for. No score thresholds, no required
rounds, no check that refuses to let finished work close, no new rule that makes the loop harder to satisfy than the
owner made it." Its test is put as a question: "Did the owner ask for this refusal, or am I adding it because I found
something? If the second, the fix is to DO the work, or to write the rule down, and not to build something that says
no." The owner did not ask. I found something.

**The owner's instruction of 2026-09-11, which is stronger, because it is the owner's rather than the loop file's.**
`AGENTS.md` line 389: "No per-task verifier script and nothing re-run". `agent/RALPH.md` line 311: "No per-task
verifier script, no production build pixel check, no regression batch." Line 117 says a close needs "one line of what
was done; no verify command is needed or run". The exit I wrote asks for exactly the artefact those retired, and a
later instruction overrides an earlier one, so the retirement stands over my card.

**And this card is about the LOOP, not the product.** `agent/RALPH.md` says a finding about the loop rather than the
product is `low` unless it is actively breaking the work, and records what happens otherwise: five cards on a checker
for the ordering of two lines in a markdown file, each filed critical, so `next` kept handing them back while
sixty-five component cards sat untouched. A roast of the agent's own machinery always produces more machinery. I filed
this `medium`.

## 3. What this card does instead

1. **Write the rule into `AGENTS.md` section 7**, "What keeps going wrong, one line each", which is the file every
   iteration reads and the place its neighbours already live. One bullet, beside "An absence proves nothing without a
   positive control", which is the same family of mistake.

   The review asked for it in `agent/RALPH.md` AS WELL, and I am not doing that. Recording why rather than ignoring
   it: section 7's own header says the lessons were moved there so the compressed head stays short and they "sit in a
   file every iteration reads", and `CLAUDE.md` gives one working agreement as the whole reason this repository keeps
   `AGENTS.md` instead of two copies, "so there is one file to maintain rather than two copies that drift". A lesson
   written into two files is the drift that argument warns about, and a reader at close time is already sent to
   `AGENTS.md` section 5 by `agent/RALPH.md` itself.

2. **Correct this card on the board**: severity to `low`, because it is about the loop; and the exit rewritten to ask
   for the rule recorded rather than for a gate built.
3. **Build nothing that refuses anything.**

## 4. The rule, as proposed

The review set three bounds on the wording, and the first draft broke one of them: do not bless comment stripping in
general, **do not claim a diff tool parses TypeScript**, and do not turn reading the diff into a gate. That draft said
"the commit diff is the proof", which claims for `git diff` the very thing this card faults the stripper for claiming.
`git diff` is line based and just as blind to lexical context, so a changed line inside a template literal reads like
any other line. An overclaim inside the correction of an overclaim, one draft later.

> A regex comment stripper cannot prove a change is comments only. It is not a lexer, so it also erases text inside a
> string, a template literal or a regex literal holding `/*` or `//`, and a code change made inside one vanishes from
> BOTH copies and compares equal. `git diff` does not settle it either, being line based and equally blind to lexical
> context. What settles it is reading the changed lines yourself and judging what each one is. KN-708 claimed the
> stripper sound, KN-710 corrected the claim. Neither of these is a gate.

## 5. What must not change

- **KN-708 stays closed.** A finding never reopens a closed card, and its conclusion was right for its own file.
- **Its evidence is not rewritten.** It is a record of what was claimed at the time, and KN-685 already settled that a
  closed card's record is not edited to look better. The rule in `AGENTS.md` is what the next reader meets instead.
- **No existing verifier is touched.** The scripts under `agent/scripts/verify/` predate the owner's 2026-09-11 rule,
  and nothing here adds to them.

## 6. The proof

Reading, which is right for a rule. The bullet is in `AGENTS.md` section 7 and says what a READER must do rather than
what a tool proves; the card carries `low` and an exit asking for a record rather than a refusal; Prettier drift stays
0 on `AGENTS.md`, measured at 0 before the edit so `prettier --write` is safe there; and its em dash count stays at the
16 measured before the edit, the ones KN-709 carries, since this adds none.

## 7. What the review ruled, and what I judged

**The ruling.** The smallest sound revised exit is to record that regex stripping cannot establish a comments only
change, amend this card to explain the withdrawn gate and send readers to the actual diff, and leave KN-708 unchanged;
reading those places is sufficient proof for a documentation task. It confirmed the language premise from source, that
ECMAScript lexes comments, strings, templates and regex literals as distinct contexts, and that TypeScript's regex
support concerns regex literals rather than any general regex tokenizer. So question 1 is answered: correcting this
open card's exit is the sound move, not goalpost moving.

**Its correction, which I had earned.** `git diff` is line based and cannot supply a lexical assertion, so my
replacement rule was itself an overclaim. Section 4 now says what a reader does instead, and says plainly that neither
the stripper nor the diff is a gate.

**Where I judged against it.** It asked for the rule in `agent/RALPH.md` as well. Section 3 records why one file.

**Question 2 has no clean answer and this says so rather than pretending.** KN-708's evidence on the board still states
the wrong method, it renders into `agent/TODO_BOARD.md`, and evidence exists to be reused. Nothing short of editing a
closed card's record reaches a reader who copies that evidence without reading the working agreement, and KN-685
settled that such a record is not edited to look better. The rule in `AGENTS.md` is what the reader meets who does read
it, which every iteration is told to do, and that is the honest limit of this card.
