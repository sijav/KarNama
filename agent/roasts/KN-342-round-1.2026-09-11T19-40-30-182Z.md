1. Yes. With role and divider absent, the card’s flex `gap: 12px` leaves exactly 12px between the 30px title row and the first field, matching the design’s “12 between rows.” The divider belongs to the role/company block: it is conditionally rendered inside the same fragment as that line, not as a fields-section separator. [ContactCard.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\contact-card\ContactCard.tsx:343)

2. Yes, whitespace can reach the card. The modal saves `role` and `company` verbatim, trimming only `name`; Postgres also accepts arbitrary non-null text. A role of `' '` passes the current filter, produces an invisible paragraph and divider, and recreates KN-342’s defect. The card should normalize display values, e.g. trim each part before filtering and joining.

Findings:

- critical — Whitespace-only optional values still render the empty role line and divider. Enter a single space in Role (or Company), save, then reopen the contact card: `[part !== null && part !== '']` retains it, `role !== ''` is true, and the full card draws a blank 22px paragraph plus `<hr>`. The modal explicitly preserves this input because its save path trims only `name`. This fails the exit condition for a contact that has no meaningful role or company. [ContactCard.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\contact-card\ContactCard.tsx:193) [ContactCard.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\contact-card\ContactCard.tsx:343) [ContactModal.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\modal\ContactModal.tsx:76)

- minor — The English Storybook prop documentation still says role cannot be missing, contradicting the changed `string | null` component contract and the owner-approved name-only contact. [Shared-ContactCard.md](D:\Kar\Gandom\KarNama\apps\web\src\shared\story-docs\en\Shared-ContactCard.md:19)

VERDICT
score: 5.0
criticals: 1
one-line: Normalize whitespace-only role and company values before deciding whether to render the role block.