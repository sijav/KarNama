# KN-483 · A posting page can freeze the API: postingText runs its regexes before it cuts the text

Beside `posting.ts`, per `agent/RALPH.md` step 2b.

## The card

**Why.** Anyone can call extractJob with a link, and the demo path needs no
sign-in: one hostile page per rate-limit slot stalls the API for every reader.

**Exit condition, as filed.** posting.test.ts drives postingText with a two
megabyte body of '&lt;' and it returns within a second; the slice happens before
the first replace; the API suite passes.

**From.** KN-477's review of Codex's API, A-01.

## What is true today

- `readPosting` stops reading at 2,000,000 bytes, so `postingText` is handed up
  to about two million characters.
- `postingText` decodes `&lt;` and `&gt;` first, on purpose: the second test in
  `posting.test.ts` feeds a page whose posting arrives HTML-escaped and expects
  its escaped `<style>` and `<nav>` gone. Then it removes `script`, `style`,
  `nav` and `footer` blocks, then every tag, decodes four more entities, folds
  whitespace, trims, and only then cuts to 30,000 characters, the most the
  extraction service's pasted input and `description` take.
- Two of those passes are quadratic in the worst case, as the patterns read and
  as "Measured before the change" below times them:
  - `<[^>]+>` starts at every `<` and runs `[^>]+` to the next `>`. With no `>`
    after them, each of n `<` reads to the end: the card's two megabytes of
    `&lt;` become 500,000 `<` and about 1.25 × 10^11 steps.
  - `<(script|style|nav|footer)\b[^>]*>[\s\S]*?<\/\1\s*>` does it twice over:
    `[^>]*` reads to the end from each `<script` with no `>` after it, and
    `[\s\S]*?` reads to the end from each opening with no closing tag after it.
- The other passes are literal patterns and `\s+`, which are linear.
- The service runs this on the API's one Node process with no limit of its own:
  the fetch's 15 seconds covers reading the page, not this.

## Why not the card's own fix

Cutting the fetched HTML to 30,000 characters before any pattern runs meets
"returns within a second", but it cuts markup, not text. A posting page's head,
inline styles and scripts, JSON-LD and navigation can come to more than 30,000
characters before the posting's first word, and the service answers
`POSTING_UNAVAILABLE` when fewer than 30 characters of text survive. The cut
would trade a hostile page's stall for losing ordinary postings on the path the
product is built around, adding one by its link. So this plan keeps the whole
body and makes the work linear instead, and changes the exit condition's second
clause to match, if the plan review agrees.

## The approach

1. **Keep every pass, its order and its exact output**, so nothing the tests
   and the extraction rely on moves: decode `&lt;` and `&gt;`, drop the four
   blocks, drop tags, decode the rest, fold whitespace, trim, cut to 30,000.
2. **Rewrite the two quadratic passes as scans that never go back**, with the
   meaning of the patterns they replace. A failed closing search happens at
   most once per name, and every other scan starts where the one before it
   ended or inside what it removed, so the work is linear in the body:
   - **Blocks.** Find the next `<script`, `<style`, `<nav` or `<footer` and a
     word boundary with a global pattern from the last position, under the
     same `i` and `u` flags. Find the `>` that ends the opening with `indexOf`,
     then its closing tag, `</name\s*>` case-insensitively, from there with that
     name's own global pattern and `lastIndex`. Found: remove from the opening
     to the end of the closing, as one space, and go on after it. No `>` after
     an opening: no later opening can end either, so the pass stops. No closing
     tag for a name: no later opening of that name can close, so that name is
     skipped from then on, and the search goes on one character after the
     opening, which stays, as the pattern leaves it.
   - **Tags.** From each `<`, `indexOf('>')`. None: the pass stops and the rest
     stays. Directly after it, `<>`: the pattern needs a character between, so
     the `<` stays and the scan moves one on. Otherwise the tag becomes one
     space and the scan goes on after the `>`.
3. **Prove the meaning did not change** with a differential test: the old
   pattern chain kept in the test as the reference, run on a few thousand short
   strings from a seeded generator over the pieces that matter, `<`, `>`, `/`,
   `script`, `SCRIPT`, `style`, `nav`, `footer`, `&lt;`, `&gt;`, `&amp;`,
   spaces, newlines and letters, each short enough that the reference is fast,
   compared with the new function exactly.
4. **Prove it is linear** with hostile bodies of two million characters, each
   returning inside a second: the card's `&lt;` repeated; `<script` repeated
   with no `>`; `<script>` repeated with no closing tag; `&lt;nav&gt;` repeated;
   one `<` followed by two million letters. And a posting whose text starts
   after 60,000 characters of `<style>` and `<script>` comes through whole, the
   case the card's own fix would have lost.
