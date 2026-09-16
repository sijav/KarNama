# KN-618 - Settings' sample data message may go unread, since its status region mounts already holding it

## The card

**Why.** A screen reader user who presses Load sample data may hear nothing, and cannot tell the
press worked or that there is now a board to open.

**Exit.** The Settings dialog's status region is in the page, empty, before the samples load, and
the loaded message is written into it after, shown by a story that reads it empty before the press
and holding the message after.

A child of KN-477, from its roast. Found while planning KN-326, the Loading State's region of the
same kind, on 2026-09-15.

## Measured before planning, 2026-09-16

- **The defect**, `SettingsDialog.tsx` line 88:
  `{loaded ? <Box role="status">{i18n._('Sample data loaded. Open your board or network to explore it.')}</Box> : null}`.
  The region is inserted into the page with its line already inside it. A region inserted with its
  text is not announced by every screen reader; only a change to a region already in the page is.
- **The layout is the real question, not the conditional**, and it is now measured rather than
  predicted. That line sits inside `<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>`,
  with the explaining paragraph and the Load sample data button. Measured in the running Storybook
  on the real element: the column computes `rowGap: 8px` — **8, not the 16 I first wrote**, because
  this theme's spacing unit is 4, so `gap: 2` is `spacing.xs` — and appending an empty `div` to it
  took its height from **170 to 178**, restoring to 170 when the probe was removed. So an
  always-mounted empty region **does** open a gap under the button, of 8px. Hoisting the conditional
  without answering this changes what every reader sees.
- **And the gap is not escaped by moving one level out**, which is where my first answer was headed.
  Measured on the same elements: the dialog is itself a flex column with `rowGap: 16px` over 5
  children, and the body inside it another with `rowGap: 12px` over 3. Probing those two with an
  empty child grew neither, **but that proves nothing either way** — both are height-stable, so an
  added child does not move the box's own measured height, while the gap it introduces still spaces
  what is inside. So the honest reading is the one the plan's review gave: a region parked as a new
  direct child of the dialog body would sit in a 12 or 16 pixel gapped context instead of an 8, and
  the fix has to be spacing that appears only when there is something to space.
- **The two precedents in this repository disagree, and they disagree for a reason.**
  `Input.tsx` line 364 keeps `<span role="alert">{error}</span>` mounted always, in normal flow, and
  its comment says it "stays mounted and exposed, never hidden, or the next error would land in a
  region that was not there", KN-287 — a span in flow collapses to nothing when empty.
  `BulkActionBar.tsx` line 128 and `JobsScreen.tsx` line 336 keep theirs mounted but absolutely
  positioned and clipped, out of flow entirely.
- **The clipped pattern cannot simply be copied here.** Those two carry screen-reader-only
  announcements. This message is **visible copy**: the dialog shows "Sample data loaded. Open your
  board or network to explore it." to everyone, so clipping it would take it away from sighted
  readers.
- **The story already makes the transition the exit asks for.** The meta's `render` returns
  `<WithTrigger args={args} updateArgs={updateArgs} />`, so every story goes through it, and
  `WithTrigger`'s `onLoadSamples` calls `updateArgs({ loaded: true })` while the meta's args start
  `loaded: false`. `Preferences` already presses «Load sample data» and asserts `onLoadSamples` fired
  once. So **two assertions inside its existing play meet the exit**, with no new story and no new
  docs entry in either language. `Loaded` is `{ args: { loaded: true } }`, args-only, and proves
  nothing about announcement.
- **Drift baselines**: `SettingsDialog.tsx` 0, `SettingsDialog.stories.tsx` 0, and both
  `Shared-SettingsDialog.md` 14.

## The approach

1. **The region is always in the page, and its CONTENT is what changes**:
   `<Box role="status">{loaded ? i18n._('…') : null}</Box>`, so the first load is a change to a
   region that was already there, which is what a screen reader announces.
2. **The spacing appears only when there is something to space.** The gap is real and measured, 8px,
   the column growing 170 to 178 with an empty child — and moving the region a level out would only
   trade it for the body's 12 or the dialog's 16, which is what my first answer missed. So the
   sample-data subsection is restructured instead: its paragraph and button keep their `gap: 2`
   between them, and the always-mounted region is not a gapped sibling of them but carries its own
   top spacing, which it has only when it holds the message. The dialog body stays a single direct
   child of the Modal. One visible region, no clipped duplicate: the copy a sighted reader sees is
   the copy that is announced.
   **Measuring first was the point twice over**: it caught a number I had wrong by half, and the
   review caught that the number was not the whole question.
