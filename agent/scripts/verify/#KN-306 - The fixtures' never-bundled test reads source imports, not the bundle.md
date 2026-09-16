# KN-306 - The fixtures' never-bundled test reads source imports, not the production bundle

## The card

**Why.** KN-062's exit condition says the fixtures never appear in the production bundle and a test
asserts it; sample names and contacts shipping to users is the thing it guards, and a source
convention is not the bundle.

**Exit.** A check builds the web app for production and asserts that no fixture value, a sentinel
only the fixtures hold, appears in the emitted files; a planted import of the fixtures from app code
makes it fail.

A child of KN-062, from its roast.

## Measured before planning, 2026-09-16

- **What the test does today.** `story-fixtures.test.ts` lines 29 to 40 glob `/src/**/*.{ts,tsx}` as
  RAW TEXT, drop stories, tests and the Storybook-only folders, and assert that no remaining source
  holds a `story-fixtures` import specifier. **Its "can fail" case tests the regex against a literal
  string**, so it proves the pattern matches, never that the check would catch a real import.
- **Two holes beyond the card's own list.** The glob is `.ts` and `.tsx` only, so a JSON route, an
  `.mjs`, or anything reached through an alias is invisible to it; and it proves a CONVENTION about
  source, which is a different claim from what the artifact contains.
- **This repository has already learned this exact lesson once.** `agent/scripts/lib/verify.mjs`
  opens by recording that KN-058's first verifier "asserted the absence of `shell: true` by slicing
  todo.mjs source between two string markers, which tests text rather than behaviour", and that a
  reviewer was right to call it out. The fix then was to extract the logic so the real path and the
  proof call the same function. **Same defect, same repository, written down.**
- **The standard this check is held to**, AGENTS.md: a verifier under `agent/scripts/verify` "fails
  when the thing it checks is broken, proved by mutation. That is a different question from whether
  a line of it executed." So the proof is a mutation, not coverage.
- **The convention.** Verifiers are named for their card — `verify/KN-058.mjs`, `KN-065.mjs`,
  `KN-149.mjs` — are thin CLIs over `agent/scripts/lib/*.mjs`, and are wired to a root script as
  `contract.mjs` is by `npm run contract`. **There are no separate test files under `agent/`**: the
  verifier IS the proof, and `KN-065.mjs` line 118 shows the shape, driving `verifyGate` against a
  fixture to exercise a real failure.
- **The read-only constraint, which decides the hard part.** `fixtures/always-fails.mjs` says why it
  is committed rather than written at test time: "so a verifier that uses it stays runnable in a
  read-only working tree, which is where a reviewer runs it." A proof that plants an import and
  rebuilds cannot run there.
- **The build.** `vite.config.ts` sets `outDir: 'dist'` and `sourcemap: true`. `dist/` is gitignored.
  A production build already runs in `playwright.config.ts` line 34 and in the Pages workflow. The
  emitted tree is small and nameable: five `.html`, one `.js`, one `.js.map`, one `.css`, three
  `.woff2`.
- **The sentinel must be PER LANGUAGE.** `en-US.json` holds "Pars New Technologies",
  "Dadehvarzan Sepand" and "Binesh Hooshmand", each appearing in exactly one file under `src`;
  `fa-IR.json` holds «فناوران نوین پارس», which is not a transliteration. A check that scanned one
  language and claimed the fixtures never ship would be wrong for the other.
- **Measured against a CURRENT build**, made at 16:12 after HEAD: none of those sentinels appears
  anywhere in `dist`, the sourcemap included. So the fixtures do not ship today — this card is a
  weak test, not a live leak. An earlier reading of mine used a build from 15:10 and was stale; it
  is replaced rather than relied on.

## The decisions, for the review

**All three are settled by the review, and the first was settled against a rule I had invented.**

1. ~~Where the proof of failure comes from.~~ **The mutation goes INSIDE the verifier, repeatably.**
   I argued that planting and rebuilding would break a read-only rule — but `always-fails.mjs`'s
   comment is **the reason that particular fixture is committed, not a rule that every verifier must
   be read-only**. I generalised a rationale from one file into a constraint on the card, and the
   consequence was the worst kind of split: the expensive half, the only half that proves the exit,
   would have run once and never again. A verifier that needs writes is allowed here, provided it
   says so plainly and reports itself incomplete where it cannot run. A committed-directory test of
   the scanner proves only that it can find bytes in a directory — **not** that an import survives
   the Vite graph, which is what the exit asks. My own probe already ran the real sequence, so the
   cost is known and small.
2. ~~Whether the check runs the build itself.~~ **It builds unconditionally, then scans.** No `dist`
   timestamps and no "build if missing" branch: that is two behaviours, and the cheap one can scan a
   stale artifact and call it a pass. Vite empties `outDir` before writing, so an unconditional
   build is clean by construction.
3. ~~Whether `.map` counts.~~ **Every regular file beneath `dist` is scanned, as bytes** — HTML,
   CSS, assets and `.map` alike. Requiring at least one `.js` is a useful sanity check that
   something was emitted, but it is **not** equivalent to "all emitted files" and would leave an
   HTML or CSS leak unlooked-at. The probe confirms maps carry the text when an import lands.

