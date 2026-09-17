# KN-485 · The API starts half configured: nothing checks that demo extraction has its secret, provider and key

From KN-477's review, A-03, H-02 and H-03.

**Why**, from the board: a misconfiguration shows up as a reader's failed extraction rather than a failed deploy, and
the owner had to diagnose it by hand from a phone.

**Exit**, from the board: `env.test.ts` shows the server refusing to start with demo extraction on and `AUTH_SECRET`,
the provider key or `EXTRACTION_PROVIDER` missing; `render.yaml` declares `AUTH_SECRET`, `EXTRACTION_PROVIDER`,
`GROQ_API_KEY`, `ALLOW_DEMO_EXTRACTION` and `TRUST_PROXY_HOPS`; health reports each as present or absent.

## 1. The defect, read from source

`env.ts` makes `AUTH_SECRET` optional, both provider keys optional, and defaults `EXTRACTION_PROVIDER` to `openai`.
So `ALLOW_DEMO_EXTRACTION=true` parses cleanly with no secret and no key, and the process starts. Then:

- `auth.service.ts:34-36` is `private hmac(value)`, reading `AUTH_SECRET` and returning `fail('AUTH_NOT_CONFIGURED')`
  when it is absent or under 32 characters. Lines 47, 58 and 79 route every limit key, every code write and every
  code check through it, so with no secret the first demo extraction fails.
- `extraction.service.ts:70` is `if (!key || !model) return fail('EXTRACTION_NOT_CONFIGURED')`.
- `health.resolver.ts` meanwhile answers `demoExtractionEnabled: true` and names the provider, **saying nothing about
  whether any of those exist**.

That combination is the outage: a service that reports itself healthy and demo-enabled while every extraction fails.
`render.yaml` declares only `NODE_ENV`, `NPM_CONFIG_PRODUCTION`, `WEB_ORIGIN` and `DATABASE_URL`, so none of the
variables that decide this is named where the service is defined.

## 2. Five things that will bite, found by reading rather than by building

**A default is applied DURING parsing, so a refinement can never see the provider missing.** This was the plan
review's first correction and it is right. `EXTRACTION_PROVIDER` carries `.default('openai')`, so by the time any
`superRefine` on the object runs, the field reads `openai` whether a deployer chose it or not. The rule this card
needs, refuse when the provider was not chosen, is **unobservable** while that default is on the schema. So the field
becomes `z.enum(['openai','groq']).optional()` and the refinement reads the raw absence.

**Removing that default costs nothing, because both consumers already restate it.** Measured, not assumed:
`extraction.service.ts:65` is `this.config.get<string>('EXTRACTION_PROVIDER') === 'groq'`, so anything that is not
`groq`, `undefined` included, takes the OpenAI path; and `health.resolver.ts:20` ends in `?? 'openai'`. Both read
through `config.get<string>` rather than the typed `Env`, so the type going optional reaches neither. No transform
restoring the default is needed.

**OpenAI needs a MODEL as well as a key, and unlike Groq it has no default anywhere.** This was the review's second
correction and it is the more dangerous one, because it is invisible unless both files are read together.
`extraction.service.ts:67-69` reads `GROQ_EXTRACTION_MODEL` **with an inline fallback** on top of `env.ts:25`'s
schema default, while the OpenAI branch reads `OPENAI_EXTRACTION_MODEL` bare, and `env.ts:22` gives it no default. So
a Groq model can never be missing and an OpenAI model can. A refusal that demanded only the key would let exactly the
configuration this card exists to stop boot and fail every extraction. **That asymmetry is deliberate and must not be
tidied into symmetry**, which is the shape of edit that would quietly undo this.

**The error formatter has a comment that a refinement would falsify.** `parseEnv` maps `issue.path.join('.')` and its
comment says there is no `(root)` fallback because "the schema is an object schema, so every issue carries the key it
is about, and a fallback for a case that cannot arise is a branch no test can reach". A `superRefine` issue can carry
an EMPTY path, which would print a bare `: message` and make that reasoning false. So each refusal attaches its issue
to a named key with `path: ['AUTH_SECRET']` and so on. That is better than teaching the formatter a fallback anyway:
the message then names the variable whoever is deploying has to set, which is the whole purpose of naming them all at
once.

