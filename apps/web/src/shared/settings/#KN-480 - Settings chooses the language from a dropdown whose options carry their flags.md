# KN-480 · Settings chooses the language from a dropdown whose options carry their flags

Beside the work, per `agent/RALPH.md` step 2b: the Select gains a slot before an
option's name, and the Settings dialog uses it for the language.

## The card

**Why.** The owner asked for it, and a dropdown keeps the dialog short as
languages are added.

**Exit condition.** Settings shows the language as a Select whose options each
carry a flag and a name; choosing one switches language and direction at once
and survives a reload; Theme and Load sample data still work; the Settings
stories show it in all four combinations.

**The owner, 2026-09-14:** "it needs to be in the settings, with a drop down and
a flag", "language should be a drop down in settings too", and of the rest of
the dialog, "the load sample data is nice keep it".

## What is true today

- `SettingsDialog`, Codex's of 2026-09-12, lists the two languages as MUI
  Radios in a RadioGroup under a FormLabel, then Theme as three Radios, then
  the sample-data text, its secondary Button and a status line, in the Modal
  shell at 420.
- The product's `Select`, KN-012, node `183:26`: the label above a field 44
  tall, options of `{ value, label, disabled? }`, the value a list, and
  `onChange(string[])`. Its rows are `options.tsx`'s Option Rows, 40 tall, 12
  of padding and 8 of gap, the check at the inline end when chosen; the field
  shows the chosen names through `Intl.ListFormat`. Nothing can come before an
  option's name, in its row or in the field.
- `LanguageFlag`, KN-479: 20 by 13.33, decorative unless named.
- `EmploymentTypeSelect` and `JobLevelSelect` compose `Select` and narrow its
  `string[]` back to their own type with a guard inside `filter`, which leaves
  no branch that cannot run.
- Three e2e specs pick a language in Settings by its radio: `settings.spec.ts`
  (English, still checked after a reload, then back to «فارسی»),
  `layout-overflow.spec.ts` and `drag-cards.spec.ts`.
- Figma draws no Settings ("setting doesn't exists in figma"), so the dialog is
  composed from drawn parts: the Select of `183:26` and KN-479's flag, which
  DESIGN.md section 5 places.

## The approach

1. **`SelectOption` gains an optional `leading`**, a node drawn before the
   option's name: in its Option Row at the inline start, so 12 from the edge
   and the row's own 8 before the name; and in the field before the chosen
   name, 16 from the edge and 8 before it, when the select holds one choice and
   that option has one. A multiple select still lists names alone. The name
   beside a `leading` keeps its ellipsis, and the `leading` does not shrink. It
   only adds: a Select given no `leading` draws exactly as before, which its
   existing stories keep proving.
2. **The dialog's language becomes that Select**, composed in `SettingsDialog`
   rather than in a component of its own, since Settings is its one user: the
   catalog's «زبان» as its label, `localeOrder` for its options, each named by
   `locales` in its own language and led by `<LanguageFlag locale={value} />`,
   and its change narrowed to a `Locale` with `isLocale` inside `filter`, as the
   job selects do. Theme and Load sample data are left exactly as they are.
3. **Stories first.** `Select` gains `Leading`: the languages with their flags,
   asserting each row's flag 12 from the inline start with the name 8 after it,
   the chosen row's check still at the inline end, and the field's flag 16 from
   the inline start with the chosen name 8 after it. `SettingsDialog`'s
   `Preferences` picks English from the Select and sees `onLocaleChange` called
   with `en-US`; four stories pinned to fa-IR and en-US, light and dark, open the
   dialog and assert the field shows the current language's flag and name and
   the open list both languages, each led by its own flag.
4. **The e2e specs** choose the language by opening the combobox named «زبان» or
   Language and pressing the option, and `settings.spec.ts` checks after the
   reload that the field shows English instead of a checked radio.
5. **Docs**: `Shared-Select.md` says what `leading` is in `options` and adds
   `Leading`; `Shared-SettingsDialog.md` says the language is a dropdown with
   flags and adds the four stories; both in `en` and `fa`. DESIGN.md section 5's
   Settings paragraph says the language is chosen from the Select, each option
   led by its flag.

## What I expect to be hard, and what I am unsure about

- **MUI's `.MuiSelect-select` cuts its value as inline text.** A flag and a name
  in a flex row need the ellipsis on the name itself, `min-width: 0`, and a flag
  that keeps its 20.
- **The field's accessible name** is the label alone: MUI 9's `SelectInput`
  sets `aria-labelledby` to the label's id and nothing else, read in
  `node_modules`, so the combobox is «زبان» or Language whatever is chosen, and
  the hidden flag cannot change it.
- **Choosing a language re-renders the tree** in the other locale and direction
  while the dialog is open: the list closes, focus goes back to the field, and
  React must not warn.
- **Type-ahead** matches an item's `innerText`, read in `MenuList`, and a hidden
  flag has none, so it is unchanged.

## The plan review, and what changed

Codex, plan kind with web search, 2026-09-14, archived at
`%TEMP%/claude-roast/2b1874631dd1/20260914T115329-plan-kn-480-settings-chooses-the-language-from-a-drop-7e1cc9.md`.
It found the plan sound and the simplest correct change.

- **The list is portalled to the page, outside the dialog.** Accepted: the e2e
  specs open the combobox inside the dialog but press the option through
  `page.getByRole('option')`, then wait for the listbox to go.
- **The accessible name is the label alone**, not the label and the value.
  Accepted, and confirmed in MUI's source above.
- **Narrow with `isLocale` inside `filter` and call the handler per value**,
  never behind an `if` on `[0]`, which would add a branch no test reaches.
  Accepted, as a `for` over the filtered list, since `forEach` would hand the
  handler an index and the array too.
- **Prove the edge after choosing**: the list gone, the field focused, the
  document in the new language and direction, no React warning. Accepted:
  `Preferences` asserts the first two, and the e2e the language and direction.
- **The four stories must really be pinned** to both languages and both schemes.

## How I will know it worked

The `Select` and `SettingsDialog` stories pass, with the four combinations; the
docs guard, lint and tsc are clean; coverage of `select/` and `settings/` stays
at 100 percent; the three e2e specs pass on desktop and phone; a planted failure
is caught; and I look at the dialog open and closed in fa-IR and en-US, light
and dark.
