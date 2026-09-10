# Plan — KN-071, a contact needs only a full name

> **This plan is gone.** It was deleted on 2026-09-10 by KN-160's first version,
> which told me to remove a plan once its task closed, on the reasoning that git
> held every version of it. That reasoning was false: `.gitignore` carried
> `.claude/plan-*.md`, so the file had never been committed and there was
> nothing to recover from. Unlike KN-100's, this one had not been read into the
> session, so no copy survives anywhere.
>
> This marker stands in its place rather than a reconstruction. Writing out what
> the plan "probably said" would put invented reasoning next to real code under
> a heading that claims to be the record, which is worse than an admission.

## What does survive, and where to look instead

- **The decision itself** is in `DESIGN.md` section 6, under the owner-settled
  block, and in the `Contact` model comment in `schema.prisma` beside this file.
  A contact requires a full name and nothing else. Both an email and a phone
  stay nullable and neither is enforced.
- **Why it is not provisional**: the design's own note argues the other way, that
  a contact with no route to reach them is close to useless. The owner was shown
  that argument on 2026-09-08 and chose the permissive rule anyway. So do NOT
  add a one-of-two constraint later on the grounds that the design obviously
  wanted one. It did; the owner overruled it.
- **The verifier** is `agent/scripts/verify/KN-071.mjs`, which checks that the
  decision is recorded affirmatively and cannot be satisfied by a card stating
  the opposite rule.
- **The roast round** for KN-071 is archived under `agent/roasts/`.

## The lesson this file exists to carry

Check that the fallback you are relying on actually exists before you rely on
it. "Version control has it" was one `git check-ignore` away from being tested,
and it was never tested.
