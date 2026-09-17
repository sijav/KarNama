# KN-484 · Behind Render every visitor shares one rate limit, and a malformed call spends it

From KN-477's review, A-02 and H-05.

**Why**, from the board: one visitor, or one script, can lock every reader out of extraction for an hour, and the SMS
and verify limits will share the same bucket once live login is on.

**Exit**, as the board now carries it after the owner's decision: one helper resolves the caller's address from
`CF-Connecting-IP`, with a fallback for running without Cloudflare in front, and BOTH the extraction resolver and the
auth resolver use it; a test drives the real GraphQL path with two requests carrying different `CF-Connecting-IP`
values and shows them counted separately; and a source under ten characters, or over thirty thousand, is refused with
`INVALID_POSTING` without being counted and without reaching the extraction service, while a bad token with a short
source still fails `UNAUTHENTICATED`.

**Two owner decisions on 2026-09-17, and the second replaces the first, because the first answered a question I had
got wrong.** I reported that Render documented no hop count, and the owner chose to measure the header on the deployed
service. Render does document this; I had not found the page. Told that, the owner ruled: use `CF-Connecting-IP`, one
helper, both resolver families. Recorded in that order so nobody re-opens it.

## 1. The mechanism, and it is three call sites rather than one

`extraction.resolver.ts` line 20, `auth.resolver.ts` line 17 and `auth.resolver.ts` line 22 all contain the SAME
expression, character for character:

```
context.req.ip ?? context.req.socket.remoteAddress ?? ''
```

feeding `extract-demo:<ip>` at 10 an hour, `sms-ip:<ip>` at 10 and `verify-ip:<ip>` at 60. **The card's why says the
SMS and verify limits "will" share the same bucket once live login is on. They already do.** The defect is present
tense in all three, and fixing only extraction would leave two thirds of it standing, which the plan review named as
the most likely mistake from here.

**Why it shares.** `main.ts` line 29 sets `trust proxy` from `TRUST_PROXY_HOPS`, which `env.ts` line 27 defaults to
`0`. Express's guide: a numeric value means "the address that is at most `n` number of hops away", where
"`req.socket.remoteAddress` is the first hop". At `0`, `req.ip` IS the socket peer, which behind Render is Render's
own proxy and identical for everyone. The `?? ''` at the end is the same failure by another route: one key with an
empty tail rather than no key.

**Why a refund is not available.** `auth.service.ts` lines 40 to 50 count and check in ONE statement, an
`INSERT … ON CONFLICT DO UPDATE … WHERE started < NOW() - INTERVAL '1 hour' OR count < $2 RETURNING count`, failing
with `RATE_LIMITED` when no row comes back. Nothing to undo, so validating before counting means validating before
`limit` is called at all.

**What counts as invalid.** `extraction.service.ts` line 48 trims and line 49 rejects `length < 10 || length > 30_000`
with `INVALID_POSTING`. The board named only the lower bound; the rule has two ends.

**How a refusal is spelled.** `fail` in `auth/errors.ts` returns `never` and throws a `GraphQLError` carrying the code
in `extensions`, which is what the integration test reads.

## 2. What Render actually documents, and why the hop count was the wrong instrument

An earlier version of this plan said Render documented nothing and that a numeric `1` would hand back Cloudflare's
address. **Both were wrong**, and they are recorded rather than quietly replaced. Express walks right to left from the
socket peer, so what `1` yields depends on the header supplied, which I could not have deduced. And Render does
document the answer:

> "Set the trusted proxy header to `CF-Connecting-IP`. Cloudflare writes that header on every request that reaches a
> Render web service, and it overwrites whatever the caller sent, so the value is both accurate and outside the
> caller's control."

> "Cloudflare appends to `X-Forwarded-For` rather than replacing it, so a caller who sends their own copy of the
> header controls the leftmost entry and can claim any address."

Cloudflare's own documentation points the same way, recommending `CF-Connecting-IP` or `True-Client-IP` over
`X-Forwarded-For` for restoring the visitor's address.

**So this is a security property, not a configuration detail.** A rate-limit key built on `X-Forwarded-For` is a key
the caller can choose, which is worse than one bucket for everyone: it looks fixed and is trivially evaded.
`CF-Connecting-IP` is overwritten by Cloudflare on every request, so the caller cannot set it.

