# KN-460 - The mocked code rides in the production auth contract, where a real sender could leak a live one

## The card

**Why**, from the board: A one-time code on the screen is the whole point of the
mock and a serious defect the moment it is real. The migration that introduces it
is exactly the moment nobody is looking at this file.

**Exit condition**, from the board: AuthValue cannot carry a code, the screen reads
it from something only the mock provides, and a provider that does not mock it
cannot show one.

Filed by KN-459's roast. High, three points.

## What is there, read on 2026-09-15

- **`src/core/auth/AuthProvider.tsx`**: `AuthValue`, the contract both providers
  fill, has `mockCode: string | null`, documented as the mock's, KN-459. The mock,
  `AuthProvider`, fills it from the code it has pending; `NO_AUTH`, the context's
  default, has it null.
- **`src/core/auth/RemoteAuthProvider.tsx`**: the live provider writes `mockCode:
null` into its value.
- **`src/screens/AuthScreen.tsx`**: draws the stand-in notice, a `status` holding
  the code, whenever `auth.mockCode` is not null.
- **`src/app/AppProviders.tsx`**: mounts one of the two, `remoteAuth ?
RemoteAuthProvider : AuthProvider`, and `main.tsx` passes `VITE_AUTH_MODE ===
'live'`; the Pages build is `demo`. The Storybook preview wraps every story in
  `AppProviders` with the mock, and stories put providers of their own inside it.
- **What reads the field**: `AuthProvider.stories.tsx`'s probe, KN-465, and a
  comment in `AuthProvider.test.tsx`. `AuthScreen.stories.tsx` reads the code off
  the screen, never the field.
- **Coverage**: `AuthProvider.test.tsx` renders the mock with `renderToString`,
  since a file both projects touch keeps the node project's numbers, KN-103.
- **Docs**: `Core-AuthProvider.md`, both languages, say the mock hands the code to
  the screen.

## The approach

1. **`AuthValue` loses `mockCode`**, and `NO_AUTH` and `RemoteAuthProvider` their
   lines. Once the field is gone, TypeScript refuses it on an `AuthValue` literal.
2. **A context only the mock provides**, in `AuthProvider.tsx` beside the mock:
   `MockCodeContext` holds the code and the `AuthValue` it belongs to. A pure
   function, `codeFor(delivery, auth)`, gives the code only when `auth` is that
   same value, and null otherwise; `useMockCode()` is it over the two contexts.
   The mock provides both contexts, the delivery memoised on its value and its
   code. So a provider that does not mock cannot show a code, even one mounted
   inside the mock, as a story or the preview can do: the value its screen reads is
   not the one the code belongs to. Outside the mock there is no delivery at all.
3. **`AuthScreen`** draws the notice from `useMockCode()`, under a comment saying
   it and the context go together when a real sender comes.
4. **`index.ts`** exports `useMockCode`.
5. **Tests**: `AuthProvider.test.tsx` checks `codeFor` with a real code: given to
   the value it belongs to, refused to another value and to no delivery; and
   `useMockCode` read outside the mock and inside it. The stories' probe reads
   `useMockCode()`. A new story, `NoCodeUnderAnotherProvider`, puts a stand-in
   `AuthContext.Provider` that is waiting for a code, as any provider that does not
   mock would be, inside the mock, each around its own sign-in screen: once the
   mock has sent a code, its screen shows it and the other shows none.
6. **Docs**: the new story in both languages, and `Core-AuthProvider.md`'s opening
   says the code reaches the screen through the mock's own context.

## How I will know it works

- The unit project, whose guards read every story; the AuthProvider and SignIn
  stories under Vitest; eslint; tsc; coverage of `AuthProvider.tsx` and
  `AuthScreen.tsx`.
- Plants: `codeFor` without the comparison fails the new story and the unit test;
  the screen reading nothing fails the SignIn stories that read the code off the
  screen.
- The e2e sign-in spec, and the code step seen in fa-IR and en-US, light and dark.

## What I am unsure of

