1. The WCAG reading is sound. WCAG permits contrast calculations from CSS-defined colours and permits ignoring anti-aliased pixels. A solid 2px CSS outline whose declared dark colour is 3.04:1 passes even though rasterized corner pixels blend below 3:1. The coverage calculation is not WCAG’s required method, but here it is corroborating the declared solid geometry, not replacing it. It does not prove subjective comfort at the corners; 3.04:1 is legal but fragile. [W3C’s Focus Appearance understanding](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)

2. The expanded hover/hit area is a trade-off, not a defect: the interactive control is now the 28px root, so hover correctly follows that target. It becomes a defect only if a composition puts another target into that invisible 4px perimeter; there are no current production Checkbox compositions. The manual `Mui-focusVisible` class is only a Storybook-test limitation, and the production verifier separately uses a real Tab. The Title Group contract is deferred integration work, but KN-015 and KN-026 now make it an explicit acceptance condition with a mutation test, so it is not a KN-293 defect.

Findings: none. The implementation keeps the outline’s full logical extent inside the clipping host, preserves the 20px Figma frame, enlarges the actual target, has a named mutation that removes the room, and validates a real keyboard-focus path in the production build. I could not complete the verifier locally because this read-only sandbox denies its required temporary build directory; that is an environment limitation, not a finding.

VERDICT
score: 9.1
criticals: 0
one-line: nothing