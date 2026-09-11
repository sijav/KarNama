# KN-021 · Page header

Beside the header. Recorded after the build, on 2026-09-11, the owner having
asked for speed.

**Exit condition, from the board.** Both drawn instances match Figma, the
optional back and action slots each render and are each omittable, the
language switch appears only at the mobile breakpoint, and the title is the
page heading in the accessibility tree.

## What was built

- From nodes 155:56 and 155:72, read with use_figma: the title, 20 at 600,
  `text/primary`, at the inline start, the back arrow of 155:72, 20 in
  `text/secondary`, 12 before it, and the primary action at the inline end;
  the 47 instances on the screens sit in a `bg/surface` header, so the title
  group's own `bg/surface` fill, invisible there, is left out.
- The title is an `h1`. The back arrow is a named button; the file draws it
  pointing right, back in RTL, and with no left arrow in the set an English
  page mirrors it. The action is a slot for the caller's Button.
- The language switch follows the action below MUI's `md`, 900 pixels, the
  build's mobile breakpoint, recorded in DESIGN.md section 5; no screen draws
  it, DESIGN.md places it.
- Stories: Default, WithBack, TitleOnly, LanguageOnNarrowScreens with the
  runner's viewport, InEnglish.