- **Whether the comparison is more than the exit asks.** In the app only one
  provider is ever mounted, so the context alone meets it; the comparison is for a
  provider mounted inside the mock, which only stories do today. It is one line,
  and without it the exit's last clause holds only by how `AppProviders` is wired.
- **A shape without a context**: the mock could hand `AuthScreen` a prop or a slot
  instead, but `App` renders the screen and does not know which provider is
  mounted, so the prop would have to come from `AppProviders` through `App`.

## Plan review, Codex, 2026-09-15

Sound, with one correction, taken. The comparison is needed rather than extra: a
context alone leaks through a nested provider, since an inner provider overrides
`AuthContext` but inherits the outer mock's code context. React reads the nearest
provider of each context from the current render, so `useMemo` and StrictMode's
double renders do not undo it, provided the delivery is made from the very value
given to `AuthContext.Provider` in that render.

**The correction**: the ordinary `sign-in.spec.ts` runs the mock and cannot prove
the live path. `connected.spec.ts`, run by `npm run e2e:connected`, already expects
no mock notice after a server code is asked for, so it is named and run.

**The details**: `MockCodeContext` stays private to `AuthProvider.tsx`, holding
`{ auth, code }`, and only `useMockCode` leaves the barrel; the two providers' values
sit side by side in the mock; and the new story also asserts the mock's own screen
shows the code it sent, since pairing the code with a stale or rebuilt value would
hide it there.

## Result, 2026-09-15

Built as planned, with one thing found on the way.

- **`AuthValue` has no `mockCode`**, and `NO_AUTH` and `RemoteAuthProvider` lost
  their lines.
- **`AuthProvider.tsx`**: `MockCodeContext`, private to the file, holds `{ auth,
code }`, made with `useMemo` from the very value `AuthContext.Provider` is given
  in the same render. `codeFor(delivery, auth)` gives the code only when `auth` is
  `delivery.auth`; `useMockCode()` reads the two contexts through it. `codeFor` is
  exported from the file for its test, and only `useMockCode` joins the barrel.
- **`AuthScreen.tsx`** draws the notice from `useMockCode()`.
- **Tests**: `codeFor` with a real code; `useMockCode` outside any provider;
  the probe reads `useMockCode()`; `NoCodeUnderAnotherProvider` sends a code from
  the mock's screen with its randomness at 0.5 and asserts that screen shows
  50000 and the screen under the stand-in shows no status at all.
- **Found**: `connected.spec.ts` checked that live mode shows no notice by looking
  for «هیچ پیامی واقعاً ارسال نمی‌شود», which the notice never says; the catalog
  has «هنوز پیامکی واقعاً ارسال نمی‌شود. کدت این است:». The check could not fail. It
  looks for the notice's own words now.

The checks:

- The unit project, 1423 tests in 39 files; Core/AuthProvider and SignIn stories 12
  of 12, and `AuthProvider.test.tsx` 11 of 11.
- eslint and tsc clean; every file touched was prettier-clean at HEAD and is, and
  `connected.spec.ts` keeps its HEAD drift.
- Coverage of those three files' run: every line this change adds is covered.
  Uncovered in that run and untouched: `AuthProvider.tsx` 154 to 159, the storage
  handler another tab's sign-in reaches, and `AuthScreen.tsx` 47 to 51 and 218, the
  live provider's retry timer and restore button.
- Plants, each restored by hash: `codeFor` without its comparison fails the unit
  test and `NoCodeUnderAnotherProvider`; the screen reading no code fails seven
  stories, Core/AuthProvider's three and SignIn's `SigningInOnAPhone`,
  `EnterFinishesTheStep` and both `KeyboardsForEachStep`; a notice drawn under every
  provider fails `connected.spec.ts`'s live login at line 21.
- e2e: `sign-in.spec.ts` and `two-tabs.spec.ts` in demo mode, 10 passed and 2
  skipped, mobile's own; `connected.spec.ts` in live mode against
  `agent/scripts/scenario-server.mjs`, whose database and SMS are local doubles,
  12 of 12.
- Seen on the Storybook dev server: the mock's screen with its code and the other
  with none in Persian, light and dark, and the code step in English, light and
  dark.
