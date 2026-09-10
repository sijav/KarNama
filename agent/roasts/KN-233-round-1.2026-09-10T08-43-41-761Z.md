1. Yes, for normal React DOM props, the attribute is committed before the ref callback runs. This check does not race React’s attribute application. It can still be absent because the child overwrote it.

2. No, a pre-existing `aria-describedby` is legitimate. The tooltip must merge its ID with existing IDs. MUI spreads `children.props` after Tooltip’s `other` props, so the child currently replaces the tooltip’s ID entirely.

3. A ref-forwarding wrapper that intentionally returns `null` while a 200–500 ms async permission, feature-flag, or transition state resolves is legitimate and will be falsely reported at 100 ms.

Findings:

- critical — [Tooltip.tsx:61](D:\Kar\Gandom\KarNama\apps\web\src\shared\tooltip\Tooltip.tsx:61) does not prove event props arrived. A wrapper can forward only `ref` and `aria-describedby`, while dropping `onFocus`, `onMouseOver`, `onMouseLeave`, and touch handlers:

  ```tsx
  const Broken = ({ ref, 'aria-describedby': describedBy }) => (
    <button ref={ref} aria-describedby={describedBy} />
  )
  ```

  It passes this check, but the production tooltip remains silent. That is the precise defect KN-233 was meant to close. Add a story for this shape; the current `RefOnlyButton` drops too much and lets an attribute-only test masquerade as an event-prop test.

- critical — [Tooltip.tsx:43](D:\Kar\Gandom\KarNama\apps\web\src\shared\tooltip\Tooltip.tsx:43) arbitrarily declares a correctly implemented conditional trigger broken after 100 ms. Change `LateButton`’s timeout at [Tooltip.stories.tsx:79](D:\Kar\Gandom\KarNama\apps\web\src\shared\tooltip\Tooltip.stories.tsx:79) to 200 ms and it logs the permanent false error before the valid trigger attaches. The exit condition has no 100 ms limit, so it is not met.

- major — [Tooltip.tsx:61](D:\Kar\Gandom\KarNama\apps\web\src\shared\tooltip\Tooltip.tsx:61) falsely reports a child that forwards every prop but already has its own description. Worse, its existing attribute replaces the tooltip ID because MUI applies `children.props` last. The visual tooltip may work, but it is no longer an accessible description. Merge description IDs and add a story with an existing description.

I could not run the mutation verifier to completion because this review sandbox is read-only: its intentional source mutations and temporary Vite files fail with `EPERM`. That is an environment limitation, not a finding.

VERDICT
score: 3.0
criticals: 2
one-line: the aria-describedby check can be satisfied while every tooltip event handler is still dropped, so it does not fix KN-233