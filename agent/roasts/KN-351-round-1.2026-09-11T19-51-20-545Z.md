1. No. `Button`, `Tab`, and `ToggleButton` apply `theme.typography.button`; `MenuItem` applies `body1`; `Chip` sets `theme.typography.fontFamily`. This theme defines all of those with the same Vazirmatn token, so the base override neither changes their intended family nor defeats a distinct `typography.button` family.

2. The token is correct for this product. I found no intentional alternate font context. Existing `sx: { fontFamily: 'inherit' }` rules retain their higher-priority local behavior. There are no shipping raw text buttons or selects outside MUI; the only native input is a hidden file picker.

Findings:

- major — KN-351 was marked done without the mandatory four-combination visual check. Its closure evidence records only Persian/light and English/dark, omitting Persian/dark and English/light. This violates the repository’s explicit done gate. [agent/board.json:9262](D:/Kar/Gandom/KarNama/agent/board.json:9262)

The implementation itself meets the task’s functional condition: the global override is present, and both requested computed-style assertions exist. [theme.ts:97](D:/Kar/Gandom/KarNama/apps/web/src/theme/theme.ts:97), [ContactCard.stories.tsx:114](D:/Kar/Gandom/KarNama/apps/web/src/shared/contact-card/ContactCard.stories.tsx:114), [StatusPicker.stories.tsx:78](D:/Kar/Gandom/KarNama/apps/web/src/shared/status-picker/StatusPicker.stories.tsx:78)

VERDICT
score: 8.5
criticals: 0
one-line: Visually verify the missing Persian/dark and English/light combinations before calling KN-351 done.