1. `role="status"` is appropriate here. It politely announces the inserted/replaced code after Send/resend without interrupting the reader. Do not move focus; that would be worse. Ensure the status remains the sole announcement path.

2. The real-SMS migration is unsafe. `mockCode` has been added to the general `AuthValue` contract, then consumed directly by the production screen. A real provider can accidentally keep returning it, exposing a real OTP. There is no type-level or architectural boundary that makes removal one edit.

3. Yes. The new story never resends, so it can pass even if the notice remains on the first code while `verify` accepts only the resent code. The provider currently derives both from `sent`, but the test does not prove that invariant.

Findings:

- **major** — Real OTP leakage is now an easy regression. `mockCode` is public auth state and `AuthScreen` unconditionally renders it whenever non-null. When a real sender replaces the mock, retaining that field or populating it from a server response displays a live credential to anyone viewing the page. Keep mock delivery data confined to a mock-only implementation, or make the production auth contract incapable of carrying a readable code. [AuthProvider.tsx:26](D:/Kar/Gandom/KarNama/apps/web/src/core/auth/AuthProvider.tsx:26), [AuthProvider.tsx:135](D:/Kar/Gandom/KarNama/apps/web/src/core/auth/AuthProvider.tsx:135), [AuthScreen.tsx:83](D:/Kar/Gandom/KarNama/apps/web/src/screens/AuthScreen.tsx:83)

- **minor** — The SignIn Docs page still instructs readers that the code is in the browser console, contradicting the new phone flow. This is precisely the stale mock guidance that will be left behind during the transition. Update both locales’ existing introduction, not only the new story entry. [Screens-SignIn.md:8](D:/Kar/Gandom/KarNama/apps/web/src/shared/story-docs/en/Screens-SignIn.md:8)

- **minor** — The new provider assertion proves the opposite of the requirement: it creates a fresh provider and expects `mockCode` to be `null`, rather than observing the provider after `requestCode`. The phone story covers only the first send. Add a resend sequence that reads the newly displayed code and signs in with it. [AuthProvider.test.tsx:69](D:/Kar/Gandom/KarNama/apps/web/src/core/auth/AuthProvider.test.tsx:69), [AuthProvider.test.tsx:73](D:/Kar/Gandom/KarNama/apps/web/src/core/auth/AuthProvider.test.tsx:73), [AuthScreen.stories.tsx:135](D:/Kar/Gandom/KarNama/apps/web/src/screens/AuthScreen.stories.tsx:135)

- **minor** — The added multi-paragraph interface and JSX comments are documentation prose in code, violating the repository’s explicit documentation rule. Put the explanatory material in the SignIn story docs and retain only short implementation comments. [AuthProvider.tsx:26](D:/Kar/Gandom/KarNama/apps/web/src/core/auth/AuthProvider.tsx:26), [AuthScreen.tsx:79](D:/Kar/Gandom/KarNama/apps/web/src/screens/AuthScreen.tsx:79)

Focused Storybook verification could not start because this read-only sandbox prevents Vite from writing its temporary config file; board validation passed.

VERDICT
score: 6.5
criticals: 0
one-line: keep mock OTP delivery out of the shared production auth contract so a real SMS migration cannot expose live codes