3. **The two halves are proved by two stories, not by one transition, and this took two wrong
   answers to reach.** `Preferences` asserts the region is in the dialog and empty immediately
   before the press it already makes. `Loaded`, which renders `loaded: true` straight from args and
   needs no transition, asserts it holds the message.

   What I tried first and what was wrong with it: asserting the filled state inside `Preferences`
   after the click, with `waitFor` on the review's advice. It failed with the region found and
   empty. I diagnosed a stale node — the `dialog` binding captured before a re-render — and
   re-pointed the query at the live document. **It failed identically, so that diagnosis was
   wrong.** The cause is that `updateArgs` re-renders in a real Storybook, which is exactly what
   KN-563 documented as a problem there, but does not under the Vitest runner, so `loaded` never
   flips and no wait can help. Checked rather than assumed: seven story files here call
   `updateArgs`, and **not one of their plays asserts a rendered consequence of it**. The browser
   reading I took alongside was inconclusive — the play had already run and left the region filled
   before I looked — so it is the absence of prior art, not that reading, that settles it.

4. **The docs entry for `Preferences` gains a clause** in both languages, since its prose describes
   what the story checks and it will now check one thing more.

## What I will change

- `apps/web/src/shared/settings/SettingsDialog.tsx`, the region at line 88
- `apps/web/src/shared/settings/SettingsDialog.stories.tsx`, two assertions in `Preferences`
- `apps/web/src/shared/story-docs/en/Shared-SettingsDialog.md` and `fa/Shared-SettingsDialog.md`,
  the `Preferences` entry in each

## What I expect to be hard, and what I am unsure of

- **Whether an empty region really opens the gap — answered, and it caught an error of mine.** It
  does: 170 to 178 and back, `rowGap` 8px. I had written 16px into this plan from the `gap: 2`
  shorthand, assuming MUI's default 8px unit; this theme's unit is 4. The plan's review is reading
  the version that says 16, so its answer is judged against the measured 8. **The habit that
  mattered was measuring at all**, since the reasoning was right and the number was not.
- **Whether `role="status"` with no accessible content is sound to leave in the page.** The Input
  and the Bulk Action Bar both do it deliberately, so the pattern is established here; what is new
  is doing it with a region that is also visible copy.
- **Not turning this into KN-326.** The Loading State's region is the same kind of defect and has its
  own card; this one is the Settings dialog alone.
- **The announcement itself cannot be tested from a story.** A story can prove the region is present
  and empty before, and holds the line after — which is what the exit asks — but no test here reads
  what a screen reader would say. That limit is stated rather than implied, since three comments in
  one day have already claimed more than their checks covered.

## How I will know it works

- `Preferences` passes with its two new assertions, and the story suite for the dialog passes whole.
- **The measurement is recorded either way**: the resting dialog's layout with the region empty,
  before and after, so the choice in step 2 rests on a number rather than on my expectation.
- The unit project passes, the docs guard among it; `tsc` and eslint pass; no changed file's drift
  grows and this plan's is 0.
- A look at the dialog in both languages and both schemes, before the press and after, to see that
  nothing moved that should not have.

## Plan review, 2026-09-16, Codex gpt-5.6-terra

**The premise is confirmed with sources, which is worth more than agreement.** `role="status"` is
implicitly `aria-live="polite"` and `aria-atomic="true"`, and an empty rendered region that is then
filled is the W3C-prescribed pattern, so leaving one empty is sound rather than merely harmless. The
compatibility concern is real and specific: NVDA does not announce a populated `status` inserted into
the DOM, issue 14591, and the same was observed with JAWS, while VoiceOver does — which is exactly
why the region must be mounted before it is filled. Adding `aria-live="polite"` to a region still
inserted populated would not fix the timing, and `assertive` would be the wrong urgency.

**It found the 16px error independently**, by reading that this theme configures MUI spacing at 4px,
where I found it by measuring. Two routes, one number: 8.

**Its layout correction is taken, and it caught the bug my first answer was walking into.** Moving
the region "after the gapped column" does not make it free, because the Modal is itself a column with
a 16 pixel gap between direct children; the region would have traded an 8 for a 16. My own probe of
the dialog and the body grew neither, but that measures nothing — both are height-stable. So the
subsection is restructured instead, with spacing that exists only when the region has content.

**And its story note is grounded in this repository rather than in general caution**: the populated
assertion uses `waitFor` because `updateArgs` re-renders this story during its play, which is KN-563,
a closed card about this exact story, whose analysis is already in the file at line 88. It confirmed
reusing `Preferences` is right, since that story already performs the action and owns the transition,
and that proving the DOM precondition and update rather than speech is the honest limit of a story
test.