**Adding fields to `Health` breaks the build until the schema is regenerated**, and regenerating is safe.
`schema.gql` is committed and `npm run build` is `tsc -p tsconfig.build.json && npm run schema:check`, so the order is
build, generate, build again. The worry that the new refusal could block its own regeneration is measured and absent:
`schema.ts:9` builds the schema "WITHOUT starting a server" from `GraphQLSchemaBuilderModule`, which reads decorators
only, and `resolvers.ts` imports three resolver classes and nothing that parses an environment. Its docblock records
that the old `autoSchemaFile` approach DID need a full environment and that a roast rated that major.

The empty-environment count is safe: `env.test.ts:49` expects exactly `2 configuration problem(s)` from `parseEnv({})`,
`ALLOW_DEMO_EXTRACTION` defaults to `false`, so a rule conditioned on it being `true` does not fire there, and an
optional field never errors on its own. What DOES change is `env.test.ts:15`, which asserts the complete environment
yields `EXTRACTION_PROVIDER === 'openai'`; with the default gone that is `undefined`, and the assertion becomes the
one that tells absent from explicit.

## 3. Where the refusal attaches, which already exists

`app.module.ts:18` is `validate: parseEnv`, Nest's own hook, so a throw from `parseEnv` stops the bootstrap. This card
adds a rule to an existing refusal rather than any new wiring. `main.ts:25` and `database/cli.ts:100` call `parseEnv`
too, inside bootstrap and inside a command, so nothing parses an environment at import time.

## 4. What health may say, and what it must never say

Four new booleans, one per thing that can be missing:

| field                          | true when                                                   |
| ------------------------------ | ----------------------------------------------------------- |
| `authSecretConfigured`         | `AUTH_SECRET` is set, which the schema already floors at 32 |
| `extractionProviderConfigured` | a provider was CHOSEN, rather than falling back to OpenAI   |
| `extractionKeyConfigured`      | the key for the provider in force is set                    |
| `extractionModelConfigured`    | the model for the provider in force is set                  |

The last two mirror the two operands of `extraction.service.ts:70`, `if (!key || !model)`, one field per operand, so
the query answers the question the failure actually raises instead of half of it.

**`extractionProviderConfigured` is here because I was wrong to leave it out.** The earlier draft argued that a
provider is always explicit when demo extraction is on, so the field could never read false where it mattered. That
is true only with demo extraction ON. With it OFF, an absent provider and an explicit `openai` are different states
that health today reports identically as `'openai'`, and the difference is exactly what an operator wondering why a
Groq key is being ignored needs to see. The card's exit names `EXTRACTION_PROVIDER` among the things health must
report present or absent, and the earlier draft reasoned that stated exit away on my own judgment.

`health.resolver.test.ts:41` already asserts `JSON.stringify(health)` does not contain a fixture credential, so that
existing guard is what catches a slip. Presence is read through `ConfigService`, for the same reason the existing
fields are: it is the validated value rather than whatever the environment holds now.

## 5. The refusal, stated as a rule

When `ALLOW_DEMO_EXTRACTION` is `true`, the process refuses to start unless `AUTH_SECRET` is set, `EXTRACTION_PROVIDER`
was chosen, the key for that chosen provider is present, and, **for OpenAI only**, `OPENAI_EXTRACTION_MODEL` is
present. Each missing one is its own issue against its own key, so the message names all of them at once, which is the
behaviour `parseEnv` already exists to give and which its four-cold-starts comment is about.

**Why the provider must be chosen rather than defaulted**: defaulting to `openai` is what lets a Groq deployment boot
pointing at a provider it has no key for. A deployment that turns demo extraction on has made a choice and should
have to say it. With demo extraction off, nothing changes for anyone.

## 6. The deployment handoff, which is not optional

`render.yaml:50-59` already records this repository's own experience of it: a service "keeps the settings it was made
with until the Blueprint is re-synced", learned when an edited `buildCommand` produced an identical failure. The same
applies to a newly declared `sync: false` variable, which Render prompts for when the Blueprint creates the service
rather than when a later commit adds it. So the two secrets must already exist in the dashboard, and both do:
`AUTH_SECRET` and the provider key were set there by hand when demo extraction was turned on.

The failure mode is bounded by construction, and this is the part worth stating plainly: **the refusal fires only
when `ALLOW_DEMO_EXTRACTION` is `true`**, which is exactly the configuration in which every extraction is already
failing. It cannot turn a working deployment into a broken one. It can only turn a deployment that lies about its
health into one that refuses to start and says why.

