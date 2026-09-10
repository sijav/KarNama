1. No current competing document writer exists. The only `AppProviders` mounts are the app root and Storybook decorator. StrictMode repeats the same assignment, and the real `LanguageSwitch` updates that same provider. If nested `AppProviders` are later introduced, outer wins because layout effects run child-first, so nesting with different locales is unsafe.

2. `useLayoutEffect` is pre-paint for the committed React tree: React cannot yield to paint between DOM mutation and layout effects. The observer and Storybook phase checks do not themselves prove a physical paint boundary, but they correctly distinguish layout from passive effects. Late fonts/CSS do not reopen a wrong-`dir` frame, because the attributes are already set before they can paint the committed tree.

Findings: none. The implementation fixes the actual commit-to-passive-effect gap, and the verifier’s `useEffect` mutation demonstrates that it detects the original regression.

VERDICT
score: 9.5
criticals: 0
one-line: nothing