**`TRUST_PROXY_HOPS` therefore leaves this card**, and `render.yaml` needs no value. It is NOT deleted: `main.ts` still
passes it to `trust proxy`, which governs `req.protocol` and secure-cookie handling as well as `req.ip`, and removing
it is a separate decision with separate consequences. This card stops depending on it.

**And the deployed-header logging is not done.** It was the owner's first answer, superseded by their second. It would
read real visitors' addresses, which is personal data, and would still not prove the overwrite or the spoof
resistance that Render's contract states.

## 3. What this drops, and why carrying it would be momentum rather than reason

The previous plan's central design was a production app factory, `createApp(env)`, so that `trust proxy` could be
exercised by a test rather than only by `bootstrap()`. **That whole apparatus existed to make a setting testable that
this card no longer uses.** With the key read from a header, the test drives the real GraphQL path with two different
`CF-Connecting-IP` values and needs no `trust proxy` at all.

The facts that made the factory necessary still stand and are worth keeping written down, because the next card that
touches `main.ts` will meet them: `Test.createTestingModule` never calls `bootstrap`, no test in `apps/api` imports
`main.ts`, and `vitest.config.ts` excludes `src/main.ts` from coverage because it "boots a real server on a real
port". They are simply no longer this card's problem.

## 4. The helper, settled by the review

One function, `clientIp(req)`, in a small top-level `src/client-ip.ts` with its test beside it. **It is request ingress
policy rather than authentication**, which is the reason it does not go next to `tokenFrom` in `auth/auth.resolver.ts`
even though that would follow the existing grain: both resolver families import it without either one, or a future
third consumer, having to depend on `auth`.

**The fallback chain is `CF-Connecting-IP`, then `req.ip`, then `req.socket.remoteAddress`, then the empty string**,
which keeps exactly what the three call sites do today behind the new first choice.

An earlier version of this section said falling back "silently restores the shared-bucket defect wherever Cloudflare is
not in front". **That overstates it and the review was right to correct it.** On a direct local server `req.ip` IS the
caller and is the right answer. The shared address only comes back behind an unconfigured proxy that is not
Cloudflare, which is a deployment decision somebody would have to take, not a reason to make development on a laptop
fail.

## 5. The validation half, unchanged and blessed twice

`extract`'s rule is a pure function of the source, so the resolver can refuse before counting anything.

**Authentication precedence is kept**, which is the correction that would otherwise have shipped a bug: the guard goes
early ONLY in the anonymous demo branch. With a bearer token the account resolves FIRST and the source is validated
after, before that account's limit. Otherwise an invalid token with a short source stops saying `UNAUTHENTICATED` and
starts saying `INVALID_POSTING`. The review confirmed this ordering leaves no path where a limit is skipped that
should have counted.

**The extraction service is not invoked at all** for an invalid source. The caller still sees `INVALID_POSTING`.

**The rule must not be copied.** One exported predicate, used by the service and by the resolver.

**Refusing for free is acceptable**, which the review considered: it permits cheap malformed probes, but they reach no
provider and spend none of the scarce shared quota, which is the defect being fixed. It is not protection against
request-body or GraphQL parsing abuse and must not be described as if it were.

## 6. Scope

| file                                     | what changes                                                                |
| ---------------------------------------- | --------------------------------------------------------------------------- |
| `src/client-ip.ts`                       | new: reads `CF-Connecting-IP`, then the existing fallbacks                  |
| `src/client-ip.test.ts`                  | new, beside it: the header chosen, a repeated header, each fallback         |
| `extraction/extraction.service.ts`       | `sourceText` exported, and `extract` uses it rather than restating it       |
| `extraction/extraction.resolver.ts`      | `clientIp`, and refuses an invalid source before any `limit`                |
| `auth/auth.resolver.ts`                  | `clientIp` at `requestLoginCode` and at `verifyLoginCode`                   |
| `extraction/extraction.resolver.test.ts` | the address cases, plus the invalid source and the token precedence         |
| `auth/auth.resolver.test.ts`             | the address cases                                                           |
| `auth/auth.test.ts`                      | `post()` takes headers, and the two-address sequence against the limiter    |
| `AGENTS.md`                              | one lesson: which forwarded header a caller controls, and which they do not |
| this plan                                | the record                                                                  |

