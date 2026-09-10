# Plan — KN-132, pin what is byte-compared

## The task, from the board

`.gitattributes` pins `apps/api/schema.gql` to LF and the Figma captures to
`-text`, both because they are compared byte for byte. Two files added since are
compared the same way and are NOT pinned:
`packages/graphql/src/generated.ts`, compared literally against a fresh
generation by `packages/graphql/scripts/check-generated.mjs`, and
`packages/graphql/src/operations/health.graphql`, which
`agent/scripts/verify/KN-128.mjs` edits by matching a literal string containing
a newline.

This machine has `core.autocrlf=input`, so nothing converts and both work. On a
machine with `core.autocrlf=true` the generated comparison reports the file
stale when no schema changed, and the verifier's replacement stops matching.

**Exit condition.** A checkout with `core.autocrlf=true` passes `npm run build`
and `agent/scripts/verify/KN-128.mjs`, **proved by simulating that checkout**
rather than by reasoning about it, and `.gitattributes` covers every file any
script compares byte for byte, **derived from the scripts rather than listed by
hand**.

## The two clauses, and which one is actually hard

**Pinning is trivial.** Two lines in `.gitattributes`, with the reason written
beside them the way the existing two entries have it.

**"Derived from the scripts rather than listed by hand" is the hard clause**,
and it is the one worth getting right, because the card's whole complaint is
that this lesson has now been learned three times and a hand-maintained list is
what let it be learned a third time. A check that hardcodes the four paths would
be the same defect wearing a verifier.

## How I intend to derive it

A file is byte-compared if a script reads it and compares its CONTENT against
something rather than parsing it. Approximating that from source is the risk.
My intended rule, narrow and stated so it can be argued with:

1. Scan `agent/scripts/**/*.mjs` and `packages/*/scripts/**/*.mjs`.
2. Collect every string literal in them that looks like a repository path with a
   file extension and that resolves to a tracked file.
3. Keep the ones whose surrounding statement reads the file: the literal appears
   within a `readFileSync` or `join(...)` chain feeding one.
4. Of those, keep the ones the script then compares as text: the read value is
   used with `===`, `!==`, `.includes(`, `.replace(` against another literal, or
   passed to a hash.
5. Every survivor must be pinned in `.gitattributes`, or the check fails naming
   it and the script that compares it.

**Where this will be wrong**: step 4 is a heuristic over source text, and this
repository has been bitten repeatedly by exactly that shape, KN-128 and KN-072.
A `.replace(` on a path string rather than on file content would be a false
positive. A comparison done through a helper in another module would be a false
negative, which is the dangerous direction.

**The fallback if the derivation cannot be made honest**: keep the list explicit
but put it in ONE place that both the check and a human read, and have the check
prove the list is complete a different way, by asserting that every file a
script reads with `readFileSync` and does not `JSON.parse` is either pinned or
named in an explicit exemption with a reason. That is still derived, but the
derivation is "everything, minus what someone justified".

## Simulating the checkout

`git clone` this repository into a temp directory with `core.autocrlf=true`, or
`git -c core.autocrlf=true checkout-index -a` into one, and then assert the
pinned files contain no CR. That proves the PIN works, which is the mechanism.

Running `npm run build` there needs `node_modules` and is minutes of install for
a line-ending question, so I intend to prove the mechanism rather than the whole
build, and to say so plainly rather than claim the exit condition's words. If
that is not enough, the honest answer is to say the clause is unmet rather than
to describe a weaker proof in the card's language.

## Corrected by the plan check

- **`git check-attr` and `git ls-files --eol` are diagnostics, not a
  substitute.** They report assigned attributes and the CURRENT index and
  worktree state, not the result of a hypothetical checkout under another
  configuration. So the simulation stays.
- **Step 4 is the weak step and it is dropped.** Inferring a byte comparison
  from `readFileSync` plus nearby syntax fails in the dangerous direction.
- **Mutation-test by removing each new attribute IN the temporary checkout**,
  and require the file to gain CRLF for it. That proves the attribute is what
  protects the file, which is the actual claim.

## What replaces the derivation

Stop deriving and RUN the conversion. Two things make that sound:

1. **A positive control on the simulation itself.** An unpinned markdown file
   in the same checkout must come out with CRLF. Without that, every "no CR
   found" result is equally consistent with a checkout that converted nothing,
   which is the shape of vacuous pass this repository keeps shipping.
2. **A positive control on the derivation.** The heuristic cannot be proved
   complete, but it CAN be required to find the files already known to be
   byte-compared. If it returns fewer, the derivation is broken and the check
   fails saying so, rather than passing because it found nothing.

That turns "derived from the scripts rather than listed by hand" into a check
with a floor under it, instead of a heuristic trusted on its own word.

## What I am unsure about

- Whether the derivation above is honest enough to be worth having, or whether
  it will produce a check that passes because its heuristic missed the file that
  matters, which is the exact failure this card exists to stop.
- Whether skipping `npm run build` in the simulated checkout leaves the exit
  condition genuinely unmet. I think proving no CR survives is the mechanism the
  build failure would be a symptom of, but the card says build, and I would
  rather record the gap than paper it.
