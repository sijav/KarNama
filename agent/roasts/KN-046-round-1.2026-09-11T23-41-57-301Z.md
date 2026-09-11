1. Expiry is checked at submit time, so a code expiring between typing and clicking is rejected correctly. But moving the system clock backwards extends a code’s real lifetime, because expiry is based only on `Date.now()`.

2. Two tabs are not coordinated. Each tab holds its own pending code and session; the last tab to save a name overwrites `karnama.session`, while the other tab remains visibly signed in with stale in-memory state.

3. A hand-written localStorage session gets in. For example, setting `karnama.session` to `{"phone":"09120000000","name":"x","since":"x"}` before loading grants board access, with no code ever issued or verified.

4. Signing out while an add modal is open unmounts the UI, but does not clear the records provider. The next person signing in on that browser receives the previous person’s board.

5. The normalizer correctly handles the formats the design promises: Persian/Arabic digits, spaces, ASCII dashes, `+98`, and `0098`. It rejects malformed lengths and prefixes. It does not accept typographic dashes such as `–`, which is less important than the persistence failures.

6. One reader signs out and another signs in to the same browser: the second reader sees, edits, and can delete the first reader’s jobs because all records live under the single global `karnama.records` key. Records must be scoped to a verified account identity, and the in-memory record state and client cache must reset on an identity change. With the current client-only mock, phone normalization can be a temporary namespace, but it is not authentication.

Findings:

- critical — The archive is neither account-scoped nor cleared at sign-out. `RecordsProvider` always loads and writes the same `karnama.records` key, independently of the authenticated session. Sign in as A, create jobs, sign out, then sign in as B: B gets A’s full archive. This directly violates the product’s ownership model. [RecordsProvider.tsx](D:\Kar\Gandom\KarNama\apps\web\src\core\records\RecordsProvider.tsx:10), [RecordsProvider.tsx](D:\Kar\Gandom\KarNama\apps\web\src\core\records\RecordsProvider.tsx:58), [AuthProvider.tsx](D:\Kar\Gandom\KarNama\apps\web\src\core\auth\AuthProvider.tsx:139)

- critical — The session validator accepts any structurally plausible localStorage object, so OTP is bypassable. `readSession` validates only string types and a phone-shaped value; it neither validates `since` nor verifies a token, signature, or previously issued code. The provider trusts that result on startup. DevTools can therefore inject a named session and enter the board immediately. [auth.ts](D:\Kar\Gandom\KarNama\apps\web\src\core\auth\auth.ts:89), [AuthProvider.tsx](D:\Kar\Gandom\KarNama\apps\web\src\core\auth\AuthProvider.tsx:59), [AuthProvider.tsx](D:\Kar\Gandom\KarNama\apps\web\src\core\auth\AuthProvider.tsx:93)

- major — Mobile users cannot sign out at all. `Navigation` passes only destination props to `TabBar`, dropping `onSignOut`; the e2e test explicitly skips its sign-out assertion on mobile. The claimed desktop-and-phone sign-out coverage is false. [Navigation.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\navigation\Navigation.tsx:21), [sign-in.spec.ts](D:\Kar\Gandom\KarNama\apps\web\e2e\sign-in.spec.ts:82)

- major — Cross-tab identity changes are stale and race-prone. There is no `storage` listener, so Tab A can sign out while Tab B remains authenticated. Likewise, two first-login tabs can save different names, and whichever calls `saveName` last overwrites the shared session. [AuthProvider.tsx](D:\Kar\Gandom\KarNama\apps\web\src\core\auth\AuthProvider.tsx:93), [AuthProvider.tsx](D:\Kar\Gandom\KarNama\apps\web\src\core\auth\AuthProvider.tsx:136)

- minor — The required expired-code UI path is not exercised end-to-end or in Storybook. The e2e covers only a wrong code; the unit test covers the pure checker but not the provider/screen message and resend route after an actual expiry. [sign-in.spec.ts](D:\Kar\Gandom\KarNama\apps\web\e2e\sign-in.spec.ts:57), [auth.test.ts](D:\Kar\Gandom\KarNama\apps\web\src\core\auth\auth.test.ts:59)

- minor — The auth screen hardcodes MUI spacing (`p: 6`) instead of using the theme token required by the repository contract. [AuthScreen.tsx](D:\Kar\Gandom\KarNama\apps\web\src\screens\AuthScreen.tsx:110)

VERDICT
score: 2.5
criticals: 2
one-line: Scope records and reset all record/cache state by authenticated identity, because sign-out then sign-in currently exposes the prior reader’s archive.