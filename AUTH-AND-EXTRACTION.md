# Connected login and ad extraction

The app temporarily uses mock login by default, including the Pages deployment.
The verification code appears on screen and no SMS is sent. Set
`VITE_AUTH_MODE=live` to restore server authentication. For server testing with mock
login, explicitly set `ALLOW_DEMO_EXTRACTION=true` on the API. This permits only
anonymous extraction, with durable limits of ten requests per IP per hour and
twenty total per hour. It defaults to false. Account operations still require a
real session, and invalid bearer tokens never fall back to anonymous extraction.
Manual ad entry remains available when extraction fails or reaches a limit.
Storybook continues to use its isolated demo provider.

The adapters are Kavenegar verification SMS, OpenAI Responses and Groq structured
extraction. The local integration fixture replaces SMS and AI; it does not prove
live provider availability.

## Configuration

Use `apps/api/.env.example` and `apps/web/.env.example` as templates. Do not put
secrets in a `VITE_` variable, git, or a chat message.

The API needs its existing database and CORS configuration, plus `AUTH_SECRET`
(random, at least 32 characters). For Groq testing, set `EXTRACTION_PROVIDER=groq`,
`GROQ_API_KEY` and `GROQ_EXTRACTION_MODEL=openai/gpt-oss-120b`. The model uses
[Groq strict structured outputs](https://console.groq.com/docs/structured-outputs).
Free-tier quotas are account-specific and provider failures preserve manual entry.
There is no automatic fallback to a paid provider. Keep `VITE_AUTH_MODE=demo`
and enable `ALLOW_DEMO_EXTRACTION` on the API while testing mocked login.

For Render, add these variables under the existing service's Environment settings,
then save and redeploy. A local `.env` is ignored by git and is not uploaded when
code is pushed. Set the web repository variable `KARNAMA_API_URL` to that service's
full `/graphql` URL. Do not put the Groq key in repository variables or web builds.

For real SMS login, also set `KAVENEGAR_API_KEY` and `KAVENEGAR_TEMPLATE`.
To use OpenAI instead, set `EXTRACTION_PROVIDER=openai`, `OPENAI_API_KEY`, and
`OPENAI_EXTRACTION_MODEL`. The SMS template must be approved
for Kavenegar verification and contain its token placeholder. Select a model
available to your account that supports Responses structured outputs. There is
no silently chosen paid model. Missing provider configuration returns an explicit
error; it never returns a successful fake code delivery or empty extracted draft.

Generate a secret locally with Node's `crypto.randomBytes(32).toString('hex')`.
Keep it stable across restarts. Changing it invalidates pending codes and resets
hashed rate-limit keys; existing sessions remain valid until revoked or expired.

From `apps/api`, compile with `npx tsc -p tsconfig.build.json`, apply the additive
migration with `node --env-file=.env dist/database/cli-entry.js migrate`, then
start with `node --env-file=.env dist/main.js`. The migration creates challenges,
sessions and rate counters without changing existing job records.

Set the web `VITE_API_URL` to the full `/graphql` URL and `VITE_AUTH_MODE=live`,
then rebuild. For Pages, also change `VITE_AUTH_MODE` in `.github/workflows/pages.yml`
to `live`; the workflow reads the repository variable `KARNAMA_API_URL`.
Render's start command now applies migrations before starting. Existing Render
services may need their start command updated or Blueprint synchronized.

For a reverse proxy, configure `TRUST_PROXY_HOPS` to the verified number of trusted
hops. Its default is zero for direct local connections. Leaving it zero behind
a proxy shares an IP limit across visitors; trusting unverified forwarded headers
allows spoofing. See [Express proxy configuration](https://expressjs.com/en/guide/behind-proxies/)
and [Render's client-IP guidance](https://render.com/articles/how-render-handles-ddos-attacks).

## Behavior

Codes expire after two minutes, allow five incorrect attempts, and can be resent
after one minute. Durable counters limit SMS requests to five per phone and ten
per IP per hour, verification to sixty per IP per hour, and extraction to twenty
per account per hour. Challenges use HMAC; opaque session tokens use SHA-256 in
the database. Tokens expire after thirty days and logout revokes them. The browser
keeps the bearer token in session storage and checks it with the server after a
reload. It never treats the old localStorage account object as authentication.

Only the ad the user submits is extracted. Pasted text is sent to the configured
AI provider and preserved in the editable draft. For a submitted public HTTP(S)
URL, the API reads that page with bounded size, time and redirects, validates
each destination and pins the checked DNS result. Private addresses, credentials
in URLs and unusual ports are rejected. This does not crawl or aggregate boards.
Sites requiring login, browser JavaScript, or access checks can require pasted
text instead. Model output is validated again before it reaches the form.

OpenAI requests use `store: false`. Groq requests use its Chat Completions endpoint
with a strict JSON schema and a bounded output budget. Both responses are checked
against the same local schema, including dates, URLs and enumerated values.
SMS follows [Kavenegar's verification endpoint](https://kavenegar.com/rest.html).
Extraction failure keeps the original source and offers manual entry.

Accounts and sessions are now server-backed. Job records, notes and attachments
still use the existing browser storage, partitioned by phone; this change does
not implement cross-device record synchronization. Mobile logout is exposed above
the page content because the existing mobile navigation had no logout control.

## Reproducible checks

Compile the API first, then run `npm run e2e:connected --workspace @karnama/web`.
This starts the real Nest GraphQL API against ephemeral PGlite on loopback port
4400 and the actual web app on 5174. Only SMS delivery and AI output are fixtures.
The fixture is outside the API build, requires `NODE_ENV=test`, and binds only
127.0.0.1. Never deploy it. Its test-code route exists only in that script.

The connected tests exercise wrong-code rejection, signup, session restoration,
ad extraction, review edits, persistence, manual recovery and logout on desktop
and mobile. API tests exercise the actual migrations, code consumption, attempt
limits, expiration, authorization and provider failure. URL and extraction tests
reject private addresses, invalid fields and unsafe links.

The legacy demo board tests explicitly intercept extraction responses. They test
the client review flow; they are not evidence of live model quality or SMS delivery.
The existing Lingui CLI lacks configuration, documented in `TECH-DEBT.md` section
8; strings use the current runtime catalogs and their consistency tests.
