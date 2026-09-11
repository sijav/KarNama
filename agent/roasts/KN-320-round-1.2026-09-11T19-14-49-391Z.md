1. Yes. A flush, `overflow: hidden` host clips 2px of the target and 6px of the focused outline. Today, `PageHeader` itself does not clip, and it has no application-page consumers; its only use is its Storybook file. The captured mobile screens place the header 16px from the viewport edge, so the drawn layout has room.

2. Negative margin is the only proposed option that preserves both the 20px arrow and its specified 12px gap while making the actual button box 24px. A 10px gap violates the task. A pseudo-element would not make the measured button box 24px. WCAG’s spacing exception could permit the old 20px control if its centered 24px circle avoids other targets, but it does not meet the product’s explicit 24px target requirement.

Findings: none. The change produces a 24×24 actual button while retaining the required arrow geometry. Typecheck and focused ESLint pass. The Storybook test could not start because this read-only sandbox prevents Vite writing its temporary config file.

[WCAG 2.5.8 target-size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) confirms the 24×24 requirement and the narrowly defined spacing exception.

VERDICT
score: 9.5
criticals: 0
one-line: nothing