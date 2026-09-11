1. The stretched overlay does not swallow the existing links, checkbox, or delete: each is raised to `z-index: 1`. The article/button structure is intelligible to a screen reader. The pattern itself is sound.

2. No, keyboard order is wrong. At rest the checkbox and delete are `display: none`, so Tab enters the name button first. That focus reveals them, then Tab reaches delete; the checkbox is only reachable with Shift+Tab. A keyboard user cannot enter the card at its visual first control.

3. `dir="ltr"` is correct for email, phone, and LinkedIn inside RTL. The formatted mobile groups are logically ordered `0912 123 4567`, and LTR preserves that order.

4. Yes. The 30px title row remains fixed. The checkbox’s 28px root with 4px negative margins occupies 20px in flex layout, plus the 8px gap, moving the name exactly 28px.

Findings:

- critical — Valid contacts with only a name cannot be represented correctly. The database explicitly makes `role` optional, but this component requires it; if null arrives at runtime, it still renders an empty role paragraph and divider rather than omitting the absent field. This violates the contact contract and produces a visibly blank row for the owner-approved name-only contact. [ContactCard.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\contact-card\ContactCard.tsx:13), [ContactCard.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\contact-card\ContactCard.tsx:185), [ContactCard.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\contact-card\ContactCard.tsx:318)

- critical — The full card’s keyboard sequence is inaccessible in the expected order. `display: none` removes the checkbox from sequential focus navigation until the name receives focus. The sequence from the preceding element is Name → Delete, with Checkbox available only by reversing direction. [ContactCard.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\contact-card\ContactCard.tsx:88), [ContactCard.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\contact-card\ContactCard.tsx:273)

- critical — The required mutation proof for the Title Group does not exist. `CheckboxRingIsWhole` only asserts the current unclipped DOM; it never mutates the Title Group to clip and proves that the assertion fails. The explicit exit condition is therefore unmet. [ContactCard.stories.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\contact-card\ContactCard.stories.tsx:150)

- critical — Compact email is not a `mailto:` link. It is a button that calls `window.location.assign`, and the task note admits this handler is not exercised. This fails both the specified link contract and total behavioral coverage. [ContactCard.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\contact-card\ContactCard.tsx:232), [#KN-026 - Contact card, full and compact.md](D:\Kar\Gandom\KarNama\apps\web\src\shared\contact-card\#KN-026%20-%20Contact%20card,%20full%20and%20compact.md:33)

- minor — The new user-facing labels use raw `i18n._('…')` strings rather than the mandated Lingui macro (`t`) or `<Trans>`. They happen to be manually present in catalogs now, but extraction will not own these messages as required. [ContactCard.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\contact-card\ContactCard.tsx:235)

`todo validate`, ESLint, and TypeScript passed. The targeted Vitest command could not start because this read-only sandbox denies Vitest’s temporary SSR directory.

VERDICT
score: 3.0
criticals: 4
one-line: Make name-only contacts render correctly, then fix the full card’s keyboard sequence and missing focus-ring mutation proof