5. **Positive controls**: put the old chain back and see the hostile tests fail
   to finish inside an outer minute, then restore it byte for byte; break the
   tag scan's `<>` rule and see the differential test fail.
6. **Amend the card's exit condition** on the board, with a note saying why,
   once the plan review has read this.

## What changes, file by file

- `apps/api/src/extraction/posting.ts`: `postingText` keeps its signature; two
  private functions replace two `.replace` calls, with a comment saying why
  they scan rather than match.
- `apps/api/src/extraction/posting.test.ts`: the differential test, the hostile
  bodies and the deep posting.
- The card: the exit condition's second clause.

## What I expect to be hard, and what I am unsure about

- **Exact equivalence at the edges**: `\b` after the name under `i` and `u`, a
  backreference matching the closing name case-insensitively, `\s*` before the
  closing `>`, and an opening that never closes with another opening inside its
  attributes. The differential test is how I will find out rather than reason
  about it, so the generator has to be able to build each of those shapes.
- **A one second budget in a unit test** on a slow runner. Two million
  characters of linear scanning should take tens of milliseconds; if it comes
  near the budget the implementation is wrong, not the machine.
- **Whether exact equivalence is the right goal at all.** The old chain leaves
  an unclosed `<script>`'s text in, where a prompt injection could sit. Changing
  that is a change of behaviour with its own tradeoff, so it is not this card's;
  if the review thinks it matters, it becomes a card of its own.
- **Coverage**: the API holds 100 percent, and the stop and skip branches each
  need a case, which explicit tests give whatever the generator reaches.

## How I will know it worked

The hostile bodies each return inside a second where the reference chain does
not finish them inside a minute; the differential test passes on every
generated string and fails when the tag scan's `<>` rule is broken; the deep
posting comes through; `npm test` in `apps/api` passes with coverage at 100
percent; lint and `tsc` are clean.

## Measured before the change

The old chain on growing bodies, `kn483-measure.mjs` in the session's
scratchpad: `&lt;` repeated took 7, 26 and 105 ms at 20,000, 40,000 and 80,000
characters; `<script` repeated with no `>` 31, 122 and 534 ms; `<script>`
repeated with no closing tag 6, 23 and 93 ms; `&lt;nav&gt;` repeated 2, 9 and
35 ms; one `<` before letters stayed at 0. Four times the time for twice the
page, so two million characters is between about twenty seconds and six
minutes of the API's one process, depending on the shape.

## The plan review, and what changed

Codex, plan kind with web search, 2026-09-14, archived at
`%TEMP%/claude-roast/2b1874631dd1/20260914T134838-plan-kn-483-a-posting-page-can-freeze-the-api-posting-3b5b54.md`.

- **The card's own fix caps markup, not content**, and a fixed prefix of the
  raw page cannot promise the description has begun. It could not fetch
  Jobinja, e-estekhdam, LinkedIn or Lever raw to count their markup, and said
  the argument holds without that. Accepted as the plan had it: the whole two
  megabytes stay.
- **Amend the card before the build, not after**, since its second clause names
  the slice. Done on the board before any code, with a note.
- **The scans stay linear and keep the patterns' meaning** only if they use the
  real `iu` opening pattern and an `iu` closing pattern rather than a
  hand-written word boundary or case folding, mark a name unclosed before any
  more `>` search for it, collect the kept spans in an array joined once, and
  never search from the start again. Accepted, all four.
- **V8's linear-time RegExp is no way out**: its `l` flag needs a disabled
  experimental V8 flag, and its fallback excludes backreferences and `i` and
  `u` patterns. There is no HTML tokenizer in Node or in the repository, and one
  would change what malformed markup means. Accepted: no dependency.
- **Keeping the old output is right for this card**; an unclosed script's text
  in front of the model is a real concern, filed apart. Accepted: KN-483's child
  card.
- **The old chain cannot be a Vitest control**: a synchronous pattern blocks its
  worker, and no in-process timeout interrupts it. Accepted: the slow controls
  run in a child process the parent kills, and the tests only time the new
  function.
- **A few thousand generated strings are coverage, not proof**, and the
  alphabet reached no Unicode word character. Accepted: the generator gains `ſ`
  and the Kelvin sign, and explicit cases cover a name followed by a letter that
  folds to a word character, a malformed opening with a real block later, each
  missing `>` and missing closing tag, `<>`, `<x>` and several `<` before one
  `>`.
