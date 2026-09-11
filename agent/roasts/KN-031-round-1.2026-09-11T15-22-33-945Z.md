1. Error timing/accessibility: yes. It is introduced only after Save, disappears when the name becomes non-blank, and the Input supplies a persistent `role="alert"` live region.

2. Reset logic: no. A parent that recreates `initial` on an unrelated rerender resets the form while the user is typing.

3. Keyboard usability: no. The 581px mobile modal has no keyboard/visual-viewport constraint, so the footer can sit under the on-screen keyboard.

4. Edit footer direction: yes. Actions precede the aside in DOM order; flex direction makes them inline-start and Delete inline-end in both RTL and LTR.

Findings:

- critical — Edit mode is not guaranteed to be prefilled or to show Delete. `initial` and `onDelete` are optional for every mode, so this valid call renders a blank “Edit contact” form with Add-mode footer placement:
  ```tsx
  <ContactModal open mode="edit" jobs={[]} onSave={fn} onCancel={fn} />
  ```
  That violates both the prefilled Edit and destructive-action requirements. Model the props as a discriminated union, making `initial` and `onDelete` required for `mode: 'edit'`. [ContactModal.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\modal\ContactModal.tsx:21), [ContactModal.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\modal\ContactModal.tsx:88)

- critical — Editing is destructively reset whenever the parent supplies a freshly allocated equivalent record. For example, a parent rendering `initial={{ ...contact }}` and rerendering for a timer, query update, or sibling state change causes `start !== seen.start`, then lines 61–64 replace the currently typed values with the original record. This is exactly the common “new initial object every render” case. Compare a stable record identity/key, reset on opening or selected-contact identity, or have the parent explicitly remount the modal when changing records. [ContactModal.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\modal\ContactModal.tsx:55), [ContactModal.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\modal\ContactModal.tsx:60)

- major — The mobile modal is not safe with a software keyboard. The captured mobile frame is 358×581; this implementation has a naturally sized paper and only makes the body scrollable. It does not cap the paper against the visual viewport or account for keyboard occlusion. On a 390×844 phone, focusing a lower field with a roughly 300px keyboard leaves the bottom footer under the keyboard, including Save/Cancel. [PanelModal.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\modal\PanelModal.tsx:56), [PanelModal.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\modal\PanelModal.tsx:100)

- major — The Social link placeholder is a bare user-facing string, violating the repository’s Lingui rule. It will also remain English in Persian UI. [ContactModal.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\modal\ContactModal.tsx:113)

`tsc` and ESLint pass for the modal files. I could not execute Storybook/Vitest because the read-only sandbox prevents Vite from creating its temporary bundled config, which is an environment limitation rather than a finding.

VERDICT
score: 4.0
criticals: 2
one-line: Make Edit’s required record/delete contract explicit, then stop equivalent parent rerenders from resetting active form input.