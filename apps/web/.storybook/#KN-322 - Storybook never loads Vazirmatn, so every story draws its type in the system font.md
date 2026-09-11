# KN-322 · Storybook never loads Vazirmatn, so every story draws its type in the system font

Beside the preview. Recorded after the fix, on 2026-09-11, under the owner's
rules of that day.

**Exit condition, from the board.** preview.tsx loads the font the app loads,
and a story shows through document.fonts that Vazirmatn is loaded before it
measures text.

## What was done

- `preview.tsx` imports `@fontsource-variable/vazirmatn`, as `main.tsx` does,
  and its `beforeEach` waits on `document.fonts.load` for a Persian letter and
  a Latin one in the theme's own family, so both faces are in before any story
  renders; a face otherwise loads only when text first asks for it, after a
  story has already measured. The lint exempts the font set's `load` by name,
  TECH-DEBT 17.
- Foundations/Tokens' Type story finds the Vazirmatn faces for U+600-6FF and
  U+0-FF in `document.fonts` with status loaded, then measures each role's
  line. Chromium writes a range without its leading zeros, so the story matches
  either form. With the import commented out the story fails.
- The whole storybook project with the face: 255 of 256; the one failure is
  JobCard's Pressed, which expected white against the pressed grey, the
  transition flake noted on KN-365, and it passes alone. No story leaned on
  the system font's widths.
