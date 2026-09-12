1. The union is appropriate for one visual component with mutually exclusive capabilities. A separate link component is not required just because `href` and `disabled` conflict. But each branch needs first-class rendering and tests; the current Storybook setup hides the link branch.

2. Yes, typing meta as `IconButtonSwitch` hides the link case. Every story renders a button, Controls excludes `href`, and no test verifies that the rendered element is an anchor, has the destination, or has native link behavior. The Controls table is honest only about the switch branch, not `IconButton` as exported.

3. Yes. With `exactOptionalPropertyTypes: true`, `href?: never` rejects both `href={undefined}` and `{ ...{ href: undefined } }` when paired with `disabled`. `undefined` is not assignable to `never` unless explicitly included.

Findings:

- critical — The actual checkout does not typecheck. `apps/web/src/shared/icon-button/IconButton.tsx:140` and `:144` fail MUI overload resolution because `TooltipTrigger` is derived from the polymorphic MUI component, producing button-or-anchor event-handler unions that cannot be passed to either concrete render branch. This is in the current uncommitted KN-447-shaped edit, not the supplied KN-433 diff, but it means the live component cannot satisfy the repository’s clean-typecheck completion requirement.

- major — The new `IconButtonLink` branch has no Storybook story or behavioral assertion. `IconButton.stories.tsx:14-31` forces all rendered args to `IconButtonSwitch` and deliberately omits `href`. A regression that stops rendering an anchor, drops `href`, or regresses link semantics remains untested.

- minor — The change puts component API documentation in JSDoc at `IconButton.tsx:39-47`. The repository contract requires that prose in `story-docs`, not `.tsx`; the matching user-facing explanation already belongs in `Shared-IconButton.md`.

VERDICT
score: 4.5
criticals: 1
one-line: make the actual IconButton implementation typecheck by separating the button and anchor trigger prop types before treating KN-433 as closed