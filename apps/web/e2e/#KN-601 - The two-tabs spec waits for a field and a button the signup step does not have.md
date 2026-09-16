# KN-601 - The two-tabs spec waits for a field and a button the signup step does not have

## The card

**Why.** The only end-to-end test of a tab part way through signing in being signed in by another
tab never gets past its third step, so a regression in that adoption, or in signing out from the
other tab afterwards, would pass unnoticed.

**Exit.** `two-tabs.spec.ts` finds the signup step by its own words, «نام و نام خانوادگی» and «شروع
کن», and both its tests pass on desktop against a fresh build.

Found while testing KN-586, 2026-09-15. The spec came with KN-419, 30f6b8e, and has not changed
since.

## Measured before planning, 2026-09-16

- **The two wrong locators.** `apps/web/e2e/two-tabs.spec.ts` line 92 fills
  `getByLabel('اسم و فامیل')` and line 93 clicks `getByRole('button', { name: 'ادامه' })`.
- **«اسم و فامیل» is the CONTACT MODAL's field**, the id `Full name` at `locales/fa-IR.ts` line 184.
  It is a real string in the product, drawn somewhere else entirely, which is what makes the mistake
  easy to miss by eye.
- **«ادامه» is in NEITHER catalog.** Searched: it appears in the repository only at the broken line
  itself and inside two plan markdowns, one of which is KN-586's plan already describing this
  defect. The other is KN-518's, quoting «با ادامه‌دادن», a different word in the Terms Note. So
  that locator cannot ever match anything the product draws.
- **What the signup step actually draws**, read from the screen rather than inferred from the
  catalog: `AuthScreen.tsx` line 208 gives the field `label={i18n._('First and last name')}`, which
  is «نام و نام خانوادگی», and line 217 gives the button `{i18n._('Start')}`, the id `Start` at
  `fa-IR.ts` line 263, «شروع کن».
- **How the test gets there.** `signedIn(page, name, phone)` in `e2e/session.ts` line 16 adds an
  init script writing `karnama.session` with `{ phone, name, since }`. The test calls
  `signedIn(there, '')`, an **empty name**, so the second tab holds a session nobody has named, the
  first tab adopts it, and the first tab lands on the signup step. That is why the fill and the
  click are aimed at the FIRST tab, `here`, and not at the one that signed in.
- **What the failure looks like in a real run**, from my own full e2e run today: on desktop
  `two-tabs.spec.ts:72` fails at **30.0 seconds**, a timeout, while the file's first test,
  `two-tabs.spec.ts:31`, passes in 3.3. On mobile both are skipped by the spec's own `test.skip`,
  the storage two tabs share being the same at every width.
- **Drift** on the spec is 0, and the file is Persian throughout: every locator in it is a hardcoded
  Persian string rather than an id read through lingui, which is the convention of the e2e suite.
- **Nothing else in the repository waits for those two strings**, so this is two lines and not a
  pattern.

## The approach

1. **The two locators take the signup step's own words**: `getByLabel('نام و نام خانوادگی')` and
   `getByRole('button', { name: 'شروع کن' })`, matching what `AuthScreen.tsx` draws and what the
   rest of the suite already uses — `sign-in.spec.ts` fills and presses exactly those two.
2. **The file's convention is kept.** The strings stay hardcoded Persian rather than being read
   through the catalog: every locator in this suite is written that way, and changing one file's
   habit would make it the odd one out. The cost is recorded rather than hidden: a search for an
   English id will not find these, which is the trap KN-565 and KN-589 both hit.
3. **Nothing else changes.** The card is two locators; if the steps below them turn out to be wrong
   as well, that is a finding and a card, not a licence to rewrite the test.

## What I will change

- `apps/web/e2e/two-tabs.spec.ts`, lines 92 and 93

## What I expect to be hard, and what I am unsure of

- **Lines 94 to 102 have never run.** The test has always timed out at line 92, so everything after
  it — that both tabs reach «فرصت‌های شغلی من», that signing out in the other tab brings this one
  back to its number rather than to the code it was sent, and that no page error was raised — is
  unproven code. Fixing the locators may simply reveal the next thing that was never true. **That
  is the likely outcome, not the unlikely one**, and it is the reason this card is worth doing.
- **A 30 second timeout is the whole cost of a run**, so iterating here is slow. The spec is run
  alone rather than through the full suite while the fix is settled.
- **Whether the adoption itself works.** The card's own description says the failure's page snapshot
  showed the signup step reached, so the session WAS adopted; that is evidence the product is right
  and the test is wrong, which is what this card assumes. If the fixed test fails on the adoption
  rather than on the locators, the assumption was wrong and the card becomes a product bug.

## How I will know it works

- `two-tabs.spec.ts` passes on desktop against a fresh build, **both** tests, which is the exit.
  "Fresh" has to be made literal: `playwright.config.ts` sets `reuseExistingServer: !process.env.CI`,
  so outside CI a run silently takes whatever is already on 4173. The run is made with `CI=1`, which
  forces the configured server to build and start rather than reuse stale output. **The baseline I
  took before this may itself have reused a preview**, which is worth knowing and does not change
  what it showed, since the failure is a locator that matches nothing.
- **The control, cheaper than the one I planned.** I had meant to plant the old «اسم و فامیل» back
  and watch it time out; that costs 30 seconds to prove only that the pass was not a coincidence of
  matching copy. Instead a temporary `await expect(here.getByLabel('اسم و فامیل')).toHaveCount(0)`
  goes in right after the other tab loads: it proves the signup step is reached AND that the old
  locator could never have matched there, in no time at all. The 30 second timeout already observed
  twice is the stronger historical evidence anyway.
- The full e2e suite afterwards, to see that the count of known failures drops by one and that
  nothing else moved: it was 91 passed, 2 failed, 9 skipped, the other failure KN-651.
- No changed file's Prettier drift grows, and this plan's is 0.

## Plan review, 2026-09-16, Codex gpt-5.6-terra

**Approved, with one correction taken.** The correction: "against a fresh build" was not literal,
because the config reuses an existing server outside CI, so the run is made with `CI=1`. It also
judged the planned mutation disproportionate and offered the cheaper check now in the proofs above.

**On the convention, it argued the side I had leant against and I take it.** Keeping the Persian
literals is right: importing the catalog would make this one e2e file inconsistent and couple a
browser-level test to implementation data, and hardcoded Persian verifies what the Persian reader
actually receives. If the searchability cost is to be paid down, the fix is a suite-wide locator
convention, not an exception on a two-line card.

**On the unrun lines**, it settled the question this plan raised: if an assertion below the repaired
locator fails, that is a NEW finding and not evidence the card misdiagnosed the defect, because
reaching the repaired field already proves the cross-tab adoption succeeded — `AuthProvider` takes
the other page's `storage` event, clears the pending code and enters the empty-name signup state,
and a tab is not notified of its own write. The likeliest next failure is the first board-heading
assertion after «شروع کن», and it gets its own card rather than growing this one.
