# KN-355 · Below 900 the shell has no language switch: the sidebar took it and the shell draws no Page Header

Beside the shell. Recorded after the fix, on 2026-09-11, under the owner's
rules of that day.

**Exit condition, from the board.** At the phone's width the shell shows the
Page Header with its language switch, choosing a language there changes it and
persists, and a story at 390 finds and uses the switch.

## What was done

- The shell's `main` draws the Page Header, titled with the current
  destination's name, where it drew a bare «KarNama» heading. The Page Header
  already carries the language switch below 900, DESIGN.md section 5; on a wide
  screen the sidebar's foot has it and the header's is hidden. The header has no
  action yet: the board's «+ افزودن فرصت شغلی» comes with the board screen.
- `useDestinationName` joins the navigation's barrel for it.
- LanguageOnAPhone sizes the runner's screen to 390 by 844, presses «فارسی» in
  the header, chooses English, and finds the page left to right, its heading
  in English and en-US stored; it puts the screen and the stored choice back.
  The Persian and English stories now find the destination's name as the
  page's heading. All three failed on the old shell.
- Seen: the header's switch draws as MUI's default button, «ENGLISH» in
  capitals, KN-387. KN-116's move of the switch into the drawn chrome looks
  done by KN-027 and this, noted on it. In the Browser pane's phone emulation
  the tap did not open the menu, so the pane's look used the page's own clicks;
  the story's clicks are the runner's real ones.