**Both resolver test files asserted the OLD behaviour** and had to change: each carried the same `contextOf` helper and
the same cases, "its own address" and "its socket's address when it has none". They were asserting the behaviour being
removed, which is the right reason for a test to change.

**Not in scope**: `env.ts`, `main.ts`, `render.yaml`, `config/render.test.ts`, and any `createApp` refactor.
`TRUST_PROXY_HOPS` is left exactly as it is; this card stops depending on it rather than removing it.

## 7. What must not change

- **`auth.limit`'s atomicity.** One statement that counts and checks is what makes the limit correct under concurrency.
- **The global bucket.** `extract-demo:global` at 20 an hour is a second limit with its own purpose.
- **The codes a caller sees.** `INVALID_POSTING` for a bad source, `UNAUTHENTICATED` for a bad token, and a bad token
  still wins over a bad source.
- **`TRUST_PROXY_HOPS` itself.** Left exactly as it is; this card stops depending on it rather than removing it.

## 8. The proof

**In the resolver tests**, which are paired because the review named using the helper in only one family as the main
implementation risk: all three call sites key on `CF-Connecting-IP`; a short source and an over-long source each fail
`INVALID_POSTING` with no `auth.limit` call and no `extract` call; and a bad token with a short source still fails
`UNAUTHENTICATED`, which is the other half of that risk.

**In `client-ip.test.ts`**, beside the helper: the header chosen over `req.ip`, a repeated header taking its first
value, and each fallback in turn down to the empty string.

**In `auth.test.ts`, the real GraphQL path against the durable limiter**, in the sequence the review supplied rather
than the vaguer one this section first had:

> Clear `auth_limits`, enable demo extraction, make ten successful requests carrying address A, check that A's
> eleventh is refused with `RATE_LIMITED`, then make one successful request carrying address B.

That stays under the global limit of 20, so B's success proves the per-address key actually differs rather than that
some other bucket had room. `post()` gains request headers, which it already does for `Authorization`, and extraction
stays mocked as that file's existing extraction test already does.

`tsc --noEmit` and `eslint --max-warnings 0` on `apps/api`.

**And the headline claim was checked against a planted failure**, which `AGENTS.md` asks for in as many words: a check
that finds nothing has not proved anything, so confirm it can find a case you plant by hand. Backing `CF-Connecting-IP`
out of `clientIp`, so it returns only what Express derives, makes `auth.test.ts` fail at exactly the right line:

> `AssertionError: expected undefined to deeply equal { title: 'Demo engineer' }`

which is the second caller being refused because it shared the first one's bucket. That is the defect this card exists
for, reproduced on demand. The mutation was reverted in the same command rather than across a turn, and `client-ip.ts`
measures 0 drift after the restore. It is a one-off reading, not a script and not a gate: the owner retired per-task
verifiers on 2026-09-11.

**Coverage is not a signal in this workspace.** KN-486 records the API gate already failing at 80.37 percent of
statements with `extraction.service.ts` at 17.02, so a threshold failure here is not evidence about this change and a
pass is not available to claim. `vitest.setup.ts` also replaces `globalThis.fetch` to refuse any host but 127.0.0.1.

## 9. Questions, and where each landed

1. **Answered: a top-level `src/client-ip.ts`.** Section 4 carries the reason.
2. **Answered, and it corrected me.** Keep the existing chain behind the header; the fallback is right for a direct
   server and the shared address returns only behind an unconfigured non-Cloudflare proxy.
3. **Answered: the harness does exercise the durable limiter**, and the review supplied a sharper sequence than I had.
   Section 8 now carries it.
4. **Asked and answered by me rather than by the reviewer, which is the right way round.** I had asked whether a fourth
   place keys a limit on an address; I then checked instead of waiting. Every `.limit(` call in `apps/api/src` is
   `sms-ip`, `sms-phone`, `verify-ip`, `extract-demo:<address>`, `extract-demo:global` and `extract:<account>`, of
   which THREE key on an address, and every address use outside tests is those same three lines. The `BlockList` in
   `posting.ts` is not a caller allowlist at all: it is the outbound guard on fetching a posting URL, pointing the
   other way. The review agreed the three are the complete set.
