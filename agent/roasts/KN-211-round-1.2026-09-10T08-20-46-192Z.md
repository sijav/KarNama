1. Yes. `useEffect(..., [])` only evaluates the first committed child. Replacing a working trigger with a non-forwarding one later is silent; starting with a conditionally absent trigger falsely reports before it appears. [Tooltip.tsx:33](D:/Kar/Gandom/KarNama/apps/web/src/shared/tooltip/Tooltip.tsx:33)

2. StrictMode does not falsely report for an initially mounted, ref-forwarding DOM trigger: refs are assigned before passive effects run. It will, however, emit the same error twice for an invalid initial trigger, and it does not solve the conditional-mount false positive.

3. Yes. The test makes the no-ref case fail, but a child can forward only the ref while swallowing MUI’s event props. The local check sees a node; MUI’s props-forwarding diagnostic is development-only. In production this ships as a tooltip that never opens with no report.

Findings

- critical — A ref-only wrapper still satisfies the component’s check but drops MUI’s hover/focus listeners. For example, `forwardRef<HTMLButtonElement>((_props, ref) => <button ref={ref} />)` is accepted by `children: ReactElement`; `trigger.current` receives the button and suppresses the local error, while `_props` discards `onMouseOver`, `onFocus`, etc. MUI’s only detection is explicitly guarded by `process.env.NODE_ENV !== 'production'`, so the production tooltip silently never opens. The existing mutation removes both props and ref, so it cannot detect this case. This fails the task’s “does not forward props” exit condition. [Tooltip.tsx:28](D:/Kar/Gandom/KarNama/apps/web/src/shared/tooltip/Tooltip.tsx:28), [Tooltip.tsx:33](D:/Kar/Gandom/KarNama/apps/web/src/shared/tooltip/Tooltip.tsx:33), [Tooltip.stories.tsx:41](D:/Kar/Gandom/KarNama/apps/web/src/shared/tooltip/Tooltip.stories.tsx:41), [Tooltip.stories.tsx:155](D:/Kar/Gandom/KarNama/apps/web/src/shared/tooltip/Tooltip.stories.tsx:155), [Tooltip.js:503](D:/Kar/Gandom/KarNama/node_modules/@mui/material/Tooltip/Tooltip.js:503)

- major — The one-time effect misreports a valid conditional trigger and misses later invalid replacement. A wrapper which initially renders `null` and later renders `<button ref={ref} {...props} />` produces “can never open” at mount even though it subsequently works. Conversely, a valid trigger swapped for `SwallowingButton` after mount produces no local report. The component needs to observe the actual trigger attachment across updates, not just its first passive effect. [Tooltip.tsx:32](D:/Kar/Gandom/KarNama/apps/web/src/shared/tooltip/Tooltip.tsx:32), [Tooltip.tsx:38](D:/Kar/Gandom/KarNama/apps/web/src/shared/tooltip/Tooltip.tsx:38)

I ran `node agent/scripts/verify/KN-211.mjs`. Its non-mutating checks passed, but Vitest could not create `.vite-temp`, and its mutation checks could not write source files in this read-only sandbox.

VERDICT
score: 4.0
criticals: 1
one-line: Detect or reject a ref-forwarding trigger that drops MUI’s injected event props, because it is silent in production.