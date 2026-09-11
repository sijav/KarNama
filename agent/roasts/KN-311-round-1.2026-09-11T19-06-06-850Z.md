1. No. `null` plus `console.error` makes a bad input silently remove a real action for every user. A fallback accessible name would invent semantics, so it is not safe either. Use a button-scoped error boundary or an explicit, local invalid-control fallback, and make the failure observable to the caller or telemetry, not only DevTools.

2. `beforeEach` is early enough to install the spy before render, and StrictMode’s duplicate effect does not break an “at least once” assertion. But the test is fragile: it asserts immediately instead of waiting for the passive effect, and it mutates global `console.error`. Cleanup is only safe if Storybook serializes these stories in one realm; parallel execution can restore another story’s spy.

Findings:

- major — The normal stories still violate the required “stories render from args” contract. `aria-label` is hidden from Controls and `Named` overwrites whatever the args contain. A reviewer cannot set the accessible name to blank, whitespace, or a real alternate value in Controls and see that value reach the component. The new fixed `BlankName` case does not repair that. [IconButton.stories.tsx:13](D:\Kar\Gandom\KarNama\apps\web\src\shared\icon-button\IconButton.stories.tsx:13), [IconButton.stories.tsx:21](D:\Kar\Gandom\KarNama\apps\web\src\shared\icon-button\IconButton.stories.tsx:21), [IconButton.stories.tsx:27](D:\Kar\Gandom\KarNama\apps\web\src\shared\icon-button\IconButton.stories.tsx:27), [IconButton.stories.tsx:172](D:\Kar\Gandom\KarNama\apps\web\src\shared\icon-button\IconButton.stories.tsx:172)

- major — Invalid runtime input removes the control without giving the host application any observable signal or recovery path. The only report is a passive-effect `console.error`; if the component is unmounted before effects run, even that report is lost. In production, the user sees only a missing action. [IconButton.tsx:46](D:\Kar\Gandom\KarNama\apps\web\src\shared\icon-button\IconButton.tsx:46), [IconButton.tsx:50](D:\Kar\Gandom\KarNama\apps\web\src\shared\icon-button\IconButton.tsx:50)

- minor — `BlankName` does not wait for the effect it is testing. It happens to pass when rendering flushes the effect before `play`, but the assertion races a passive effect and uses a global spy that is unsafe if Storybook stories overlap. Use `waitFor`, and prefer a scoped/injected reporter or a test-local component test. [IconButton.stories.tsx:166](D:\Kar\Gandom\KarNama\apps\web\src\shared\icon-button\IconButton.stories.tsx:166), [IconButton.stories.tsx:178](D:\Kar\Gandom\KarNama\apps\web\src\shared\icon-button\IconButton.stories.tsx:178)

I ran the board validator successfully. The focused Storybook suite could not run because this checkout has no `node_modules\.bin\vitest` path.

VERDICT
score: 5.8
criticals: 0
one-line: Do not silently delete a user action on invalid input; make the failure locally visible and observable to the host.