## 7. Scope

| file                             | what changes                                                         |
| -------------------------------- | -------------------------------------------------------------------- |
| `config/env.ts`                  | provider becomes optional; the refusal, each issue on its own key    |
| `config/env.test.ts`             | the refusals, absent told from explicit, and the count still holding |
| `health/health.model.ts`         | the four booleans, described as configuration rather than values     |
| `health/health.resolver.ts`      | reads them through `ConfigService`                                   |
| `health/health.resolver.test.ts` | each true and false, and the credential guard still passing          |
| `apps/api/schema.gql`            | regenerated, not hand edited                                         |
| `render.yaml`                    | the five declarations, secrets `sync: false`                         |
| `config/render.test.ts`          | asserts them, and its own note corrected, see below                  |
| this plan                        | the record                                                           |

Baselines taken before any edit, every one 0: `env.ts`, `env.test.ts`, `render.test.ts`, `health.model.ts`,
`health.resolver.ts`, `health.resolver.test.ts`, `render.yaml`. **Em dashes to hold, not change**: `render.yaml` 2,
`render.test.ts` 1, everything else 0.

**`render.test.ts` stays line-based, and its note gets corrected rather than left lying.** The note says "If this file
grows a fourth rule, parse it properly" while the file carries five and this card takes it to ten. Switching means
adding `yaml` as a direct dev dependency: it resolves in the lockfile today but is a direct dependency of nothing, so
importing it would be a phantom dependency, and declaring it is an install. **The owner's seven day
`min-release-age` is deliberate supply chain protection and that decision is theirs**, so it is filed as KN-723 rather
than spent inside this card. The note is rewritten to say what the file actually does, why, and where the parsed
version lives, because a comment stating a rule the file breaks is worse than no comment.

What parsing would have caught here is narrower than it looks: `render.yaml` declares ONE service, so a key under the
wrong service is not a current failure mode, and the test already strips comment lines so prose about a key cannot
satisfy a rule about it. The one real hole this card would open is a secret written with a `value:` AND a later
`sync: false`, which the existing `[\s\S]{0,80}?` style would match across. So the two secret rules are written as
**adjacent lines**, `key: X` immediately followed by `sync: false`, which closes it with no dependency at all.

## 8. What must not change

- **`WEB_ORIGIN` having no default.** A default CORS origin is no CORS policy, and its test says so.
- **The "names every missing variable at once" behaviour**, and the count assertion that proves it.
- **Health never carrying a credential**, which its own test already enforces.
- **A deployment with demo extraction OFF**, which must still boot with no secret and no key, since that is the
  default posture and nothing about it is broken.
- **What either provider consumer does with an unset provider**, which is to use OpenAI, unchanged by this card.
- **The Groq model's two fallbacks**, which are why only OpenAI needs its model demanded.

## 9. The proof

`env.test.ts` refusing for each missing piece with demo extraction on, and still booting with it off. A case that
tells an ABSENT provider from an explicitly set `openai`, since that distinction is the correction this plan took and
is the piece most likely to be built wrongly. A case for demo extraction on with OpenAI chosen, a key and NO model,
which must refuse, and its Groq counterpart with no model, which must boot. The empty-environment count unchanged.
`health.resolver.test.ts` showing each of the four booleans both ways, with the credential guard still passing.
`render.test.ts` asserting the five declarations, the two secrets by adjacent lines. `tsc --noEmit`,
`eslint --max-warnings 0`, and `npm run build` including `schema:check` against a regenerated `schema.gql`.

The planted failure: remove the refusal and the environment that should be refused parses, which must fail the new
`env.test.ts` case by name.

## 10. What the reviews settled, and what is left

Settled by the reviews: attach issues to named keys rather than teaching the formatter a path-less fallback; make the
provider raw optional, which was the first material correction; demand the OpenAI model, which was the second and
which I verified at `extraction.service.ts:67-70` before taking it; report `extractionProviderConfigured`, where my
own reasoning for omitting it was wrong; correct `render.test.ts`'s note rather than merely leaving it line-based.
Answered by measurement rather than by review: no transform restoring the provider default, because both consumers
already fall back to OpenAI on their own.

Left open, and deliberately not decided inside this card: whether `render.test.ts` should parse the YAML, which is
KN-723 and a dependency the owner decides.
