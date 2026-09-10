1. Yes. This marked block returns `{ ok: true }`, but the command substitution roasts before `todo` runs:

```bash
<!-- roast-order -->
```bash
todo move <id> done "$(python ~/.claude/skills/roast/roast.py task)"
python ~/.claude/skills/roast/roast.py task &
```
```

The first line is classified only as a close because the tokenizer treats the quoted substitution as one inert token. A shell evaluates `$(...)` before invoking `todo`, so the actual order is roast, close, roast. I reproduced the `ok: true` verdict.

2. Yes, and it is still the already-filed KN-192 defect. A correct stale marked block followed by the real unmarked reversed block returns `{ ok: true }`:

```md
<!-- roast-order -->
```bash
todo move <id> done
python /x/roast.py task &
```

## Actual loop block
```bash
python /x/roast.py task &
todo move <id> done
```
```

The parser only validates claimed blocks. It cannot know which unmarked block is real. It also accepts the marker inside an existing code block and binds it to that code block’s closing fence, because it has no fence-state tracking.

3. The quote-stripping regex is exploitable, not merely untidy. This line is valid shell:

```bash
sh -c 'python /x/roast.py task' \"; todo move <id> done \" # x
```

The shell runs the inner roast, then runs `todo`. The regex treats the escaped quotes as a quoted span and removes the semicolon; the tokenizer also mishandles escapes and returns neither a close nor a roast. Put it before an ordinary close and roast:

```bash
<!-- roast-order -->
```bash
sh -c 'python /x/roast.py task' \"; todo move <id> done \" # x
todo move <id> done
python /x/roast.py task &
```
```

`closesBeforeRoasting` returns `{ ok: true }`, while actual execution begins roast, close.

4. The missing check was an exit-condition mutation suite with a named counterexample for every semantic clause. For this card, it should have included:

- A “close must be head token” fixture, `grep todo move <id> done`.
- A “quoted argument is still a valid close” positive fixture, `todo move <id> "done"`.
- A mutation that disables quote state and must make that positive fixture fail.
- A shell-expansion fixture such as the command-substitution case above, or an explicit refusal of shell expansions.

That is a testable contract: require every declared guarantee to have both a passing fixture and a targeted mutation that makes that fixture fail. The current verifier instead tests selected examples and has no test for its claimed head-token property. [KN-190.mjs](/D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-190.mjs:60) proves only the two “real shapes,” not the exit condition.

Findings:

- critical — Quoted command substitution causes a false pass and executes roast before close. The tokenizer labels quoted content as data, but shell command substitution is execution, not data. The verifier consequently records the close on the first line and the visible roast on the next line, returning `ok: true`. [prompt-order.mjs](/D:/Kar/Gandom/KarNama/agent/scripts/verify/lib/prompt-order.mjs:109), [prompt-order.mjs](/D:/Kar/Gandom/KarNama/agent/scripts/verify/lib/prompt-order.mjs:182)

- critical — Escaped quotes let the regex hide real shell separators, producing another false pass. `line.replace(/"[^"]*"|'[^']*'/g, '')` is a separate, incorrect shell parser from `tokenise()`. The reproducer above bypasses `UNSUPPORTED`, then hides a roast-before-close sequence. [prompt-order.mjs](/D:/Kar/Gandom/KarNama/agent/scripts/verify/lib/prompt-order.mjs:157), [prompt-order.mjs](/D:/Kar/Gandom/KarNama/agent/scripts/verify/lib/prompt-order.mjs:160)

- major — Marker selection is still not a declaration. `includes(MARKER)` accepts an inline marker or one rendered literally inside a code fence, and fence detection has no Markdown fence state. This confirms KN-192 remains open; a stale valid block can mask a reversed unmarked one. [prompt-order.mjs](/D:/Kar/Gandom/KarNama/agent/scripts/verify/lib/prompt-order.mjs:48), [prompt-order.mjs](/D:/Kar/Gandom/KarNama/agent/scripts/verify/lib/prompt-order.mjs:61)

I ran `KN-190`, `KN-184`, and board validation. They pass, which demonstrates the verifier does not cover these counterexamples.

VERDICT
score: 1.5
criticals: 2
one-line: Stop treating shell text as tokenizable by two ad-hoc parsers, reject shell expansion and escaped-quote syntax unless a real shell parser or a deliberately narrow grammar can establish the order.