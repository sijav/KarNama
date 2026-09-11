# KN-134 · ThemedTree sets i18n state while rendering

Beside the providers. Recorded after the fix, on 2026-09-11, under the owner's
rules of that day.

**Exit condition, from the board.** The full web suite produces no React
warnings at all, asserted by a check that fails when one appears rather than by
reading the output, and switching language still works in fa-IR and en-US with
the choice surviving a reload.

## What was done

- The warning, "Cannot update a component (I18nProvider) while rendering a
  different component (ThemedTree)", came from `i18n.activate(locale)` in
  ThemedTree's render: the shared instance's change reached the provider's
  store mid-render. `src/i18n` now makes one catalog instance per locale, made
  once and never switched, `i18nFor`, and ThemedTree hands the provider the one
  for its locale. @lingui/react 6.6's I18nProvider builds its store from the
  prop and reads it through `useSyncExternalStore`, so a switch shows the new
  language in the same render, with no flash and no remount. The shared `i18n`
  follows in the layout effect, for code outside the tree and the stories that
  read expected copy from it.
- The suite's other React warning, "Received true for a non-boolean attribute
  notched", six a run: MUI's Select hands a displayEmpty, outlined select's
  input a `notched` prop, and our InputBase passed it to a div. The Select is
  `variant="standard"` now; its and its callers' stories pass.
- `.storybook/react-warnings.setup.ts`, a setup file of both projects, fails a
  test whose run sends React's printf-style `console.error`, one with `%s` in
  its format; the product's own reports are plain sentences and still print.
  The unit project passes 993 of 993 under it, and the storybook project 265 of
  267, the two failures KN-365's transition flakes. With the old render-time
  activate planted back, LanguageOnAPhone fails with "React warned during this
  test".
- In the real app at a phone's width: English chosen in the header, the page
  left to right and en-US stored; after a reload, still English; no console
  errors.