**And one correction to how the result is stated.** I had planned to borrow `contract.mjs`'s "this
is a regression checker, not a proof". The review is right that this would be inaccurate in the
other direction: after an unconditional build it DOES prove those sentinels are absent from that
exact artifact. The precise limit is narrower and should be printed as such — it does not prove that
every possible fixture value is absent, only the ones it carries.

## The approach

1. **`agent/scripts/lib/bundle-scan.mjs`**: given a directory and a list of sentinels, read every
   regular file beneath it as BYTES and return each file holding one. No build, no globals, nothing
   about this product, so it can be exercised on any directory.
2. **`agent/scripts/verify/KN-306.mjs`**, which builds and mutates, in this order:
   a. build the app unconditionally and scan the fresh `dist`, which must be clean;
   b. in a `try`/`finally`, add a live fixture reference to an app entry, build again, and require
   the scan to FAIL naming the artifact — the exit's planted import, run every time;
   c. assert the entry matches its original bytes and carries no marker, then build once more and
   scan again, so `dist` is left representing the restored tree and the restore itself is proved.
3. **It sets the production inputs rather than inheriting whatever is lying about**: `KARNAMA_BASE`
   and `VITE_AUTH_MODE` as the Pages workflow sets them, and `VITE_API_URL` defaulted to a stated
   placeholder when absent. Pages refuses an empty one, KN-489, because deploys went out reporting
   success while rejecting every call — but requiring the repository variable here would make the
   check unrunnable locally, and a fixture leak is a module-graph question that variable cannot
   change. **The output prints which inputs it used**, so nobody reads the artifact as the deployed
   one.
4. **A root script**, as `contract` is, so it is runnable by name.
5. **The old source-scan test stays, relabelled** as the cheap early convention check. It catches
   the ordinary mistake in a second; what it loses is its claim to be the bundle check.
6. **Its output states the limit precisely, and does NOT hedge past it.** After an unconditional
   build it proves these sentinels are absent from that artifact. What it does not prove is that
   every possible fixture value is absent. Borrowing `contract.mjs`'s "not a proof" wholesale would
   be inaccurate in the other direction, which the review caught.

## What I will change

- `agent/scripts/lib/bundle-scan.mjs`, new
- `agent/scripts/verify/KN-306.mjs`, new — it builds three times and mutates an app entry, so it is
  slow and it is not read-only, and it says both
- `package.json`, one script
- `apps/web/src/shared/story-fixtures/story-fixtures.test.ts`, the comment that overclaims
- this plan

~~`agent/scripts/verify/fixtures/`, a committed directory for the read-only proof~~ — **dropped**.
It would have proved only that the scanner finds bytes in a directory, which is not the exit's
claim, and it existed to satisfy a read-only rule I had invented from another fixture's rationale.

## What I expect to be hard, and what I am unsure of

- **Reading the sentinels from the JSON without importing the fixtures into the check's own graph.**
  Reading the file as text and picking named fields is fine; importing the module would be ironic.
- **A sentinel must be a value, not a word that could legitimately appear.** "Tehran, remote" would
  be a bad sentinel; an invented company name is a good one, and each was checked to appear in
  exactly one file under `src`.
- **The check must not pass by scanning nothing.** If `dist` is missing, empty, or holds no `.js`,
  that is a failure to run and not a pass — the lesson KN-626 cost two readings to learn.
- **Absence is the weak direction, but only exactly so far.** A clean scan after an unconditional
  build DOES prove these sentinels are absent from that artifact; what it does not prove is that
  every possible fixture value is absent. Print that limit, and no vaguer hedge than that.
- **It writes to the tree and builds three times**, so it is slow, it cannot run in a read-only
  checkout, and a crash between the plant and the restore would leave an import in an app entry. The
  restore goes in a `finally`, the planted text carries a marker naming this card, and the run ends
  by rebuilding so `dist` represents the restored tree rather than the planted one.
- **The premise was measured before any of this was designed.** A planted import in `src/main.tsx`
  carried BOTH sentinels into `dist/assets/index-*.js` and its `.map`. Both travelled because the
  fixtures' `index.ts` imports both JSON files — so a one-language scan would have caught THIS case,
  and per-language sentinels are still right because an arrangement importing one language would
  not be caught. That distinction is worth keeping straight in the output.

## How I will know it works

- **The planted-import control runs EVERY time, inside the verifier**: an app entry imports the
  fixtures, a real production build runs, and the scan FAILS naming the emitted file; the entry is
  restored, rebuilt, and the scan is clean again. Not a thing I do once and record — a thing the
  check does, which is the whole difference between this and the test it replaces.
- **The restore is asserted, not assumed.** The planted import is valid TypeScript, so a failed
  restore would still build and still look clean. The entry's bytes are compared with what it
  started with and the marker's absence checked BEFORE the final build.
- **A killed run cannot be mistaken for a defect.** `try`/`finally` does not survive termination, so
  the verifier looks for its own marker at startup and refuses with the two commands that undo it,
  rather than building a planted tree and reporting whatever that produces.
- `npm run contract` still passes, the unit project passes, `tsc` and `eslint` are clean, no changed
  file's drift grows and this plan's is 0.
